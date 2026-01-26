# Otter River Rush

A 3-lane endless river runner game built with **Expo** and **React Three Fiber**.

[![CI](https://github.com/arcade-cabinet/otter-river-rush/actions/workflows/integration.yml/badge.svg)](https://github.com/arcade-cabinet/otter-river-rush/actions/workflows/integration.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## Play Now

- **Web**: [jbcom.github.io/otter-river-rush](https://jbcom.github.io/otter-river-rush/)
- **iOS**: Coming soon (EAS Build)
- **Android**: Coming soon (EAS Build)

---

## Features

### Gameplay
- **Endless Runner**: Infinite procedural river generation
- **3-Lane System**: Swipe or use keyboard to dodge obstacles
- **Progressive Difficulty**: Speed increases with distance
- **Collectibles**: Coins, gems, power-ups
- **Power-Ups**: Shield, Magnet, Score Multiplier, Ghost Mode
- **4 Biomes**: Forest, Mountain, Canyon, Rapids

### Graphics
- **3D Rendering**: React Three Fiber with WebGL
- **GLB Models**: 18 Meshy AI-generated 3D models
- **11 Animations**: Idle, walk, run, jump, dodge, collect, hit, death, victory
- **PBR Textures**: AmbientCG and Kenney asset packs
- **Biome-Specific Materials**: Visual variety per environment

### Cross-Platform
- **Single Codebase**: Expo for web, iOS, and Android
- **NativeWind**: Tailwind CSS for React Native
- **Touch & Keyboard**: Responsive controls for all devices

---

## Quick Start

### Prerequisites
- Node.js 22+
- pnpm 10+

### Installation
```bash
# Clone repository
git clone https://github.com/arcade-cabinet/otter-river-rush.git
cd otter-river-rush

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Development Commands
```bash
# Start Expo dev server (all platforms)
pnpm dev

# Platform-specific
pnpm dev:web       # Web on :8081
pnpm dev:ios       # iOS simulator
pnpm dev:android   # Android emulator

# Build
pnpm build         # Build all packages
pnpm build:web     # Export web bundle

# Quality
pnpm lint          # Run Biome linter
pnpm type-check    # TypeScript validation
pnpm test          # Run tests
```

---

## Tech Stack

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

## Project Structure

```
otter-river-rush/
├── apps/
│   └── mobile/                 # Unified Expo app
│       ├── app/                # Expo Router screens
│       ├── assets/             # Native assets
│       ├── public/             # Web static assets
│       │   ├── models/         # GLB 3D models
│       │   ├── textures/       # PBR textures
│       │   └── audio/          # Sound effects
│       └── src/
├── packages/
│   ├── game-core/              # Shared game logic
│   ├── rendering/              # R3F components
│   ├── ui/                     # NativeWind UI
│   ├── config/                 # Game constants
│   ├── state/                  # Zustand stores
│   ├── audio/                  # Audio system
│   ├── types/                  # TypeScript types
│   └── content-gen/            # Meshy AI pipeline
├── memory-bank/                # AI agent context
└── docs/                       # Documentation
```

---

## Key Packages

| Package | Purpose |
|---------|---------|
| `@otter-river-rush/game-core` | ECS systems, game logic |
| `@otter-river-rush/rendering` | React Three Fiber components |
| `@otter-river-rush/ui` | NativeWind UI components |
| `@otter-river-rush/config` | PHYSICS, VISUAL constants |

---

## Game Controls

### Keyboard (Web/Desktop)
- **A / Left Arrow**: Move left
- **D / Right Arrow**: Move right
- **Space / W / Up Arrow**: Jump
- **Escape / P**: Pause

### Touch (Mobile)
- **Swipe Left**: Move left
- **Swipe Right**: Move right
- **Swipe Up**: Jump
- **Tap**: Pause

---

## Building for Production

### Web
```bash
pnpm build:web
# Output: apps/mobile/dist/
```

### Native (EAS Build)
```bash
cd apps/mobile

# iOS
eas build --platform ios --profile preview

# Android
eas build --platform android --profile preview
```

---

## Environment Variables

Create `.env` in the root:
```bash
MESHY_API_KEY=msy_xxx  # Meshy AI for 3D generation
EXPO_TOKEN=xxx         # EAS Build token
```

---

## Documentation

- [AGENTS.md](./AGENTS.md) - AI agent instructions
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) - System architecture
- [docs/DESIGN.md](./docs/DESIGN.md) - Game design document
- [docs/BRAND_IDENTITY.md](./docs/BRAND_IDENTITY.md) - Visual identity

### Memory Bank
- [memory-bank/activeContext.md](./memory-bank/activeContext.md) - Current work
- [memory-bank/progress.md](./memory-bank/progress.md) - Development status

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Make changes
4. Run checks (`pnpm lint && pnpm type-check`)
5. Commit with conventional commits (`feat: add amazing feature`)
6. Push and create PR

---

## License

MIT License - See [LICENSE](LICENSE)

---

## Credits

### Technologies
- [Expo](https://expo.dev/) - Universal React platform
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) - Declarative Three.js
- [Miniplex](https://miniplex.hmans.co/) - ECS for React
- [NativeWind](https://www.nativewind.dev/) - Tailwind for React Native
- [Meshy AI](https://meshy.ai/) - Text-to-3D generation

### Assets
- [AmbientCG](https://ambientcg.com/) - CC0 PBR textures
- [Kenney](https://kenney.nl/) - Game assets

---

**Built with love by [@jbcom](https://github.com/jbcom)**
