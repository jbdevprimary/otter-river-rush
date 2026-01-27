# Testing Guide

## Overview

Otter River Rush is a TypeScript Expo project. The testing stack is in place, but
most suites are still being assembled. This document captures the current status
and how to add new tests.

## Current Tooling

- **Jest** for unit tests (`pnpm test`)
- **Playwright** for web E2E tests (`pnpm playwright test`)
- **Biome** for linting (`pnpm lint`)
- **TypeScript** for type checking (`pnpm typecheck`)

## Running Tests

```bash
pnpm test
pnpm lint
pnpm typecheck
```

## Playwright E2E (Web)

Playwright is configured in `playwright.config.ts`. To add tests:

1. Create `tests/e2e/<feature>.spec.ts`.
2. Start the app (or let Playwright run `pnpm build && pnpm preview`).
3. Run:

```bash
pnpm playwright test
```

## Adding Unit Tests

Place Jest tests alongside source files using the `.test.ts` or `.test.tsx`
convention. Keep tests focused on ECS systems, hooks, and utility modules.

## Planned Coverage

- Game loop + ECS systems
- Input handling (keyboard + touch)
- UI flows (menu → game → game over)
- Performance smoke checks for WebGL
