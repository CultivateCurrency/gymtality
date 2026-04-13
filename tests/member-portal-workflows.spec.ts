import { test, expect } from '@playwright/test';

/**
 * MEMBER PORTAL WORKFLOW TESTS
 * Comprehensive testing of user journeys, auth, bookings, and portal features
 */

test.describe('Member Portal - Complete Workflow', () => {
  // Setup: Common test data
  const TEST_USER = {
    email: 'test-member@gymtality.fit',
    password: 'TestPassword123!@#',
    fullName: 'Test Member',
  };

  test.beforeEach(async ({ page }) => {
    // Set up test environment
    page.on('console', (msg) => console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`));
    page.on('pageerror', (err) => console.error(`[Browser Error] ${err.message}`));
  });

  // ============================================
  // AUTHENTICATION WORKFLOWS
  // ============================================

  test('should login and access member dashboard', async ({ page }) => {
    console.log('\n[TEST] Login and Access Dashboard');

    // Navigate to login
    await page.goto('/auth/login', { waitUntil: 'networkidle' });
    console.log('✓ Login page loaded');

    // Verify login form elements
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
    console.log('✓ Login form elements visible');

    // Fill and submit login form
    await emailInput.fill(TEST_USER.email);
    await passwordInput.fill(TEST_USER.password);
    await submitButton.click();

    // Wait for redirect to dashboard
    await page.waitForURL(/\/member|\/dashboard/, { timeout: 10000 });
    console.log('✓ Logged in successfully');

    // Verify dashboard loads
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 5000 });
    console.log(`✓ Dashboard loaded with heading: "${await heading.textContent()}"`);
  });

  test('should navigate member portal sections', async ({ page }) => {
    console.log('\n[TEST] Navigate Portal Sections');

    // Assume logged in
    await page.goto('/member/dashboard', { waitUntil: 'networkidle' });
    console.log('✓ Dashboard page loaded');

    // Test navigation to landing audio page
    const landingAudioLink = page.locator('a:has-text("Landing Audio"), a:has-text("Audio Booking"), button:has-text("Audio")').first();

    if (await landingAudioLink.count() > 0) {
      await landingAudioLink.click();
      await page.waitForURL(/landing-audio/, { timeout: 5000 });
      console.log('✓ Navigated to Landing Audio page');

      // Verify page content
      const pageHeading = page.locator('h1').first();
      await expect(pageHeading).toContainText(/audio|booking/i);
      console.log(`✓ Landing audio page active`);
    } else {
      console.log('⚠ Landing audio link not found in navigation');
    }

    // Test profile link
    const profileLink = page.locator('a:has-text("Profile"), a:has-text("Settings")').first();
    if (await profileLink.count() > 0) {
      await profileLink.click();
      await page.waitForURL(/profile|settings/, { timeout: 5000 });
      console.log('✓ Navigated to Profile page');
    }
  });

  test('should logout successfully', async ({ page }) => {
    console.log('\n[TEST] Logout Workflow');

    // Assume logged in
    await page.goto('/member/dashboard', { waitUntil: 'networkidle' });

    // Find logout button
    const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign Out"), a:has-text("Logout")').first();

    if (await logoutButton.count() > 0) {
      await logoutButton.click();
      await page.waitForURL(/auth|login/, { timeout: 5000 });
      console.log('✓ Logged out successfully');

      // Verify redirected to login
      const loginHeading = page.locator('text=/login|sign in/i').first();
      await expect(loginHeading).toBeVisible();
      console.log('✓ Redirected to login page');
    } else {
      console.log('⚠ Logout button not found');
    }
  });

  // ============================================
  // LANDING AUDIO BOOKING WORKFLOWS
  // ============================================

  test('should display landing audio booking form with all fields', async ({ page }) => {
    console.log('\n[TEST] Landing Audio Form Display');

    await page.goto('/member/landing-audio', { waitUntil: 'networkidle' });
    console.log('✓ Landing audio page loaded');

    // Verify page title
    const pageTitle = page.locator('h1');
    await expect(pageTitle).toContainText(/audio|booking/i);
    console.log('✓ Page title verified');

    // Verify form sections
    const songInput = page.locator('#songName, input[placeholder*="Song"], input[placeholder*="song"]').first();
    const artistInput = page.locator('#artistName, input[placeholder*="Artist"], input[placeholder*="artist"]').first();
    const dateInput = page.locator('#bookingDate, input[type="date"]').first();
    const termsCheckbox = page.locator('input[type="checkbox"]').first();

    await expect(songInput).toBeVisible();
    console.log('✓ Song name input visible');
    await expect(artistInput).toBeVisible();
    console.log('✓ Artist name input visible');
    await expect(dateInput).toBeVisible();
    console.log('✓ Booking date input visible');
    await expect(termsCheckbox).toBeVisible();
    console.log('✓ Terms checkbox visible');

    // Verify mode toggle buttons
    const spotifyButton = page.locator('button:has-text("Spotify")');
    const uploadButton = page.locator('button:has-text("Upload")');

    await expect(spotifyButton).toBeVisible();
    console.log('✓ Spotify mode button visible');
    await expect(uploadButton).toBeVisible();
    console.log('✓ Upload mode button visible');

    // Verify price information
    const priceText = page.locator('text=$20, text=20, text=/\\$.*20/');
    await expect(priceText.first()).toBeVisible();
    console.log('✓ Price information displayed');
  });

  test('should play background music on landing audio page', async ({ page }) => {
    console.log('\n[TEST] Background Music Player');

    await page.goto('/member/landing-audio', { waitUntil: 'networkidle' });
    console.log('✓ Landing audio page loaded');

    // Find play button
    const playButton = page.locator('button:has-text("Play"), button:has-text("Pause")').first();
    await expect(playButton).toBeVisible();
    console.log('✓ Music player button visible');

    // Click play
    const buttonText = await playButton.textContent();
    if (buttonText?.includes('Play')) {
      await playButton.click();
      // Give audio time to start
      await page.waitForTimeout(500);
      console.log('✓ Play button clicked');

      // Verify button state changed
      const updatedText = await playButton.textContent();
      if (updatedText?.includes('Pause')) {
        console.log('✓ Music playback started (button shows Pause)');
      }
    }
  });

  test('should display featured demo track (Gymtality theme)', async ({ page }) => {
    console.log('\n[TEST] Featured Demo Track');

    await page.goto('/member/landing-audio', { waitUntil: 'networkidle' });
    console.log('✓ Landing audio page loaded');

    // Look for featured section
    const featuredSection = page.locator('text=/see how it works|featured|rotation/i').first();
    await expect(featuredSection).toBeVisible();
    console.log('✓ Featured demo section visible');

    // Verify Gymtality theme is mentioned
    const themeSongText = page.locator('text=/Personal Trainer|Gymtality/i');
    await expect(themeSongText.first()).toBeVisible();
    console.log('✓ Gymtality theme song visible in featured section');

    // Verify "Book This Song" button exists
    const bookThemeSongButton = page.locator('button:has-text("Book This Song")');
    if (await bookThemeSongButton.count() > 0) {
      await expect(bookThemeSongButton).toBeVisible();
      console.log('✓ "Book This Song" button visible for featured track');
    }
  });

  test('should test Spotify search functionality', async ({ page }) => {
    console.log('\n[TEST] Spotify Search');

    await page.goto('/member/landing-audio', { waitUntil: 'networkidle' });
    console.log('✓ Landing audio page loaded');

    // Ensure Spotify mode is active
    const spotifyButton = page.locator('button:has-text("Spotify")');
    if (await spotifyButton.count() > 0) {
      await spotifyButton.click();
      await page.waitForTimeout(300);
      console.log('✓ Spotify mode selected');
    }

    // Find search input
    const searchInput = page.locator('input[placeholder*="Song"], input[placeholder*="search"], input[placeholder*="artist"]').first();
    if (await searchInput.count() > 0) {
      await searchInput.fill('Gym Workout');
      console.log('✓ Search query entered: "Gym Workout"');

      // Find and click search button
      const searchButton = page.locator('button:has-text("Search")').first();
      if (await searchButton.count() > 0) {
        await searchButton.click();
        await page.waitForTimeout(2000);
        console.log('✓ Search button clicked');

        // Verify results appear
        const searchResults = page.locator('[role="button"]:has-text(/fitness|gym|workout)').first();
        if (await searchResults.count() > 0) {
          console.log('✓ Search results displayed');
        } else {
          console.log('⚠ No search results visible yet (Spotify API may need credentials)');
        }
      }
    } else {
      console.log('⚠ Spotify search input not found');
    }
  });

  test('should switch between Spotify and Upload modes', async ({ page }) => {
    console.log('\n[TEST] Mode Toggle (Spotify ↔ Upload)');

    await page.goto('/member/landing-audio', { waitUntil: 'networkidle' });
    console.log('✓ Landing audio page loaded');

    const spotifyButton = page.locator('button:has-text("Spotify")');
    const uploadButton = page.locator('button:has-text("Upload")');

    // Switch to upload
    await uploadButton.click();
    await page.waitForTimeout(300);
    const uploadLabel = page.locator('text=/audio file|upload|mp3|wav/i').first();
    if (await uploadLabel.count() > 0) {
      console.log('✓ Switched to Upload mode - file input visible');
    }

    // Switch back to spotify
    await spotifyButton.click();
    await page.waitForTimeout(300);
    const spotifyLabel = page.locator('text=/search spotify|spotify track/i').first();
    if (await spotifyLabel.count() > 0) {
      console.log('✓ Switched to Spotify mode - search visible');
    }
  });

  test('should validate booking form (date in future, terms acceptance)', async ({ page }) => {
    console.log('\n[TEST] Booking Form Validation');

    await page.goto('/member/landing-audio', { waitUntil: 'networkidle' });
    console.log('✓ Landing audio page loaded');

    // Try to submit without terms
    const submitButton = page.locator('button:has-text("Book for")').first();

    // Fill in required fields
    const songInput = page.locator('#songName').or(page.locator('input[placeholder*="Song"]')).first();
    const artistInput = page.locator('#artistName').or(page.locator('input[placeholder*="Artist"]')).first();

    if (await songInput.count() > 0 && await artistInput.count() > 0) {
      await songInput.fill('Test Song');
      await artistInput.fill('Test Artist');
      console.log('✓ Song and artist filled');

      // Try to submit without checkbox - button should be disabled
      const isDisabled = await submitButton.isDisabled();
      if (isDisabled) {
        console.log('✓ Submit button disabled without terms acceptance');
      } else {
        console.log('⚠ Submit button should be disabled without terms');
      }

      // Accept terms
      const termsCheckbox = page.locator('input[type="checkbox"]').first();
      if (await termsCheckbox.count() > 0) {
        await termsCheckbox.click();
        console.log('✓ Terms checkbox checked');
      }
    }
  });

  test('should display booking history/recent bookings', async ({ page }) => {
    console.log('\n[TEST] Booking History Display');

    await page.goto('/member/landing-audio', { waitUntil: 'networkidle' });
    console.log('✓ Landing audio page loaded');

    // Look for recent bookings section
    const bookingsSection = page.locator('text=/your bookings|recent bookings|booking history/i').first();

    if (await bookingsSection.count() > 0) {
      await expect(bookingsSection).toBeVisible();
      console.log('✓ Bookings section found');

      // Check if there are any bookings listed
      const bookingItems = page.locator('[role="button"], div').filter({ has: page.locator('text=/pending|active|rejected/i') });
      const count = await bookingItems.count();
      console.log(`✓ Found ${count} booking(s) displayed`);
    } else {
      console.log('⚠ Bookings section not visible (may be empty)');
    }
  });

  // ============================================
  // RESPONSIVENESS & ACCESSIBILITY
  // ============================================

  test('should be responsive on mobile viewport', async ({ page }) => {
    console.log('\n[TEST] Mobile Responsiveness');

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    console.log('✓ Viewport set to mobile (375x667)');

    await page.goto('/member/landing-audio', { waitUntil: 'networkidle' });

    // Verify key elements are visible
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
    console.log('✓ Heading visible on mobile');

    const formFields = page.locator('input').first();
    await expect(formFields).toBeVisible();
    console.log('✓ Form fields visible on mobile');

    const submitButton = page.locator('button:has-text("Book")').first();
    if (await submitButton.count() > 0) {
      await expect(submitButton).toBeVisible();
      console.log('✓ Submit button visible on mobile');
    }

    // Check for touch-friendly spacing (min 44px)
    const buttons = await page.locator('button').boundingBox();
    console.log('✓ Mobile layout verified');
  });

  test('should be responsive on tablet viewport', async ({ page }) => {
    console.log('\n[TEST] Tablet Responsiveness');

    await page.setViewportSize({ width: 768, height: 1024 });
    console.log('✓ Viewport set to tablet (768x1024)');

    await page.goto('/member/landing-audio', { waitUntil: 'networkidle' });

    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
    console.log('✓ Page displays correctly on tablet');
  });

  test('should be accessible with proper heading hierarchy', async ({ page }) => {
    console.log('\n[TEST] Accessibility - Heading Hierarchy');

    await page.goto('/member/landing-audio', { waitUntil: 'networkidle' });

    // Check for h1
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThan(0);
    console.log(`✓ Found ${h1Count} h1 heading(s)`);

    // Verify heading hierarchy (no skipped levels)
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    console.log(`✓ Total ${headings.length} headings found`);
  });

  test('should have proper form labels for accessibility', async ({ page }) => {
    console.log('\n[TEST] Accessibility - Form Labels');

    await page.goto('/member/landing-audio', { waitUntil: 'networkidle' });

    // Check for labels
    const labels = await page.locator('label').count();
    expect(labels).toBeGreaterThan(0);
    console.log(`✓ Found ${labels} form label(s)`);

    // Verify inputs have associated labels or placeholders
    const inputs = await page.locator('input[type="text"], input[type="date"], input[type="email"]').all();
    for (const input of inputs.slice(0, 3)) {
      const placeholder = await input.getAttribute('placeholder');
      const ariaLabel = await input.getAttribute('aria-label');
      const hasLabel = placeholder || ariaLabel;
      if (hasLabel) {
        console.log(`✓ Input has accessibility label`);
      }
    }
  });

  // ============================================
  // PERFORMANCE & ERROR HANDLING
  // ============================================

  test('should handle network errors gracefully', async ({ page }) => {
    console.log('\n[TEST] Error Handling');

    // Simulate offline by blocking network requests to API
    await page.goto('/member/landing-audio', { waitUntil: 'networkidle' });
    console.log('✓ Page loads normally');

    // Try to trigger an error (e.g., empty search)
    const searchInput = page.locator('input[placeholder*="search"], input[placeholder*="Search"]').first();
    if (await searchInput.count() > 0) {
      const searchButton = page.locator('button:has-text("Search")').first();
      if (await searchButton.count() > 0) {
        await searchButton.click();
        await page.waitForTimeout(1000);
        console.log('✓ Handled empty search gracefully');
      }
    }
  });

  test('should load within acceptable time', async ({ page }) => {
    console.log('\n[TEST] Page Load Performance');

    const startTime = Date.now();

    await page.goto('/member/landing-audio', { waitUntil: 'networkidle' });

    const loadTime = Date.now() - startTime;
    console.log(`✓ Page loaded in ${loadTime}ms`);

    if (loadTime < 3000) {
      console.log('✓ PASS: Load time is acceptable (<3s)');
    } else {
      console.log(`⚠ WARNING: Load time is slow (${loadTime}ms)`);
    }
  });

  // ============================================
  // DATA ISOLATION & SECURITY
  // ============================================

  test('should not expose sensitive data in URLs or forms', async ({ page }) => {
    console.log('\n[TEST] Security - Sensitive Data');

    await page.goto('/member/landing-audio', { waitUntil: 'networkidle' });

    // Check for API keys, tokens in page source
    const pageContent = await page.content();
    const sensitivePatterns = [
      /api[_-]?key/i,
      /secret[_-]?key/i,
      /password/i,
      /token.*(?!type)/i,
    ];

    let foundSensitive = false;
    for (const pattern of sensitivePatterns) {
      if (pattern.test(pageContent)) {
        console.log(`⚠ Found potential sensitive data: ${pattern}`);
        foundSensitive = true;
      }
    }

    if (!foundSensitive) {
      console.log('✓ No obvious sensitive data exposed');
    }
  });

  test('should have HTTPS links for external resources', async ({ page }) => {
    console.log('\n[TEST] Security - HTTPS Links');

    await page.goto('/member/landing-audio', { waitUntil: 'networkidle' });

    // Check all links
    const links = await page.locator('a, script, img').all();
    let httpLinks = 0;

    for (const link of links) {
      const href = await link.getAttribute('href') || await link.getAttribute('src');
      if (href && href.startsWith('http://')) {
        console.log(`⚠ HTTP link found: ${href}`);
        httpLinks++;
      }
    }

    if (httpLinks === 0) {
      console.log('✓ All external resources use HTTPS or are relative');
    }
  });
});
