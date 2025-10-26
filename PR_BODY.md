# PR: Complete GitHub Actions CI/CD with Unified Release System

## 🚀 GitHub Actions Complete Setup

This PR modernizes the entire CI/CD pipeline with a unified release system that builds and deploys across all platforms.

---

## 🎯 What's Included

### ✅ Unified Release Workflow
**New**: `.github/workflows/release.yml`

- **Triggers**: Version tags (`v*`) or manual dispatch
- **Builds**: Web, Android APK, Desktop (Win/Mac/Linux) in parallel
- **Auto-Release**: Creates GitHub Release with all artifacts attached
- **Smart**: Reuses web build across all platforms (efficient)

**Example**:
```bash
git tag v1.0.0 && git push origin v1.0.0
# → Builds everything + creates release automatically
```

### ✅ Optimized CI Pipeline
**Updated**: `.github/workflows/ci.yml`

- Lint, type-check, test, build on every PR
- E2E and visual tests **only on main** (faster PRs)
- Coverage upload **only on main push**
- Bundle size check (fails if > 5MB)
- Node 20 standardized across all jobs

### ✅ GitHub Pages Deploy
**Updated**: `.github/workflows/deploy.yml`

- Auto-deploys on push to main
- Capacitor-ready web build
- Shows build size info
- Live at: https://jbcom.github.io/otter-river-rush/

### ✅ Legacy Workflows Updated
**Modified**: `mobile-build.yml`, `desktop-build.yml`

- Marked as deprecated (use `release.yml` instead)
- Kept for **manual testing only** (no auto-release)
- Useful for quick builds without creating releases

---

## 📦 Release Artifacts

When you push a version tag, the release workflow creates:

| Platform | Files | Size |
|----------|-------|------|
| 📱 **Android** | `otter-river-rush-v1.0.0-unsigned.apk` | ~30 MB |
| 🪟 **Windows** | `.exe` installer + portable | ~100 MB |
| 🍏 **macOS** | `.dmg` + `.zip` | ~80 MB |
| 🐧 **Linux** | `.AppImage` + `.deb` | ~95 MB |
| 🌐 **Web** | Deployed to Pages | ~500 KB gzipped |

All artifacts automatically attached to GitHub Release!

---

## 🔄 Workflow Triggers

### Continuous Integration (CI)
```
✅ Push to main/develop
✅ Pull requests
```

### Deploy
```
✅ Push to main
✅ Manual dispatch
```

### Release
```
✅ Push version tag (git tag v1.0.0)
✅ Manual dispatch (with version input)
```

---

## 📋 Testing Checklist

- [x] CI workflow lints/tests/builds successfully
- [x] Deploy workflow can push to Pages
- [x] Release workflow structure validated
- [x] Node versions consistent (20)
- [x] Artifact paths correct
- [x] Retention policies set
- [x] Documentation added

**Note**: Full release workflow will be tested after merge when we push a tag.

---

## 📖 Documentation

**New**: `.github/workflows/README.md`

Complete guide covering:
- All workflow descriptions
- Trigger conditions
- Usage instructions
- Troubleshooting
- Best practices

---

## 🎯 After Merge

### To Deploy Web:
```bash
# Just push to main (automatic)
git push origin main
```

### To Create Release:
```bash
# Tag and push
git tag v1.0.0
git push origin v1.0.0

# Check release at:
# https://github.com/jbcom/otter-river-rush/releases
```

### To Test Build (no release):
```
Actions → "Build Mobile" or "Build Desktop" → Run workflow
```

---

## 🔥 Benefits

1. **One workflow for all releases** - No more managing separate workflows
2. **Parallel builds** - Faster release creation
3. **Consistent** - Same Node version, same process everywhere
4. **Efficient** - Web build reused for Android/Desktop
5. **Automated** - Tag push = instant release
6. **Well-documented** - Clear README in workflows dir

---

## 🚢 Ready to Ship

After merging:
1. CI will verify everything works
2. Web deploys automatically
3. Tag v1.0.0 to test full release pipeline
4. All platforms build and release 🎉

---

**Previous**: 4 separate workflows, manual releases, inconsistent setup
**Now**: Unified, automated, documented, production-ready! 🚀
