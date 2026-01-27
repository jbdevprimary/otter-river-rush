# Testing GitHub Pages Deployment

## Quick Test

Test the live GitHub Pages deployment with a single command:

```bash
# Run all tests against GitHub Pages
pnpm run test:github-pages

# Or manually specify the URL
pnpm run test:e2e:github-pages
```

## Manual Testing with Playwright MCP

### Using Playwright UI (Recommended)

This opens an interactive browser where you can see the tests run:

```bash
BASE_URL=https://arcade-cabinet.github.io/otter-river-rush pnpm run test:e2e:web:ui
```

### Using Headed Mode

Watch tests execute in a real browser:

```bash
BASE_URL=https://arcade-cabinet.github.io/otter-river-rush pnpm run test:e2e:web:headed
```

### Headless Mode (CI-style)

Run tests in headless mode like CI does:

```bash
BASE_URL=https://arcade-cabinet.github.io/otter-river-rush pnpm run test:e2e:web
```

## What Gets Tested

When you run tests against GitHub Pages, they verify:

✅ **No Blue Screen**
- Samples pixels across the canvas
- Checks for color diversity
- Fails if screen is solid blue

✅ **Menu Renders**
- Game title is visible
- Buttons are interactive
- UI elements display correctly

✅ **WebGL Initializes**
- Canvas element exists
- WebGL2 context is available
- Babylon.js loads successfully

✅ **Assets Load**
- 3D models (GLB files) load without 404s
- Textures load correctly
- No critical network errors

✅ **Game Functions**
- State transitions work (menu → playing)
- Controls respond to keyboard input
- HUD displays during gameplay
- Distance/score tracking works

## Viewing Test Results

After running tests, view the detailed HTML report:

```bash
pnpm exec playwright show-report
```

This opens a browser with:
- Test pass/fail status
- Screenshots of failures
- Network activity logs
- Console error messages
- Execution timeline

## GitHub Pages URL

The live deployment is at:
**https://arcade-cabinet.github.io/otter-river-rush**

You can test it manually by:
1. Opening the URL in your browser
2. Clicking "PLAY GAME"
3. Verifying the game renders (not a solid blue screen)
4. Testing keyboard controls (arrow keys or A/D)

## CI/CD Integration

Tests run automatically after every deployment:

1. Code is pushed to `main` branch
2. CD workflow builds and deploys to GitHub Pages
3. `test-deployment` job runs E2E tests against live URL
4. If tests fail, deployment is marked as failed
5. Playwright HTML report is uploaded as artifact

See `.github/workflows/cd.yml` for the configuration.

## Troubleshooting

### Tests Fail with "net::ERR_BLOCKED_BY_CLIENT"

This usually means:
- URL is incorrect
- Site hasn't deployed yet
- Network/firewall blocking the connection

**Solution**: Wait a few minutes for deployment, then retry.

### Tests Fail with "solid blue screen"

This means the render pipeline isn't working. Check:
- Browser console for errors
- Network tab for failed asset loads
- WebGL is available in the test environment

**Solution**: Review Playwright HTML report for details.

### Tests Pass Locally but Fail in CI

This can happen due to:
- Timing differences (slower CI environment)
- Different asset paths in production
- WebGL differences in headless mode

**Solution**: Run tests with `--headed` locally to match CI behavior.

## Related Documentation

- [Main E2E Testing Guide](./web-e2e-tests.md)
- [Test Suite Documentation](../tests/README.md)
- [CI/CD Workflows](../.github/workflows/)
