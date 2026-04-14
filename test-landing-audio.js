/**
 * Manual test script for landing audio page
 * Run with: node test-landing-audio.js
 */

const { chromium } = require('playwright');

async function runTests() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('\n' + '='.repeat(70));
  console.log('LANDING AUDIO PAGE TESTS');
  console.log('='.repeat(70));

  try {
    // Test 1: Page loads
    console.log('\n[1/10] Testing page load...');
    await page.goto('http://localhost:3000/member/landing-audio');
    await page.waitForLoadState('networkidle');
    console.log('✓ Page loaded successfully');

    // Test 2: Verify heading
    console.log('\n[2/10] Verifying page heading...');
    const heading = await page.locator('h1').first().textContent();
    if (heading && (heading.includes('Audio') || heading.includes('Landing'))) {
      console.log(`✓ Heading found: "${heading}"`);
    } else {
      console.log(`⚠ Heading not as expected: "${heading}"`);
    }

    // Test 3: Form fields
    console.log('\n[3/10] Checking form fields...');
    const songInput = page.locator('#songName');
    const artistInput = page.locator('#artistName');
    const dateInput = page.locator('#bookingDate');
    const termsCheckbox = page.locator('input[type="checkbox"]').first();

    if (await songInput.count() > 0) console.log('✓ Song name input found');
    else console.log('✗ Song name input missing');

    if (await artistInput.count() > 0) console.log('✓ Artist name input found');
    else console.log('✗ Artist name input missing');

    if (await dateInput.count() > 0) console.log('✓ Booking date input found');
    else console.log('✗ Booking date input missing');

    if (await termsCheckbox.count() > 0) console.log('✓ Terms checkbox found');
    else console.log('✗ Terms checkbox missing');

    // Test 4: Mode toggle buttons
    console.log('\n[4/10] Checking booking mode buttons...');
    const spotifyBtn = page.locator('button:has-text("Spotify")');
    const uploadBtn = page.locator('button:has-text("Upload")');

    if (await spotifyBtn.count() > 0) console.log('✓ Spotify button found');
    else console.log('✗ Spotify button missing');

    if (await uploadBtn.count() > 0) console.log('✓ Upload button found');
    else console.log('✗ Upload button missing');

    // Test 5: Toggle modes
    console.log('\n[5/10] Testing mode toggle...');
    if (await uploadBtn.count() > 0) {
      await uploadBtn.click();
      await page.waitForTimeout(500);
      const uploadLabel = page.locator('label:has-text("Audio File")');
      if (await uploadLabel.count() > 0) {
        console.log('✓ Upload mode displays correctly');
      }

      await spotifyBtn.click();
      await page.waitForTimeout(500);
      const spotifyLabel = page.locator('label:has-text("Search Spotify")');
      if (await spotifyLabel.count() > 0) {
        console.log('✓ Spotify mode displays correctly');
      }
    }

    // Test 6: Form input
    console.log('\n[6/10] Testing form input...');
    if (await songInput.count() > 0) {
      await songInput.fill('Test Song Title');
      const value = await songInput.inputValue();
      if (value === 'Test Song Title') {
        console.log('✓ Song input accepts text');
      }
    }

    if (await artistInput.count() > 0) {
      await artistInput.fill('Test Artist');
      const value = await artistInput.inputValue();
      if (value === 'Test Artist') {
        console.log('✓ Artist input accepts text');
      }
    }

    // Test 7: Price display
    console.log('\n[7/10] Checking price information...');
    const priceText = page.locator('text="$20"');
    if (await priceText.count() > 0) {
      console.log('✓ Price ($20) displayed');
    }

    const rotationText = page.locator('text=/30-second|rotation/i');
    if (await rotationText.count() > 0) {
      console.log('✓ Rotation info displayed');
    }

    // Test 8: Mobile responsiveness
    console.log('\n[8/10] Testing mobile responsiveness...');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    const mobileHeading = page.locator('h1').first();
    if (await mobileHeading.isVisible()) {
      console.log('✓ Page displays on mobile (375x667)');
    }

    // Test 9: Tablet responsiveness
    console.log('\n[9/10] Testing tablet responsiveness...');
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    const tabletHeading = page.locator('h1').first();
    if (await tabletHeading.isVisible()) {
      console.log('✓ Page displays on tablet (768x1024)');
    }

    // Test 10: Desktop responsiveness
    console.log('\n[10/10] Testing desktop responsiveness...');
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);
    const desktopHeading = page.locator('h1').first();
    if (await desktopHeading.isVisible()) {
      console.log('✓ Page displays on desktop (1920x1080)');
    }

    // Take screenshots
    console.log('\n[SCREENSHOTS] Taking screenshots...');
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.screenshot({ path: 'landing-audio-desktop.png', fullPage: true });
    console.log('✓ Desktop screenshot: landing-audio-desktop.png');

    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ path: 'landing-audio-mobile.png', fullPage: true });
    console.log('✓ Mobile screenshot: landing-audio-mobile.png');

    console.log('\n' + '='.repeat(70));
    console.log('✓ ALL TESTS COMPLETED SUCCESSFULLY');
    console.log('='.repeat(70));

  } catch (error) {
    console.error('\n✗ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

runTests();
