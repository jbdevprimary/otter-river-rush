# Complete GitHub Actions CI/CD + Virtual Joystick for Mobile

## 🚀 What's Included

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

### 🕹️ Virtual Joystick for Mobile
**NEW**: Professional on-screen joystick using `nipplejs`

- **120px draggable joystick** - Bottom-left corner
- **Mobile-only** - Auto-detects touch devices, hidden on desktop
- **Triple control options**:
  1. Virtual joystick (drag)
  2. Swipe gestures
  3. Direct tap
- **Smooth & responsive** - Proper sensitivity tuning
- **Theme-matched** - Blue color matching game UI
- **No conflicts** - All input methods work together

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

## 🎮 Mobile Controls Enhanced

**Before**: Swipe only
**After**: 
- ✅ Swipe gestures (anywhere on screen)
- ✅ Virtual joystick (drag bottom-left control)
- ✅ Direct tap (left/right sides)

**Desktop**: Keyboard + mouse (no joystick shown)

The virtual joystick provides better control for mobile gamers and is a standard in mobile games!

---

## 🔄 Workflow Triggers

### Continuous Integration (CI)
```
✅ Push to main/develop
✅ Pull requests
```

### Deploy
```
✅ Push to main (auto-deploys to Pages)
✅ Manual dispatch
```

### Release
```
✅ Push version tag (git tag v1.0.0)
✅ Manual dispatch (with version input)
```

---

## 📋 What Was Fixed/Added

### GitHub Actions:
- [x] Unified release workflow for all platforms
- [x] Optimized CI (faster PR checks)
- [x] GitHub Pages auto-deploy
- [x] Deprecated old workflows
- [x] Complete documentation (README.md)

### Mobile Experience:
- [x] Virtual joystick component
- [x] nipplejs integration
- [x] TypeScript definitions
- [x] Touch device detection
- [x] Multi-input support
- [x] UI repositioned (lives moved to top-right)

### Code Quality:
- [x] All lint checks passing
- [x] All type checks passing
- [x] All tests passing (70/70)
- [x] Proper cleanup in useEffect
- [x] Event-based communication

---

## 🎯 After Merge

### Deploy Web:
```bash
git push origin main  # Auto-deploys
```

### Create Release:
```bash
git tag v1.0.0
git push origin v1.0.0
# → Builds: Web, Android, Windows, macOS, Linux
# → Creates GitHub Release with all artifacts
```

### Test on Mobile:
```bash
npm run build
npm run cap:android
# Install APK on your phone and test the joystick!
```

---

## 🔥 Benefits

1. **One workflow for all releases** - Tag once, build everything
2. **Parallel builds** - Faster releases (web + Android + 3 desktop)
3. **Better mobile UX** - Professional joystick controls
4. **Efficient** - Web build reused across platforms
5. **Automated** - Tag push = instant multi-platform release
6. **Well-documented** - Complete guides in `.github/workflows/README.md`

---

## 📦 Package Changes

- **Added**: `nipplejs` (virtual joystick library)
- **Added**: 6 new workflow/component files
- **Modified**: 7 workflow/component files

---

## 🚢 Ready to Ship

After merging:
1. ✅ CI verifies all checks
2. ✅ Web auto-deploys with joystick
3. ✅ Tag v1.0.0 to test full release
4. ✅ Download APK and test on Android!

---

**Previous**: Swipe-only mobile controls, scattered workflows
**Now**: Professional joystick + unified CI/CD for all platforms! 🕹️🚀
