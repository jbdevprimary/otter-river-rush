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

## Recent Work

### Jump Mechanics Implementation (2026-01-26)

Added jump mechanics for the otter player:

**New Components:**
- `JumpComponent` - Tracks jump state (isJumping, verticalVelocity, groundZ, etc.)
- `jump` animation state added to `AnimationState` type

**New Systems:**
- `jump.ts` - Jump physics system with gravity, arc trajectory, landing detection
- Updated `input.ts` - Spacebar and swipe-up triggers jump
- Updated `animation.ts` - Jump animation support with auto-transition on landing

**Physics Constants:**
- `JUMP_PHYSICS` - Initial velocity (8), gravity (20), cooldown (500ms), splash particles

**Key Features:**
- Parabolic arc trajectory with realistic gravity
- 500ms cooldown between jumps to prevent spam
- Splash particles on landing (8 blue particles in ring pattern)
- Swipe-up gesture support for mobile
- Spacebar/W/ArrowUp support for keyboard

**Files Modified:**
- `src/game/types/entities.ts` - Added JumpComponent, jump animation state
- `src/game/config/physics-constants.ts` - Added JUMP_PHYSICS
- `src/game/ecs/systems/jump.ts` - New jump physics system
- `src/game/ecs/systems/input.ts` - Jump input handling
- `src/game/ecs/systems/animation.ts` - Jump animation support
- `src/game/ecs/world.ts` - Initialize jump component on otter spawn
- `packages/game-core/*` - Mirrored changes for mobile app

---

### Seed-Based Procedural Generation (2026-01-26)

Implemented deterministic game generation using seeded RNG:

**Files Modified:**
- `packages/game-core/src/utils/seeded-random.ts` - Added daily challenge seed, URL sharing utilities
- `packages/game-core/src/utils/index.ts` - Export new seed utilities
- `packages/game-core/src/store/game-store.ts` - Added SeedState and GameRiverWidthState
- `packages/game-core/src/store/index.ts` - Export new types
- `packages/game-core/src/ecs/systems/spawner.ts` - Pattern-based spawning with seeded RNG

**Features:**
1. **Seeded RNG**: 3-word seed phrases (e.g., "river swift golden") for shareable seeds
2. **Daily Challenge Mode**: Deterministic date-based seeds for same-day competition
3. **Pattern-Based Spawning**: Obstacle and collectible patterns for natural gameplay
4. **River Width Variation**: Seeded width changes for visual variety
5. **Shareable Seeds**: URL-safe encoding for sharing runs

**Usage:**
```typescript
// Auto-generated seed for normal play
startGame('classic');

// Daily challenge with deterministic seed
startDailyChallenge();

// Custom seed for shared runs
startGame('classic', 'river swift golden');

// Get current seed for sharing
const seed = getSeedPhrase();
```

---

### Dynamic River Width System (2026-01-26)

Implemented dynamic river width that varies based on distance, biome, and random variation:

**New Files:**
- `packages/game-core/src/config/river-width.ts` - Configuration and utilities
- `packages/game-core/src/store/river-width-store.ts` - Zustand state management
- `packages/rendering/src/components/DynamicRiverEnvironment.tsx` - Visual renderer
- `packages/rendering/src/components/DynamicGameScene.tsx` - Integration example
- `packages/rendering/src/hooks/useRiverWidth.ts` - React hook for game integration

**Features:**
1. **Biome-Based Widths**: Each biome has different base, min, max widths:
   - Forest: 8m base (6-10m range)
   - Canyon: 5m base (4-7m range, narrow!)
   - Tropical: 10m base (8-14m range, wide!)
   - Arctic: 9m base (7-12m range)
   - Volcanic: 6m base (4-8m range)

2. **Distance-Based Variations**: River width changes every 200m with:
   - 40% probability of width change at each checkpoint
   - 3-second smooth transitions between widths
   - Minimum 500m gap between narrow sections

3. **Dynamic Lane Positions**: Lanes automatically adjust based on river width:
   - `getLaneX(lane)` returns dynamic X position
   - `calculateLanePositions(width)` for custom calculations
   - Spawner and input systems updated to use dynamic positions

4. **Collision Boundaries**: River edges prevent player from leaving the river:
   - `checkRiverBoundaries()` for collision detection
   - `clampToRiverBoundaries()` for position clamping
   - Player automatically constrained to river area

5. **Visual Indicators**:
   - Riverbank edges move with width
   - Trees reposition based on river width
   - Narrow section rocks jutting into river
   - Transition glow effects (red=narrowing, green=widening)

**Usage:**
```typescript
// In game scene component
const { width, lanePositions, isNarrow, getLaneX, boundaries } = useRiverWidth({
  isPlaying: status === 'playing',
  distance,
  biome: currentBiome,
});

return (
  <DynamicRiverEnvironment
    biome={currentBiome}
    riverWidth={width}
    lanePositions={lanePositions}
    isNarrow={isNarrow}
  />
);

// In spawner (non-reactive)
const getLanePosition = (lane: Lane) => getCurrentLanePositions()[lane + 1];
updateSpawner(state, now, isPlaying, gameMode, getLanePosition, getCurrentRiverWidth());
```

**Files Modified:**
- `packages/core/src/systems/spawner.ts` - Added dynamic lane/width parameters
- `packages/core/src/systems/input.ts` - Added `updatePlayerInputDynamic()` with boundaries
- `packages/core/src/utils/collision.ts` - Added `checkRiverBoundaries()`, `clampToRiverBoundaries()`
- `packages/game-core/src/config/index.ts` - Export river-width config
- `packages/game-core/src/store/index.ts` - Export river-width store
- `packages/rendering/src/components/index.ts` - Export new components
- `packages/rendering/src/index.ts` - Export hooks

---

## Next Steps

1. Test dynamic river width in game
2. Integrate with biome transition system
3. Test on physical devices (iOS/Android)
4. Verify EAS Build works
5. Add GitHub Pages deployment for Expo web

---

**Status**: Dynamic river width system implemented. Ready for integration testing.
