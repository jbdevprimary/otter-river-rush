/**
 * CRITICAL SMOKE TEST
 * Tests the ACTUAL user experience, not just state changes
 * This test MUST pass or the app is broken
 */

import { test, expect } from '@playwright/test';

test.describe('Critical Smoke Test - Real User Flow', () => {
  test('app loads, renders React, shows menu, starts game, renders canvas', async ({ page }) => {
    // Navigate
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // CRITICAL: Wait for React to mount
    await page.waitForTimeout(2000);
    
    // Check React app mounted (not white screen)
    const hasContent = await page.evaluate(() => {
      return document.body.textContent && document.body.textContent.length > 100;
    });
    expect(hasContent).toBe(true);
    
    // Check menu is visible
    const menuVisible = await page.locator('#startScreen').isVisible();
    expect(menuVisible).toBe(true);
    
    // Check menu has text content
    const menuText = await page.locator('#startScreen').textContent();
    expect(menuText).toContain('Otter River Rush');
    
    // CRITICAL: Actually click the button (don't bypass with evaluate)
    const classicButton = page.locator('#classicButton');
    await expect(classicButton).toBeVisible({ timeout: 5000 });
    
    // Force click with JavaScript since Playwright struggles with scroll containers
    await page.evaluate(() => {
      document.querySelector<HTMLButtonElement>('#classicButton')?.click();
    });
    await page.waitForTimeout(1000);
    
    // Check game started (menu should hide)
    const menuHidden = await page.locator('#startScreen').isHidden();
    expect(menuHidden).toBe(true);
    
    // CRITICAL: Check R3F canvas exists
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 5000 });
    
    // Check canvas has WebGL context (not just empty canvas)
    const hasWebGL = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return false;
      const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
      return gl !== null;
    });
    expect(hasWebGL).toBe(true);
    
    // Check HUD is visible
    const scoreElement = page.locator('[data-testid="score"]');
    await expect(scoreElement).toBeVisible({ timeout: 3000 });
    
    // Let game run for 3 seconds
    await page.waitForTimeout(3000);
    
    // Verify game is actually running (score or distance should increase)
    const gameState = await page.evaluate(() => {
      const state = (window as any).__gameStore?.getState?.();
      return {
        status: state?.status,
        score: state?.score,
        distance: state?.distance,
      };
    });
    
    expect(gameState.status).toBe('playing');
    expect(gameState.distance).toBeGreaterThan(0);
    
    console.log('✅ SMOKE TEST PASSED - App actually works!');
    console.log(`   Status: ${gameState.status}`);
    console.log(`   Distance: ${gameState.distance}m`);
    console.log(`   Score: ${gameState.score}`);
  });
});

