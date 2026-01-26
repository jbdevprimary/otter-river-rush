# Active Context - Otter River Rush

**Last Updated**: 2026-01-26
**Current Branch**: integration/r3f-mobile-refactor
**Session Status**: Unified Expo Migration Complete

---

## Current Architecture: Unified Expo

The project now uses a **single Expo app** (`apps/mobile/`) that targets all platforms:
- **Web**: Metro bundler → GitHub Pages
- **iOS**: EAS Build → App Store
- **Android**: EAS Build → Play Store

### Key Changes (2026-01-26)

1. **Removed `apps/web/`** - Old Vite-based web app deleted
2. **Unified architecture** - Single codebase for web + iOS + Android
3. **NativeWind styling** - All UI components use Tailwind CSS via NativeWind
4. **Metro for web** - Replaces Vite for web bundling
5. **Assets in `apps/mobile/public/`** - Static assets served from Metro

---

## Tech Stack Summary

| Layer | Technology |
|-------|------------|
| Platform | Expo (unified) |
| 3D Rendering | React Three Fiber + expo-three |
| UI Framework | React 19 + React Native |
| Styling | NativeWind (Tailwind CSS) |
| State | Zustand |
| ECS | Miniplex |
| Package Manager | pnpm workspaces |
| Linting | Biome |

---

## Recent Work

### Unified Expo Migration (2026-01-26)

**Phase 1: NativeWind Setup**
- Configured NativeWind v4 with Tailwind 3.4.17
- Updated Metro config with `withNativeWind()` wrapper
- Added brand colors to tailwind.config.js

**Phase 2: Asset Migration**
- Moved assets from `apps/web/public/` to `apps/mobile/public/`
- Assets served at root URLs (`/models/...`, `/textures/...`)
- GLB models, PBR textures, and audio files all HTTP 200

**Phase 3: Port Game Logic**
- Game logic shared via `packages/game-core`
- Mobile App.tsx uses shared store

**Phase 4: UI Component Migration**
- Converted all UI components to NativeWind:
  - Menu.tsx, HUD.tsx, PauseMenu.tsx, Settings.tsx
  - Leaderboard.tsx, CharacterSelect.tsx
  - AchievementNotification.tsx, MilestoneNotification.tsx
- Uses React Native primitives (View, Text, Pressable)

**Phase 5: Integration Testing**
- Expo web server running on :8081
- All components bundled (GameCanvas, GameHUD, MainMenu)
- State management working (zustand, miniplex)
- Assets serving correctly

**Phase 6: Cleanup**
- Removed `apps/web/` directory
- Updated CI/CD workflows
- Updated CLAUDE.md and AGENTS.md

---

## Commands

```bash
# Development
pnpm dev           # Expo dev server
pnpm dev:web       # Web on :8081
pnpm dev:ios       # iOS simulator
pnpm dev:android   # Android emulator

# Building
pnpm build:web     # Export web bundle

# Testing
pnpm test
pnpm lint
pnpm type-check
```

---

## Project Structure

```
otter-river-rush/
├── apps/
│   └── mobile/                 # Unified Expo app
│       ├── app/                # Expo Router screens
│       ├── assets/             # Native assets
│       ├── public/             # Web static assets
│       │   ├── models/
│       │   ├── textures/
│       │   └── audio/
│       └── src/
├── packages/
│   ├── game-core/              # Shared game logic
│   ├── rendering/              # R3F components
│   ├── ui/                     # NativeWind UI
│   └── config/                 # Game constants
└── memory-bank/                # AI agent context
```

---

## Next Steps

1. Test on physical devices (iOS/Android)
2. Verify EAS Build works
3. Add GitHub Pages deployment for Expo web
4. Clean up any remaining lint/type errors

---

**Status**: Unified Expo migration complete. Ready for testing.
