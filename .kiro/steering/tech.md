# Technology Stack

## Core Technologies

- **Expo SDK 52+**: Unified platform for web, iOS, Android
- **React 19**: UI framework
- **React Three Fiber (R3F)**: Declarative Three.js for 3D rendering
- **TypeScript 5.5+**: Strict mode enabled, no `any` types
- **Miniplex 2**: Entity Component System (ECS)
- **Zustand 5**: Global state management
- **NativeWind v4**: Tailwind CSS for React Native

## Development Tools

- **pnpm 10+**: Package manager (monorepo workspaces)
- **Biome**: Linting and formatting (replaces ESLint + Prettier)
- **Metro**: JavaScript bundler (Expo's default)
- **Vitest**: Unit and integration tests
- **EAS Build**: Cloud builds for native apps

## Common Commands

```bash
# Development
pnpm dev              # Start Expo dev server (all platforms)
pnpm dev:web          # Web on :8081
pnpm dev:ios          # iOS simulator
pnpm dev:android      # Android emulator

# Building
pnpm build            # Build all packages
pnpm build:web        # Export web bundle

# Quality
pnpm lint             # Run Biome linter
pnpm type-check       # TypeScript validation
pnpm test             # Run tests
pnpm verify           # Lint + type-check

# Content Generation
pnpm --filter @otter-river-rush/content-gen gen:all
```

## Key Packages

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

## Code Standards

### TypeScript
- Strict mode enabled (no `any`, explicit return types)
- Interfaces over types where possible
- Path mapping via monorepo packages

### Styling
- NativeWind (Tailwind CSS) for all UI
- Use `className` not inline `style`
- Brand colors: `brand-primary`, `brand-gold`, `brand-success`, `brand-danger`

### Components
- React Native primitives: `View`, `Text`, `Pressable`
- Functional components with hooks
- Co-locate styles with components

### Git
- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`
- Branch naming: `feature/`, `fix/`, `refactor/`

## Environment Variables

Required in `.env`:
```bash
MESHY_API_KEY=msy_xxx  # Meshy AI for 3D generation
EXPO_TOKEN=xxx         # EAS Build token
```

## Performance Targets

- **FPS**: 60 (target), 30-60 (mobile acceptable)
- **Load Time**: < 3s first contentful paint
- **Bundle Size**: < 2 MB total
- **Memory**: < 100 MB during gameplay

## Browser/Platform Support

- **Web**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **iOS**: iOS 14+ via EAS Build
- **Android**: Android 10+ via EAS Build
- **WebGL**: Required for Three.js
