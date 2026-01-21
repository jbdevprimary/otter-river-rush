# Release Please Troubleshooting Guide

This document provides guidance for troubleshooting common issues with the release-please workflow.

## Table of Contents
- [Token Permission Issues](#token-permission-issues)
- [Commit Parsing Errors](#commit-parsing-errors)
- [Release Not Created](#release-not-created)
- [Best Practices](#best-practices)

---

## Token Permission Issues

### Error: "GitHub Actions is not permitted to create or approve pull requests"

**Cause:** The default `GITHUB_TOKEN` has restricted permissions that prevent it from creating pull requests when workflow files are modified. This is a GitHub security feature.

**Solution:**

1. **Create a Personal Access Token (PAT):**
   - Go to GitHub Settings → Developer settings → Personal access tokens
   - For **classic token**: Select `repo` scope (full control)
   - For **fine-grained token**: Grant these permissions:
     - `Contents`: Read and write
     - `Pull requests`: Read and write
     - `Metadata`: Read-only (automatically included)

2. **Add token as repository secret:**
   - Navigate to repository Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `CI_GITHUB_TOKEN`
   - Value: Paste your token
   - Click "Add secret"

3. **Verify configuration:**
   - The workflow **requires** `CI_GITHUB_TOKEN` to be set
   - The workflow will fail immediately if `CI_GITHUB_TOKEN` is not configured
   - Check workflow logs for token validation messages
   - **Note:** `GITHUB_TOKEN` will NOT work for this workflow

**Alternative for Organizations:**
- Create a GitHub App or use a robot account with appropriate permissions
- Store the token/credentials as `CI_GITHUB_TOKEN` secret

---

## Commit Parsing Errors

### Error: "commit could not be parsed" or "unexpected token ' ' at 1:X"

**Cause:** release-please expects commits to follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. Commits that don't match this format will generate parsing warnings.

**Examples of problematic commits:**
```
🔄 synced local '.' with remote 'repository-files/always-sync/'
🚀 MAJOR: Fix E2E test failures and restore CI pipeline
Add end-to-end test validation (#64)
Update documentation to reflect full platform removal approach
```

**Examples of valid commits:**
```
feat: add end-to-end test validation
fix: resolve E2E test failures
docs: update platform removal documentation
chore: sync repository files
```

**Is this a problem?**

**No!** These warnings are informational only:
- ✅ The workflow continues to run
- ✅ Release PRs are still created
- ✅ Releases are still published
- ⚠️ Only valid conventional commits appear in the changelog
- ⚠️ Invalid commits are silently skipped

**Why does this happen?**
- Merge commits often have custom formats
- Repository sync tools may not use conventional format
- Manual commits may not follow the format
- Bot-generated commits may use custom formats

**How to reduce parsing warnings:**

1. **Use conventional commit format for all commits:**
   ```
   <type>[optional scope]: <description>
   
   [optional body]
   
   [optional footer(s)]
   ```

2. **Common types:**
   - `feat`: New feature
   - `fix`: Bug fix
   - `docs`: Documentation changes
   - `style`: Code style/formatting
   - `refactor`: Code refactoring
   - `perf`: Performance improvements
   - `test`: Test changes
   - `build`: Build system changes
   - `ci`: CI/CD changes
   - `chore`: Other changes (maintenance, dependencies)

3. **Configure git to help:**
   ```bash
   # Use a commit template
   git config commit.template .gitmessage
   
   # Enable commit message linting (if configured)
   npm install --save-dev @commitlint/cli @commitlint/config-conventional
   ```

4. **For merge commits:**
   - Use squash merging to create a single conventional commit
   - Manually edit merge commit messages to follow format
   - Note: release-please handles merges but non-conventional messages won't appear in changelog

**Should I fix old commits?**

**No!** Do not rewrite history:
- ❌ Don't rebase/amend merged commits
- ❌ Don't force-push to main branch
- ✅ Just use conventional format going forward
- ✅ Old non-conventional commits are safely ignored

---

## Release Not Created

### No release PR was created after merging commits

**Common causes:**

1. **No version-bumping commits since last release**
   - Only `feat`, `fix`, and breaking changes trigger version bumps
   - Check if recent commits use these types
   - `docs`, `chore`, `style` alone won't create a release

2. **All commits failed to parse**
   - Review commit parsing warnings in workflow logs
   - Ensure at least some commits follow conventional format

3. **Token permission issues**
   - See [Token Permission Issues](#token-permission-issues) above
   - Check workflow logs for authentication errors

4. **Release PR already exists**
   - Check for open PRs with title "chore: release X.X.X"
   - release-please updates existing release PRs instead of creating new ones

**How to debug:**

1. **Check workflow logs:**
   ```
   Actions → Release Please → Latest run → Build logs
   ```
   Look for:
   - Token validation messages
   - Commit parsing summary
   - "Looking for open release pull requests"
   - "Building candidate release pull request"

2. **Verify conventional commits:**
   ```bash
   git log --oneline main | head -20
   ```
   Ensure recent commits have `feat:` or `fix:` prefix

3. **Manual trigger:**
   - Go to Actions → Release Please → Run workflow
   - Select "main" branch
   - Click "Run workflow"

---

## Best Practices

### For Maintainers

1. **Token Management:**
   - Use fine-grained tokens with minimal permissions when possible
   - Set token expiration and rotate regularly
   - Document token owner in team notes
   - Use organization secrets for team repositories

2. **Commit Hygiene:**
   - Enforce conventional commits via PR checks
   - Use squash merging for feature branches
   - Review PR titles (they become merge commit messages)
   - Consider a commit message linter (commitlint)

3. **Release Process:**
   - Review generated release PRs before merging
   - Verify changelog accuracy
   - Check version bump is appropriate
   - Add manual changelog entries if needed
   - Merge release PRs promptly to avoid conflicts

4. **Monitoring:**
   - Watch for workflow failures
   - Review commit parsing warnings periodically
   - Keep release-please action up to date
   - Test workflow after major repository changes

### For Contributors

1. **Commit Format:**
   - Always use conventional commit format
   - Write clear, descriptive commit messages
   - Include breaking change footer if applicable:
     ```
     feat!: remove deprecated API
     
     BREAKING CHANGE: The old API has been removed
     ```

2. **Pull Requests:**
   - Use conventional format for PR titles
   - Squash commits when merging to main
   - Let maintainers handle releases

3. **When in Doubt:**
   - Refer to [Conventional Commits](https://www.conventionalcommits.org/)
   - Check recent commits for examples
   - Ask maintainers for guidance

---

## Advanced Configuration

### Release Search Depth

The `release-search-depth` setting in `.release-please-config.json` controls how many commits back release-please will look.

Current setting: `500` commits

- Increase if you have a very long commit history
- Decrease for faster processing (if history is short)
- Default is 100, we use 500 to handle larger history

### Changelog Customization

Edit `.release-please-config.json` to customize changelog sections:

```json
{
  "changelog-sections": [
    { "type": "feat", "section": "✨ Features", "hidden": false },
    { "type": "fix", "section": "🐛 Bug Fixes", "hidden": false }
  ]
}
```

Set `"hidden": true` to exclude a commit type from changelog.

### Version Bumping Rules

Configured in `.release-please-config.json`:
- `"bump-minor-pre-major": true` - Bump minor version before 1.0.0
- `"bump-patch-for-minor-pre-major": true` - Treat pre-1.0.0 minors as patches

---

## Additional Resources

- [release-please documentation](https://github.com/googleapis/release-please)
- [Conventional Commits specification](https://www.conventionalcommits.org/)
- [GitHub Actions permissions](https://docs.github.com/en/actions/security-guides/automatic-token-authentication)
- [Creating Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)

---

## Getting Help

If you encounter issues not covered here:

1. Check the [release-please issues](https://github.com/googleapis/release-please/issues)
2. Review recent workflow run logs in detail
3. Verify your `.release-please-config.json` is valid JSON
4. Contact repository maintainers
5. Open an issue with:
   - Error message
   - Workflow run URL
   - Recent commit history
   - Steps to reproduce
