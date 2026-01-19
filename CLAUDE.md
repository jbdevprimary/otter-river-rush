# CLAUDE.md - Otter River Rush

This file provides guidance to Claude Code when working with this repository.

## Project Overview

**Otter River Rush** is a 3-lane endless river runner game built with:
- **Babylon.js 8.x** + **Reactylon** for 3D rendering
- **React 19** for UI
- **Miniplex ECS** for entity management
- **Meshy AI** for 3D asset generation
- **Vite** for bundling
- **pnpm** workspaces for monorepo management

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Generate 3D assets with Meshy
pnpm --filter @otter-river-rush/content-gen gen:all
```

## Project Structure

```
otter-river-rush/
├── apps/
│   └── web/                    # Main web application
│       ├── public/
│       │   └── assets/
│       │       └── models/     # Meshy-generated GLB models
│       └── src/
├── packages/
│   ├── config/                 # Game configuration (physics, visual, lanes)
│   ├── content-gen/            # Meshy 3D asset generation pipeline
│   ├── core/                   # Miniplex ECS world, spawn functions
│   ├── rendering/              # Babylon.js + Reactylon components
│   ├── state/                  # Zustand game state management
│   ├── types/                  # TypeScript type definitions
│   └── ui/                     # React UI components (menus, HUD)
└── docs/                       # Architecture documentation
```

## Key Packages

### @otter-river-rush/content-gen
Meshy AI 3D asset generation pipeline:
- `src/api/meshy-client.ts` - API client with SSE streaming
- `src/tasks/definitions/text-to-3d.json` - Task definition
- `src/assets/prompts.ts` - 16 asset prompts
- `src/cli.ts` - CLI for generating assets

**Important Meshy API details:**
- Uses v2 text-to-3d endpoint: `POST /openapi/v2/text-to-3d`
- Valid `art_style` values: `pbr`, `realistic`, `sculpture` (NOT `cartoon`)
- Response paths are at root level (`model_urls.glb`, NOT `result.model_urls.glb`)
- Uses SSE streaming to poll task progress

### @otter-river-rush/core
Miniplex ECS world with spawn functions:
- `world.ts` - World instance and queries
- `spawn.otter()`, `spawn.rock()`, `spawn.coin()`, etc.
- Model paths reference `/assets/models/...`

### @otter-river-rush/rendering
Babylon.js + Reactylon rendering:
- `EntityRenderer.tsx` - Renders ECS entities with GLB models
- `GameCanvas.tsx` - Main canvas component
- Uses model caching and cloning for performance

### @otter-river-rush/config
Game constants:
- `PHYSICS` - Scroll speed, lane change speed
- `VISUAL` - Camera position, layers, model scales
- `getLaneX()` - Convert lane (-1, 0, 1) to X position

## Coordinate System

- **X axis**: Lanes (left/right)
- **Y axis**: Forward/backward (scroll direction)
- **Z axis**: Height (depth layers)

Babylon.js uses Y-up, so in EntityRenderer:
```typescript
mesh.position.set(
  entity.position.x,  // X stays X
  entity.position.z,  // Game Z -> Babylon Y
  entity.position.y   // Game Y -> Babylon Z
);
```

## Generated 3D Assets

All models are Meshy-generated GLB files in `apps/web/public/assets/models/`:

| Category | Asset | Path |
|----------|-------|------|
| Player | Otter | `/assets/models/player/otter-player/model.glb` |
| Obstacle | Large Rock | `/assets/models/obstacle/rock-large/model.glb` |
| Obstacle | Medium Rock | `/assets/models/obstacle/rock-medium/model.glb` |
| Obstacle | Small Rock | `/assets/models/obstacle/rock-small/model.glb` |
| Obstacle | Floating Log | `/assets/models/obstacle/log-floating/model.glb` |
| Obstacle | Branch | `/assets/models/obstacle/branch-floating/model.glb` |
| Collectible | Gold Coin | `/assets/models/collectible/coin-gold/model.glb` |
| Collectible | Blue Gem | `/assets/models/collectible/gem-blue/model.glb` |
| Collectible | Green Gem | `/assets/models/collectible/gem-green/model.glb` |
| Collectible | Purple Gem | `/assets/models/collectible/gem-purple/model.glb` |
| Collectible | Small Fish | `/assets/models/collectible/fish-small/model.glb` |
| Collectible | Golden Fish | `/assets/models/collectible/fish-golden/model.glb` |
| Decoration | Lily Pad | `/assets/models/decoration/lily-pad/model.glb` |
| Decoration | Cattail | `/assets/models/decoration/cattail/model.glb` |
| Decoration | Reed Cluster | `/assets/models/decoration/reed-cluster/model.glb` |
| Decoration | Rubber Duck | `/assets/models/decoration/duck-rubber/model.glb` |

Asset manifest: `apps/web/public/assets/models/manifest.json`

## Environment Variables

Required in `.env`:
```
MESHY_API_KEY=msy_xxx  # Meshy AI API key for 3D generation
```

## Common Commands

```bash
# Development
pnpm dev                                    # Start dev server (default port 3000)
pnpm build                                  # Build all packages
pnpm test                                   # Run tests

# Content Generation
pnpm --filter @otter-river-rush/content-gen gen:all       # Generate all assets
pnpm --filter @otter-river-rush/content-gen gen otter     # Generate specific asset

# Linting
pnpm lint                                   # Run ESLint
pnpm format                                 # Format with Prettier
```

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
  // ...
}
```

### Rendering Pipeline
1. Miniplex world manages entities
2. EntityRenderer syncs ECS state with Babylon.js meshes
3. Models are preloaded and cloned per entity
4. Sync runs at ~60fps via setInterval

### Game Loop
1. Systems update entity positions based on velocity
2. Collision detection checks player vs obstacles/collectibles
3. Spawner creates new entities as player progresses
4. Entities removed when they scroll off screen

## Known Issues / TODOs

- WebGPU texture size mismatch warnings on some browsers (cosmetic, doesn't affect gameplay)
- Decoration entities (lily pads, etc.) not yet spawned during gameplay
- Could add sound effects and music

## Testing

Use Chrome MCP for end-to-end testing:
1. Navigate to `http://localhost:3004` (or available port)
2. Click "PLAY GAME" to start
3. Use arrow keys or A/D to move lanes
4. Avoid rocks, collect coins

## Related Repositories

This project is part of the arcade-cabinet ecosystem. See:
- `~/src/jbdevprimary/` - Primary development workspace
- `~/assets/` - Shared asset library (Kenney, Quaternius, etc.)
