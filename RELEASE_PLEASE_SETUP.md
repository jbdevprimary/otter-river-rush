# Release Please Workflow - Action Required

## 🔴 IMMEDIATE ACTION REQUIRED

The `release-please` workflow has been updated to fix permission issues, but requires **one-time setup** by a repository administrator.

### What Changed?

The workflow now uses a custom token (`CI_GITHUB_TOKEN`) instead of the default `GITHUB_TOKEN` because GitHub's security policies prevent the default token from creating pull requests when workflow files are modified.

### Setup Instructions (5 minutes)

1. **Create a Personal Access Token**:
   - Go to https://github.com/settings/tokens
   - Click "Generate new token" → "Generate new token (classic)"
   - Set these values:
     - **Note**: `otter-river-rush release-please`
     - **Expiration**: Choose based on your security policy (e.g., 90 days, 1 year)
     - **Scopes**: Check `repo` (Full control of private repositories)
   - Click "Generate token"
   - **IMPORTANT**: Copy the token now (you won't see it again)

2. **Add Token as Repository Secret**:
   - Go to https://github.com/arcade-cabinet/otter-river-rush/settings/secrets/actions
   - Click "New repository secret"
   - Name: `CI_GITHUB_TOKEN`
   - Value: Paste the token you just created
   - Click "Add secret"

3. **Verify Setup**:
   - Go to https://github.com/arcade-cabinet/otter-river-rush/actions
   - Click on "Release Please" workflow
   - Click "Run workflow" → Select "main" branch → "Run workflow"
   - Wait for it to complete
   - Should show "✅ CI_GITHUB_TOKEN is configured" in logs

### What Happens If You Don't Set This Up?

The workflow will **fail immediately** with this error:
```
❌ CI_GITHUB_TOKEN secret is not configured!
❌ This workflow requires a custom token with PR creation permissions.
❌ See workflow comments for setup instructions.
```

This is intentional - the workflow won't waste time trying to create a PR with insufficient permissions.

### Alternative: Fine-Grained Personal Access Token

If you prefer more granular permissions:

1. Go to https://github.com/settings/tokens?type=beta
2. Click "Generate new token"
3. Set these values:
   - **Token name**: `otter-river-rush release-please`
   - **Expiration**: Choose based on your security policy
   - **Repository access**: Select "Only select repositories" → Choose `arcade-cabinet/otter-river-rush`
   - **Permissions**:
     - Contents: Read and write
     - Pull requests: Read and write
4. Generate and add as `CI_GITHUB_TOKEN` secret (same as above)

### Token Maintenance

- **Expiration**: Set a calendar reminder to renew before expiration
- **Rotation**: Update the secret when rotating tokens
- **Revocation**: If compromised, revoke immediately and create a new one
- **Owner**: Document who owns this token (for vacation coverage)

### Additional Notes

- **Commit Parsing Warnings**: You'll see warnings about commits that don't follow conventional format (e.g., `feat:`, `fix:`). This is **normal** and expected. The workflow continues successfully.
- **Merge Commits**: Merge commits are handled but may not follow conventional format, which is fine.
- **Changelog**: Only commits with conventional format appear in the changelog.

### Documentation

- Full troubleshooting guide: `docs/RELEASE_PLEASE_TROUBLESHOOTING.md`
- Workflow comments: `.github/workflows/release-please.yml` (lines 1-40)
- Configuration: `.release-please-config.json`

### Questions?

See `docs/RELEASE_PLEASE_TROUBLESHOOTING.md` or contact the team.

---

**Status**: ⏳ Waiting for `CI_GITHUB_TOKEN` secret to be configured

Once configured, this notice can be deleted.
