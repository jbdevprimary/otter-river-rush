# Tech Context - Otter River Rush

**Last Updated**: 2026-01-27
**Architecture**: Unified Expo (web + iOS + Android)

---

## Technology Stack

### Core Platform

#### Expo (Unified)
- **Expo SDK 52+** - Single app for all platforms
- **Metro Bundler** - JavaScript bundler for web, iOS, Android
- **Expo Router** - File-based routing
- **EAS Build** - Cloud builds for native apps
- **EAS Submit** - App store submissions

#### Language & Runtime
- **TypeScript 5.5+** - Strict mode enabled
  - Strict null checks
  - No implicit any
  - Path mapping via monorepo packages

#### 3D Rendering
- **React Three Fiber (R3F)** - Declarative Three.js for React
- **expo-three** - Expo bindings for Three.js
- **expo-gl** - WebGL context for Expo
- **@react-three/drei** - R3F helpers (useGLTF, useAnimations)

#### State & Architecture
- **Zustand 5** - Global state management
- **Miniplex 2** - Entity Component System (ECS)
- **React 19** - UI framework

#### Styling
- **NativeWind v4** - Tailwind CSS for React Native
- **Tailwind CSS 3.4** - Utility-first CSS (via NativeWind)
- Brand colors: `brand-primary`, `brand-gold`, `brand-success`, `brand-danger`

---

## Development Tools

### Code Quality
- **Biome** - Linting and formatting (replaces ESLint + Prettier)
  - Single config file (`biome.json`)
  - Fast performance
  - Zero config needed

### Package Management
- **pnpm 10+** - Fast, disk-efficient package manager
- **pnpm workspaces** - Monorepo management

### Testing
- **Vitest** - Unit and integration tests
- **Jest** - React Native testing (via Expo)

---

## Build Configuration

### Expo Configuration
- `app.json` - Expo app config
- `eas.json` - EAS Build profiles
- `metro.config.js` - Metro + NativeWind config
- `tailwind.config.js` - Tailwind theme

### Key app.json Settings
```json
{
  "expo": {
    "web": {
      "bundler": "metro",
      "output": "static"
    }
  }
}
```

---

## Development Setup

### Prerequisites
```bash
Node.js >= 22.0.0
pnpm >= 10.0.0
```

For native builds:
- **iOS**: macOS + Xcode
- **Android**: Android Studio + Java 21

### Installation
```bash
# Clone repository
git clone https://github.com/arcade-cabinet/otter-river-rush.git
cd otter-river-rush

# Install dependencies
pnpm install

# Start development server
pnpm dev        # All platforms
pnpm dev:web    # Web on :8081
pnpm dev:ios    # iOS simulator
pnpm dev:android # Android emulator
```

### Development Commands
```bash
# Development
pnpm dev           # Expo dev server (all platforms)
pnpm dev:web       # Web specifically (:8081)
pnpm dev:ios       # iOS simulator
pnpm dev:android   # Android emulator

# Building
pnpm build         # Build all packages
pnpm build:web     # Export web bundle

# Testing
pnpm test          # Run tests
pnpm lint          # Run Biome linter
pnpm type-check    # TypeScript validation

# Content Generation
pnpm --filter @otter-river-rush/content-gen gen:all
```

---

## Technical Constraints

### Browser/Platform Support
- **Web**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **iOS**: iOS 14+ via EAS Build
- **Android**: Android 10+ via EAS Build
- **WebGL**: Required for Three.js

### Performance Requirements
- **60 FPS**: Target on all platforms
- **Load time**: < 2s first contentful paint
- **Memory**: < 100MB during gameplay

### Platform-Specific
- **Web**: Metro bundler with static export
- **iOS/Android**: Native builds via EAS
- **Assets**: Served from `assets/` via Expo asset bundling

---

## Dependencies

### Production (Key Packages)
```json
{
  "expo": "~52.0.0",
  "react": "19.0.0",
  "react-native": "0.76.x",
  "@react-three/fiber": "^8.x",
  "@react-three/drei": "^9.x",
  "three": "^0.170.x",
  "zustand": "^5.x",
  "miniplex": "^2.x",
  "nativewind": "^4.x"
}
```

### Development (Key Packages)
```json
{
  "typescript": "~5.5.0",
  "@biomejs/biome": "^1.x",
  "tailwindcss": "~3.4.17"
}
```

---

## Monorepo Structure

### Packages
| Package | Purpose |
|---------|---------|
| `@otter-river-rush/game-core` | Platform-agnostic game logic, ECS systems |
| `@otter-river-rush/rendering` | React Three Fiber components |
| `@otter-river-rush/config` | Game constants (PHYSICS, VISUAL, lanes) |
| `@otter-river-rush/ui` | NativeWind UI components |
| `@otter-river-rush/audio` | Audio system (platform-agnostic) |
| `@otter-river-rush/state` | Zustand store definitions |
| `@otter-river-rush/types` | TypeScript type definitions |
| `@otter-river-rush/content-gen` | Meshy AI asset generation |

### Package Resolution
Metro resolves workspace packages via `nodeModulesPaths` in `metro.config.js`.

---

## Environment Configuration

### Environment Variables
Required in `.env`:
```bash
MESHY_API_KEY=msy_xxx  # Meshy AI for 3D generation
EXPO_TOKEN=xxx         # EAS Build token
```

### No Runtime Config
- All game config in TypeScript (`packages/config`)
- No runtime environment variables needed
- Compile-time configuration only

---

## CI/CD

### GitHub Actions Workflows
- `integration.yml` - Lint, type-check, test on PR/push
- `mobile-primary.yml` - Primary build and deploy workflow
- `build-platforms.yml` - Multi-platform EAS builds

### Deployment
- **Web**: GitHub Pages via `expo export --platform web`
- **iOS**: EAS Build → App Store Connect
- **Android**: EAS Build → Play Store

---

## Asset Pipeline

### Static Assets
Located in `assets/`:
```
assets/
├── models/          # GLB 3D models
├── textures/        # PBR texture sets
└── audio/           # Sound effects and music
```

### Asset Loading
- **Web**: Bundled via `expo-asset` and resolved to URIs
- **Native**: Bundled via `expo-asset`

### Meshy AI Generation
```bash
cd packages/content-gen
pnpm gen:all  # Generate all 3D assets
```

---

## Security Considerations

### No Backend
- Client-side only application
- No authentication required
- No API keys in production code (except Meshy for dev)

### Privacy
- No analytics or tracking
- localStorage only for game saves
- No third-party requests except asset CDNs

---

## Troubleshooting

### Common Issues

**Metro bundler fails**
```bash
# Clear Metro cache
npx expo start --clear
```

**NativeWind styles not applying**
```bash
# Ensure global.css is imported in _layout.tsx
# Rebuild Metro cache
npx expo start --clear
```

**EAS Build fails**
```bash
# Check eas.json configuration
# Verify Expo account credentials
eas whoami
```

**Type errors in packages**
```bash
# Rebuild all packages
pnpm build
# Then run type-check
pnpm type-check
```

---

## Further Reading

### Internal Documentation
- [AGENTS.md](../AGENTS.md) - AI agent instructions
- [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) - System architecture
- [docs/DESIGN.md](../docs/DESIGN.md) - Game design document

### External Resources
- [Expo Documentation](https://docs.expo.dev/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [NativeWind](https://www.nativewind.dev/)
- [Miniplex](https://miniplex.hmans.co/)
- [Zustand](https://zustand-demo.pmnd.rs/)
