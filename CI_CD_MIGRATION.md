# CI/CD Workflow Migration Guide

## Overview

The CI/CD workflows have been completely refactored to follow DRY (Don't Repeat Yourself) principles, maximize code reuse, and separate continuous integration from continuous deployment concerns.

## What Changed

### New Workflow Architecture

**Before (4 workflows with duplication):**
- `mobile-primary.yml` - Full CI/CD (build, test, Android, Pages)
- `integration.yml` - Lint, type-check, unit tests
- `build-platforms.yml` - Multi-platform builds
- `release.yml` - Deprecated semantic-release

**After (3 modular workflows):**
- `ci.yml` - **Continuous Integration** (lint, test, build, e2e)
- `cd.yml` - **Continuous Deployment** (Pages, Android, Play Store)
- `release-please.yml` - **Release Management** (automated versioning)

### Reusable Composite Actions

Created modular composite actions in `.github/actions/`:
- `setup-node-pnpm/` - Node.js + pnpm setup with caching
- `install-deps/` - Install dependencies with frozen lockfile
- `build-web/` - Build web bundle with verification
- `setup-android/` - Complete Android SDK setup

### Security: SHA-Pinned Actions

All GitHub Actions are now pinned to their latest stable commit SHAs instead of version tags for improved security and reproducibility:

```yaml
# Before
uses: actions/checkout@v6

# After
uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd  # v6.0.2
```

## New Workflow Details

### 1. CI Workflow (`ci.yml`)

**Purpose:** Validate all code changes before deployment

**Jobs:**
1. **Lint** - ESLint and format checking
2. **Type Check** - TypeScript compilation
3. **Unit Tests** - Run test suite with coverage
4. **Build Web** - Build web bundle and upload artifact
5. **E2E Tests** - Smoke tests with Playwright
6. **CI Summary** - Overall status report

**Triggers:**
- Push to `main` or `develop`
- Pull requests to `main` or `develop`
- Manual dispatch

**Artifacts:**
- `web-dist-{sha}` - Built web application (7 day retention)
- `playwright-report-{sha}` - E2E test reports (7 day retention)

### 2. CD Workflow (`cd.yml`)

**Purpose:** Deploy validated builds to production environments

**Jobs:**
1. **Check CI** - Verify CI passed before deploying
2. **Deploy Pages** - Deploy web to GitHub Pages
3. **Build Android** - Build debug + release APKs
4. **Upload Play Store** - Upload to Google Play (releases only)
5. **Create Release** - Create GitHub Release with artifacts
6. **CD Summary** - Deployment status report

**Triggers:**
- Successful CI completion on `main` branch
- Manual dispatch (with options for selective deployment)
- Called by release-please on new releases

**Inputs (manual dispatch):**
- `deploy_web` - Deploy to GitHub Pages (default: true)
- `build_android` - Build Android APK (default: true)
- `upload_play_store` - Upload to Play Store (default: false)
- `release_version` - Version tag for releases (optional)

**Artifacts:**
- `app-debug-apk-{sha}` - Debug APK (30 day retention)
- `app-release-apk-{sha}` - Release APK (90 day retention)

### 3. Release Please Workflow (`release-please.yml`)

**Purpose:** Automated versioning and release management

**Process:**
1. Analyzes conventional commits on `main` branch
2. Creates/updates Release PR with changelog
3. When Release PR is merged, creates GitHub Release
4. Triggers CD workflow with Play Store upload enabled

**Requires:** `CI_GITHUB_TOKEN` secret (PAT with repo permissions)

## Migration Impact

### Workflow Triggers

**No breaking changes for developers:**
- CI still runs on every push/PR to main/develop
- Deployments still happen on main branch
- Manual deployments still available via workflow_dispatch

### Environment Variables & Secrets

**All secrets preserved:**
- `CI_GITHUB_TOKEN` - For release-please PR creation
- `ANDROID_KEYSTORE_BASE64` - For APK signing
- `ANDROID_KEY_ALIAS` - Keystore alias
- `ANDROID_KEYSTORE_PASSWORD` - Keystore password
- `ANDROID_KEY_PASSWORD` - Key password
- `GOOGLE_PLAY_JSON_KEY` - Play Store service account

### Removed Workflows

The following workflows have been removed (merged into ci.yml + cd.yml):
- ❌ `mobile-primary.yml` - Superseded by `ci.yml` + `cd.yml`
- ❌ `integration.yml` - Superseded by `ci.yml`
- ❌ `build-platforms.yml` - Superseded by `cd.yml`
- ❌ `release.yml` - Already deprecated (semantic-release)

### Kept Workflows

These workflows remain unchanged:
- ✅ `docs.yml` - Documentation deployment (updated with SHA pinning)
- ✅ `claude-code.yml` - AI code review (updated with SHA pinning)

## Benefits

### 1. DRY Principles
- **Zero duplication** of Node/pnpm setup logic
- **Single source of truth** for build commands
- **Reusable composite actions** across all workflows

### 2. Clear Separation of Concerns
- **CI** validates code quality and correctness
- **CD** handles deployment and distribution
- **Release Please** manages versioning automatically

### 3. Better Resource Utilization
- CI builds web bundle **once**, CD reuses it
- Parallel job execution where possible
- Conditional deployment based on CI success

### 4. Improved Security
- All actions pinned to specific commit SHAs
- Reduced attack surface from dependency updates
- Easier to audit and verify action code

### 5. Enhanced Maintainability
- Modular structure easier to understand
- Changes localized to specific workflows
- Composite actions reduce duplication

## Testing the New Workflows

### Test CI Workflow
```bash
# Create a test branch
git checkout -b test-ci-workflow

# Make a small change
echo "# Test" >> README.md

# Commit and push
git add README.md
git commit -m "test: verify CI workflow"
git push origin test-ci-workflow

# Create a PR and watch CI run
```

### Test CD Workflow (Manual)
```bash
# Go to Actions tab in GitHub
# Select "Continuous Deployment"
# Click "Run workflow"
# Choose options:
#   - deploy_web: true
#   - build_android: true (if Android configured)
#   - upload_play_store: false (for testing)
```

### Test Release Flow
```bash
# Make feature commits with conventional format
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug"

# Push to main (via PR)
# release-please creates Release PR automatically
# Review and merge Release PR
# CD workflow triggers with Play Store upload
```

## Troubleshooting

### CI Fails but Deployment Runs
**Symptom:** CD workflow runs even though CI failed

**Solution:** This shouldn't happen. CD workflow has `check-ci` job that verifies CI success. Check workflow logs.

### Android Build Fails
**Symptom:** `build-android` job fails in CD workflow

**Note:** Android builds are set to `continue-on-error: true` because Capacitor is not yet fully configured for v2.0 monorepo. This is expected and won't block deployments.

### Release Please Creates Empty PRs
**Symptom:** Release PR has no changes

**Cause:** No conventional commits since last release

**Solution:** Use conventional commit format:
- `feat:` for features (minor version bump)
- `fix:` for bug fixes (patch version bump)
- `BREAKING CHANGE:` in commit body (major version bump)

### Actions SHA Pinning Issues
**Symptom:** Workflow fails with action not found

**Solution:** Verify the SHA is correct. All SHAs are documented in workflow files with version comments:
```yaml
uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd  # v6.0.2
                       # ^^^^^^^^^^^^^^ SHA                      # ^^^^^^ version
```

## Rollback Procedure

If critical issues arise, you can temporarily revert to old workflows:

```bash
# Checkout the previous commit before migration
git checkout <previous-commit>

# Copy old workflows
cp .github/workflows/mobile-primary.yml /tmp/
cp .github/workflows/integration.yml /tmp/

# Return to current branch
git checkout main

# Restore old workflows
cp /tmp/mobile-primary.yml .github/workflows/
cp /tmp/integration.yml .github/workflows/

# Disable new workflows (rename to .yml.disabled)
mv .github/workflows/ci.yml .github/workflows/ci.yml.disabled
mv .github/workflows/cd.yml .github/workflows/cd.yml.disabled

# Commit and push
git add .github/workflows/
git commit -m "revert: temporarily restore old CI/CD workflows"
git push
```

## Future Enhancements

### Planned Improvements
- [ ] Add desktop builds (Electron) to CD workflow
- [ ] Implement preview deployments for PRs
- [ ] Add performance benchmarking to CI
- [ ] Integrate visual regression testing
- [ ] Add automated rollback on deployment failures

### Android Version Management
- [ ] Update `release-please-config.json` to include Android version files
- [ ] Automate version code/name bumps in `build.gradle`
- [ ] Sync npm version with Android version

## References

- [Release Please Documentation](https://github.com/googleapis/release-please)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Actions Security Best Practices](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
- [Composite Actions Documentation](https://docs.github.com/en/actions/creating-actions/creating-a-composite-action)

## Questions?

For questions or issues with the new CI/CD workflows:
1. Check the [workflow logs](../../actions) in GitHub Actions
2. Review this migration guide
3. Open an issue with the `ci-cd` label
4. Tag maintainers for urgent issues
