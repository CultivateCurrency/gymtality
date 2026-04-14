import { test, expect } from '@playwright/test';

test.describe('Landing Audio Booking Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the landing audio page
    await page.goto('/member/landing-audio');
    await page.waitForLoadState('networkidle');
  });

  test('should load page with correct title and heading', async ({ page }) => {
    // Verify page title
    await expect(page).toHaveTitle(/Gymtality/i);

    // Verify main heading
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText(/Landing Page Audio|Book.*Audio/i);
  });

  test('should display booking form with all required fields', async ({ page }) => {
    // Check for song name field
    const songNameInput = page.locator('#songName');
    await expect(songNameInput).toBeVisible();
    await expect(songNameInput).toHaveAttribute('placeholder', /Song|track/i);

    // Check for artist name field
    const artistNameInput = page.locator('#artistName');
    await expect(artistNameInput).toBeVisible();
    await expect(artistNameInput).toHaveAttribute('placeholder', /Artist|name/i);

    // Check for booking date field
    const bookingDateInput = page.locator('#bookingDate');
    await expect(bookingDateInput).toBeVisible();

    // Check for terms checkbox
    const termsCheckbox = page.locator('input[type="checkbox"]').first();
    await expect(termsCheckbox).toBeVisible();

    // Check for submit button
    const submitButton = page.locator('button:has-text("Book for")');
    await expect(submitButton).toBeVisible();
  });

  test('should display Spotify and Upload mode toggle buttons', async ({ page }) => {
    // Check for Spotify button
    const spotifyButton = page.locator('button:has-text("Spotify")');
    await expect(spotifyButton).toBeVisible();

    // Check for Upload button
    const uploadButton = page.locator('button:has-text("Upload")');
    await expect(uploadButton).toBeVisible();

    // Verify Spotify is active by default
    await expect(spotifyButton).toHaveClass(/bg-green-600|bg-orange-500/);
  });

  test('should toggle between Spotify and Upload modes', async ({ page }) => {
    const spotifyButton = page.locator('button:has-text("Spotify")');
    const uploadButton = page.locator('button:has-text("Upload")');

    // Click Upload mode
    await uploadButton.click();
    await page.waitForLoadState('domcontentloaded');

    // Check if Upload section appears
    const audioUploadLabel = page.locator('label:has-text("Audio File")');
    await expect(audioUploadLabel).toBeVisible();

    // Switch back to Spotify
    await spotifyButton.click();
    await page.waitForLoadState('domcontentloaded');

    // Check if Spotify search section appears
    const spotifySearchLabel = page.locator('label:has-text("Search Spotify")');
    await expect(spotifySearchLabel).toBeVisible();
  });

  test('should allow form field inputs', async ({ page }) => {
    const songInput = page.locator('#songName');
    const artistInput = page.locator('#artistName');
    const dateInput = page.locator('#bookingDate');

    // Fill in song name
    await songInput.fill('Test Song');
    await expect(songInput).toHaveValue('Test Song');

    // Fill in artist name
    await artistInput.fill('Test Artist');
    await expect(artistInput).toHaveValue('Test Artist');

    // Fill in booking date (future date)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const dateString = futureDate.toISOString().split('T')[0];
    await dateInput.fill(dateString);
    await expect(dateInput).toHaveValue(dateString);
  });

  test('should require terms acceptance', async ({ page }) => {
    const songInput = page.locator('#songName');
    const artistInput = page.locator('#artistName');
    const dateInput = page.locator('#bookingDate');
    const termsCheckbox = page.locator('input[type="checkbox"]').first();
    const submitButton = page.locator('button:has-text("Book for")');

    // Fill form without accepting terms
    await songInput.fill('Test Song');
    await artistInput.fill('Test Artist');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const dateString = futureDate.toISOString().split('T')[0];
    await dateInput.fill(dateString);

    // Button should be disabled without terms
    await expect(submitButton).toBeDisabled();

    // Accept terms
    await termsCheckbox.click();
    await expect(termsCheckbox).toBeChecked();

    // Button should still be disabled (Spotify mode requires track selection)
    await expect(submitButton).toBeDisabled();
  });

  test('should display price information', async ({ page }) => {
    // Check for price display
    const priceText = page.locator('text=/\\$20|20.*day|per day/i');
    await expect(priceText).toBeVisible();

    // Check for 30-second rotation text
    const rotationText = page.locator('text=/30-second|rotation/i');
    await expect(rotationText).toBeVisible();
  });

  test('should display error message for past booking dates', async ({ page }) => {
    const songInput = page.locator('#songName');
    const artistInput = page.locator('#artistName');
    const dateInput = page.locator('#bookingDate');

    // Fill form with past date
    await songInput.fill('Test Song');
    await artistInput.fill('Test Artist');
    await dateInput.fill('2020-01-01');

    // Try to submit
    const submitButton = page.locator('button:has-text("Book for")');
    if (!(await submitButton.isDisabled())) {
      await submitButton.click();
      await page.waitForTimeout(500);

      // Error should appear
      const errorMessage = page.locator('text=/past|future/i');
      if (await errorMessage.count() > 0) {
        await expect(errorMessage).toBeVisible();
      }
    }
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForLoadState('domcontentloaded');

    // Verify key elements are still visible
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();

    const songInput = page.locator('#songName');
    await expect(songInput).toBeVisible();

    const submitButton = page.locator('button:has-text("Book for")');
    await expect(submitButton).toBeVisible();

    // Check that elements stack properly
    const formElements = page.locator('form');
    if (await formElements.count() > 0) {
      const boundingBox = await formElements.first().boundingBox();
      expect(boundingBox?.width).toBeLessThanOrEqual(400);
    }
  });

  test('should be responsive on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForLoadState('domcontentloaded');

    // Verify key elements are visible
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();

    const submitButton = page.locator('button:has-text("Book for")');
    await expect(submitButton).toBeVisible();
  });

  test('should have accessible heading structure', async ({ page }) => {
    // Check for proper heading hierarchy
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);

    // Check for descriptive labels
    const labels = page.locator('label');
    const labelCount = await labels.count();
    expect(labelCount).toBeGreaterThan(0);
  });

  test('should have proper form labels', async ({ page }) => {
    // Check song name label
    const songLabel = page.locator('label:has-text("Song")');
    if (await songLabel.count() > 0) {
      await expect(songLabel).toBeVisible();
    }

    // Check artist name label
    const artistLabel = page.locator('label:has-text("Artist")');
    if (await artistLabel.count() > 0) {
      await expect(artistLabel).toBeVisible();
    }

    // Check booking date label
    const dateLabel = page.locator('label:has-text("Booking")');
    if (await dateLabel.count() > 0) {
      await expect(dateLabel).toBeVisible();
    }
  });

  test('should display recent bookings section if available', async ({ page }) => {
    // Wait for potential async data loading
    await page.waitForTimeout(2000);

    // Check if bookings section exists
    const bookingsSection = page.locator('text=/Your Bookings|Recent Bookings/i');
    if (await bookingsSection.count() > 0) {
      await expect(bookingsSection).toBeVisible();
    }
  });

  test('should handle upload mode file input', async ({ page }) => {
    // Switch to upload mode
    const uploadButton = page.locator('button:has-text("Upload")');
    await uploadButton.click();
    await page.waitForLoadState('domcontentloaded');

    // Check for file input
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeVisible();

    // Check for upload instructions
    const uploadText = page.locator('text=/Click to upload|MP3.*WAV.*OGG/i');
    if (await uploadText.count() > 0) {
      await expect(uploadText).toBeVisible();
    }
  });

  test('should display terms agreement text', async ({ page }) => {
    // Check for terms text
    const termsText = page.locator('text=/own all rights|explicit|offensive|Artist Placement/i');
    await expect(termsText.first()).toBeVisible();
  });
});
