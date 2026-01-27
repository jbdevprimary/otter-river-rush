import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-report/results.json' }],
    process.env.CI ? ['github'] : ['list'],
  ],
  timeout: 60000, // Increased for WebGL initialization

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:4173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000,

    // WebGL-specific settings
    launchOptions: {
      args: [
        '--use-gl=angle', // Use ANGLE for consistent WebGL rendering
        '--use-angle=swiftshader', // Software rendering for CI headless
        '--enable-webgl',
        '--enable-webgl2',
        '--ignore-gpu-blocklist',
        '--disable-gpu-sandbox',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-background-timer-throttling',
        '--disable-renderer-backgrounding',
      ],
    },
  },

  // Visual testing specific settings for WebGL
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 500, // Higher tolerance for WebGL variance
      maxDiffPixelRatio: 0.02, // 2% pixel difference allowed
      threshold: 0.3, // Color difference threshold
      animations: 'disabled',
    },
    toMatchSnapshot: {
      maxDiffPixelRatio: 0.02,
    },
  },

  projects: [
    {
      name: 'chromium-webgl',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        launchOptions: {
          args: [
            '--use-gl=angle',
            '--use-angle=swiftshader',
            '--enable-webgl',
            '--enable-webgl2',
            '--ignore-gpu-blocklist',
            '--no-sandbox',
            '--disable-setuid-sandbox',
          ],
        },
      },
    },
    {
      name: 'chromium-video',
      use: {
        ...devices['Desktop Chrome'],
        video: 'on',
        launchOptions: {
          args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl'],
        },
      },
      testMatch: '**/ai-playthrough.spec.ts',
    },
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
        hasTouch: true,
        isMobile: true,
        launchOptions: {
          args: ['--use-gl=angle', '--enable-webgl'],
        },
      },
    },
  ],

  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: 'pnpm build && pnpm preview',
        port: 4173,
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
      },
});
