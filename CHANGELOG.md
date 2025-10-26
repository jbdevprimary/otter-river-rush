# Changelog

All notable changes to Otter River Rush will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added - Phase 2 (React Three Fiber)
- React Three Fiber game engine with WebGL rendering
- Zustand state management for game state
- Input handling hooks (keyboard and touch)
- React components for all game entities:
  - Otter (player with lane movement)
  - Rock (obstacles)
  - Coin (collectibles)
  - Gem (rare collectibles)
  - Background (scrolling water)
- Complete UI components (MainMenu, HUD, GameOver, Pause)
- Entity spawning system
- Collision detection in React
- Smooth lane-based movement with lerp
- Visual animations (bobbing, rotation, scaling)
- Dev mode with lane indicators and stats

### Added - Phase 1 (Production Foundation)
- Tailwind CSS 4.x with custom Otter theme
- DaisyUI 5.x component library
- ResponsiveCanvas utility for adaptive canvas sizing
- High-DPI display support (Retina, etc.)
- Cross-platform build infrastructure:
  - Capacitor for mobile (Android/iOS)
  - Electron for desktop (Windows/Mac/Linux)
  - GitHub Actions workflows for automated builds
- Modern responsive UI design
- Touch-friendly controls (44px minimum targets)
- Accessibility features (high contrast, reduced motion)
- Production-ready build system

### Changed
- Converted all UI to Tailwind CSS classes
- Modernized HTML with DaisyUI components
- Enabled JSX support in TypeScript
- Updated tsconfig for React development
- Optimized CSS (8.7KB from 11.12KB)

### Fixed
- All 6 TypeScript build errors
- SPEED_BOOST renamed to CONTROL_BOOST across codebase
- Added vite-env.d.ts for ImportMeta.env types
- PostCSS configuration for Tailwind 4.x
- Capacitor deprecated bundledWebRuntime property

### Infrastructure
- Added 2 GitHub Actions workflows (mobile, desktop)
- 10+ new npm scripts for cross-platform builds
- Automated Android APK builds
- Automated desktop builds for 3 platforms
- Tag-based release automation

## [0.1.0] - 2025-10-24

### Added
- Initial game implementation with Canvas 2D
- Core endless runner mechanics
- Lane-based movement system
- Obstacle generation (rocks)
- Collectibles (coins, gems)
- Power-up system (shield, magnet, multiplier, ghost, slow motion)
- Achievement system (50+ achievements)
- Score tracking and combos
- Multiple game modes (Classic, Time Trial, Zen, Daily Challenge)
- Save/load system with localStorage
- Audio system with Howler.js
- Leaderboard system (local)
- Stats tracking
- Settings menu
- PWA support with offline capability
- Sprite-based rendering
- Object pooling for performance
- Comprehensive testing (Vitest + Playwright)
- CI/CD with GitHub Actions
- Complete documentation

### Technical
- TypeScript 5.5 with strict mode
- Vite 5.4 build system
- Canvas 2D rendering engine
- Entity-Component System (ECS)
- State machine for game states
- Procedural generation system
- Physics system
- Collision detection with spatial grid
- Particle system

---

## Version History

- **Unreleased**: Phase 1 & 2 complete - Production foundation + React Three Fiber
- **0.1.0**: Initial release - Vanilla Canvas 2D version

## Upcoming Versions

### [0.2.0] - Phase 2 Complete
- Full React Three Fiber implementation
- WebGL-powered rendering
- Enhanced visual effects
- Improved performance
- Feature parity with vanilla version

### [0.3.0] - Phase 3 Complete
- Mobile apps (Android APK, iOS IPA)
- Desktop apps (Windows, Mac, Linux)
- App store submissions
- Code signing
- Auto-updates

### [0.4.0] - Phase 4 Complete
- AI-generated asset variants
- Dynamic asset loading
- Theme system
- Asset optimization pipeline

### [0.5.0] - Phase 5 Complete
- Enhanced biome system
- 50+ achievements
- Multiple game modes refined
- Advanced accessibility features
- Complete feature parity with README

### [1.0.0] - Phase 6 Complete (Production Launch)
- All features complete
- Production hardening
- Performance optimization
- Security audit
- Monitoring and analytics
- Full documentation
- Ready for public launch

---

**Note**: This project is currently in active development. Version 1.0.0 is expected in approximately 8-10 weeks from Phase 1 start (2025-10-25).
