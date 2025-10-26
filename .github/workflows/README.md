# GitHub Actions Workflows

This directory contains a unified CI/CD workflow for all automation needs.

## 🔄 Unified CI/CD Workflow

### CI/CD (`.github/workflows/ci-cd.yml`)
**Single workflow handling all CI/CD, releases, and platform builds with gating logic**

**Triggers:**
- **Pull Requests** → Fast validation (lint, type-check, test, build) - ~3 min
- **Push to main** → Full CI + auto-deploy to GitHub Pages - ~6 min
- **Push to develop** → Full CI only (no deploy)
- **Version tags (v*)** → Full CI + build all platforms + create release
- **Manual dispatch** → Configurable: choose what to build/deploy

---

## 📋 Workflow Jobs

### CI Jobs (Run on all events)
- ✅ **Lint**: ESLint + Prettier checks
- ✅ **Type Check**: TypeScript compilation
- ✅ **Test**: Unit tests with Vitest (70 tests)
- ✅ **Build Web**: Production build + bundle size check (max 5MB)

### Extended Testing (Main branch only)
- ✅ **E2E Tests**: Playwright end-to-end tests
- ✅ **Visual Tests**: Visual regression testing

### Deployment (Main branch only)
- 🚀 **Deploy Web**: Auto-deploy to GitHub Pages
  - URL: https://jbcom.github.io/otter-river-rush/

### Platform Builds (Tags or manual)
- 📱 **Build Android**: Unsigned APK for Android devices
- 🖥️ **Build Desktop**: macOS (.dmg), Windows (.exe), Linux (.AppImage, .deb)

### Release (Tags only)
- 📦 **Create Release**: GitHub Release with all platform artifacts

---

## 🎯 Usage Patterns

### For Contributors (Pull Requests)
```bash
# Push your branch → CI runs automatically
git push origin feature/my-feature

# What runs:
# - Lint, type-check, test, build (~3 min)
# - Fast feedback, no deployment
```

### For Maintainers (Main Branch)
```bash
# Push to main → Full CI + auto-deploy
git push origin main

# What runs:
# - All CI checks
# - E2E + visual tests
# - Auto-deploy to GitHub Pages
# Total: ~6 min
```

### For Releases (Version Tags)
```bash
# Create and push a version tag
git tag v1.0.0
git push origin v1.0.0

# What runs:
# - All CI checks
# - Build Android APK
# - Build desktop apps (Mac, Windows, Linux)
# - Create GitHub Release with all artifacts
# - Auto-deploy web to GitHub Pages
```

### Manual Workflow Dispatch
Go to **Actions** → **CI/CD** → **Run workflow**

**Options:**
- ✅ Deploy to GitHub Pages (default: true)
- ✅ Build Android APK (default: true)
- ✅ Build Desktop apps (default: true)
- ⬜ Create GitHub Release (default: false)

Use this to:
- Build specific platforms without creating a release
- Test release process before tagging
- Deploy to Pages without waiting for tags

---

## 🎨 Workflow Gating Logic

| Trigger | Lint/Test/Build | E2E/Visual | Deploy Web | Build Platforms | Create Release |
|---------|----------------|------------|------------|-----------------|----------------|
| **PR** | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| **Push to develop** | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| **Push to main** | ✅ | ✅ | ✅ | ⬜ | ⬜ |
| **Tag v\*** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Manual (default)** | ✅ | ✅ | ✅ | ✅ | ⬜ |

---

## 📊 Artifact Retention

- **CI builds**: 7 days
- **Platform builds**: 30 days
- **GitHub Releases**: Permanent

---

## 🚀 Quick Reference

### Deploy to Production
```bash
git push origin main
# → Web auto-deploys to GitHub Pages
```

### Create Full Release
```bash
git tag v1.0.0
git push origin v1.0.0
# → Builds all platforms + creates GitHub Release
```

### Build Android Only
```bash
# Use manual workflow dispatch:
# Actions → CI/CD → Run workflow
# - Uncheck "Build Desktop apps"
# - Uncheck "Create GitHub Release"
```

### Build Desktop Only
```bash
# Use manual workflow dispatch:
# Actions → CI/CD → Run workflow
# - Uncheck "Build Android APK"
# - Uncheck "Create GitHub Release"
```

---

## 🐛 Troubleshooting

### CI Failing
```bash
# Run locally first
npm run lint
npm run type-check
npm test -- --run
npm run build
```

### Bundle Size Exceeding Limit
```bash
# Check current bundle size
npm run build
du -sh dist

# Optimize images
npm run process-icons
```

### Android Build Failing
```bash
# Test locally
npm run build
npx cap sync android
cd android && ./gradlew assembleRelease
```

### Desktop Build Failing
```bash
# Test locally
npm run electron:build
```

### Deploy Failing
- Check if GitHub Pages is enabled in repo settings
- Verify `dist/` folder contains `index.html`
- Check workflow logs for specific errors

---

## 🔐 Secrets Required

**None currently!** The workflow uses:
- `GITHUB_TOKEN` (auto-provided by GitHub Actions)
- Public npm packages (no auth needed)

**For future enhancements:**
- `ANDROID_KEYSTORE`: For signed APK releases
- `CODECOV_TOKEN`: For coverage reporting (optional)

---

## 📖 Related Documentation

- [Platform Setup Guide](../../PLATFORM_SETUP.md)
- [Contributing Guide](../../CONTRIBUTING.md)
- [Cross-Platform Build Guide](../../docs/implementation/CROSS_PLATFORM_BUILD_GUIDE.md)

---

## 💡 Design Philosophy

**One workflow to rule them all:**
- Single source of truth for all automation
- Gating logic instead of multiple workflows
- Clear, maintainable, predictable behavior
- Fast feedback for common cases (PRs)
- Comprehensive builds when needed (releases)

**Status**: [![CI/CD](https://github.com/jbcom/otter-river-rush/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/jbcom/otter-river-rush/actions/workflows/ci-cd.yml)
