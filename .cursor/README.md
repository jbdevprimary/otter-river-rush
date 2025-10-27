# Otter River Rush - Docker Development Environment

This directory contains a production-grade Docker environment that matches the CI/CD pipeline configuration.

## 🎯 Why This Setup?

- **Consistency**: Matches GitHub Actions CI environment exactly (Node 22, Java 17, Gradle 9.1.0)
- **No Version Conflicts**: Eliminates "works on my machine" issues
- **Complete Toolchain**: All dependencies pre-installed (Android SDK, Playwright, build tools)
- **Fast Iteration**: Cached volumes for node_modules and Gradle dependencies

## 🚀 Quick Start

### Using Docker Compose (Recommended)

```bash
# Start interactive development shell
docker-compose up -d dev
docker-compose exec dev bash

# Inside container:
npm run dev        # Start Vite dev server
npm run build      # Build production
npm test           # Run tests
```

### Using Dockerfile Directly

```bash
# Build the image
docker build -t otter-river-rush-dev -f .cursor/Dockerfile .

# Run development container
docker run -it --rm -v $(pwd):/workspace -p 5173:5173 otter-river-rush-dev
```

## 📋 Common Tasks

### Web Development
```bash
# Start dev server (accessible at http://localhost:5173)
docker-compose run --rm -p 5173:5173 dev npm run dev

# Build production
docker-compose run --rm dev npm run build

# Preview production build
docker-compose run --rm -p 4173:4173 dev npm run preview
```

### Android Build
```bash
# Build APK
docker-compose run --rm --profile android android npm run cap:build:android

# Or use Gradle directly
docker-compose run --rm --profile android android bash -c "cd android && ./gradlew assembleRelease"

# Sync Capacitor
docker-compose run --rm dev npx cap sync android
```

### Testing
```bash
# Run unit tests
docker-compose run --rm dev npm test

# Run E2E tests
docker-compose run --rm --profile test test npm run test:e2e

# Run visual regression tests
docker-compose run --rm dev npm run test:visual
```

### Asset Generation
```bash
# Generate all assets
docker-compose run --rm dev npm run generate-all

# Generate sprites only
docker-compose run --rm dev npm run generate-sprites

# Run asset pipeline
docker-compose run --rm dev npm run asset-pipeline
```

### Linting & Type Checking
```bash
# Lint code
docker-compose run --rm dev npm run lint

# Type check
docker-compose run --rm dev npm run type-check

# Format code
docker-compose run --rm dev npm run format
```

## 🔧 Environment Specifications

### Included Tools
- **Node.js**: v22.x (matches CI)
- **Java**: OpenJDK 17 (Temurin distribution, matches CI)
- **Gradle**: 9.1.0 (matches `gradle-wrapper.properties`)
- **Android SDK**: API 35, Build Tools 35.0.0
- **Playwright**: v1.47.0 with system dependencies
- **Global npm packages**: tsx, typescript, vite, electron, @capacitor/cli

### Build Environment
- Based on `mcr.microsoft.com/playwright:v1.47.0-jammy` (Ubuntu 22.04)
- Pre-installed graphics libraries (cairo, pango, etc.) for canvas/sharp operations
- Pre-configured Android SDK with licenses accepted
- Gradle daemon and dependency caching enabled

## 📊 Volume Management

The docker-compose setup uses named volumes for performance:
- `node_modules`: npm dependencies cache
- `android_gradle`: Android Gradle cache
- `android_build`: Android build outputs
- `gradle_cache`: Global Gradle cache
- `build_cache`: npm build cache

### Clean volumes if needed:
```bash
docker-compose down -v  # Remove all volumes
docker volume prune     # Clean unused volumes
```

## 🐛 Troubleshooting

### Port conflicts
```bash
# Check what's using the port
lsof -i :5173

# Use different ports
docker-compose run --rm -p 3000:5173 dev npm run dev
```

### Permission issues
```bash
# Fix file ownership (run on host)
sudo chown -R $USER:$USER .

# Or run container as your user
docker-compose run --rm --user $(id -u):$(id -g) dev npm install
```

### Gradle issues
```bash
# Clean Gradle cache
docker-compose run --rm android bash -c "cd android && ./gradlew clean"

# Rebuild with fresh cache
docker-compose run --rm android bash -c "cd android && ./gradlew assembleRelease --no-daemon --no-build-cache"
```

### Node modules out of sync
```bash
# Rebuild node_modules in container
docker-compose run --rm dev npm ci

# Or clear the volume
docker-compose down -v
docker-compose up -d dev
```

## 🎓 Advanced Usage

### Interactive Android Debug
```bash
# Shell into Android build environment
docker-compose run --rm --profile android android bash

# Then inside:
cd android
./gradlew assembleDebug --stacktrace --info
./gradlew dependencies  # Check dependency tree
```

### Parallel Builds
```bash
# Build all platforms simultaneously
docker-compose run --rm dev npm run build &
docker-compose run --rm --profile android android npm run cap:build:android &
wait
echo "All builds complete!"
```

### CI Simulation
```bash
# Run the exact CI workflow locally
docker-compose run --rm -e CI=true -e NODE_ENV=production dev bash -c "
  npm ci &&
  npm run lint &&
  npm run type-check &&
  npm test -- --run &&
  npm run build
"
```

## 📝 Notes

- The Dockerfile is optimized for layer caching - dependencies are installed before code is copied
- Android SDK licenses are pre-accepted in the image
- Playwright browsers are pre-installed (Chromium, Firefox, WebKit)
- The environment variables match GitHub Actions exactly to prevent surprises
- Java 17 is enforced globally via `JAVA_HOME` and `update-alternatives`

## 🔗 Related Files

- `Dockerfile` - Main image definition
- `docker-compose.yml` - Service orchestration
- `../android/build.gradle` - Java 17 enforcement
- `../android/gradle/wrapper/gradle-wrapper.properties` - Gradle version
- `../.github/workflows/build-platforms.yml` - CI configuration

## 💡 Tips

1. **First run**: Build will take 5-10 minutes (downloads Android SDK, installs dependencies)
2. **Subsequent runs**: Very fast thanks to layer caching and volumes
3. **Disk space**: The image is ~3GB, plan accordingly
4. **Memory**: Allocate at least 4GB RAM to Docker for Android builds
5. **CPU**: More cores = faster Gradle builds (set in Docker Desktop preferences)

## 🆘 Need Help?

Check the [project documentation](../docs/) or the [GitHub workflows](../.github/workflows/) for examples of how these commands are used in CI.
