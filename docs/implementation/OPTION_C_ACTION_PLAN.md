# Option C: Close and Recreate - Action Plan

**Date**: 2025-10-25  
**Branch**: cursor/organize-docs-handle-comments-and-optimize-renovate-ad4a  
**Status**: Ready to Execute

## Summary

We're implementing **Option C**: Close all existing Renovate PRs and let the new optimized configuration recreate them in a consolidated, organized manner.

## Why This Approach?

### Benefits
1. ✅ **Clean slate** - No conflicts or issues from old PRs
2. ✅ **Proper grouping** - New config will group related updates
3. ✅ **Auto-merge** - Non-major updates will auto-merge after CI
4. ✅ **Less noise** - Weekly schedule instead of constant updates
5. ✅ **Better organization** - Clear separation of major vs non-major

### What We're Avoiding
- ❌ Manual conflict resolution (PR #26)
- ❌ Individual PR reviews (10 separate PRs)
- ❌ Fragmented updates
- ❌ Potential peer dependency issues

## PRs to Close

### Non-Major Updates (Will be grouped into 1 PR)
- **PR #21**: `eslint-config-prettier` v9 → v10
- **PR #22**: `lint-staged` v15 → v16  
- **PR #25**: `rollup-plugin-visualizer` v5 → v6
- **PR #30**: `ai` v5.0.78 → v5.0.79

### Major Updates (Separate PRs, manual review)
- **PR #24**: `node` v20 → v22
- **PR #26**: `vite` v5 → v7 ⚠️ (HAS CONFLICT)
- **PR #27**: `vite-plugin-pwa` v0.21 → v1
- **PR #28**: GitHub Actions artifacts v4 → v5
- **PR #29**: `lighthouse-ci-action` v10 → v12
- **PR #31**: `vitest` monorepo v2 → v4

### DO NOT CLOSE
- **PR #23**: "Improve otter river control and ai integration" (Feature PR, not Renovate)

## Step-by-Step Instructions

### Step 1: Close Renovate PRs

Run these commands in the GitHub UI or CLI:

```bash
# Close non-major updates
gh pr close 21 --comment "Closing as part of Renovate optimization. New consolidated PR will be created with updated config."
gh pr close 22 --comment "Closing as part of Renovate optimization. New consolidated PR will be created with updated config."
gh pr close 25 --comment "Closing as part of Renovate optimization. New consolidated PR will be created with updated config."
gh pr close 30 --comment "Closing as part of Renovate optimization. New consolidated PR will be created with updated config."

# Close major updates (with more specific notes)
gh pr close 24 --comment "Closing as part of Renovate optimization. New PR will be created with updated config."
gh pr close 26 --comment "Closing due to peer dependency conflict with vite-plugin-pwa. Will be recreated with proper dependency ordering."
gh pr close 27 --comment "Closing as part of Renovate optimization. Will be recreated as major update PR."
gh pr close 28 --comment "Closing as part of Renovate optimization. GitHub Actions updates will be handled separately."
gh pr close 29 --comment "Closing as part of Renovate optimization. Will be recreated with updated config."
gh pr close 31 --comment "Closing as part of Renovate optimization. Vitest v4 upgrade will be handled in separate major update PR."
```

### Step 2: Merge This PR

This PR includes:
- ✅ Documentation reorganization (27 files moved)
- ✅ Memory bank initialization (6 new files)
- ✅ Renovate configuration optimization
- ✅ Removed deprecated `@types/sharp` dependency

```bash
# Review and merge this PR
gh pr review --approve
gh pr merge --squash
```

### Step 3: Wait for Renovate

After merge, Renovate will:

1. **Next Monday (per schedule)**: Create new PRs based on updated config
2. **Expected PRs**:
   - 1 PR: "chore(deps): update all non-major dependencies" (auto-merge)
   - ~5-6 PRs: Individual major updates (manual review)
   - 1 PR: GitHub Actions updates

### Step 4: Review New PRs

When Renovate creates new PRs:

#### Auto-Merged (Non-Major)
- Will include: eslint-config-prettier, rollup-plugin-visualizer, ai, and other patches/minors
- CI must pass (lint, type-check, tests, build)
- Will merge automatically if all checks pass

#### Manual Review (Major)
1. **vite-plugin-pwa v1** - Review breaking changes first
2. **vite v7** - Merge after vite-plugin-pwa
3. **vitest v4** - Test carefully, may need test updates
4. **GitHub Actions v5** - Verify workflow compatibility
5. **lighthouse-ci-action v12** - Check action compatibility

## Expected Timeline

| When | What Happens |
|------|--------------|
| **Now** | Close 10 Renovate PRs |
| **Now** | Merge this documentation/config PR |
| **Monday** | Renovate runs with new config |
| **Monday** | New consolidated PRs created |
| **Monday** | Non-major PR auto-merges (if CI passes) |
| **This Week** | Review and merge major updates |
| **Next Monday** | Any remaining updates grouped again |

## What to Expect

### First Renovate Run (Monday)

**Single Non-Major PR** (auto-merge):
```
chore(deps): update all non-major dependencies

Updates:
- eslint-config-prettier: 9.1.0 → 10.0.0
- rollup-plugin-visualizer: 5.12.0 → 6.0.0  
- ai: 5.0.78 → 5.0.79
- (any other patches/minors)
```

**Separate Major PRs** (manual review):
```
1. chore(deps): update dependency vite-plugin-pwa to v1
2. chore(deps): update dependency vite to v7
3. chore(deps): update vitest monorepo to v4 (major)
4. chore(deps): update github artifact actions (major)
5. chore(deps): update treosh/lighthouse-ci-action action to v12
6. chore(deps): update dependency node to v22
```

### Ongoing Behavior

- **Weekly schedule**: Updates only on Mondays
- **Auto-merge**: Non-breaking changes merge automatically
- **Rate limiting**: Max 3 concurrent PRs, 2 per hour
- **Grouped updates**: Related packages grouped together
- **Less noise**: Dramatically fewer notifications

## Verification Steps

After new PRs are created:

1. **Check CI Status**
   ```bash
   gh pr list --json number,title,statusCheckRollup
   ```

2. **Review Auto-Merged PR**
   ```bash
   gh pr view <number> --json commits,reviews,checks
   ```

3. **Test Locally** (for major updates)
   ```bash
   gh pr checkout <number>
   npm install
   npm run verify  # lint, type-check, test, build
   ```

4. **Merge Major Updates** (in order)
   ```bash
   # 1. vite-plugin-pwa first
   gh pr merge <number> --squash
   
   # 2. Then vite
   gh pr merge <number> --squash
   
   # 3. Then others
   ```

## Risk Assessment

### Low Risk ✅
- Closing existing PRs (can recreate manually if needed)
- New Renovate config (can revert if issues)
- Waiting for Monday (only 3-4 days)

### Medium Risk ⚠️
- Major updates may have breaking changes
- Vitest v4 may need test file updates
- GitHub Actions v5 has artifact format changes

### Mitigation
- Test major updates thoroughly before merge
- Keep old config backed up (git history)
- Can always close new PRs and go manual

## Rollback Plan

If new config causes issues:

1. **Revert renovate.json**
   ```bash
   git revert <commit-hash>
   ```

2. **Or update config**
   ```json
   {
     "enabled": false  // Temporarily disable
   }
   ```

3. **Or handle manually**
   - Close all Renovate PRs
   - Update dependencies manually
   - Update renovate.json later

## Success Criteria

After this is complete, we should have:

- ✅ Clean PR list (only feature PRs, no stale Renovate PRs)
- ✅ Optimized Renovate config active
- ✅ Documentation properly organized
- ✅ Deprecated dependencies removed
- ✅ Consolidated dependency update PRs
- ✅ Auto-merge working for safe updates
- ✅ Weekly update schedule (less noise)

## Next Actions Required

### Immediate (You Need to Do)
1. ❗ **Close 10 Renovate PRs** (commands above)
2. ❗ **Merge this PR** (documentation + config updates)

### Automatic (Renovate Will Do)
3. ⏳ Wait until Monday
4. ⏳ Renovate creates new consolidated PRs
5. ⏳ Non-major PR auto-merges (if CI passes)

### Follow-up (After New PRs Created)
6. ✅ Review major update PRs
7. ✅ Test thoroughly
8. ✅ Merge in correct order
9. ✅ Verify everything works

## Commands Summary

```bash
# 1. Close all Renovate PRs (run in repository)
for pr in 21 22 24 25 26 27 28 29 30 31; do
  gh pr close $pr --comment "Closing as part of Renovate optimization. New consolidated PRs will be created with updated config."
done

# 2. Verify only feature PR #23 remains open
gh pr list --state open

# 3. Merge this PR (documentation + config)
gh pr merge <this-pr-number> --squash

# 4. Wait for Monday, then check new PRs
gh pr list --state open

# 5. Review and merge as appropriate
```

## Documentation

This plan is part of:
- `OUTSTANDING_ISSUES.md` - Full issue analysis
- `DOCS_REORGANIZATION.md` - Documentation changes
- `renovate.json` - New configuration

---

**Status**: Ready to execute  
**Timeline**: 3-7 days (includes Monday wait)  
**Effort**: Low (mostly automated)  
**Risk**: Low (clean, reversible approach)  
**Next Step**: Close Renovate PRs and merge this branch

## Questions?

If you encounter issues:

1. **PR won't close**: Use GitHub UI instead of CLI
2. **Renovate doesn't run**: Check Dependency Dashboard (Issue #5)
3. **Auto-merge not working**: Check branch protection rules
4. **CI failing**: May need to fix issues before auto-merge works
5. **Wrong grouping**: Adjust renovate.json packageRules

---

**Ready to proceed!** Close the 10 Renovate PRs and merge this branch. Renovate will handle the rest on Monday.
