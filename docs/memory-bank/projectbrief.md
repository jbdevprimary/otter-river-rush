# Project Brief - Otter River Rush

## Core Project Identity

**Otter River Rush** is a browser-based endless runner game featuring an adorable otter navigating down a rushing river. Built with TypeScript and HTML5 Canvas, it's a modern take on the endless runner genre with progressive web app capabilities.

## Project Goals

### Primary Objectives
1. **Engaging Gameplay**: Create a fun, addictive endless runner experience
2. **Technical Excellence**: Showcase modern TypeScript game development practices
3. **Accessibility**: Make the game playable by everyone, everywhere
4. **Performance**: Maintain 60 FPS on all devices
5. **Progressive**: Work offline and install as a native-like app

### Secondary Objectives
- Demonstrate best practices in game architecture
- Provide comprehensive testing examples
- Create maintainable, extensible codebase
- Document the development process thoroughly

## Core Requirements

### Functional Requirements
- **Gameplay**: Endless scrolling river with lane-based movement
- **Controls**: Keyboard (arrows/WASD), touch, and mouse support
- **Obstacles**: Rocks and other hazards to avoid
- **Collectibles**: Coins, gems, and power-ups
- **Progression**: Score tracking, achievements, levels
- **Persistence**: Save/load game progress
- **Audio**: Sound effects and background music
- **Modes**: Classic, Time Trial, Zen, Challenge modes

### Technical Requirements
- TypeScript with strict mode
- Canvas 2D rendering at 60 FPS
- Object pooling for performance
- Progressive Web App (PWA)
- Responsive design (mobile-first)
- Comprehensive test coverage (80%+)
- CI/CD with automated deployment
- Bundle size < 2MB

### Quality Requirements
- WCAG 2.1 AA accessibility compliance
- Lighthouse performance score 95+
- Cross-browser compatibility
- Zero TypeScript errors
- Zero ESLint warnings
- Formatted code (Prettier)

## Target Audience

### Primary Users
- Casual gamers looking for quick entertainment
- Mobile users wanting offline gameplay
- Accessibility-focused players
- Web game enthusiasts

### Secondary Users
- TypeScript/game developers learning best practices
- Contributors to open-source games
- Students studying game architecture

## Success Criteria

### Launch Criteria
✅ All core gameplay features implemented  
✅ 60 FPS performance on target devices  
✅ 80%+ test coverage  
✅ Zero critical bugs  
✅ Accessibility compliance verified  
✅ PWA installable and works offline  
✅ Documentation complete  

### Post-Launch Metrics
- Playable on all modern browsers
- Installation rate for PWA
- Achievement completion rates
- Player retention metrics
- Community contributions

## Constraints

### Technical Constraints
- Browser-only (no native builds)
- Canvas 2D (no WebGL required)
- localStorage for persistence (no backend)
- Client-side only (no multiplayer initially)

### Resource Constraints
- Open-source project (community-driven)
- Zero budget (free assets/tools only)
- GitHub Pages hosting (static only)

## Non-Goals

What this project explicitly does NOT aim to do:
- Compete with commercial game engines
- Support legacy browsers (IE11)
- Include real-time multiplayer
- Use 3D graphics or WebGL
- Require user accounts or login
- Collect user analytics (privacy-first)
- Monetization (ads/IAP)

## Project Scope

### In Scope
- Single-player endless runner
- Multiple game modes
- Achievement system
- Local leaderboards
- Power-ups and collectibles
- Sound and music
- PWA features
- Comprehensive testing
- Full documentation

### Out of Scope (Future Phases)
- Online leaderboards
- User accounts
- Social features
- Level editor
- Modding support
- Mobile native apps
- Backend/server

## Technology Stack

See [Tech Context](./techContext.md) for detailed technology information.

**Core Stack**:
- TypeScript 5.5+
- Vite 5.4+
- HTML5 Canvas
- Vitest + Playwright
- GitHub Actions

## Repository Information

- **Repository**: jbcom/otter-river-rush
- **License**: MIT (open source)
- **Hosting**: GitHub Pages
- **CI/CD**: GitHub Actions

## Document Status

- **Created**: 2025-10-25
- **Status**: Active
- **Version**: 1.0
- **Owner**: Development Team

---

This document serves as the foundation for all other documentation. All decisions should align with these core goals and requirements.
