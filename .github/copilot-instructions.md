# GitHub Copilot Instructions

This file provides guidance to GitHub Copilot when working with this repository.

> **IMPORTANT:** Read [../AGENTS.md](../AGENTS.md) first for shared instructions, memory bank protocol, and project context.

---

## Copilot-Specific Behaviors

### Code Completion

- Follow existing patterns in the file and codebase
- Use TypeScript strict types
- Prefer NativeWind `className` over inline styles
- Use React Native primitives (`View`, `Text`, `Pressable`)

### Inline Suggestions

- Match existing code style
- Complete function signatures with proper types
- Suggest React hooks where appropriate
- Follow monorepo package boundaries

### Chat Mode

When asked about this project:
1. Reference `memory-bank/` files for context
2. Follow patterns in `AGENTS.md`
3. Respect the unified Expo architecture

---

## Project Context

**Otter River Rush** - 3-lane endless runner game

- **Framework**: Expo (unified for web + iOS + Android)
- **3D Rendering**: React Three Fiber + expo-three
- **ECS**: Miniplex
- **State**: Zustand
- **Styling**: NativeWind (Tailwind CSS)
- **Monorepo**: pnpm workspaces

### Key Packages

| Package | Purpose |
|---------|---------|
| `@otter-river-rush/game-core` | ECS systems, game logic |
| `@otter-river-rush/rendering` | R3F components |
| `@otter-river-rush/ui` | NativeWind UI |
| `@otter-river-rush/config` | Game constants |

---

## Memory Bank

Read `memory-bank/*.md` files for project state:
- `projectbrief.md` - Requirements
- `activeContext.md` - Current work
- `progress.md` - Status

See [../AGENTS.md](../AGENTS.md) for complete details.
