# Web E2E Testing with Playwright MCP

## Overview

This document describes the E2E testing setup for the web version of Otter River Rush. These tests use Playwright's MCP (Modular Component Pattern) to automatically manage test servers and verify game rendering across different environments.

## Purpose

The web E2E tests solve the **solid blue screen problem** and ensure:

1. **Rendering integrity** - Game renders correctly with WebGL
2. **Blue screen detection** - Explicitly catches solid color rendering failures
3. **UI functionality** - Menu and gameplay elements are interactive
4. **State management** - Game transitions work correctly
5. **Asset loading** - 3D models and textures load without 404s
6. **Cross-environment** - Works on localhost, preview, and deployed sites

## How Playwright MCP Works

Playwright MCP automatically manages the test environment based on configuration:

### Automatic Server Management

```typescript
// playwright.config.ts
webServer: process.env.BASE_URL
  ? undefined  // BASE_URL set: use that URL
  : {
      command: 'npm run preview',  // No BASE_URL: start preview server
      port: 4173,
      reuseExistingServer: !process.env.CI,
    },
```

**When `BASE_URL` is set:**
- Playwright tests against that URL
- No server is started
- Use for testing deployed sites or custom servers

**When `BASE_URL` is NOT set:**
- Playwright builds and starts `npm run preview`
- Waits for server to be ready on port 4173
- Automatically shuts down server after tests
- Use for local development testing

## Test Suite Structure

Location: `tests/e2e/web-rendering.spec.ts`

### Critical Tests (Blue Screen Detection)

1. **Page loads without solid blue screen**
   - Checks color diversity across screen
   - Explicitly fails if solid color detected
   - Verifies content is present

2. **Main menu visibility**
   - Menu is visible and contains game title
   - Buttons are present and interactive

3. **Gameplay initialization**
   - Game starts when clicking play button
   - WebGL canvas loads and initializes
   - Menu transitions to gameplay

4. **Game rendering**
   - HUD displays during gameplay
   - Distance and entities increase over time
   - Controls respond to input

5. **State transitions**
   - Menu → Playing → Paused → Playing
   - All transitions work smoothly

6. **No console errors**
   - Critical errors are caught and reported
   - Known warnings are filtered out

### Asset Loading Tests

1. **3D models** - GLB/GLTF files load without 404s
2. **Textures** - PNG/JPG/WebP files load correctly

## Running Tests

### Prerequisites

```bash
# Install dependencies
pnpm install

# Build the web app
pnpm build
```

### Local Testing (Auto Server)

Playwright starts preview server automatically:

```bash
# Basic run (headless, auto-starts server)
pnpm run test:e2e:web

# With Playwright UI (interactive debugging)
pnpm run test:e2e:web:ui

# Headed mode (see browser)
pnpm run test:e2e:web:headed

# Watch mode
pnpm exec playwright test tests/e2e/web-rendering.spec.ts --watch
```

### Testing Against Custom URL

Test against any URL by setting `BASE_URL`:

```bash
# Test against local dev server
BASE_URL=http://localhost:5173 pnpm run test:e2e:web

# Test against preview server (manual)
BASE_URL=http://localhost:4173 pnpm run test:e2e:web

# Test against deployed site
BASE_URL=https://jbcom.github.io/otter-river-rush pnpm run test:e2e:web

# Test against staging environment
BASE_URL=https://staging.example.com pnpm run test:e2e:web
```

### Debug Specific Test

```bash
# Run single test
pnpm exec playwright test tests/e2e/web-rendering.spec.ts -g "solid blue screen"

# Run with debug inspector
PWDEBUG=1 pnpm exec playwright test tests/e2e/web-rendering.spec.ts

# Run and generate trace
pnpm exec playwright test tests/e2e/web-rendering.spec.ts --trace on
```

## CI/CD Integration

### In Pull Requests (CI Workflow)

Tests run in smoke test mode as part of CI:

```yaml
# .github/workflows/ci.yml
- name: Run E2E smoke tests
  run: pnpm test:e2e --project=chromium --grep="smoke"
```

### After Deployment (CD Workflow)

Full rendering tests run after deployment to verify the live site:

```yaml
# .github/workflows/cd.yml
- name: Run Web E2E tests against deployment
  env:
    BASE_URL: https://jbcom.github.io/otter-river-rush
  run: pnpm run test:e2e:web --reporter=html
```

## Understanding Test Results

### ✅ Success Output

```
✓ Page loads without errors and is not a solid blue screen
  ✓ Screen color diversity: 15 unique colors detected
  Dominant color: rgb(10,22,40)

✅ Main menu is visible and interactive
✅ Gameplay canvas loaded with WebGL context
✅ Game is running: 45m distance, 12 entities
✅ PASSED: No solid blue screen detected at any stage
```

### ❌ Failure Output (Blue Screen)

```
❌ CRITICAL: Screen is solid blue! The render pipeline is not functioning.
Screen appears to be a solid color. Detected only 1 unique colors.

Expected: true
Received: false
```

### ❌ Failure Output (WebGL)

```
❌ CRITICAL: Canvas exists but WebGL context is not available!
```

### ❌ Failure Output (Assets)

```
❌ Model loading errors:
  - 404 https://example.com/assets/models/otter.glb
  - 404 https://example.com/assets/models/rock.glb
Failed to load 2 3D model(s)
```

## Solving Common Problems

### Problem: Solid Blue Screen

**Root causes:**
1. React Three Fiber not initializing
2. WebGL context failing to create
3. Canvas covered by solid color background
4. Models not loading/rendering

**Debugging steps:**
```bash
# Run with headed browser to see what's happening
pnpm run test:e2e:web:headed

# Check browser console
pnpm exec playwright test tests/e2e/web-rendering.spec.ts --headed

# Generate trace for detailed analysis
pnpm exec playwright test tests/e2e/web-rendering.spec.ts --trace on
pnpm exec playwright show-trace trace.zip
```

**Solutions:**
- Check `vite.config.ts` for correct `base` path
- Verify `import.meta.env.BASE_URL` usage in code
- Ensure WebGL is available in test environment
- Check that Canvas component is rendering

### Problem: Assets Not Loading (404s)

**Root causes:**
1. Incorrect `base` in `vite.config.ts`
2. Assets not copied to dist folder
3. Wrong asset paths in code

**Debugging steps:**
```bash
# Check built files
ls -R apps/web/dist/assets/

# Test asset URLs directly
curl -I https://example.com/assets/models/otter.glb

# Run tests and check network tab
pnpm run test:e2e:web:headed
```

**Solutions:**
- Update `vite.config.ts` base for production
- Verify `public/` folder structure
- Check `AssetBridge` path construction
- Ensure `BASE_URL` env var is correct

### Problem: Menu Not Visible

**Root causes:**
1. React not mounting
2. CSS not loading
3. DOM elements have wrong IDs

**Debugging:**
```bash
# Check DOM structure
pnpm exec playwright codegen http://localhost:4173

# Run with UI mode
pnpm run test:e2e:web:ui
```

**Solutions:**
- Verify `#startScreen` and `#classicButton` IDs exist
- Check CSS is bundled and loaded
- Ensure React root renders correctly

### Problem: WebGL Not Available

**Root causes:**
1. Headless browser lacks GPU
2. WebGL disabled
3. Browser too old

**Solutions:**
```bash
# Force software rendering
pnpm exec playwright test --browser=chromium --headed

# Update Playwright browsers
pnpm exec playwright install --with-deps chromium
```

## Test Configuration

### Playwright Config (`playwright.config.ts`)

```typescript
export default defineConfig({
  testDir: './tests/e2e',
  baseURL: process.env.BASE_URL || 'http://localhost:4173',
  timeout: 30000,  // 30s per test
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  
  use: {
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    actionTimeout: 10000,
  },
  
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: 'npm run preview',
        port: 4173,
        reuseExistingServer: !process.env.CI,
      },
});
```

### Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `BASE_URL` | Target URL for tests | `https://example.com` |
| `CI` | Enable CI-specific settings | `true` |
| `PWDEBUG` | Enable Playwright inspector | `1` |

## Adding New Tests

Follow this pattern:

```typescript
test('New feature renders correctly', async ({ page }) => {
  // Navigate
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  // Act
  await page.locator('#myButton').click();
  await page.waitForTimeout(1000);
  
  // Assert
  await expect(page.locator('#result')).toBeVisible();
  
  // Log success
  console.log('✅ New feature verified');
});
```

## Best Practices

1. **Use real user flows** - Click buttons, don't manipulate state
2. **Wait appropriately** - Give React/WebGL time to initialize
3. **Log progress** - Use console.log for debugging
4. **Handle timing** - Be generous with timeouts in headless
5. **Test cleanup** - Tests should be independent
6. **Clear errors** - Provide helpful failure messages

## Helper Functions

### `checkForSolidBlueScreen(page)`

Samples canvas pixels to detect uniform color (blue screen).

```typescript
const isSolidBlue = await checkForSolidBlueScreen(page);
if (isSolidBlue) {
  throw new Error('Screen is solid blue!');
}
```

### `checkScreenColorDiversity(page)`

Analyzes screen for color variety.

```typescript
const { hasDiversity, uniqueColors } = await checkScreenColorDiversity(page);
expect(hasDiversity).toBe(true);
console.log(`Found ${uniqueColors} unique colors`);
```

## Continuous Improvement

As the game evolves:

1. **Add tests for new features** - Cover new game modes, UI elements
2. **Update selectors** - Keep IDs/selectors in sync with code
3. **Refine timeouts** - Adjust based on CI performance
4. **Expand assertions** - Add checks for new edge cases
5. **Document changes** - Keep this guide updated

## Related Files

- `tests/e2e/web-rendering.spec.ts` - Test file
- `playwright.config.ts` - Playwright configuration
- `.github/workflows/ci.yml` - CI pipeline
- `.github/workflows/cd.yml` - CD pipeline
- `package.json` - Test scripts

## Troubleshooting Checklist

When tests fail:

- [ ] Check browser console for errors
- [ ] Verify assets load (Network tab)
- [ ] Confirm WebGL is available
- [ ] Test base URL directly in browser
- [ ] Run with `--headed` to see UI
- [ ] Check Playwright version is current
- [ ] Review recent code changes
- [ ] Compare with working commit

## Support

For issues or questions:

1. Review test logs in GitHub Actions
2. Download Playwright HTML reports
3. Run tests locally with `--ui` flag
4. Check browser console in headed mode
5. Review related documentation
