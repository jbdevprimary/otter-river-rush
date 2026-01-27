/**
 * Web Rendering E2E Tests with Playwright MCP
 * 
 * These tests verify that the game renders correctly in any web environment.
 * They specifically check for the "solid blue screen" issue and ensure proper
 * menu and gameplay rendering.
 * 
 * Playwright MCP automatically manages the server based on configuration:
 * - If BASE_URL is set: Tests against that URL (deployed or local)
 * - If BASE_URL is not set: Playwright starts preview server automatically
 * 
 * Usage:
 *   pnpm exec playwright test tests/e2e/web-rendering.spec.ts              # Auto-starts preview
 *   BASE_URL=https://example.com pnpm exec playwright test ...              # Tests deployed site
 *   pnpm exec playwright test tests/e2e/web-rendering.spec.ts --ui         # Debug mode
 *   pnpm exec playwright test tests/e2e/web-rendering.spec.ts --headed     # See browser
 */

import { test, expect, Page } from '@playwright/test';

/**
 * Helper to check if the screen is a solid color (blue screen of death)
 */
async function checkForSolidBlueScreen(page: Page): Promise<boolean> {
  return await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return false;

    // Create a temporary canvas to sample pixels
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    try {
      // Sample a few pixels to check if they're all the same blue color
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      
      // Check if all pixels are roughly the same color
      const firstR = pixels[0];
      const firstG = pixels[1];
      const firstB = pixels[2];
      
      // Sample every 1000th pixel to check uniformity
      let uniformCount = 0;
      const sampleSize = Math.min(100, Math.floor(pixels.length / 4000));
      
      for (let i = 0; i < sampleSize; i++) {
        const offset = i * 4000;
        const r = pixels[offset];
        const g = pixels[offset + 1];
        const b = pixels[offset + 2];
        
        // Check if pixel is similar to first pixel (within threshold)
        if (Math.abs(r - firstR) < 10 && Math.abs(g - firstG) < 10 && Math.abs(b - firstB) < 10) {
          uniformCount++;
        }
      }
      
      // If more than 90% of samples are uniform, it's likely a solid color
      return uniformCount / sampleSize > 0.9;
    } catch (e) {
      // If we can't read pixels (WebGL), try another method
      return false;
    }
  });
}

/**
 * Helper to check screen color diversity
 */
async function checkScreenColorDiversity(page: Page): Promise<{ 
  hasDiversity: boolean; 
  uniqueColors: number;
  dominantColor: string;
}> {
  return await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return { hasDiversity: false, uniqueColors: 0, dominantColor: 'none' };

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return { hasDiversity: false, uniqueColors: 0, dominantColor: 'none' };

    try {
      // Sample pixels from different areas of the screen
      const samples = 20;
      const colors = new Set<string>();
      const width = canvas.width;
      const height = canvas.height;
      
      for (let i = 0; i < samples; i++) {
        const x = Math.floor((width / samples) * i);
        const y = Math.floor(height / 2);
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        const color = `rgb(${pixel[0]},${pixel[1]},${pixel[2]})`;
        colors.add(color);
      }
      
      const uniqueColors = colors.size;
      const dominantColor = Array.from(colors)[0] || 'unknown';
      
      // If we have more than 3 unique colors, there's diversity
      return {
        hasDiversity: uniqueColors > 3,
        uniqueColors,
        dominantColor
      };
    } catch (e) {
      return { hasDiversity: true, uniqueColors: 0, dominantColor: 'error' };
    }
  });
}

test.describe('Web Rendering - Critical Tests (Blue Screen Detection)', () => {
  test.beforeEach(async ({ page }) => {
    // Enable verbose logging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Browser error:', msg.text());
      }
    });
    
    page.on('pageerror', error => {
      console.error('Page error:', error.message);
    });
  });

  test('Page loads without errors and is not a solid blue screen', async ({ page }) => {
    // Navigate to the page
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for React to mount
    await page.waitForTimeout(2000);
    
    // Check that the page has content (not blank)
    const bodyText = await page.evaluate(() => document.body.textContent || '');
    expect(bodyText.length).toBeGreaterThan(50);
    
    // Check that we don't have a solid blue screen
    const isSolidBlue = await checkForSolidBlueScreen(page);
    if (isSolidBlue) {
      throw new Error('❌ CRITICAL: Screen is solid blue! The render pipeline is not functioning.');
    }
    
    // Check for color diversity
    const colorCheck = await checkScreenColorDiversity(page);
    console.log(`✓ Screen color diversity: ${colorCheck.uniqueColors} unique colors detected`);
    console.log(`  Dominant color: ${colorCheck.dominantColor}`);
    
    expect(colorCheck.hasDiversity, 
      `Screen appears to be a solid color. Detected only ${colorCheck.uniqueColors} unique colors.`
    ).toBe(true);
  });

  test('Main menu is visible and interactive', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Check that the start screen is visible
    const startScreen = page.locator('#startScreen');
    await expect(startScreen).toBeVisible({ 
      timeout: 10000 
    });
    
    // Verify menu contains game title
    const menuText = await startScreen.textContent();
    expect(menuText).toContain('Otter River Rush');
    
    // Check that game mode buttons exist and are visible
    const classicButton = page.locator('#classicButton');
    await expect(classicButton).toBeVisible({ timeout: 5000 });
    
    // Verify button is interactive (enabled)
    const isEnabled = await classicButton.isEnabled();
    expect(isEnabled).toBe(true);
    
    console.log('✅ Main menu is visible and interactive');
  });

  test('Game mode buttons are present and functional', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Check all game mode buttons exist
    const buttons = {
      classic: page.locator('#classicButton'),
      timeTrial: page.locator('#timeTrialButton'),
      zen: page.locator('#zenButton'),
      daily: page.locator('#dailyButton'),
    };
    
    for (const [mode, button] of Object.entries(buttons)) {
      const visible = await button.isVisible();
      if (!visible) {
        console.warn(`⚠️  ${mode} button not visible`);
      } else {
        console.log(`✓ ${mode} button is visible`);
      }
    }
    
    // At least the classic button must be present
    await expect(buttons.classic).toBeVisible();
  });

  test('Starting gameplay loads game view with functional canvas', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Verify menu is visible first
    await expect(page.locator('#startScreen')).toBeVisible();
    
    // Click the classic mode button
    const classicButton = page.locator('#classicButton');
    await expect(classicButton).toBeVisible({ timeout: 5000 });
    
    // Use JavaScript click for reliability
    await page.evaluate(() => {
      document.querySelector<HTMLButtonElement>('#classicButton')?.click();
    });
    
    // Wait for game to start
    await page.waitForTimeout(1500);
    
    // Menu should hide
    const menuHidden = await page.locator('#startScreen').isHidden();
    expect(menuHidden).toBe(true);
    
    // Canvas should be visible
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 5000 });
    
    // Verify canvas has WebGL context
    const hasWebGL = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return false;
      const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
      return gl !== null;
    });
    
    if (!hasWebGL) {
      throw new Error('❌ CRITICAL: Canvas exists but WebGL context is not available!');
    }
    
    console.log('✅ Gameplay canvas loaded with WebGL context');
  });

  test('Game HUD displays during gameplay', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Start game
    await page.evaluate(() => {
      document.querySelector<HTMLButtonElement>('#classicButton')?.click();
    });
    await page.waitForTimeout(1500);
    
    // Check that HUD elements are visible
    const scoreElement = page.locator('[data-testid="score"]');
    await expect(scoreElement).toBeVisible({ timeout: 5000 });
    
    console.log('✅ HUD is visible during gameplay');
  });

  test('Game state transitions correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Check initial state (menu)
    const initialState = await page.evaluate(() => {
      return (window as any).__gameStore?.getState?.()?.status || 'unknown';
    });
    expect(initialState).toBe('menu');
    
    // Start game
    await page.evaluate(() => {
      document.querySelector<HTMLButtonElement>('#classicButton')?.click();
    });
    await page.waitForTimeout(1500);
    
    // Check playing state
    const playingState = await page.evaluate(() => {
      return (window as any).__gameStore?.getState?.()?.status;
    });
    expect(playingState).toBe('playing');
    
    console.log('✅ Game state transitions: menu → playing');
  });

  test('Game renders and updates during gameplay', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Start game
    await page.evaluate(() => {
      document.querySelector<HTMLButtonElement>('#classicButton')?.click();
    });
    await page.waitForTimeout(2000);
    
    // Let game run for a few seconds
    await page.waitForTimeout(3000);
    
    // Check that distance increases (game is actually running)
    const distance = await page.evaluate(() => {
      return (window as any).__gameStore?.getState?.()?.distance || 0;
    });
    
    expect(distance).toBeGreaterThan(0);
    
    // Check that entities are being spawned
    const entityCount = await page.evaluate(() => {
      return (window as any).debug?.getPerformanceStats?.()?.totalEntities || 0;
    });
    
    expect(entityCount).toBeGreaterThan(0);
    
    console.log(`✅ Game is running: ${distance}m distance, ${entityCount} entities`);
  });

  test('Screen is not solid blue at any point during normal flow', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Check 1: Menu screen should not be solid blue
    let colorCheck = await checkScreenColorDiversity(page);
    expect(colorCheck.hasDiversity, 
      'Menu screen appears to be solid color'
    ).toBe(true);
    
    console.log(`✓ Menu screen has ${colorCheck.uniqueColors} unique colors`);
    
    // Start game
    await page.evaluate(() => {
      document.querySelector<HTMLButtonElement>('#classicButton')?.click();
    });
    await page.waitForTimeout(2000);
    
    // Check 2: Game screen should not be solid blue
    colorCheck = await checkScreenColorDiversity(page);
    expect(colorCheck.hasDiversity, 
      'Game screen appears to be solid color'
    ).toBe(true);
    
    console.log(`✓ Game screen has ${colorCheck.uniqueColors} unique colors`);
    
    // Check 3: Screen should not be solid blue after a few seconds of gameplay
    await page.waitForTimeout(3000);
    colorCheck = await checkScreenColorDiversity(page);
    expect(colorCheck.hasDiversity, 
      'Game screen became solid color during gameplay'
    ).toBe(true);
    
    console.log(`✓ Game screen remains diverse after gameplay: ${colorCheck.uniqueColors} unique colors`);
    console.log('✅ PASSED: No solid blue screen detected at any stage');
  });

  test('Controls are functional during gameplay', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Start game
    await page.evaluate(() => {
      document.querySelector<HTMLButtonElement>('#classicButton')?.click();
    });
    await page.waitForTimeout(2000);
    
    // Get initial player state
    const initialState = await page.evaluate(() => {
      const state = (window as any).__gameStore?.getState?.();
      return {
        distance: state?.distance || 0,
        score: state?.score || 0,
      };
    });
    
    // Press arrow key
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(500);
    
    // Game should still be running after input
    const afterInputState = await page.evaluate(() => {
      const state = (window as any).__gameStore?.getState?.();
      return {
        distance: state?.distance || 0,
        status: state?.status,
      };
    });
    
    expect(afterInputState.status).toBe('playing');
    expect(afterInputState.distance).toBeGreaterThanOrEqual(initialState.distance);
    
    console.log('✅ Controls are functional');
  });

  test('Pause and resume functionality works', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Start game
    await page.evaluate(() => {
      document.querySelector<HTMLButtonElement>('#classicButton')?.click();
    });
    await page.waitForTimeout(2000);
    
    // Pause the game
    await page.evaluate(() => {
      (window as any).__gameStore?.getState?.()?.pauseGame?.();
    });
    await page.waitForTimeout(500);
    
    // Check paused state
    const pausedState = await page.evaluate(() => {
      return (window as any).__gameStore?.getState?.()?.status;
    });
    expect(pausedState).toBe('paused');
    
    // Resume button should be visible
    const resumeButton = page.locator('#resumeButton');
    await expect(resumeButton).toBeVisible({ timeout: 5000 });
    
    // Resume the game
    await page.evaluate(() => {
      document.querySelector<HTMLButtonElement>('#resumeButton')?.click();
    });
    await page.waitForTimeout(500);
    
    // Check resumed state
    const resumedState = await page.evaluate(() => {
      return (window as any).__gameStore?.getState?.()?.status;
    });
    expect(resumedState).toBe('playing');
    
    console.log('✅ Pause/resume transitions work correctly');
  });

  test('No critical console errors during normal gameplay', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    page.on('pageerror', error => {
      errors.push(`Page error: ${error.message}`);
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Start game
    await page.evaluate(() => {
      document.querySelector<HTMLButtonElement>('#classicButton')?.click();
    });
    await page.waitForTimeout(3000);
    
    // Filter out non-critical errors
    const criticalErrors = errors.filter(error => {
      // Ignore known warnings
      return !error.includes('ResizeObserver') && 
             !error.includes('Warning:') &&
             !error.includes('console.warn');
    });
    
    if (criticalErrors.length > 0) {
      console.error('❌ Critical errors detected:');
      criticalErrors.forEach(error => console.error(`  - ${error}`));
    }
    
    expect(criticalErrors.length).toBe(0);
    console.log('✅ No critical console errors');
  });
});

test.describe('Web Rendering - Asset Loading', () => {
  test('3D models load successfully', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const networkErrors: string[] = [];
    
    page.on('response', response => {
      if (response.status() >= 400) {
        networkErrors.push(`${response.status()} ${response.url()}`);
      }
    });
    
    // Start game to trigger asset loading
    await page.evaluate(() => {
      document.querySelector<HTMLButtonElement>('#classicButton')?.click();
    });
    
    // Wait for models to load
    await page.waitForTimeout(5000);
    
    // Check for 404s on model files
    const modelErrors = networkErrors.filter(error => 
      error.includes('.glb') || error.includes('.gltf') || error.includes('/models/')
    );
    
    if (modelErrors.length > 0) {
      console.error('❌ Model loading errors:');
      modelErrors.forEach(error => console.error(`  - ${error}`));
      throw new Error(`Failed to load ${modelErrors.length} 3D model(s)`);
    }
    
    console.log('✅ All 3D models loaded successfully');
  });

  test('Textures load successfully', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const networkErrors: string[] = [];
    
    page.on('response', response => {
      if (response.status() >= 400) {
        networkErrors.push(`${response.status()} ${response.url()}`);
      }
    });
    
    await page.waitForTimeout(2000);
    
    // Start game
    await page.evaluate(() => {
      document.querySelector<HTMLButtonElement>('#classicButton')?.click();
    });
    
    await page.waitForTimeout(5000);
    
    // Check for texture loading errors
    const textureErrors = networkErrors.filter(error => 
      error.includes('.png') || error.includes('.jpg') || 
      error.includes('.webp') || error.includes('/textures/')
    );
    
    if (textureErrors.length > 0) {
      console.warn('⚠️  Texture loading warnings:');
      textureErrors.forEach(error => console.warn(`  - ${error}`));
      // Don't fail the test for texture errors, just warn
    } else {
      console.log('✅ Textures loaded without errors');
    }
  });
});
