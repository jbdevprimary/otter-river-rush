# E2E Tests

## Quick Start

```bash
# Run web rendering tests (auto-starts preview server)
pnpm run test:e2e:web

# Run with Playwright UI (interactive debugging)
pnpm run test:e2e:web:ui

# Run in headed mode (see browser)
pnpm run test:e2e:web:headed

# Test against deployed site
BASE_URL=https://jbcom.github.io/otter-river-rush pnpm run test:e2e:web
```

## Test Files

- `web-rendering.spec.ts` - Web build rendering tests with blue screen detection

## Documentation

See [docs/testing/web-e2e-tests.md](../docs/testing/web-e2e-tests.md) for comprehensive documentation.

## What Gets Tested

### Critical Rendering Tests
- ✅ Page loads without solid blue screen
- ✅ Menu is visible and interactive
- ✅ Game starts and WebGL initializes
- ✅ HUD displays during gameplay
- ✅ Game state transitions work
- ✅ Controls are functional
- ✅ No critical console errors

### Asset Loading Tests
- ✅ 3D models load without 404s
- ✅ Textures load correctly

## CI/CD Integration

Tests automatically run:
- After deployment to GitHub Pages
- Against live URL: `https://jbcom.github.io/otter-river-rush`
- Generates HTML reports on failure
- Uploads artifacts for debugging
