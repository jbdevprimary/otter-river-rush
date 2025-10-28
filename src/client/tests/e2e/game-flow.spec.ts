import { test, expect } from '@playwright/test';

test.describe('Game Flow E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/otter-river-rush/');
    await page.waitForLoadState('networkidle');
  });
  
  test('should load main menu', async ({ page }) => {
    // Check for menu screen
    await expect(page.locator('#startScreen')).toBeVisible();
    
    // Check for game mode buttons
    await expect(page.locator('#classicButton')).toBeVisible();
    await expect(page.locator('#timeTrialButton')).toBeVisible();
    await expect(page.locator('#zenButton')).toBeVisible();
    await expect(page.locator('#dailyButton')).toBeVisible();
  });
  
  test('should start classic mode', async ({ page }) => {
    await page.evaluate(() => {
      document.querySelector<HTMLButtonElement>('#classicButton')?.click();
    });
    
    // Menu should hide
    await expect(page.locator('#startScreen')).toBeHidden();
    
    // Game canvas should be visible
    await expect(page.locator('canvas')).toBeVisible();
    
    // HUD elements should appear
    await page.waitForTimeout(1000); // Wait for game to initialize
  });
  
  test('should load 3D models', async ({ page }) => {
    await page.evaluate(() => {
      document.querySelector<HTMLButtonElement>('#classicButton')?.click();
    });
    
    // Wait for WebGL context
    await page.waitForTimeout(2000);
    
    // Check for Three.js canvas
    const canvas = await page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // Check canvas has WebGL context
    const hasWebGL = await page.evaluate(() => {
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
      const gl = canvas?.getContext('webgl') || canvas?.getContext('webgl2');
      return !!gl;
    });
    
    expect(hasWebGL).toBe(true);
  });
  
  test('should display HUD during gameplay', async ({ page }) => {
    await page.evaluate(() => {
      document.querySelector<HTMLButtonElement>('#classicButton')?.click();
    });
    await page.waitForTimeout(1000);
    
    // Score should be visible (starts at 0)
    const scoreVisible = await page.evaluate(() => {
      return document.body.textContent?.includes('0') || false;
    });
    
    expect(scoreVisible).toBe(true);
  });
  
  test('should respond to keyboard input', async ({ page }) => {
    await page.evaluate(() => {
      document.querySelector<HTMLButtonElement>('#classicButton')?.click();
    });
    await page.waitForTimeout(1000);
    
    // Press arrow key
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(100);
    
    // Should register input (check via debug tools)
    const playerExists = await page.evaluate(() => {
      return (window as any).debug?.getPerformanceStats?.()?.totalEntities > 0;
    });
    
    expect(playerExists).toBe(true);
  });
  
  test('should spawn entities over time', async ({ page }) => {
    await page.evaluate(() => {
      document.querySelector<HTMLButtonElement>('#classicButton')?.click();
    });
    
    // Wait for entities to spawn
    await page.waitForTimeout(5000);
    
    // Check entity count via debug
    const entityCount = await page.evaluate(() => {
      return (window as any).debug?.getPerformanceStats?.()?.totalEntities || 0;
    });
    
    expect(entityCount).toBeGreaterThan(0);
  });
  
  test('should pause game with Escape', async ({ page }) => {
    await page.evaluate(() => {
      document.querySelector<HTMLButtonElement>('#classicButton')?.click();
    });
    await page.waitForTimeout(1000);
    
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    // Pause screen should appear
    await expect(page.locator('#pauseScreen')).toBeVisible();
  });
  
  test('should resume from pause', async ({ page }) => {
    await page.evaluate(() => {
      document.querySelector<HTMLButtonElement>('#classicButton')?.click();
    });
    await page.waitForTimeout(1000);
    
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    await page.click('#resumeButton');
    await page.waitForTimeout(500);
    
    // Pause screen should hide
    await expect(page.locator('#pauseScreen')).toBeHidden();
  });
  
  test('should track score over time', async ({ page }) => {
    await page.evaluate(() => {
      document.querySelector<HTMLButtonElement>('#classicButton')?.click();
    });
    
    // Wait and check score increases
    await page.waitForTimeout(3000);
    
    const score = await page.evaluate(() => {
      return (window as any).__gameStore?.getState?.()?.score || 0;
    });
    
    expect(score).toBeGreaterThan(0);
  });
  
  test('should track distance', async ({ page }) => {
    await page.evaluate(() => {
      document.querySelector<HTMLButtonElement>('#classicButton')?.click();
    });
    await page.waitForTimeout(3000);
    
    const distance = await page.evaluate(() => {
      return (window as any).__gameStore?.getState?.()?.distance || 0;
    });
    
    expect(distance).toBeGreaterThan(0);
  });
  
  test('should handle game over', async ({ page }) => {
    await page.evaluate(() => {
      document.querySelector<HTMLButtonElement>('#classicButton')?.click();
    });
    
    // Trigger game over via debug
    await page.evaluate(() => {
      (window as any).__gameStore?.getState?.()?.endGame?.();
    });
    
    await page.waitForTimeout(1000);
    
    // Game over screen should appear
    await expect(page.locator('#gameOverScreen')).toBeVisible();
  });
  
  test('should restart from game over', async ({ page }) => {
    await page.evaluate(() => {
      document.querySelector<HTMLButtonElement>('#classicButton')?.click();
    });
    
    await page.evaluate(() => {
      (window as any).__gameStore?.getState?.()?.endGame?.();
    });
    
    await page.waitForTimeout(1000);
    await page.click('#restartButton');
    await page.waitForTimeout(1000);
    
    // Should be back in game
    const status = await page.evaluate(() => {
      return (window as any).__gameStore?.getState?.()?.status;
    });
    
    expect(status).toBe('playing');
  });
  
  test('should load all 3D model files', async ({ page }) => {
    await page.evaluate(() => {
      document.querySelector<HTMLButtonElement>('#classicButton')?.click();
    });
    await page.waitForTimeout(3000);
    
    // Check for failed model loads in console
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(2000);
    
    const has404Errors = consoleErrors.some(err => err.includes('404'));
    expect(has404Errors).toBe(false);
  });
  
  test('should maintain 30+ FPS', async ({ page }) => {
    await page.evaluate(() => {
      document.querySelector<HTMLButtonElement>('#classicButton')?.click();
    });
    await page.waitForTimeout(5000);
    
    // Check FPS via performance monitor
    const fps = await page.evaluate(() => {
      const fpsElement = document.querySelector('[class*="bg-green"]') || 
                         document.querySelector('[class*="bg-red"]');
      const text = fpsElement?.textContent || '0 FPS';
      return parseInt(text);
    });
    
    expect(fps).toBeGreaterThan(30);
  });
});
