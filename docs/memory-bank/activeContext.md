# Active Context - Otter River Rush

**Last Updated**: 2025-10-27
**Current Branch**: main
**Session Status**: 🔄 COMPREHENSIVE SYSTEMS BUILD + E2E TESTING

## Current Work Summary

### Completed Tasks ✅

#### 1. Complete Monorepo Reorganization
- pnpm workspace (client + dev-tools)
- React Three Fiber ACTIVE
- Miniplex ECS integrated
- Build: 1.25MB, 346KB gzipped

#### 2. Meshy 3D Assets (18 GLB files, 91 MB)
- Otter: 1 model + 10 animations
- Rocks: 4 variants (retextured)
- Collectibles: coin + gem
- Idempotent generation pipeline
- Recovery manager for task matching

#### 3. Complete Game Architecture
**10 Systems Created:**
- Movement, Collision, Spawning, Cleanup
- Score, Power-ups, Difficulty, Biomes
- Achievements, Audio framework
- Camera (follow + shake)
- Input (keyboard + touch/swipe)

**Components:**
- EntityRenderer (GLB models with Miniplex)
- GameCanvas (complete 3D scene)
- GameHUD, MainMenu, GameOver (with proper IDs)
- River, Skybox, LaneMarkers
- Visual Effects (bloom, vignette)
- Error Boundary

**Utilities:**
- Math helpers (lerp, clamp, easing, etc.)
- Collision helpers (AABB, spatial grid, QuadTree)
- Entity helpers (movement, targeting, spawning)
- Animation helpers (transitions, queuing)
- Debug tools (god mode, teleport, freeze)
- Test helpers (test world, assertions)
- Performance tools (pooling, profiling)

**Hooks:**
- useEntityQuery (player, obstacles, collectibles)
- useAnimationMixer (animation control)
- usePersistence (save/load)
- useAssetPreloader (loading screen)

#### 4. Testing & Documentation
- E2E tests created (14 tests)
- Integration tests (ECS system)
- Complete documentation (README, guides)
- Memory bank updated

### Recent Work - Session 2025-10-27

**Asset Path Corrections:**
1. Created missing `manifest.webmanifest` file
2. Created `src/utils/assets.ts` with base URL helpers
3. Fixed 10 component files to use proper asset paths:
   - MainMenu, HUD, GameOver, HealthBar (UI)
   - Coin, Gem, Rock, Otter (Game)
   - game-constants.ts, EntityRenderer.tsx (System)
4. Corrected "post-processor" → "processor" naming (PRE-commit workflow)

**Results:**
- ✅ Zero console errors (no 404s)
- ✅ Menu loads and displays correctly
- ✅ Running at 120 FPS
- ⚠️ E2E tests timing out (>120s) - unable to complete verification
- ❌ Full gameplay loop NOT verified

### Current Issues

**E2E Test Status:** INCOMPLETE
- Tests started but timed out after 120 seconds
- Test report generated but not analyzed
- Unknown which specific gameplay features work/fail
- Menu appears functional but gameplay unverified

**Required Next Steps:**
1. Complete E2E test run or analyze test report
2. Identify actual gameplay failures (if any)
3. Fix gameplay issues preventing full loop
4. Verify complete sequence: Menu → Game → Playing → Game Over → Menu

## Key Files Modified This Session

1. **`.cursor/Dockerfile`** - 165-line production-grade Docker image
2. **`.cursor/docker-compose.yml`** - Multi-service orchestration
3. **`.cursor/docker.sh`** - Executable CLI helper (279 lines)
4. **`.cursor/README.md`** - Complete Docker documentation
5. **`.dockerignore`** - Build optimization
6. **`android/app/build.gradle`** - Fixed ignoreAssetsPattern syntax
7. **`android/app/capacitor.build.gradle`** - Reverted to auto-generated (VERSION_21)
8. **`android/build.gradle`** - Modern `plugins.withType` for Java 17 enforcement
9. **`.github/workflows/build-platforms.yml`** - Added clarifying comment
10. **`PLATFORM_SETUP.md`** - Docker quick-start, Java 17 explanation
11. **`docs/memory-bank/activeContext.md`** - This file

## Docker Environment Architecture

### Build Strategy
- **Base Image**: `mcr.microsoft.com/playwright:v1.47.0-jammy` (Ubuntu 22.04)
- **Node.js 22**: Matches CI exactly
- **Java 17**: Required by Capacitor 7.x, Android Gradle Plugin 8.x
- **Gradle 9.1.0**: Matches `gradle-wrapper.properties`
- **Android SDK**: API 35 with Build Tools 35.0.0
- **Global Tools**: tsx, typescript, vite, electron, @capacitor/cli

### Usage
```bash
# Build image (one time, ~5-10 minutes)
.cursor/docker.sh build

# Start development
.cursor/docker.sh dev

# Common commands
.cursor/docker.sh web              # Vite dev server
.cursor/docker.sh build-android    # Build APK
.cursor/docker.sh test             # Run tests
.cursor/docker.sh verify           # Verify environment
```

### Why Java 17?
- **Capacitor 7.x requirement**: Official compatibility target
- **Android Gradle Plugin 8.x**: Optimized for Java 17
- **CI environment match**: GitHub Actions uses Temurin Java 17
- **LTS support**: Maintained until 2029
- **Ecosystem standard**: Android development hasn't migrated to Java 21 yet

## Tech Stack

### Development Environment
- **Docker**: Containerized dev environment matching CI
- **Node.js 22**: Latest LTS
- **Java 17**: Temurin distribution (Capacitor requirement)
- **Gradle 9.1.0**: Modern Android builds
- **Android SDK API 35**: Latest Android development

### Build/Deploy
- Vite 7.x
- GitHub Actions CI/CD (unified `build-platforms.yml`)
- GitHub Pages (web deployment)
- Capacitor 7.x (mobile)
- Electron 38.x (desktop)

### Game
- TypeScript (strict mode)
- Canvas 2D rendering
- Zustand (state management)

## Next Steps

### Immediate
- Merge PR #58 (copilot/update-ci-workflows)
- Verify unified build-platforms workflow
- Test Docker environment locally

### Short-term
- Build Docker image and test all commands
- Verify Android builds work in Docker
- Document any issues discovered during testing

## Important Patterns

### Docker Development
- Always use `.cursor/docker.sh` commands (don't call docker directly)
- Web build ALWAYS runs (desktop and mobile need it as base)
- Use named volumes for caching (node_modules, gradle)
- Image is ~3GB (includes Android SDK, browsers, tools)

### Gradle Modernization
- Use property assignment syntax: `namespace = "value"`
- Use `plugins.withType` instead of `afterEvaluate`
- Don't edit auto-generated files (`capacitor.build.gradle`)
- Global Java 17 enforcement in root `build.gradle`

### CI/CD Optimization
- Single web build reused across all platforms
- Parallel platform builds (desktop, mobile)
- Flexible platform selection (all/web/desktop/mobile)
- Optional asset generation on demand

## Memory Bank Files

- **activeContext.md** (this file) - Current session state
- **productContext.md** - Product vision and goals
- **progress.md** - Overall progress tracking
- **projectbrief.md** - Original project requirements
- **systemPatterns.md** - Code patterns and conventions
- **techContext.md** - Technical architecture

---

**Status**: 8/14 tests passing, game initialization broken
**Next Session**: Fix entity spawning, keyboard input, FPS display - core gameplay issues
