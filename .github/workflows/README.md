# GitHub Actions Workflows

## 🏗️ Architecture Overview

This repository uses a **modular, DRY CI/CD architecture** with clear separation of concerns:

- **CI (Continuous Integration)** - Validates code quality and builds artifacts
- **CD (Continuous Deployment)** - Deploys validated artifacts to production
- **Release Management** - Automates versioning and GitHub releases

All workflows use **SHA-pinned actions** for security and reproducibility.

---

## 📋 Active Workflows

### `ci.yml` - Continuous Integration ⚡

**Purpose:** Validate all code changes before deployment

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Manual dispatch

**Jobs:**
1. **Lint** - ESLint and format checking
2. **Type Check** - TypeScript compilation
3. **Unit Tests** - Test suite with coverage reporting
4. **Build Web** - Build web bundle (uploaded as artifact)
5. **E2E Tests** - Smoke tests with Playwright (Chromium only)
6. **CI Summary** - Overall pipeline status

**Artifacts:**
- `web-dist-{sha}` - Built web application (7 days)
- `playwright-report-{sha}` - E2E test reports (7 days)

**Key Features:**
- Uses composite actions for all setup steps (DRY)
- Parallel job execution where possible
- Coverage reporting to Codecov
- Fast feedback loop (~5-10 minutes)

---

### `cd.yml` - Continuous Deployment 🚀

**Purpose:** Deploy validated builds to production environments

**Triggers:**
- Successful CI completion on `main` branch (automatic)
- Manual dispatch with selective deployment options
- Called by release-please on new releases

**Jobs:**
1. **Check CI** - Verify CI passed before deploying
2. **Deploy Pages** - Deploy web to GitHub Pages
3. **Build Android** - Build debug + release APKs
4. **Upload Play Store** - Upload to Google Play (releases only)
5. **Create Release** - Create GitHub Release with artifacts
6. **CD Summary** - Deployment status report

**Manual Dispatch Inputs:**
- `deploy_web` - Deploy to GitHub Pages (default: true)
- `build_android` - Build Android APK (default: true)
- `upload_play_store` - Upload to Play Store (default: false)
- `release_version` - Version tag for releases (optional)

**Artifacts:**
- `app-debug-apk-{sha}` - Debug APK (30 days)
- `app-release-apk-{sha}` - Release APK (90 days)

**Key Features:**
- Reuses web-dist artifact from CI (no rebuild)
- Conditional deployment based on inputs
- APK signing with keystore (if secrets available)
- Google Play upload for releases only

**Note:** Android builds continue-on-error as Capacitor not yet configured for v2.0 monorepo.

---

### `release-please.yml` - Release Management 🎉

**Purpose:** Automated versioning and release creation

**Triggers:**
- Push to `main` branch (automatic)
- Manual dispatch

**Process:**
1. Analyzes conventional commits since last release
2. Creates/updates Release PR with changelog
3. When Release PR is merged, creates GitHub Release
4. Triggers CD workflow with Play Store upload enabled

**Requires:** `CI_GITHUB_TOKEN` secret (PAT with repo permissions)

**Outputs:**
- Release PR with auto-generated changelog
- GitHub Release with version tag
- Triggers CD workflow for deployment

**Conventional Commit Types:**
- `feat:` - New feature (minor version bump)
- `fix:` - Bug fix (patch version bump)
- `BREAKING CHANGE:` - Breaking change (major version bump)
- `docs:`, `style:`, `refactor:`, `test:`, `chore:` - Changelog only

---

### `docs.yml` - Documentation Deployment 📚

**Purpose:** Build and deploy Sphinx documentation to GitHub Pages

**Triggers:**
- Push to `main` branch
- Manual dispatch

**Jobs:**
1. **Build** - Build Sphinx documentation
2. **Deploy** - Deploy to GitHub Pages

**Key Features:**
- Uses Python 3.12 + uv for dependency management
- Builds HTML documentation from `docs/` directory
- Deploys to separate GitHub Pages deployment

---

### `claude-code.yml` - AI Code Review 🤖

**Purpose:** Automated code review with Claude AI

**Triggers:**
- `@claude` mentions in comments (interactive mode)
- Pull request opened/synchronized (automatic review)

**Modes:**
1. **Interactive** - Responds to @claude mentions
   - Only trusted users (OWNER, MEMBER, COLLABORATOR)
   - Can use Bash and GitHub CLI tools
2. **Automatic** - Reviews all PRs
   - Provides constructive feedback
   - Line-specific comments via `gh pr review`

**Requires:** `ANTHROPIC_API_KEY` secret

---

## 🧩 Composite Actions

Reusable actions in `.github/actions/`:

### `setup-node-pnpm/`
Sets up Node.js and pnpm with caching.

**Inputs:**
- `node-version` (default: '24')

**Usage:**
```yaml
- uses: ./.github/actions/setup-node-pnpm
```

### `install-deps/`
Installs pnpm dependencies with frozen lockfile.

**Usage:**
```yaml
- uses: ./.github/actions/install-deps
```

### `build-web/`
Builds web application bundle with verification.

**Outputs:**
- `build-success` - Whether build succeeded

**Usage:**
```yaml
- uses: ./.github/actions/build-web
```

### `setup-android/`
Complete Android SDK setup with Java and Gradle.

**Inputs:**
- `java-version` (default: '21')

**Usage:**
```yaml
- uses: ./.github/actions/setup-android
```

---

## 🔒 Security: SHA-Pinned Actions

All GitHub Actions are pinned to commit SHAs for security:

```yaml
# ✅ Good - SHA pinned with version comment
uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd  # v6.0.2

# ❌ Bad - Tag reference (mutable)
uses: actions/checkout@v6
```

See [ACTIONS_SHA_PINNING.md](../ACTIONS_SHA_PINNING.md) for the complete registry.

---

## 📊 Workflow Decision Tree

```
Code Change
    ↓
    CI (ci.yml)
    ├─ Lint
    ├─ Type Check
    ├─ Unit Tests
    ├─ Build Web (artifact)
    └─ E2E Tests
         ↓
    ✅ CI Passed
         ↓
    CD (cd.yml) - if main branch
    ├─ Deploy Pages
    ├─ Build Android APK
    └─ (Optional) Google Play
    
Release Flow
    ↓
    release-please.yml
    ├─ Create/Update Release PR
    └─ On merge → Trigger CD with Play Store upload
```

---

## 🚫 Removed Workflows

The following workflows were removed during the DRY refactoring (2026-01-27):

- ❌ `mobile-primary.yml` - Superseded by `ci.yml` + `cd.yml`
- ❌ `integration.yml` - Superseded by `ci.yml`
- ❌ `build-platforms.yml` - Superseded by `cd.yml`
- ❌ `release.yml` - Already deprecated (semantic-release)

See [CI_CD_MIGRATION.md](../../CI_CD_MIGRATION.md) for migration details.

---

## 💡 Best Practices

### 1. Use Conventional Commits
```bash
feat: add new game feature
fix: resolve collision detection bug
docs: update README
chore: update dependencies
```

### 2. Test Locally First
```bash
# Lint
pnpm lint

# Type check
pnpm type-check

# Unit tests
pnpm test

# Build
pnpm build
```

### 3. Manual Deployments
Use CD workflow dispatch for selective deployments:
- Test deployments: Enable only web deployment
- Full releases: Enable all deployment options
- Debug builds: Build Android without Play Store upload

### 4. Monitor CI/CD
- Check Actions tab for workflow runs
- Review summary comments on PRs
- Fix CI failures before merging

### 5. Update Actions Regularly
- Review quarterly for security updates
- Test updates in feature branches
- Update SHA pinning documentation

---

## 📚 Additional Documentation

- [CI_CD_MIGRATION.md](../../CI_CD_MIGRATION.md) - Migration guide and troubleshooting
- [ACTIONS_SHA_PINNING.md](../ACTIONS_SHA_PINNING.md) - Action version registry
- [CLAUDE.md](../../CLAUDE.md) - Repository structure and conventions

---

## 🆘 Troubleshooting

### CI Fails on Lint/Type Errors
Run locally first:
```bash
pnpm lint
pnpm type-check
```

### E2E Tests Fail
Check Playwright report artifact:
1. Go to Actions tab
2. Click failed workflow run
3. Download `playwright-report-{sha}` artifact
4. Extract and open `index.html`

### Android Build Fails
Expected behavior in v2.0 (continue-on-error enabled). Capacitor not yet configured.

### Release Please Not Creating PRs
Verify `CI_GITHUB_TOKEN` secret is configured and valid.

### Manual Deployment Not Working
Check CD workflow inputs match expected format (true/false for booleans).

---

**Last Updated:** 2026-01-27
