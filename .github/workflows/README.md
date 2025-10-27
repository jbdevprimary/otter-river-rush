# GitHub Actions Workflows - CORRECTED ARCHITECTURE

## 🎯 The Problem We Fixed

### ❌ What We Were Doing WRONG

**The fundamental flaw**: We were testing **platform wrappers** (Capacitor, Electron) instead of **game logic**.

```
WRONG APPROACH:
Build → Wrap in Capacitor/Electron → Test wrapper outcomes
└─ Testing if Capacitor/Electron work, NOT if the GAME works!
```

**Key issues:**
1. Integration tests ran AFTER platform-specific builds
2. E2E tests ran against local artifacts, not deployed URLs
3. We tested Capacitor/Electron outcomes, not core game logic
4. Core codebase wasn't tested before branching into platforms

### ✅ What We're Doing NOW (Correct)

**The fix**: Test the **core game logic FIRST**, then split into platform-specific builds.

```
CORRECT APPROACH:
Integration Tests (core game) → THEN split into platforms
├─ Web: Build → Deploy → E2E test DEPLOYED URL
├─ Mobile: Build → Capacitor wrap → Manual test
└─ Desktop: Build → Electron wrap → Manual test
```

**Why this is correct:**
1. **Integration tests first** - Verify game logic before platform branching
2. **E2E tests on deployed URLs** - Test actual production environment
3. **Platform builds are wrappers** - Just packaging tested code
4. **No redundant testing** - Don't re-test game logic in each platform

---

## 🔄 New Workflow Architecture

### 1. Integration Tests (`integration.yml`)

**Purpose**: Test core game logic BEFORE platform branching

**Runs on**: All pushes/PRs to main/develop

**Tests**:
- ✅ Lint & formatting
- ✅ Type checking
- ✅ Unit tests (game mechanics, state, logic)
- ✅ Integration tests (game systems working together)

**Critical**: This is where we test the **CODEBASE**, not platform outputs!

---

### 2. Web Build & Deploy (`web.yml`)

**Purpose**: Build for web, deploy, and E2E test the DEPLOYED site

**Triggers**: After successful Integration Tests (main branch only)

**Flow**:
```
Integration ✅ → Build web → Deploy to GitHub Pages → E2E test DEPLOYED URL
```

**E2E Tests**: Run against the **actual GitHub Pages URL**, not local builds!

**Why**: Tests what users actually experience in production.

---

### 3. Mobile Build (`mobile.yml`)

**Purpose**: Build Capacitor APK after integration tests pass

**Triggers**: After successful Integration Tests (main branch only)

**Flow**:
```
Integration ✅ → Build web → Sync Capacitor → Build APK → Manual testing
```

**No automated E2E**: Capacitor wraps tested code. Manual testing verifies the wrapper works.

---

### 4. Desktop Build (`desktop.yml`)

**Purpose**: Build Electron binaries after integration tests pass

**Triggers**: After successful Integration Tests (main branch only)

**Flow**:
```
Integration ✅ → Build web → Package Electron → Build binaries → Manual testing
```

**No automated E2E**: Electron wraps tested code. Manual testing verifies the wrapper works.

---

### 5. Release (`release.yml`)

**Purpose**: Semantic versioning and release automation

**Triggers**: After successful Web deployment

**Flow**:
```
Web deployed ✅ → Semantic release → Trigger mobile & desktop builds with version
```

---

## 📊 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│  Push to main                                           │
└───────────────────────┬─────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  INTEGRATION TESTS (integration.yml)                    │
│  ✓ Lint                                                 │
│  ✓ Type check                                           │
│  ✓ Unit tests                                           │
│  ✓ Integration tests (CORE GAME LOGIC)                 │
└───────────────────────┬─────────────────────────────────┘
                        ↓
        ┌───────────────┼───────────────┐
        ↓               ↓               ↓
┌───────────┐   ┌──────────────┐   ┌──────────────┐
│    WEB    │   │   MOBILE     │   │   DESKTOP    │
│           │   │              │   │              │
│ Build web │   │ Build web    │   │ Build web    │
│     ↓     │   │     ↓        │   │     ↓        │
│  Deploy   │   │ Sync Capacitor   │ Package Electron │
│     ↓     │   │     ↓        │   │     ↓        │
│ E2E test  │   │ Build APK    │   │ Build exe/dmg│
│ DEPLOYED  │   │     ↓        │   │     ↓        │
│    URL    │   │ Manual test  │   │ Manual test  │
└─────┬─────┘   └──────────────┘   └──────────────┘
      ↓
┌─────────────┐
│   RELEASE   │
│             │
│ Semantic    │
│ versioning  │
│     ↓       │
│ Trigger     │
│ mobile &    │
│ desktop     │
└─────────────┘
```

---

## 🧪 Testing Strategy

### Integration Tests (Before Platform Branching)

**What we test:**
- Game state management
- Physics & collision detection
- Scoring & progression logic
- Asset loading systems
- Audio system
- Input handling logic (NOT platform-specific controls)
- Rendering logic (NOT platform-specific renderers)

**Why here**: This tests the **game itself**, independent of platform wrappers.

### E2E Tests (After Web Deployment)

**What we test:**
- Actual deployed GitHub Pages URL
- User flows on production site
- Visual regression on production
- Performance on production

**Why here**: This tests what users actually experience.

### Manual Testing (Mobile & Desktop)

**What we test:**
- Platform wrapper functionality (Capacitor/Electron)
- Platform-specific features (touch, native menus, etc.)
- Installation/distribution process

**Why manual**: Automated E2E for native wrappers is complex/unreliable. The core game is already tested.

---

## 🚀 How to Use

### For Development (PRs)

1. Push to branch
2. Integration tests run automatically
3. Fix any failures before merge

### For Web Deployment

1. Merge to main
2. Integration tests run
3. If pass → Web builds & deploys
4. E2E tests run against deployed URL

### For Platform Releases

1. Web deployment succeeds
2. Release workflow creates version tag
3. Mobile & Desktop workflows triggered with version
4. Download artifacts and test manually
5. Document test results

### Manual Triggers

**Test mobile build:**
```
Actions → Mobile Build → Run workflow
- Version: "test-1" or "v1.0.0"
```

**Test desktop build:**
```
Actions → Desktop Build → Run workflow
- Version: "test-1" or "v1.0.0"
- Platforms: all/linux/macos/windows
```

---

## 📁 Files Structure

```
.github/workflows/
├── integration.yml     # Core game logic tests (FIRST)
├── web.yml            # Web build → deploy → E2E
├── mobile.yml         # Mobile/Capacitor builds
├── desktop.yml        # Desktop/Electron builds
└── release.yml        # Semantic release automation
```

---

## 🎯 Key Principles

### 1. Test Logic, Not Wrappers

**Before branching**, test the core game thoroughly. Platform wrappers are just packaging.

### 2. E2E Tests Production, Not Artifacts

E2E tests should hit **deployed URLs**, not local builds. Test what users actually see.

### 3. Three Separate Platform Flows

Web, Mobile, and Desktop are **different outputs** from the same codebase. They branch AFTER integration testing.

### 4. Manual Testing for Wrappers

Capacitor and Electron wrap already-tested code. Manual testing verifies the wrapper, not the game.

---

## 🔄 Migration from Old Architecture

### What Changed

**Deleted workflows:**
- ❌ `ci-cd.yml` - Mixed CI with platform builds
- ❌ `platform-builds.yml` - Tested after branching

**New workflows:**
- ✅ `integration.yml` - Test BEFORE branching
- ✅ `web.yml` - Deploy THEN E2E test deployed URL
- ✅ `mobile.yml` - Build Capacitor wrapper
- ✅ `desktop.yml` - Build Electron wrapper
- ✅ `release.yml` - Updated to trigger correct flows

### Why This is Better

1. **Tests in correct order**: Logic first, then wrappers
2. **Tests correct targets**: Deployed URLs, not artifacts
3. **Clear separation**: Web/Mobile/Desktop are separate flows
4. **No redundant testing**: Don't re-test game in each platform
5. **Faster CI**: Integration tests run once, platforms build in parallel

---

## 📋 TODO: Integration Tests

**Current state**: Integration test job exists but tests not yet implemented.

**Need to add:**
```typescript
// tests/integration/game-flow.test.ts
test('complete game flow', () => {
  // Start game → play → score → game over → restart
});

// tests/integration/collision.test.ts
test('collision detection', () => {
  // Otter hits obstacle → game over triggered
});

// tests/integration/scoring.test.ts  
test('scoring system', () => {
  // Distance increases → score updates correctly
});
```

**Why important**: These tests verify the **game works** before we ever touch Capacitor/Electron.

---

## 🤔 Common Questions

**Q: Why not E2E test mobile/desktop builds?**

A: Because we already tested the game logic in integration tests. Capacitor/Electron just wrap that tested code. Manual testing verifies the wrapper works, which is platform-specific and hard to automate reliably.

**Q: Why test deployed URL instead of build artifacts?**

A: Because users access the deployed site. Testing local artifacts doesn't catch deployment issues, CDN problems, or production environment differences.

**Q: Isn't this slower with three separate workflows?**

A: No! Integration tests run once. Then web/mobile/desktop build in parallel. Before, we ran redundant tests in each platform.

**Q: What if integration tests pass but Capacitor breaks?**

A: That's what manual testing catches. It's a wrapper issue, not a game logic issue. These are rare and platform-specific.

---

## ✅ Validation

All workflows validated:
```
✅ integration.yml
✅ web.yml
✅ mobile.yml
✅ desktop.yml
✅ release.yml
```

---

Last updated: 2025-10-27  
**Architecture corrected**: Testing game logic first, then platform wrappers
