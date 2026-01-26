# CLAUDE.md - Otter River Rush

This file provides guidance to Claude Code when working with this repository.

## Project Overview

**Otter River Rush** is a 3-lane endless river runner game built with a unified Expo architecture:
- **Expo** for all platforms (web, iOS, Android) via Metro bundler
- **React Three Fiber (R3F)** + **expo-three** for 3D rendering
- **React 19** for UI
- **Miniplex ECS** for entity management
- **Zustand** for state management
- **Meshy AI** for 3D asset generation
- **pnpm** workspaces for monorepo management
- **Biome** for linting and formatting
- **EAS Build** for native app builds

## Quick Start

```bash
# Install dependencies
pnpm install

# Start Expo development server (all platforms)
pnpm dev

# Start web specifically
pnpm dev:web

# Start on Android
pnpm dev:android

# Start on iOS
pnpm dev:ios

# Build web for production
pnpm build:web
```

## Project Structure

```
otter-river-rush/
├── apps/
│   └── mobile/                 # Unified Expo app (web + iOS + Android)
│       ├── app/                # Expo Router screens
│       ├── assets/             # All game assets (models, textures, audio)
│       ├── src/
│       │   ├── components/     # R3F rendering components
│       │   └── screens/        # UI screens
│       ├── app.json            # Expo configuration
│       └── eas.json            # EAS Build configuration
├── packages/
│   ├── audio/                  # Audio system (platform-agnostic)
│   ├── config/                 # Game configuration (physics, visual, lanes)
│   ├── content-gen/            # Meshy 3D asset generation pipeline
│   ├── core/                   # Miniplex ECS world, spawn functions
│   ├── game-core/              # Shared game logic (platform-agnostic)
│   ├── rendering/              # React Three Fiber components
│   ├── state/                  # Zustand game state management
│   ├── types/                  # TypeScript type definitions
│   └── ui/                     # React UI components
└── docs/                       # Architecture documentation
```

## Unified Expo Architecture

The project uses a single Expo app (`apps/mobile`) that targets all platforms:

- **Web**: Uses Metro bundler with `expo export --platform web`
- **iOS**: Built via EAS Build or local Xcode
- **Android**: Built via EAS Build or local Gradle

This replaces the previous dual-app architecture (Vite for web + Expo for mobile).

### Key Configuration Files

- `apps/mobile/app.json` - Expo configuration for all platforms
- `apps/mobile/eas.json` - EAS Build profiles for native builds
- `apps/mobile/metro.config.js` - Metro bundler configuration

### Web Configuration

Web is configured in `app.json`:
```json
{
  "expo": {
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/favicon.png"
    }
  }
}
```

## Key Packages

### @otter-river-rush/game-core
Platform-agnostic game logic:
- ECS systems (movement, collision, spawning)
- Game state management
- Scoring and progression

### @otter-river-rush/rendering
React Three Fiber rendering components:
- `EntityRenderer.tsx` - Renders ECS entities
- Platform-specific optimizations via expo-three

### @otter-river-rush/config
Game constants:
- `PHYSICS` - Scroll speed, lane change speed
- `VISUAL` - Camera position, layers, model scales
- `getLaneX()` - Convert lane (-1, 0, 1) to X position

### @otter-river-rush/content-gen
Meshy AI 3D asset generation pipeline:
- `src/api/meshy-client.ts` - API client with SSE streaming
- `src/assets/prompts.ts` - Asset prompts
- `src/cli.ts` - CLI for generating assets

## Coordinate System

- **X axis**: Lanes (left/right)
- **Y axis**: Forward/backward (scroll direction)
- **Z axis**: Height (depth layers)

Three.js uses Y-up, so in R3F components:
```typescript
// Game coords: X=lanes, Y=forward, Z=height
// Three.js coords: X=lateral, Y=height, Z=depth
<mesh position={[
  entity.position.x,  // X stays X
  entity.position.z,  // Game Z -> Three.js Y (height)
  entity.position.y   // Game Y -> Three.js Z (depth)
]} />
```

## Assets

All assets are located in `apps/mobile/assets/`:

| Category | Location |
|----------|----------|
| 3D Models | `assets/models/` |
| Textures | `assets/textures/` |
| Audio | `assets/audio/` |
| Manifest | `assets/models/manifest.json` |

## Environment Variables

Required in `.env`:
```
MESHY_API_KEY=msy_xxx  # Meshy AI API key for 3D generation
EXPO_TOKEN=xxx         # Expo token for EAS builds
```

## Common Commands

```bash
# Development
pnpm dev                 # Start Expo dev server
pnpm dev:web             # Start web specifically
pnpm dev:android         # Start Android
pnpm dev:ios             # Start iOS

# Building
pnpm build               # Build all packages
pnpm build:web           # Export web bundle

# Testing
pnpm test                # Run all tests
pnpm lint                # Run linter
pnpm type-check          # Type check all packages

# Content Generation
pnpm --filter @otter-river-rush/content-gen gen:all   # Generate all assets
```

## CI/CD

The project uses GitHub Actions with:
- `integration.yml` - Lint, type-check, and test on PR/push
- `mobile-primary.yml` - Primary workflow for building and deploying
- `build-platforms.yml` - Multi-platform builds via EAS

Web deployments go to GitHub Pages. Native builds use EAS Build.

## Architecture Notes

### ECS Pattern
Entities are data objects with optional components:
```typescript
interface Entity {
  player?: boolean;
  position?: { x: number; y: number; z: number };
  velocity?: { x: number; y: number; z: number };
  model?: { url: string; scale?: number };
  collider?: { width: number; height: number; depth: number };
  collectible?: { type: 'coin' | 'gem'; value: number };
  obstacle?: boolean;
}
```

### Game Loop
1. Systems update entity positions based on velocity
2. Collision detection checks player vs obstacles/collectibles
3. Spawner creates new entities as player progresses
4. Entities removed when they scroll off screen

## Testing

### Web
```bash
pnpm dev:web
# Navigate to http://localhost:8081 (Expo web port)
# Use arrow keys or A/D to move lanes
# Avoid rocks, collect coins
```

### Mobile (Expo Go)
```bash
pnpm dev
# Scan QR code with Expo Go app
```

### Native Builds (EAS)
```bash
cd apps/mobile
eas build --platform android --profile preview
eas build --platform ios --profile preview
```

## Related Repositories

This project is part of the arcade-cabinet ecosystem. See:
- `~/src/jbdevprimary/` - Primary development workspace
- `~/assets/` - Shared asset library (Kenney, Quaternius, etc.)
