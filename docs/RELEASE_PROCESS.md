# Release Process

This document describes the automated release process for Otter River Rush.

## Overview

The project uses **release-please** for automated versioning and releases. Unlike traditional CI/CD tools that push directly to the main branch, release-please creates a **pull request** for each release, which complies with the repository's branch protection rules.

## How It Works

### 1. Commit Messages Drive Releases

The release process is driven by [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature (minor version bump, e.g., 2.0.0 → 2.1.0)
- `fix:` - Bug fix (patch version bump, e.g., 2.1.0 → 2.1.1)
- `BREAKING CHANGE:` - Breaking change (major version bump, e.g., 2.1.0 → 3.0.0)
- Other types: `docs:`, `style:`, `refactor:`, `test:`, `build:`, `ci:`, `chore:`

### 2. Release PR Creation

When commits are pushed to `main`, the `release-please` GitHub Action:

1. Analyzes all commits since the last release
2. Determines the next version based on commit types
3. Generates release notes from commit messages
4. Creates or updates a **Release PR** with:
   - Updated version in `package.json`
   - Updated `CHANGELOG.md`
   - Release notes

### 3. Merging the Release PR

When you merge the Release PR:

1. release-please creates a GitHub Release with the new version tag
2. The mobile build workflow is automatically triggered
3. Platform-specific builds (Android APK, etc.) are created

## Workflow Files

- `.github/workflows/release-please.yml` - Main release workflow
- `.release-please-config.json` - Configuration for release-please
- `.release-please-manifest.json` - Tracks the current version

## Branch Protection Compliance

**Why we use release-please:**

The repository has branch protection rules that require all changes to `main` to go through a pull request. The old `semantic-release` workflow tried to push directly to `main`, which is now blocked.

release-please solves this by:
- ✅ Creating a PR instead of direct pushes
- ✅ Allowing code review of version bumps and changelog
- ✅ Complying with repository protection rules
- ✅ Providing visibility into what will be released

## Manual Release Process

If you need to create a release manually:

1. Ensure all commits follow conventional commit format
2. Push commits to `main` (via PR)
3. Wait for release-please to create/update the Release PR
4. Review the Release PR (check version bump, changelog)
5. Merge the Release PR to trigger the release

## Version History

See [CHANGELOG.md](../CHANGELOG.md) for the complete version history.

## Troubleshooting

### Release PR not created

- Ensure commits follow conventional commit format
- Check that the workflow has proper permissions (contents: write, pull-requests: write)
- Verify the workflow is enabled in `.github/workflows/release-please.yml`

### Release not triggered after merging PR

- Check the GitHub Actions logs for the release-please workflow
- Ensure the GITHUB_TOKEN has sufficient permissions
- Verify the workflow triggered on the merge commit

### Wrong version bump

- Review your commit messages - they determine the version bump
- Use `fix:` for patches, `feat:` for minor, `BREAKING CHANGE:` for major
- You can manually edit the Release PR before merging to adjust the version

## References

- [release-please documentation](https://github.com/googleapis/release-please)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
