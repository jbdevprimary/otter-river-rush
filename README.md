# 🦦 Otter River Rush

A modern React Three Fiber endless runner game with Miniplex ECS and professional 3D Meshy-generated assets.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Generate 3D models (requires MESHY_API_KEY)
export MESHY_API_KEY=your_key
pnpm generate:models
pnpm generate:animations
```

## 🎮 Tech Stack

### Runtime
- **React 19.2.0** - UI framework
- **React Three Fiber 9.4.0** - Declarative Three.js
- **Three.js 0.180.0** - WebGL 3D rendering
- **Miniplex 2.0.0** - ECS entity management
- **Zustand 5.0.8** - State management
- **Tailwind CSS 4.1.16** - Styling
- **DaisyUI 5.3.9** - UI components

### Development
- **TypeScript 5.5.0** - Type safety
- **Vite 7.1.12** - Build tool
- **Vitest 4.0.3** - Testing
- **Playwright 1.47.0** - E2E tests
- **pnpm** - Package manager

### 3D Assets
- **Meshy AI** - Text-to-3D model generation
- **18 GLB files** - Characters, obstacles, collectibles
- **11 animations** - Walk, run, jump, collect, etc.
- **4 rock variants** - Retextured variations

## 📁 Project Structure

```
otter-river-rush/
├── src/
│   ├── client/                 # Game runtime
│   │   ├── public/models/      # 18 GLB files (91 MB)
│   │   ├── src/
│   │   │   ├── components/     # React components
│   │   │   ├── ecs/            # Miniplex systems
│   │   │   ├── hooks/          # Custom hooks
│   │   │   ├── utils/          # Utilities
│   │   │   └── config/         # Constants
│   │   └── tests/              # Tests
│   └── dev-tools/              # Asset generation
│       └── src/
│           ├── meshy/          # API integration
│           ├── generators/     # Model generators
│           ├── pipelines/      # Asset pipeline
│           └── schemas/        # Zod schemas
└── wrappers/                   # Platform wrappers
```

## 🎨 3D Assets

**Generated with Meshy AI:**

- **Otter Character**: Rigged with 11 animations
  - Walk, run, jump, collect, hit, death, victory, happy, dodge-left, dodge-right
- **Obstacles**: 4 rock variations (base, mossy, cracked, crystal)
- **Collectibles**: Gold coins, red gems
- **Total**: 18 GLB files, 91 MB

## 🕹️ Game Systems

### Entity Component System (Miniplex)
- **Entities**: Players, obstacles, collectibles, particles, power-ups
- **Components**: Position, velocity, model, animation, collider, health
- **Systems**: Movement, collision, spawning, cleanup, scoring, difficulty

### Core Systems
- **Movement System** - Physics and entity movement
- **Collision System** - AABB collision detection
- **Spawner System** - Procedural entity generation
- **Score System** - Points, distance, combo tracking
- **Power-Up System** - Shield, ghost, magnet, multiplier, slow-motion
- **Difficulty System** - Progressive speed increase
- **Biome System** - 4 biomes with visual transitions
- **Achievement System** - 20+ achievements
- **Camera System** - Follow player with shake effects
- **Audio System** - Sound effects and music (framework ready)
- **Input System** - Keyboard + touch/swipe controls

### Utilities
- Math helpers (lerp, clamp, easing, etc.)
- Collision helpers (AABB, sphere, ray, spatial grid)
- Entity helpers (nearest, radius, movement, etc.)
- Animation helpers (transitions, queuing, crossfade)
- Debug tools (god mode, teleport, freeze, logging)
- Test helpers (test world, assertions, mocks)
- Performance tools (object pooling, QuadTree, profiling)

## 🎮 Controls

- **Arrow Keys / WASD** - Move between lanes
- **Space / Up Arrow** - Jump
- **Touch Swipe** - Left/right/up to move
- **Escape** - Pause

## 🏆 Features

- ✅ 3D WebGL rendering with R3F
- ✅ ECS architecture with Miniplex
- ✅ 11 character animations
- ✅ 4 obstacle variants
- ✅ Progressive difficulty
- ✅ Biome system (4 biomes)
- ✅ Power-up system
- ✅ Achievement system
- ✅ Touch + keyboard controls
- ✅ Camera effects
- ✅ Visual effects (bloom, vignette)
- ✅ Score/combo system
- ✅ Save/load system
- ✅ Debug tools

## 📊 Performance

- **Target**: 60 FPS
- **Bundle**: 1.25 MB (346 KB gzipped)
- **Load Time**: < 2s
- **Optimizations**: Object pooling, spatial partitioning, batch rendering

## 🛠️ Development

```bash
# Development commands
pnpm dev                    # Start dev server
pnpm build                  # Build for production  
pnpm preview                # Preview production build
pnpm test                   # Run tests
pnpm test:e2e               # E2E tests
pnpm lint                   # Lint code
pnpm type-check             # TypeScript validation

# Asset generation
pnpm generate:models        # Generate 3D models via Meshy
pnpm generate:animations    # Generate otter animations
pnpm pipeline               # Run full asset pipeline
pnpm quality-check          # Validate assets
```

## 📚 Documentation

- `/docs/CODEBASE_ASSESSMENT.md` - Code quality analysis
- `/docs/REORGANIZATION_PLAN.md` - Refactoring guide
- `/docs/MESHY_API_ALIGNMENT.md` - API integration details
- `/docs/memory-bank/` - Project context and progress
- `/src/dev-tools/README.md` - Asset generation guide

## 🎯 Next Steps

1. Wire animation mixer to entity renderer
2. Add audio files and integrate sound system
3. Create more game modes (Time Trial, Zen, Daily Challenge)
4. Add more power-ups and collectibles
5. Implement leaderboard system
6. Add more visual effects and polish

## 🤝 Contributing

See `CONTRIBUTING.md` for guidelines.

## 📄 License

MIT License - See `LICENSE` file

---

**Built with ❤️ using React Three Fiber + Miniplex + Meshy AI**
