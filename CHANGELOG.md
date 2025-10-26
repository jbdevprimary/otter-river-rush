# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.4](https://github.com/jbcom/otter-river-rush/compare/v1.0.3...v1.0.4) (2025-10-26)

### 🐛 Bug Fixes

* **ci:** remove artificial 5MB bundle size limit ([2c57475](https://github.com/jbcom/otter-river-rush/commit/2c574752871b81beb1f2f608876f9ddf2b512f26))

## [1.0.3](https://github.com/jbcom/otter-river-rush/compare/v1.0.2...v1.0.3) (2025-10-26)

### 🐛 Bug Fixes

* **ci:** add actions:write permission for workflow dispatch ([bb1b028](https://github.com/jbcom/otter-river-rush/commit/bb1b028b172fb81e68066717577d7e78243fd3b7))

## [1.0.2](https://github.com/jbcom/otter-river-rush/compare/v1.0.1...v1.0.2) (2025-10-26)

### 🐛 Bug Fixes

* **ci:** optimize E2E tests and implement automated platform builds ([2257fc6](https://github.com/jbcom/otter-river-rush/commit/2257fc6a386955e968dcf88214453ec3df8e6222))

## [1.0.1](https://github.com/jbcom/otter-river-rush/compare/v1.0.0...v1.0.1) (2025-10-26)

### 🐛 Bug Fixes

* **ci:** remove GitHub plugin from semantic-release to prevent empty releases ([63738b7](https://github.com/jbcom/otter-river-rush/commit/63738b7a4cc4cbf1e335a3d17d420b59688dfc25))

## 1.0.0 (2025-10-26)

### ✨ Features

* Add GitHub Actions CI/CD and virtual joystick for mobile ([63b1a01](https://github.com/jbcom/otter-river-rush/commit/63b1a01487e8c2882463f2c7e500b8cee2edd49f))
* **ci:** add automated semantic versioning and consolidate workflows ([a6918eb](https://github.com/jbcom/otter-river-rush/commit/a6918eba7a41bb03d80415245dc5a65adbe3f935))
* Complete multi-platform game implementation ([d9887c3](https://github.com/jbcom/otter-river-rush/commit/d9887c32afe842030ae3f1563e84d1b5fcc3495a))

### 🐛 Bug Fixes

* **ci:** add timeouts and make E2E tests non-blocking for deployment ([765c1d7](https://github.com/jbcom/otter-river-rush/commit/765c1d7610212bb5a8e961be0c0b2d26984506e4))
* Remove duplicate lines in ci.yml workflow ([51485cd](https://github.com/jbcom/otter-river-rush/commit/51485cda249594b959269b1c6e32d1692fbef363))

### ♻️ Refactoring

* Merge CI and Deploy into unified CI/CD workflow ([37987b9](https://github.com/jbcom/otter-river-rush/commit/37987b90e57916f985d82b76ea3b6197c910f7c0))

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
