# Project Structure

## Monorepo Layout

```
otter-river-rush/
├── apps/
│   └── mobile/                 # Unified Expo app (web + iOS + Android)
│       ├── app/                # Expo Router screens
│       │   ├── _layout.tsx     # Root layout (imports global.css)
│       │   └── index.tsx       # Main menu screen
│       ├── assets/             # All game assets (models, textures, audio)
│       ├── public/             # Static assets for web
│       ├── src/
│       │   ├── components/     # R3F rendering components
│       │   ├── screens/        # UI screens
│       │   └── hooks/          # Custom hooks
│       ├── app.json            # Expo configuration
│       ├── eas.json            # EAS Build configuration
│       └── metro.config.js     # Metro + NativeWind config
├── packages/
│   ├── audio/                  # Audio system (platform-agnostic)
│   ├── config/                 # Game configuration (physics, visual, lanes)
│   ├── content-gen/            # Meshy 3D asset generation pipeline
│   ├── core/                   # Miniplex ECS world, spawn functions
│   ├── game-core/              # Shared game logic (platform-agnostic)
│   ├── rendering/              # React Three Fiber components
│   ├── state/                  # Zustand game state management
│   ├── types/                  # TypeScript type definitions
│   └── ui/                     # React UI components (NativeWind)
├── memory-bank/                # AI agent context files
│   ├── projectbrief.md         # Foundation document
│   ├── productContext.md       # Product vision
│   ├── activeContext.md        # Current work status
│   ├── systemPatterns.md       # Architecture patterns
│   ├── techContext.md          # Tech stack details
│   └── progress.md             # Implementation progress
└── docs/                       # Architecture documentation
```

## Key Directories

### `apps/mobile/`
The main Expo application. All platforms (web, iOS, Android) run from this single app.

- **app/**: Expo Router file-based routing
- **assets/**: Game assets (models, textures, audio) - bundled for native
- **public/**: Static assets for web deployment
- **src/components/**: React Three Fiber rendering components
- **src/screens/**: UI screens (MainMenu, GameOverScreen)
- **src/hooks/**: Custom React hooks

### `packages/`
Shared code organized by domain. All packages are TypeScript with strict mode.

- **game-core/**: Platform-agnostic game logic (ECS systems, state, scoring)
- **rendering/**: React Three Fiber components (EntityRenderer, GameCanvas)
- **config/**: Game constants (PHYSICS, VISUAL, getLaneX())
- **ui/**: React Native + NativeWind UI components
- **audio/**: Audio system (Howler.js wrapper)
- **state/**: Zustand stores
- **types/**: Shared TypeScript types
- **content-gen/**: Meshy AI asset generation pipeline

### `memory-bank/`
AI agent context files. **Read ALL files at the start of EVERY task.**

- **projectbrief.md**: Foundation document (frozen)
- **productContext.md**: Product vision and roadmap
- **activeContext.md**: Current work focus
- **systemPatterns.md**: Architecture patterns
- **techContext.md**: Tech stack details
- **progress.md**: Implementation status

## Asset Organization

### Models (GLB)
```
apps/mobile/assets/models/
├── player/                     # Otter character
│   ├── otter-rusty-idle.glb
│   ├── otter-rusty-walk.glb
│   └── otter-rusty-dodge-left.glb
├── obstacle/                   # Rocks, logs, etc.
│   ├── rock-river.glb
│   └── log-floating.glb
├── collectible/                # Coins, gems
│   ├── coin-gold.glb
│   └── gem-blue.glb
├── environment/                # Trees, clouds
└── manifest.json               # Asset registry
```

### Textures (PBR)
```
apps/mobile/assets/textures/
├── terrain/                    # Ground textures (AmbientCG)
│   ├── Grass001_1K_Color.jpg
│   ├── Grass001_1K_Normal.jpg
│   └── Grass001_1K_Roughness.jpg
├── water/                      # River surface
└── sky/                        # HDRI skyboxes
```

### Audio
```
apps/mobile/assets/audio/
├── sfx/                        # Sound effects
│   ├── coin-collect.mp3
│   └── obstacle-hit.mp3
├── music/                      # Background music
└── ambient/                    # Ambient sounds
```

## Configuration Files

- **biome.json**: Linting and formatting rules (root + packages)
- **tsconfig.json**: TypeScript configuration (strict mode)
- **pnpm-workspace.yaml**: Monorepo workspace definition
- **apps/mobile/app.json**: Expo app configuration
- **apps/mobile/eas.json**: EAS Build profiles
- **apps/mobile/metro.config.js**: Metro bundler + NativeWind
- **apps/mobile/tailwind.config.js**: Tailwind theme

## Coordinate System

Three.js uses Y-up, so in R3F:
```typescript
// Game coords: X=lanes, Y=forward, Z=height
// Three.js: X=lateral, Y=height, Z=depth
<mesh position={[entity.position.x, entity.position.z, entity.position.y]} />
```

## Import Patterns

```typescript
// Workspace packages
import { PHYSICS, VISUAL } from '@otter-river-rush/config';
import { useGameStore } from '@otter-river-rush/state';
import { EntityRenderer } from '@otter-river-rush/rendering';

// Local imports
import { GameCanvas } from '@/components/GameCanvas';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
```

## File Naming Conventions

- **Components**: PascalCase (e.g., `GameCanvas.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useResponsiveLayout.ts`)
- **Utilities**: camelCase (e.g., `collision.ts`)
- **Types**: PascalCase (e.g., `Entity.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `PHYSICS_CONSTANTS.ts`)
- **Tests**: Same as source with `.test.ts` suffix (e.g., `collision.test.ts`)
