# 🚀 Otter River Rush - Multi-Platform Setup Guide

Complete guide to building and running on **Web, Android, iOS, Windows, macOS, and Linux**.

---

## ✅ Current Status

| Platform | Status | Commands |
|----------|--------|----------|
| **Web (PWA)** | ✅ Ready | `npm run build && npm run preview` |
| **Android** | ✅ Ready | `npm run cap:android` |
| **iOS** | ⚠️ macOS Only | `npx cap add ios && npm run cap:ios` |
| **Electron (Desktop)** | ✅ Ready | `npm run electron:dev` |
| **Windows** | ✅ Ready | `npm run electron:build` (on Windows) |
| **macOS** | ✅ Ready | `npm run electron:build` (on macOS) |
| **Linux** | ✅ Ready | `npm run electron:build` (on Linux) |

---

## 🌐 Web (PWA)

### Development
```bash
npm run dev              # Start dev server at http://localhost:5173
```

### Production
```bash
npm run build            # Build optimized production bundle
npm run preview          # Preview production build locally
```

### Deploy
```bash
# GitHub Pages (automatic on push to main)
git push origin main

# Or manually
npm run build
# Upload dist/ to your hosting provider
```

### Features
- ✅ Service Worker (offline support)
- ✅ Progressive Web App manifest
- ✅ Install prompt on mobile
- ✅ Optimized bundle (~500KB gzipped)

---

## 📱 Android

### Prerequisites
1. **Install Android Studio**: https://developer.android.com/studio
2. **Install Java 17+**: `java -version` should show 17+
3. **Set ANDROID_HOME**:
   ```bash
   export ANDROID_HOME=$HOME/Android/Sdk           # Linux
   export ANDROID_HOME=$HOME/Library/Android/sdk   # macOS
   ```

### First Time Setup
```bash
# Already done! ✅ android/ folder exists
# If you need to re-initialize:
npx cap add android
```

### Development Workflow
```bash
# 1. Build web assets
npm run build

# 2. Sync to Android
npx cap sync android

# 3. Open in Android Studio
npm run cap:android

# 4. In Android Studio:
#    - Click ▶️ Run button
#    - Or Build > Build Bundle(s) / APK(s) > Build APK(s)
```

### Build APK (Command Line)
```bash
cd android
./gradlew assembleDebug       # Debug APK
./gradlew assembleRelease     # Release APK (unsigned)
```

**Output**:
- Debug: `android/app/build/outputs/apk/debug/app-debug.apk`
- Release: `android/app/build/outputs/apk/release/app-release-unsigned.apk`

### Install on Device
```bash
# Via USB (enable USB debugging on phone)
adb devices                                    # Check connected devices
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### Sign APK for Release
```bash
# Generate keystore (first time only)
keytool -genkey -v -keystore otter-release.keystore \
  -alias otter -keyalg RSA -keysize 2048 -validity 10000

# Sign APK
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
  -keystore otter-release.keystore \
  android/app/build/outputs/apk/release/app-release-unsigned.apk otter

# Optimize
zipalign -v 4 app-release-unsigned.apk otter-river-rush.apk
```

---

## 🍎 iOS

### Prerequisites
1. **macOS with Xcode 14+**
2. **iOS Simulator or physical device**
3. **Apple Developer Account** (for device testing & App Store)

### First Time Setup (macOS only)
```bash
npx cap add ios
```

### Development Workflow
```bash
# 1. Build web assets
npm run build

# 2. Sync to iOS
npx cap sync ios

# 3. Open in Xcode
npm run cap:ios

# 4. In Xcode:
#    - Select target device/simulator
#    - Click ▶️ Run
#    - Or Product > Archive (for App Store)
```

### Troubleshooting
- **"No provisioning profile found"**: 
  1. Open project in Xcode
  2. Select project > Signing & Capabilities
  3. Choose your team (requires Apple Developer account)

---

## 🖥️ Desktop (Electron)

### Development
```bash
npm run electron:dev
# Opens Electron window with hot reload
```

### Production Build

#### Current Platform
```bash
npm run electron:build
# Outputs to dist-electron/
```

#### All Platforms (macOS only)
```bash
npm run electron:build:all
# Builds for macOS, Windows, and Linux
```

### Platform-Specific Builds

**On macOS** → Can build for:
- ✅ macOS (.dmg, .zip)
- ✅ Windows (.exe)
- ✅ Linux (.AppImage, .deb)

**On Windows** → Can build for:
- ✅ Windows (.exe)
- ❌ macOS (not supported)
- ❌ Linux (not supported)

**On Linux** → Can build for:
- ✅ Linux (.AppImage, .deb)
- ✅ Windows (.exe)
- ❌ macOS (not supported)

### Install & Run

**macOS**:
```bash
open dist-electron/mac/Otter\ River\ Rush.app
```

**Windows**:
```bash
# Double-click dist-electron/win-unpacked/Otter River Rush.exe
# Or run installer: dist-electron/Otter River Rush Setup.exe
```

**Linux**:
```bash
# AppImage
chmod +x dist-electron/Otter-River-Rush.AppImage
./dist-electron/Otter-River-Rush.AppImage

# Debian
sudo dpkg -i dist-electron/otter-river-rush_1.0.0_amd64.deb
```

---

## 🔧 Common Commands

### Clean & Rebuild
```bash
# Clean everything
rm -rf node_modules dist android/build ios/build dist-electron
npm install
npm run build

# Re-sync Capacitor
npx cap sync
```

### Update Dependencies
```bash
npm update
npx cap update
```

### Check Capacitor Status
```bash
npx cap doctor
```

---

## 🚀 CI/CD Workflows

### Mobile Build (Android)
**File**: `.github/workflows/mobile-build.yml`

**Triggers**:
- Tag push: `git tag v1.0.0 && git push origin v1.0.0`
- Manual: GitHub Actions > Mobile Build > Run workflow

**Output**: Android APK uploaded to GitHub Release

### Desktop Build
**File**: `.github/workflows/desktop-build.yml`

**Triggers**: Same as mobile

**Output**: Installers for Windows, macOS, Linux uploaded to GitHub Release

---

## 📦 Bundle Sizes

| Platform | Size |
|----------|------|
| Web (gzipped) | ~500 KB |
| Android APK | ~30 MB |
| iOS IPA | ~25 MB |
| Electron (macOS) | ~80 MB |
| Electron (Windows) | ~100 MB |
| Electron (Linux) | ~95 MB |

---

## 🐛 Troubleshooting

### "Capacitor not found"
```bash
npm install @capacitor/core @capacitor/cli
```

### "Android SDK not found"
```bash
# Set ANDROID_HOME
export ANDROID_HOME=$HOME/Android/Sdk
echo 'export ANDROID_HOME=$HOME/Android/Sdk' >> ~/.bashrc
```

### "Electron not launching"
```bash
# Rebuild Electron
npm install --force
npm run electron:dev
```

### "Gradle build failed"
```bash
cd android
./gradlew clean
cd ..
npm run build
npx cap sync android
```

### "Build succeeds but app crashes"
- Check Console logs in browser/Xcode/Android Studio
- Verify all assets are in `dist/` folder
- Run `npx cap sync` to ensure latest assets are copied

---

## 📝 Quick Start Checklist

- [ ] Install Node.js 20+
- [ ] `npm install`
- [ ] `npm run build`
- [ ] Choose platform:
  - [ ] **Web**: `npm run preview`
  - [ ] **Android**: Install Android Studio, `npm run cap:android`
  - [ ] **iOS**: (macOS) `npx cap add ios && npm run cap:ios`
  - [ ] **Desktop**: `npm run electron:dev`

---

## 🎯 Next Steps

1. **Test on real devices** (Android phone, iOS device)
2. **Set up code signing** (for production releases)
3. **Submit to app stores**:
   - Google Play Store (Android)
   - Apple App Store (iOS)
   - Microsoft Store (Windows)
   - Snap Store (Linux)

---

## 📚 Resources

- [Capacitor Docs](https://capacitorjs.com/docs)
- [Electron Builder](https://www.electron.build/)
- [Android Developer Guide](https://developer.android.com/)
- [iOS Developer Guide](https://developer.apple.com/)

---

**Need help?** Open an issue on GitHub or check the [main README](./README.md).
