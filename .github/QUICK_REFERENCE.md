# CI/CD Quick Reference Card

## 🚀 Common Tasks

### Run CI Locally
```bash
# Lint code
pnpm lint

# Type check
pnpm type-check

# Run tests
pnpm test

# Build
pnpm build

# E2E tests (requires build first)
pnpm test:e2e
```

### Manual Deployment
1. Go to **Actions** tab
2. Select **Continuous Deployment**
3. Click **Run workflow**
4. Choose options:
   - ✅ `deploy_web` - Deploy to GitHub Pages
   - ✅ `build_android` - Build Android APK
   - ❌ `upload_play_store` - Upload to Play Store (usually no)
   - (optional) `release_version` - e.g., `v1.2.3`
5. Click **Run workflow**

### Create a Release
1. Use conventional commits:
   ```bash
   git commit -m "feat: add new feature"
   git commit -m "fix: resolve bug"
   ```
2. Push to `main` (via PR)
3. **release-please** automatically creates Release PR
4. Review and merge Release PR
5. GitHub Release created automatically
6. CD workflow triggers with Play Store upload

## 📊 Workflow Status

| Workflow | Trigger | Purpose | Duration |
|----------|---------|---------|----------|
| **CI** | Push/PR | Validate code | ~5-10 min |
| **CD** | CI success | Deploy artifacts | ~10-20 min |
| **Release Please** | Push to main | Create releases | ~30 sec |

## 🔍 Debugging Failures

### CI Fails
1. Check which job failed (lint, type-check, test, build, e2e)
2. Run that job's command locally
3. Fix issues and push again

### CD Fails
1. Check if CI passed first
2. Verify secrets are configured (for Android builds)
3. Check job logs for specific error

### Android Build Fails
⚠️ **Expected in v2.0** - Capacitor not yet configured  
The workflow continues despite errors (`continue-on-error: true`)

## 📦 Artifacts

| Artifact | Retention | Location |
|----------|-----------|----------|
| Web dist | 7 days | Actions → Workflow run → Artifacts |
| Debug APK | 30 days | Actions → Workflow run → Artifacts |
| Release APK | 90 days | Actions → Workflow run → Artifacts |
| Playwright | 7 days | Actions → Workflow run → Artifacts |

## 🔐 Required Secrets

### For Release Please
- `CI_GITHUB_TOKEN` - PAT with repo permissions

### For Android (optional)
- `ANDROID_KEYSTORE_BASE64` - Base64 encoded keystore
- `ANDROID_KEY_ALIAS` - Keystore alias
- `ANDROID_KEYSTORE_PASSWORD` - Keystore password
- `ANDROID_KEY_PASSWORD` - Key password

### For Google Play (optional)
- `GOOGLE_PLAY_JSON_KEY` - Service account JSON

## 📚 Documentation

- **[Workflows README](.github/workflows/README.md)** - Detailed workflow docs
- **[Migration Guide](../CI_CD_MIGRATION.md)** - Migration info & troubleshooting
- **[SHA Pinning](.github/ACTIONS_SHA_PINNING.md)** - Action version registry
- **[Architecture](.github/ARCHITECTURE.md)** - Visual architecture diagram

## 🆘 Quick Help

| Issue | Solution |
|-------|----------|
| CI fails on lint | Run `pnpm lint` locally and fix |
| CI fails on types | Run `pnpm type-check` locally |
| E2E test fails | Download Playwright report artifact |
| Android build fails | Expected (v2.0), no action needed |
| Release PR not created | Check `CI_GITHUB_TOKEN` secret |
| Manual deploy not working | Check workflow inputs format |

## 💡 Tips

- **Always run CI locally** before pushing
- **Use conventional commits** for automatic versioning
- **Manual deploys** are for testing/debugging only
- **Release flow** is automatic via release-please
- **Check Actions tab** for real-time workflow status

## 🔗 Quick Links

- [Actions Tab](../../actions) - View workflow runs
- [Releases](../../releases) - View all releases
- [GitHub Pages](../../settings/pages) - Pages deployment settings
- [Secrets](../../settings/secrets/actions) - Manage secrets

---

**Last Updated:** 2026-01-27
