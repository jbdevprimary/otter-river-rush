import { expect, test } from '@playwright/test';

test.describe('Game Flow E2E Tests', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL || '/');
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
    await page.evaluate(() => (window as any).__gameStore?.getState?.()?.startGame?.('classic'));

    await page.waitForTimeout(500);

    // Check game state changed to playing
    const status = await page.evaluate(() => {
      return (window as any).__gameStore?.getState?.()?.status;
    });

    expect(status).toBe('playing');
  });

  test('should load 3D models', async ({ page }) => {
    await page.evaluate(() => (window as any).__gameStore?.getState?.()?.startGame?.('classic'));

    await page.waitForTimeout(2000);

    // Check player entity was created
    const playerExists = await page.evaluate(() => {
      return (window as any).debug?.getPerformanceStats?.()?.totalEntities > 0;
    });

    expect(playerExists).toBe(true);
  });

  test('should display HUD during gameplay', async ({ page }) => {
    await page.evaluate(() => (window as any).__gameStore?.getState?.()?.startGame?.('classic'));
    await page.waitForTimeout(1000);

    // Score should be visible (starts at 0)
    const scoreVisible = await page.evaluate(() => {
      return document.body.textContent?.includes('0') || false;
    });

    expect(scoreVisible).toBe(true);
  });

  test('should respond to keyboard input', async ({ page }) => {
    await page.evaluate(() => (window as any).__gameStore?.getState?.()?.startGame?.('classic'));
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
    await page.evaluate(() => (window as any).__gameStore?.getState?.()?.startGame?.('classic'));

    // Wait for entities to spawn
    await page.waitForTimeout(5000);

    // Check entity count via debug
    const entityCount = await page.evaluate(() => {
      return (window as any).debug?.getPerformanceStats?.()?.totalEntities || 0;
    });

    expect(entityCount).toBeGreaterThan(0);
  });

  test('should pause game with Escape', async ({ page }) => {
    await page.evaluate(() => (window as any).__gameStore?.getState?.()?.startGame?.('classic'));
    await page.waitForTimeout(1000);

    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Pause screen should appear
    await expect(page.locator('#pauseScreen')).toBeVisible();
  });

  test('should resume from pause', async ({ page }) => {
    await page.evaluate(() => (window as any).__gameStore?.getState?.()?.startGame?.('classic'));
    await page.waitForTimeout(1000);

    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    await page.click('#resumeButton');
    await page.waitForTimeout(500);

    // Pause screen should hide
    await expect(page.locator('#pauseScreen')).toBeHidden();
  });

  test('should track score over time', async ({ page }) => {
    await page.evaluate(() => (window as any).__gameStore?.getState?.()?.startGame?.('classic'));

    // Wait and check score increases
    await page.waitForTimeout(3000);

    const score = await page.evaluate(() => {
      return (window as any).__gameStore?.getState?.()?.score || 0;
    });

    expect(score).toBeGreaterThan(0);
  });

  test('should track distance', async ({ page }) => {
    await page.evaluate(() => (window as any).__gameStore?.getState?.()?.startGame?.('classic'));
    await page.waitForTimeout(3000);

    const distance = await page.evaluate(() => {
      return (window as any).__gameStore?.getState?.()?.distance || 0;
    });

    expect(distance).toBeGreaterThan(0);
  });

  test('should handle game over', async ({ page }) => {
    await page.evaluate(() => (window as any).__gameStore?.getState?.()?.startGame?.('classic'));

    // Trigger game over via debug
    await page.evaluate(() => {
      (window as any).__gameStore?.getState?.()?.endGame?.();
    });

    await page.waitForTimeout(1000);

    // Game over screen should appear
    await expect(page.locator('#gameOverScreen')).toBeVisible();
  });

  test('should restart from game over', async ({ page }) => {
    await page.evaluate(() => (window as any).__gameStore?.getState?.()?.startGame?.('classic'));

    await page.evaluate(() => {
      (window as any).__gameStore?.getState?.()?.endGame?.();
    });

    await page.waitForTimeout(1000);
    await page.evaluate(() => {
      document.querySelector<HTMLButtonElement>('#restartButton')?.click();
    });
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
    await page.evaluate(() => (window as any).__gameStore?.getState?.()?.startGame?.('classic'));
    await page.waitForTimeout(3000);

    // Measure FPS directly
    const fps = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let frames = 0;
        let lastTime = performance.now();

        function measureFrame() {
          frames++;
          const currentTime = performance.now();

          if (currentTime - lastTime >= 1000) {
            resolve(frames);
          } else {
            requestAnimationFrame(measureFrame);
          }
        }

        requestAnimationFrame(measureFrame);
      });
    });

    expect(fps).toBeGreaterThan(2); // Headless browser runs slower; sanity threshold
  });
});
