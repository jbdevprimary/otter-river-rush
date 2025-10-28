# Cross-Platform Build Status

## Overview
Game now uses **compositional configuration** with single source of truth in `visual-constants.ts`. All platforms build from same web bundle with proper visual properties.

## Build Architecture

```
Web Build (src/client)
    ↓ vite build → dist/
    ├─→ GitHub Pages (Web)
    ├─→ Electron (Desktop: Linux, macOS, Windows)
    └─→ Capacitor (Mobile: Android, iOS)
```

## Configuration Alignment

### Visual Constants
**Location**: `src/client/src/config/visual-constants.ts`

Single source of truth for:
- Entity scales (otter: 2.0x, rock: 1.5x, coin: 0.8x, gem: 1.0x)
- Camera settings (position, zoom: 50, FOV)
- Lighting (ambient: 0.9, directional positions/intensities)
- Physics (scrollSpeed: 5, spawn intervals)
- Colors & Z-layers

### Build Output
- **Vite**: Builds to `dist/` at repo root
- **Electron**: Reads from `dist/`, outputs to `dist-electron/`
- **Capacitor**: Syncs from `dist/`, outputs to `android/` or `ios/`

## Platform Status

### ✅ Web (Tested & Working)
- **Status**: ✅ FULLY WORKING
- **FPS**: 111-120
- **Models**: Visible at proper scale
- **Build**: Production build successful (1.26 MB, 349 KB gzipped)
- **Build Command**: `pnpm build`
- **Output**: `dist/` at root
- **Deploy**: GitHub Pages via workflow
- **Test URL**: https://jbcom.github.io/otter-river-rush/

### ✅ Desktop (Ready to Test)
- **Platforms**: Linux, macOS, Windows
- **Wrapper**: Electron
- **Build Command**: `npm run electron:build`
- **Source**: Reads from `dist/`
- **Output**: `dist-electron/`
  - Linux: `.AppImage`, `.deb`
  - macOS: `.dmg`, `.zip`
  - Windows: `.exe`
- **Workflow**: `.github/workflows/build-platforms.yml`
- **Status**: ✅ Build path verified, ready for testing

### ✅ Android (Platform Added & Ready)
- **Platform**: Android APK
- **Wrapper**: Capacitor
- **Status**: ✅ Platform added, ready for build
- **Build Commands**:
  ```bash
  pnpm build                # Build web first ✅ DONE
  npx cap sync android      # Sync to Capacitor ✅ DONE
  cd android && ./gradlew assembleRelease  # Requires JDK 17
  ```
- **Source**: Reads from `dist/`
- **Output**: `android/app/build/outputs/apk/release/`
- **Workflow**: `.github/workflows/build-platforms.yml`
- **Next**: Install JDK 17 to build APK

### 🔄 iOS (Configured, Not Tested)
- **Platform**: iOS
- **Wrapper**: Capacitor
- **Requires**: macOS + Xcode
- **Build Commands**:
  ```bash
  pnpm build           # Build web first
  npx cap sync ios     # Sync to Capacitor
  # Then open in Xcode and build
  ```
- **Status**: Config exists, needs macOS to test

## Testing Checklist

### Local Testing
- [ ] Web build works (`pnpm build && pnpm preview`)
- [ ] Desktop build works (`npm run electron:build`)
- [ ] Android build works (requires Android Studio/SDK)
- [ ] iOS build works (requires macOS/Xcode)

### CI/CD Testing
- [ ] Web deployment succeeds
- [ ] Desktop builds for all OS
- [ ] Android APK builds
- [ ] E2E tests pass

### Visual Verification
- [ ] Models render at correct scale on all platforms
- [ ] Touch controls work (mobile)
- [ ] Keyboard controls work (desktop)
- [ ] Performance acceptable (60+ FPS)

## Build Results

### ✅ Completed Successfully
- **Web build**: 1.26 MB bundle (349 KB gzipped)
- **Output location**: `dist/` at repo root
- **Assets included**: Models, sprites, HUD, icons all present
- **TypeScript**: No errors (fixed useRef type issues)
- **Capacitor sync**: Web assets copied to Android
- **Android platform**: Generated successfully with Gradle wrapper

### Known Issues

#### ✅ Resolved
- ✅ React hooks violations (fixed proper patterns)
- ✅ Models too small (fixed with visual constants 2.0x scale)
- ✅ Build path mismatch (fixed Vite output to root dist/)
- ✅ TypeScript build errors (fixed useRef type annotations)
- ✅ Android platform missing (added successfully)

#### 🔄 To Verify
- JDK 17 installation for Android APK build
- Mobile touch input with Capacitor
- Desktop window sizing with Electron
- Asset loading on native platforms

## Quick Test Commands

```bash
# Web
pnpm dev                    # Dev server
pnpm build                  # Production build
pnpm preview                # Preview build

# Desktop (after web build)
npm run electron:build      # All platforms

# Android (after web build)
npx cap sync android
cd android && ./gradlew assembleRelease

# CI/CD (GitHub Actions)
# Trigger manually: Actions > Build All Platforms > Run workflow
```

## Workflow Configuration

See `.github/workflows/build-platforms.yml`:
- Builds web once
- Reuses for all platforms
- Uploads artifacts
- Deploys to GitHub Pages
- Runs E2E tests

## Next Steps

1. **Test desktop builds** - Run `npm run electron:build` locally
2. **Test Android build** - Set up Android SDK, build APK
3. **Verify visual constants** - Ensure same scale/position across platforms
4. **Run CI/CD** - Trigger workflow, verify all builds succeed
5. **E2E testing** - Run Playwright tests against each platform
