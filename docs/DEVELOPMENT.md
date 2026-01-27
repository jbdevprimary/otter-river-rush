# Development Guide - Otter River Rush

**Last Updated**: 2026-01-27
**Status**: ✅ Flat Expo Architecture (Web + iOS + Android)

---

## Table of Contents

- [Current State](#current-state)
- [Project Structure](#project-structure)
- [Setup](#setup)
- [Asset Management](#asset-management)
- [Device Support](#device-support)
- [Testing](#testing)
- [Deployment](#deployment)
- [Common Tasks](#common-tasks)

---

## Current State

### What Works
- ✅ Flat Expo structure (`app/`, `src/`, `assets/`)
- ✅ React Three Fiber rendering + Miniplex ECS game logic
- ✅ NativeWind UI components + branded 9-slice assets
- ✅ Expo Router navigation
- ✅ Metro bundler for web + native
- ✅ Core gameplay loop (lane move + jump + collisions)

### What's In Progress
- 🔄 Branded landing page polish (9-slice updates)
- 🔄 Settings/Power-ups modal refinements
- 🔄 Device testing on physical iOS/Android hardware

---

## Project Structure

```
otter-river-rush/
├── app/                 # Expo Router screens
├── src/                 # Game + UI source
│   ├── components/      # UI + R3F components
│   ├── game/            # ECS systems, entities
│   ├── hooks/           # Custom hooks
│   └── lib/             # Utilities (audio, helpers)
├── assets/              # App-bundled assets (branding, 9-slice UI)
├── docs/                # Documentation
└── memory-bank/         # AI agent context
```

---

## Setup

### Prerequisites

```bash
node >= 22.0.0
pnpm >= 10.0.0
```

### Installation

```bash
git clone https://github.com/arcade-cabinet/otter-river-rush.git
cd otter-river-rush
pnpm install
```

### Environment Variables

Only required for asset generation or EAS builds:

```bash
MESHY_API_KEY=msy_xxx
EXPO_TOKEN=xxx
```

---

## Asset Management

### Asset Locations

- **`assets/`**: Bundled app assets (logos, splash, models, textures, audio)

### Loading Guidance

- **R3F models**: load via `expo-asset` (bundled URIs).
- **Branding/UI**: load from `assets/` via `require()` or `expo-asset`.

### Model Generation

```bash
pnpm generate:models
pnpm generate:animations
```

---

## Device Support

### Target Devices

- Android: Pixel 8A, Pixel Fold, Pixel Tablet
- iOS: iPhone 17, iPad

### Required UX Considerations

- Safe areas (notches + insets)
- Orientation awareness (portrait-first)
- Touch gesture parity with keyboard controls

---

## Testing

### Current Commands

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:playwright
pnpm test:maestro
```

### Playwright (Web E2E)

Playwright is configured in `playwright.config.ts`, but E2E test suites are
still being assembled. Add tests under `tests/e2e/` when ready, then run:

```bash
pnpm playwright test
```

---

## Deployment

### Web (Static Export)

```bash
pnpm build:web
```

Artifacts are exported to the default Expo web output (`dist/`). Configure
GitHub Pages or another static host to serve the export.

### Native (EAS Build)

```bash
eas build -p android --profile preview
eas build -p ios --profile preview
```

---

## Common Tasks

### Start the Dev Server

```bash
pnpm start
```

### Run Platform Targets

```bash
pnpm web
pnpm ios
pnpm android
```

### Clear Metro Cache

```bash
npx expo start --clear
```

### Update Dependencies

```bash
pnpm update --latest
```

---

## Getting Help

- **Architecture**: `docs/ARCHITECTURE.md`
- **Design**: `docs/DESIGN.md`
- **Active context**: `memory-bank/activeContext.md`
- **Progress**: `memory-bank/progress.md`
