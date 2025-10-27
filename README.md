# Otter River Rush 🦦🌊

[![CI](https://github.com/jbcom/otter-river-rush/actions/workflows/ci.yml/badge.svg)](https://github.com/jbcom/otter-river-rush/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

An engaging endless runner game featuring an adventurous otter navigating a rushing river. Built with **TypeScript**, **React 19**, and **React Three Fiber 9**, deployable across all platforms.

🎮 **[Play Now](https://jbcom.github.io/otter-river-rush/)** | 📖 **[Documentation](#documentation)** | 🤝 **[Contributing](./CONTRIBUTING.md)** | 📱 **[Platform Setup](./PLATFORM_SETUP.md)**

## 📦 Available On All Platforms

| Platform | Status | Get Started |
|----------|--------|-------------|
| 🌐 **Web (PWA)** | ✅ Ready | [Play Now](https://jbcom.github.io/otter-river-rush/) |
| 📱 **Android** | ✅ Ready | `npm run cap:android` |
| 🍎 **iOS** | ✅ Ready | `npm run cap:ios` (macOS) |
| 🪟 **Windows** | ✅ Ready | `npm run electron:build` |
| 🍏 **macOS** | ✅ Ready | `npm run electron:build` |
| 🐧 **Linux** | ✅ Ready | `npm run electron:build` |

See **[PLATFORM_SETUP.md](./PLATFORM_SETUP.md)** for detailed setup instructions.

![Otter River Rush Gameplay](./public/screenshot.png)

## ✨ Features

### Core Gameplay
- 🦦 **Smooth Controls**: Responsive touch, mouse, and keyboard input
- 🎯 **Multiple Game Modes**: Classic, Time Trial, Zen, and Daily Challenge
- 🌊 **Dynamic Biomes**: Travel through Forest, Mountain, Canyon, and Rapids
- 🎲 **Procedural Generation**: Unique patterns and challenges every playthrough
- 🏆 **Achievement System**: 50+ achievements to unlock
- 💎 **Collectibles**: Coins, gems, and special items
- ⚡ **Power-Ups**: Shield, Magnet, Slow Motion, Ghost, and Score Multiplier

### Technical Features
- 📱 **Progressive Web App**: Install and play offline
- 🎨 **WebGL 3D Rendering**: React Three Fiber with GLB models at 60 FPS
- 🔊 **Spatial Audio**: Immersive sound effects with Howler.js
- 💾 **Auto-Save**: Progress saved automatically to localStorage
- 📊 **Local Leaderboards**: Track your high scores
- ♿ **Accessibility**: WCAG compliant with keyboard navigation and screen reader support
- 🌙 **Reduced Motion**: Accessibility mode for motion sensitivity

### Performance
- ⚡ 60 FPS gameplay on all devices
- 📦 < 2MB bundle size (gzipped)
- 🚀 Lighthouse score: 95+
- 🎯 Object pooling for memory efficiency

## 🎮 Controls

### Keyboard
- **Arrow Keys** or **A/D**: Switch lanes
- **Space**: Start/Resume game
- **Escape**: Pause game
- **Tab**: Navigate menus

### Touch/Mobile
- **Swipe Left/Right**: Switch lanes
- **Tap**: Start/Resume game

### Mouse
- **Click Left/Right**: Switch lanes
- **Click**: Interact with menus

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ and npm
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

```bash
# Clone the repository
git clone https://github.com/jbcom/otter-river-rush.git
cd otter-river-rush

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to play!

## 📜 Available Scripts

```bash
# Development
npm run dev              # Start dev server with HMR
npm run preview          # Preview production build

# Building
npm run build            # Build for production
npm run type-check       # Run TypeScript compiler

# Cross-Platform
npm run verify:platforms # Check platform setup status
npm run cap:android      # Open Android in Android Studio
npm run cap:ios          # Open iOS in Xcode (macOS only)
npm run electron:dev     # Run desktop app with hot reload
npm run electron:build   # Build desktop installer

# Testing
npm test                 # Run unit tests
npm run test:ui          # Open Vitest UI
npm run test:coverage    # Generate coverage report
npm run test:e2e         # Run E2E tests with Playwright
npm run test:e2e:ui      # Open Playwright UI

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run format           # Format code with Prettier

# Analysis
npm run analyze          # Visualize bundle size
```

## 🏗️ Project Structure

```
otter-river-rush/
├── .github/workflows/    # CI/CD pipelines
├── src/
│   ├── components/
│   │   ├── game/         # R3F game components (Otter, Rock, Coin, etc.)
│   │   └── ui/           # React UI components (HUD, Menus)
│   ├── store/
│   │   └── gameStore.ts  # Zustand state management
│   ├── hooks/            # Custom React hooks
│   ├── utils/
│   │   ├── Config.ts     # Game configuration
│   │   ├── MathUtils.ts  # Math helpers
│   │   ├── StorageManager.ts # Deep merge save system
│   │   └── AudioManager.ts   # Howler.js audio
│   ├── types/            # TypeScript definitions
│   └── main.tsx          # Entry point
├── public/
│   ├── models/           # GLB 3D models (Otter, Rocks, Collectibles)
│   ├── textures/         # Ambient background textures
│   ├── icons/            # UI icons
│   └── audio/            # Sound effects and music
├── tests/
│   ├── unit/             # Unit tests (Vitest)
│   └── e2e/              # E2E tests (Playwright)
├── docs/                 # Documentation
│   ├── ARCHITECTURE.md   # Frozen architecture spec (v2.0.0)
│   ├── DESIGN.md         # Frozen game design spec
│   └── BRAND_IDENTITY.md # Brand and visual identity
└── scripts/              # Asset generation and build scripts
```
└── dist/                 # Production build
```

## 🎯 Game Modes

### 🏃 Classic Mode
Endless runner with progressive difficulty. Survive as long as possible while collecting coins and avoiding obstacles.

### ⏱️ Time Trial
Reach the highest distance in 60 seconds. Every second counts!

### 🧘 Zen Mode
Relaxed gameplay with no obstacles. Focus on collecting coins and enjoying the river.

### 🎲 Daily Challenge
New challenge every day with specific requirements and bonus rewards.

## 🌊 Biomes

The game features four distinct biomes that change as you progress:

1. **Peaceful Forest** (0-1000m): Gentle introduction with basic obstacles
2. **Mountain Rapids** (1000-2000m): Increased speed and obstacle density
3. **Desert Canyon** (2000-3000m): Challenging patterns and tight spacing
4. **Raging Rapids** (3000m+): Maximum difficulty with complex patterns

## 🎨 Power-Ups

- **🛡️ Shield**: Grants immunity to one collision
- **🧲 Magnet**: Auto-collect nearby coins
- **⏱️ Slow Motion**: Reduces game speed by 70%
- **👻 Ghost**: Phase through obstacles
- **⭐ Multiplier**: 2x score for limited time

## 🏆 Achievements

Unlock 50+ achievements across multiple categories:
- Distance milestones
- Score achievements
- Collection challenges
- Combo mastery
- Close call thrills
- Power-up expertise

## 🧪 Testing

### Unit Tests
```bash
npm test
```

Tests cover:
- Game logic and systems
- Collision detection
- Object pooling
- Procedural generation
- Score management

Target: 80%+ coverage

### E2E Tests
```bash
npm run test:e2e
```

E2E tests verify:
- Game loads and starts correctly
- Input handling (touch, mouse, keyboard)
- Collision detection triggers game over
- Score increments properly
- Power-ups activate correctly
- Leaderboard persistence

### Visual Regression Tests
```bash
npm run test:visual
```

Visual tests ensure:
- UI renders correctly across browsers
- Game graphics display properly
- Responsive design works on all viewports
- No visual regressions in updates

See [VISUAL_TESTING.md](./VISUAL_TESTING.md) for detailed guide.

To update visual baselines after intentional changes:
```bash
npm run test:visual:update
```

## 🚀 Deployment

The game automatically deploys to GitHub Pages on push to main branch.

### CI/CD Pipeline

Our automated workflow:
1. **Generates Fresh Content** - AI creates level patterns, enemy behaviors, sprites (main branch only)
2. **Runs Quality Checks** - Linting, type-checking, and unit tests
3. **Builds & Tests** - Creates optimized bundle with E2E tests
4. **Deploys to Web** - GitHub Pages hosting
5. **Creates Releases** - Semantic versioning with platform builds

> 📋 Secrets configured: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY` for content generation

### Manual Deployment
```bash
npm run build
# Deploy the dist/ folder to your hosting provider
```

### GitHub Pages
1. Enable GitHub Pages in repository settings
2. Set source to "GitHub Actions"
3. Push to main branch
4. Game deploys automatically via CI/CD

## 🎨 Asset Attribution

### Textures
- Water textures from [AmbientCG](https://ambientcg.com/) (CC0)
- Rock textures from [AmbientCG](https://ambientcg.com/) (CC0)

### Audio
- Sound effects from [Freesound.org](https://freesound.org/) (CC0)
- Water ambience loops (CC0 licensed)

### Fonts
- [Nunito](https://fonts.google.com/specimen/Nunito) by Vernon Adams (OFL)

See [ASSETS.md](./ASSETS.md) for complete attribution list.

## ♿ Accessibility

Otter River Rush is built with accessibility in mind:

- ✅ WCAG 2.1 AA compliant
- ⌨️ Full keyboard navigation
- 📢 Screen reader support with ARIA labels
- 🎨 High contrast mode option
- 🌈 Colorblind-friendly palette options
- 🔇 Visual alternatives for audio cues
- ⚡ Reduced motion mode
- 🎮 Adjustable game speed

## 🛠️ Tech Stack

### Frontend
- **Language**: TypeScript 5.5
- **Rendering**: HTML5 Canvas 2D (native)
- **Architecture**: Entity Component System pattern
- **Build**: Vite 7.1
- **Styling**: Tailwind CSS 4 + DaisyUI 5

### Cross-Platform
- **Mobile**: Capacitor 7.4 (Android + iOS)
- **Desktop**: Electron 38 (Windows, macOS, Linux)
- **Web**: PWA with Service Worker

### Development
- **Audio**: Howler.js 2.2
- **Testing**: Vitest 4.0, Playwright 1.47
- **Code Quality**: ESLint, Prettier
- **CI/CD**: GitHub Actions

## 📊 Performance

- **Bundle Size**: < 2MB (gzipped < 500KB)
- **FPS**: 60 FPS maintained with 200+ objects
- **Memory**: Stable with object pooling (< 50MB)
- **Package Sizes**:
  - Web (gzipped): ~500 KB
  - Android APK: ~30 MB
  - iOS IPA: ~25 MB
  - Windows EXE: ~100 MB
  - macOS DMG: ~80 MB
  - Linux AppImage: ~95 MB

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) first.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test` and `npm run test:e2e`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by classic endless runner games
- Built with modern web technologies
- Thanks to all contributors and the open source community

## 📧 Contact

- **GitHub**: [@jbcom](https://github.com/jbcom)
- **Issues**: [Bug Reports](https://github.com/jbcom/otter-river-rush/issues)
- **Discussions**: [Community Forum](https://github.com/jbcom/otter-river-rush/discussions)

---

Made with ❤️ and TypeScript

**Star ⭐ this repository if you enjoy the game!**
