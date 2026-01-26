# AGENTS.md - Shared AI Agent Instructions

This file provides shared guidance for all AI coding assistants (Claude, Gemini, Copilot, Cursor, etc.) working with this repository. Agent-specific instructions should reference this file and add only agent-specific behaviors.

---

## Memory Bank

AI agents working on this project have context that resets between sessions. This isn't a limitation - it drives meticulous documentation. After each reset, agents rely ENTIRELY on the Memory Bank to understand the project and continue work effectively.

**CRITICAL: Read ALL memory bank files at the start of EVERY task.**

### Memory Bank Structure

The Memory Bank consists of core files in Markdown format, building upon each other in a clear hierarchy:

```
memory-bank/
├── projectbrief.md      # Foundation document - core requirements and goals
├── productContext.md    # Why project exists, problems solved, UX goals
├── activeContext.md     # Current work focus, recent changes, next steps
├── systemPatterns.md    # Architecture, design patterns, component relationships
├── techContext.md       # Technologies, dev setup, dependencies, constraints
└── progress.md          # What works, what's left, current status, known issues
```

### File Hierarchy

```
projectbrief.md (Foundation)
       │
       ├── productContext.md (Why & How)
       ├── systemPatterns.md (Architecture)
       └── techContext.md (Tech Stack)
              │
              └── activeContext.md (Current State)
                         │
                         └── progress.md (Status)
```

### Core Files

| File | Purpose |
|------|---------|
| `projectbrief.md` | Foundation document that shapes all other files. Defines core requirements and goals. Source of truth for project scope. |
| `productContext.md` | Why this project exists, problems it solves, how it should work, user experience goals. |
| `activeContext.md` | Current work focus, recent changes, next steps, active decisions, important patterns. |
| `systemPatterns.md` | System architecture, key technical decisions, design patterns, component relationships. |
| `techContext.md` | Technologies used, development setup, technical constraints, dependencies. |
| `progress.md` | What works, what's left to build, current status, known issues, decision evolution. |

### Additional Context Files

Create additional files within `memory-bank/` when they help organize:
- Complex feature documentation
- Integration specifications
- Testing strategies
- Deployment procedures

---

## Core Workflows

### Starting a Session

```
1. Read ALL memory bank files (projectbrief → productContext → systemPatterns → techContext → activeContext → progress)
2. Verify context is current
3. Identify the task at hand
4. Proceed with work
```

### Plan Mode

When planning significant work:
1. Read Memory Bank completely
2. Check if files are current
3. If outdated, update first
4. Develop strategy based on context
5. Present approach to user

### Act Mode

When executing tasks:
1. Check Memory Bank for relevant context
2. Execute the task
3. Document changes in activeContext.md
4. Update progress.md if significant

---

## Documentation Updates

Memory Bank updates occur when:
1. Discovering new project patterns
2. After implementing significant changes
3. When user requests with **"update memory bank"** (MUST review ALL files)
4. When context needs clarification

### Update Process

```
1. Review ALL memory bank files
2. Document current state
3. Clarify next steps
4. Document insights & patterns
```

**Note:** When triggered by "update memory bank", review every file even if some don't need changes. Focus on `activeContext.md` and `progress.md` as they track current state.

---

## Project Overview

**Otter River Rush** is a 3-lane endless river runner game built with a unified Expo architecture:

- **Expo** for all platforms (web, iOS, Android) via Metro bundler
- **React Three Fiber (R3F)** + **expo-three** for 3D rendering
- **React 19** for UI
- **Miniplex ECS** for entity management
- **Zustand** for state management
- **NativeWind** for cross-platform styling (Tailwind CSS)
- **pnpm** workspaces for monorepo management
- **Biome** for linting and formatting

---

## Project Structure

```
otter-river-rush/
├── apps/
│   └── mobile/                 # Unified Expo app (web + iOS + Android)
│       ├── app/                # Expo Router screens
│       ├── assets/             # All game assets (models, textures, audio)
│       ├── public/             # Static assets for web
│       ├── src/
│       │   ├── components/     # R3F rendering components
│       │   ├── screens/        # UI screens
│       │   └── hooks/          # Custom hooks
│       ├── app.json            # Expo configuration
│       └── eas.json            # EAS Build configuration
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
└── docs/                       # Architecture documentation
```

---

## Quick Reference

### Commands

```bash
# Development
pnpm dev                 # Start Expo dev server
pnpm dev:web             # Start web specifically
pnpm dev:android         # Start Android
pnpm dev:ios             # Start iOS

# Building
pnpm build               # Build all packages
pnpm build:web           # Export web bundle

# Testing
pnpm test                # Run all tests
pnpm lint                # Run linter
pnpm type-check          # Type check all packages
```

### Key Packages

| Package | Purpose |
|---------|---------|
| `@otter-river-rush/game-core` | Platform-agnostic game logic (ECS systems, state, scoring) |
| `@otter-river-rush/rendering` | React Three Fiber components |
| `@otter-river-rush/config` | Game constants (PHYSICS, VISUAL, getLaneX()) |
| `@otter-river-rush/ui` | React Native + NativeWind UI components |

### Coordinate System

- **X axis**: Lanes (left/right)
- **Y axis**: Forward/backward (scroll direction)
- **Z axis**: Height (depth layers)

Three.js uses Y-up, so in R3F:
```typescript
// Game coords: X=lanes, Y=forward, Z=height
// Three.js: X=lateral, Y=height, Z=depth
<mesh position={[entity.position.x, entity.position.z, entity.position.y]} />
```

---

## Code Standards

### TypeScript
- Strict mode enabled
- No `any` types
- Explicit return types for functions
- Interfaces over types where possible

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

---

## Environment Variables

Required in `.env`:
```
MESHY_API_KEY=msy_xxx  # Meshy AI API key for 3D generation
EXPO_TOKEN=xxx         # Expo token for EAS builds
```

---

## CI/CD

- `integration.yml` - Lint, type-check, and test on PR/push
- `mobile-primary.yml` - Primary workflow for building and deploying
- `build-platforms.yml` - Multi-platform builds via EAS

Web deployments go to GitHub Pages. Native builds use EAS Build.

---

## Remember

After every session reset, AI agents begin completely fresh. The Memory Bank is the only link to previous work. Maintain it with precision and clarity.
