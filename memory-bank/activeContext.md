# Active Context - Otter River Rush

**Last Updated**: 2026-01-26
**Current Branch**: integration/r3f-mobile-refactor
**Session Status**: Flat Expo Structure + Brand Integration

---

## Current Architecture: Flat Expo (Standard)

The project uses a **standard flat Expo structure** (NOT monorepo):

```
otter-river-rush/
├── app/                     # Expo Router screens
│   ├── _layout.tsx          # Root layout
│   └── index.tsx            # Entry point
├── src/                     # All source code
│   ├── components/          # UI + 3D components
│   │   ├── ui/              # NativeWind UI components
│   │   │   ├── branded/     # 9-slice atlas-based components
│   │   │   ├── branding/    # Brand color tokens
│   │   │   └── components/  # Menu, HUD, Settings, etc.
│   │   └── carousel/        # 3D character carousel
│   ├── game/                # Game logic, ECS, store
│   ├── screens/             # CharacterSelectScreen, etc.
│   ├── hooks/               # Custom React hooks
│   └── lib/                 # Utilities (audio, etc.)
├── assets/                  # Static assets
│   ├── branding/            # logo.png, splash.png, portrait.png
│   └── ui/                  # 9-slice button/panel atlases
├── public/                  # Web static assets (models, textures)
└── memory-bank/             # AI agent context
```

### Key Changes (2026-01-26)

1. **Flattened to standard Expo** - Removed `apps/` and `packages/` monorepo directories
2. **Brand assets integrated** - Logo, splash, 9-slice atlases in assets/
3. **Branded UI components** - NineSliceButton, NineSlicePanel, CloseButton
4. **Metro patch applied** - Fixed @expo/metro-config async import bug
5. **Brand colors in Tailwind** - Full color system from BRAND_IDENTITY.md
6. **Removed legacy `src/client/`** - Was old Vite web app, now unified

---

## Tech Stack Summary

| Layer | Technology |
|-------|------------|
| Platform | Expo (unified web/iOS/Android) |
| 3D Rendering | React Three Fiber + expo-three |
| UI Framework | React 19 + React Native |
| Styling | NativeWind (Tailwind CSS) |
| State | Zustand |
| ECS | Miniplex |
| Package Manager | npm |
| Linting | Biome |

---

## Landing Page Specification

See: `docs/LANDING_PAGE_SPEC.md` for full details.

### User Flow
```
Splash Screen → Main Menu → Character Select (3D Carousel) → Game
```

### 3D Carousel Components (src/components/carousel/)
| Component | Purpose |
|-----------|---------|
| `CharacterCarousel3D` | R3F Canvas wrapper |
| `CarouselStage` | 3D scene with center + flanking otters |
| `OtterModelPreview` | GLB loader with locked/unlocked states |
| `ProceduralPedestal` | Hexagonal platform with gold ring |
| `CarouselLighting` | Spotlight + ambient |
| `useCarouselRotation` | Animation hook (300ms) |

### 9-Slice UI Components (src/components/ui/branded/)
| Component | Purpose |
|-----------|---------|
| `NineSliceButton` | Atlas-based button with states |
| `NineSlicePanel` | Atlas-based panel container |
| `CloseButton` | Atlas-based close icon |

### Brand Assets
- `assets/branding/logo.png` - Rusty mascot
- `assets/branding/splash.png` - Splash screen
- `assets/branding/portrait.png` - Character portrait
- `assets/ui/button_*_9slice_*.png` - Button atlases
- `assets/ui/panel_menu_9slice_*.png` - Panel atlas
- `assets/ui/icon_close_*.png` - Close icon atlas

---

## Brand Colors (tailwind.config.js)

```javascript
// Otter Colors
otterBrown: '#8B5A3C'
otterCream: '#F4E4C1'
otterDark: '#5C3A29'

// Water Colors
riverBlue: '#4A9ECD'
riverLight: '#7FCCF7'
riverDark: '#2E6B8F'

// Collectibles
coinGold: '#FFD700'

// Feedback
successGreen: '#4CAF50'
dangerRed: '#F44336'
```

---

## Commands

```bash
# Development
npm start          # Expo dev server
npm run web        # Web on default port
npm run ios        # iOS simulator
npm run android    # Android emulator

# Building
npm run build:web  # Export web bundle

# Testing
npm test
npm run lint
npm run typecheck
```

---

## Recent Fixes

### Metro Bundler Patch
Fixed `@expo/metro-config@0.20.18` bug where optional dependency paths were undefined:
- Created `patches/@expo+metro-config+0.20.18.patch`
- Added `postinstall: "patch-package"` to package.json
- Changed `dependency.absolutePath` → `modulePath` in two locations

### Documentation Updates
- Removed Sphinx/RST scaffolding from docs (Markdown-only docs in repo).
- Replaced placeholder installation/quickstart guidance with pnpm + Expo steps.

---

## Implemented Features

### Jump Mechanics
- JumpComponent for tracking jump state
- Jump physics system with gravity, arc trajectory
- Spacebar/W/ArrowUp and swipe-up triggers
- 500ms cooldown, splash particles on landing

### Seed-Based Procedural Generation
- 3-word seed phrases for shareable seeds
- Daily challenge mode with date-based seeds
- Pattern-based spawning with seeded RNG

### Dynamic River Width
- Biome-based width variations (1-5 lanes)
- Smooth transitions between widths
- Dynamic lane positions and collision boundaries

---

## Pending Work

1. **Full 9-slice rendering** - Proper atlas slicing with UV coordinates
2. **SettingsModal with branded panel** - Use NineSlicePanel
3. **PowerUpsGalleryModal** - Grid display of power-ups
4. **Menu with branded buttons** - Replace Pressable with NineSliceButton
5. **Landing page hero animation** - Animated Rusty on main menu
6. **Test on physical devices** - iOS/Android builds

---

**Status**: Flat Expo structure complete. Brand assets integrated. Landing page spec documented.
