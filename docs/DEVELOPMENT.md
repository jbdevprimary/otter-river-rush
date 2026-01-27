# Development Guide - Otter River Rush

**Last Updated**: 2026-01-26
**Status**: ⚠️ In Progress - Architecture Restructuring Needed

---

## Table of Contents

- [Current State](#current-state)
- [Architecture Issues](#architecture-issues)
- [Setup](#setup)
- [Asset Management](#asset-management)
- [Device Support](#device-support)
- [Testing](#testing)
- [Deployment](#deployment)
- [Common Tasks](#common-tasks)

---

## Current State

### What Works
- ✅ React Three Fiber 3D rendering
- ✅ Miniplex ECS game logic
- ✅ NativeWind UI components
- ✅ Expo app in `apps/mobile/`
- ✅ Metro bundler for web + native
- ✅ Basic game mechanics (3-lane runner)

### What's Broken/Missing
- ❌ Architecture is hybrid monorepo + Expo (should be pure Expo)
- ❌ Assets copied locally (should reference `~/assets`)
- ❌ No device-specific support (Pixel 8A, Fold, Tablet, iPad, iPhone 17)
- ❌ No fold/rotation awareness
- ❌ No Maestro testing
- ❌ No Playwright testing
- ❌ No GitHub Pages deployment
- ❌ No release-please for Android APKs

---

## Architecture Issues

### Problem: Hybrid Monorepo Pattern

**Current Structure**:
```
otter-river-rush/
├── apps/mobile/          # Expo app
├── packages/             # 10 shared packages
└── pnpm-workspace.yaml   # Monorepo config
```

**Issue**: User requirement is **pure Expo with build targets**, not pnpm monorepo.

**Options**:
1. **Flatten to single Expo app** - Move all `packages/*` into `apps/mobile/src/`
2. **Justify monorepo** - Explain benefits and get user approval
3. **Hybrid approach** - Use Expo with local packages

**Decision Required**: Clarify with user which approach to take.

---

## Setup

### Prerequisites

```bash
# Required
node >= 22.0.0
pnpm >= 10.0.0

# For native development
# iOS: macOS + Xcode
# Android: Android Studio + Java 21
```

### Installation

```bash
# Clone
git clone https://github.com/arcade-cabinet/otter-river-rush.git
cd otter-river-rush

# Install dependencies
pnpm install

# Start development
pnpm dev:web       # Web at localhost:8081
pnpm dev:ios       # iOS simulator
pnpm dev:android   # Android emulator
```

### Environment Variables

Required in `.env`:
```bash
MESHY_API_KEY=msy_xxx      # Meshy AI for 3D generation
EXPO_TOKEN=xxx             # EAS Build token
```

---

## Asset Management

### Current (WRONG) Setup

Assets are in `apps/mobile/public/` - **this is incorrect**.

### Correct Setup

**All assets should come from `~/assets`**:

```bash
~/assets/
├── AmbientCG/Assets/MATERIAL/    # PBR textures
│   ├── 1K-JPG/                   # Mobile
│   ├── 2K-JPG/                   # Desktop
│   └── 4K-JPG/                   # High-end
├── Kenney/
│   ├── 3D assets/                # ~8783 FBX + ~4677 GLB
│   └── Audio/                    # ~15 sound packs
├── KayKit_Adventurers_1.0_EXTRA/
├── Quaternius/
└── Low poly Western Objects/
```

### Required Changes

1. **Remove** `apps/mobile/public/` copies
2. **Symlink** or reference `~/assets` during build
3. **Update** asset loading code to use `~/assets` paths
4. **Generate** missing models via Meshy API

### Asset Loading Strategy

```typescript
// Current (WRONG)
const texture = useTexture('/textures/grass/color.jpg');

// Correct (TODO)
const texture = useTexture('~/assets/AmbientCG/Assets/MATERIAL/1K-JPG/Grass004/Grass004_1K_Color.jpg');
```

### Meshy Generation

```bash
# Generate 3D models for missing assets
cd packages/content-gen
pnpm gen:all
```

---

## Device Support

### Target Devices

**Android** (Local emulators available):
- Pixel 8A
- Pixel Fold
- Pixel Tablet

**iOS** (Local emulators available):
- iPad
- iPhone 17

### Required Features

1. **Fold Detection**
   ```typescript
   // Detect fold/unfold events
   window.addEventListener('resize', handleFoldChange);
   ```

2. **Rotation Support**
   ```typescript
   // Portrait ↔ Landscape
   window.addEventListener('orientationchange', handleRotation);
   ```

3. **Phone Optimization**
   - Minimize non-essential UI on phones
   - Maximize gameplay space
   - Responsive layouts for all screen sizes

### Implementation Status

- [ ] Fold event detection
- [ ] Rotation handling
- [ ] Device-specific layouts
- [ ] Safe area insets
- [ ] Responsive UI components

---

## Testing

### Maestro (Mobile Emulator Testing)

**Status**: Not implemented

**Setup** (TODO):
```bash
# Install Maestro
brew tap mobile-dev-inc/tap
brew install maestro

# Run tests
maestro test .maestro/flows/
```

**Required Tests**:
- Launch app
- Play game (3-lane controls)
- Pause/resume
- Game over flow
- Portrait/landscape modes
- Device rotation

### Playwright (Responsive Web Testing)

**Status**: Not implemented

**Setup** (TODO):
```bash
# Install Playwright
pnpm add -D @playwright/test

# Run tests
pnpm playwright test
```

**Required Tests**:
- Web responsiveness (desktop, tablet, mobile)
- Portrait and landscape modes
- Touch controls
- Keyboard controls
- Game flow (menu → play → game over)

### Current Testing

```bash
# Unit tests (Vitest)
pnpm test

# Linting
pnpm lint

# Type checking
pnpm type-check
```

---

## Deployment

### GitHub Pages (Web)

**Status**: Not configured

**Required**:
```yaml
# .github/workflows/deploy-web.yml
name: Deploy Web
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Export Expo web
        run: |
          cd apps/mobile
          npx expo export --platform web
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./apps/mobile/dist
```

### release-please (Android APKs)

**Status**: Not configured

**Required**:
- Automated versioning
- Changelog generation
- Multi-architecture APK builds
- GitHub releases

**Setup** (TODO):
```yaml
# .github/workflows/release.yml
name: Release
on:
  push:
    branches: [main]
jobs:
  release-please:
    runs-on: ubuntu-latest
    steps:
      - uses: google-github-actions/release-please-action@v4
        with:
          release-type: simple
```

### EAS Build (Native Apps)

**Current Setup**:
```bash
# Build for Android
eas build -p android --profile preview

# Build for iOS
eas build -p ios --profile preview

# Submit to stores
eas submit -p android
eas submit -p ios
```

---

## Common Tasks

### Start Development Server

```bash
# All platforms
pnpm dev

# Specific platforms
pnpm dev:web       # localhost:8081
pnpm dev:ios       # iOS simulator
pnpm dev:android   # Android emulator
```

### Build for Production

```bash
# Web
pnpm build:web     # Exports to apps/mobile/dist

# Native (requires EAS account)
cd apps/mobile
eas build -p android --profile production
eas build -p ios --profile production
```

### Clear Caches

```bash
# Metro bundler
npx expo start --clear

# Node modules
rm -rf node_modules apps/mobile/node_modules
pnpm install

# Build artifacts
rm -rf apps/mobile/dist apps/mobile/.expo
```

### Generate Assets

```bash
# Generate 3D models via Meshy
cd packages/content-gen
pnpm gen:all

# Generate sprites (if needed)
pnpm generate:sprites
```

### Update Dependencies

```bash
# Check outdated
pnpm outdated

# Update all
pnpm update --latest

# Update Expo SDK
cd apps/mobile
npx expo install --fix
```

---

## Project Structure

```
otter-river-rush/
├── apps/
│   └── mobile/               # Expo app
│       ├── app/              # Expo Router screens
│       ├── assets/           # Native assets (icons, splash)
│       ├── public/           # ⚠️ WRONG: Should use ~/assets
│       ├── src/
│       │   ├── components/   # React components
│       │   ├── screens/      # Screen components
│       │   └── hooks/        # Custom hooks
│       ├── app.json          # Expo config
│       ├── eas.json          # EAS Build config
│       ├── metro.config.js   # Metro bundler config
│       └── tailwind.config.js # Tailwind config
├── packages/                 # ⚠️ Should these exist in pure Expo?
│   ├── game-core/            # Game logic (ECS, systems)
│   ├── rendering/            # R3F components
│   ├── config/               # Game constants
│   ├── ui/                   # UI components (NativeWind)
│   ├── audio/                # Audio system
│   ├── state/                # Zustand stores
│   ├── types/                # TypeScript types
│   ├── assets/               # Asset utilities
│   └── content-gen/          # Meshy pipeline
├── memory-bank/              # AI agent context (up-to-date)
├── docs/                     # Development documentation
├── .github/workflows/        # CI/CD
├── pnpm-workspace.yaml       # ⚠️ Should this exist?
└── package.json              # Root package
```

---

## Known Issues

### Critical
1. **Architecture mismatch**: Monorepo vs pure Expo
2. **Asset sourcing**: Using local copies instead of `~/assets`
3. **Missing device support**: No Pixel/iPad specific handling
4. **No fold/rotation**: Not responsive to device orientation
5. **Missing testing**: No Maestro or Playwright setup
6. **Missing deployment**: No GitHub Pages or release-please

### Minor
- Audio system not fully integrated
- Some UI components need polish
- Performance not profiled on low-end devices

---

## Next Steps

### Immediate (High Priority)
1. **Clarify architecture**: Pure Expo or justify monorepo
2. **Fix asset sourcing**: Use `~/assets` instead of local copies
3. **Add device support**: Pixel 8A, Fold, Tablet, iPad, iPhone 17
4. **Implement fold/rotation**: Detect and respond to device changes

### Short-term (Medium Priority)
5. **Set up Maestro**: Mobile emulator testing
6. **Set up Playwright**: Responsive web testing
7. **Configure GitHub Pages**: Web deployment
8. **Configure release-please**: Android APK releases

### Long-term (Polish)
9. Integrate audio system fully
10. Performance optimization
11. Additional game modes
12. App store submissions

---

## Getting Help

- **Issues**: Check `memory-bank/activeContext.md` for current work
- **Architecture**: See `docs/ARCHITECTURE.md`
- **Game Design**: See `memory-bank/projectbrief.md`
- **Progress**: See `memory-bank/progress.md`

---

**Status**: This document reflects the **current reality** (2026-01-26) with architecture issues clearly identified.
