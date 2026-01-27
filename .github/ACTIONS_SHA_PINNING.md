# GitHub Actions SHA Pinning Reference

This document tracks all GitHub Actions used in our workflows and their pinned commit SHAs for security and reproducibility.

## Why SHA Pinning?

SHA pinning provides several security benefits:
- **Immutability**: Commit SHAs cannot be changed, preventing supply chain attacks
- **Reproducibility**: Builds are deterministic and can be exactly reproduced
- **Audit Trail**: Easy to verify the exact code being executed
- **Protection**: Prevents malicious updates via compromised action repositories

## Actions Registry

Last updated: 2026-01-27

| Action | Version | SHA (first 7) | Full SHA |
|--------|---------|---------------|----------|
| actions/checkout | v6.0.2 | `de0fac2` | `de0fac2e4500dabe0009e67214ff5f5447ce83dd` |
| actions/configure-pages | v5.0.0 | `983d773` | `983d7736d9b0ae728b81ab479565c72886d7745b` |
| actions/deploy-pages | v4.0.5 | `d6db901` | `d6db90164ac5ed86f2b6aed7e0febac5b3c0c03e` |
| actions/download-artifact | v6.0.0 | `018cc2c` | `018cc2cf5baa6db3ef3c5f8a56943fffe632ef53` |
| actions/github-script | v8.0.0 | `ed59741` | `ed597411d8f924073f98dfc5c65a23a2325f34cd` |
| actions/setup-java | v5.2.0 | `be666c2` | `be666c2fcd27ec809703dec50e508c2fdc7f6654` |
| actions/setup-node | v6.2.0 | `6044e13` | `6044e13b5dc448c55e2357c09f80417699197238` |
| actions/setup-python | v6.2.0 | `a309ff8` | `a309ff8b426b58ec0e2a45f0f869d46889d02405` |
| actions/upload-artifact | v5.0.0 | `330a01c` | `330a01c490aca151604b8cf639adc76d48f6c5d4` |
| actions/upload-pages-artifact | v4.0.0 | `7b1f4a7` | `7b1f4a764d45c48632c6b24a0339c27f5614fb0b` |
| android-actions/setup-android | v3.2.2 | `9fc6c4e` | `9fc6c4e9069bf8d3d10b2204b1fb8f6ef7065407` |
| astral-sh/setup-uv | v7.2.0 | `61cb8a9` | `61cb8a9741eeb8a550a1b8544337180c0fc8476b` |
| browser-actions/setup-chrome | v2.1.0 | `2dbff04` | `2dbff04819ebbfd5c974947148805a825b8a07fd` |
| codecov/codecov-action | v5.5.2 | `0561704` | `0561704f0f02c16a585d4c7555e57fa2e44cf909` |
| cycjimmy/semantic-release-action | v4.2.2 | `16ca923` | `16ca923e6ccbb50770c415a0ccd43709a8c5f7a4` |
| googleapis/release-please-action | v4.4.0 | `16a9c90` | `16a9c90856f42705d54a6fda1823352bdc62cf38` |
| gradle/actions/setup-gradle | v5.0.0 | `f236b35` | `f236b35da9d031e13b1005234ebe4392ed54c580` |
| pnpm/action-setup | v4.2.0 | `9fd676a` | `9fd676a19091d4595eefd76e4bd31c97133911f1` |
| r0adkll/sign-android-release | v1.0.4 | `dbeba6b` | `dbeba6b98a60b0fd540c02443c7f428cdedf0e7f` |
| r0adkll/upload-google-play | v1.1.3 | `935ef9c` | `935ef9c68bb393a8e6116b1575626a7f5be3a7fb` |
| softprops/action-gh-release | v2.5.0 | `a06a81a` | `a06a81a03ee405af7f2048a818ed3f03bbf83c7b` |

## Updating Actions

To update an action to a newer version:

1. **Check for updates:**

   ```bash
   # Visit the action repository on GitHub
   # Example: https://github.com/actions/checkout/releases
   ```

2. **Get the latest SHA:**

   ```bash
   # Find the commit SHA for the latest release tag
   # Example for actions/checkout v6.0.3:
   curl -s https://api.github.com/repos/actions/checkout/git/refs/tags/v6.0.3 | \
     grep '"sha"' | head -1 | cut -d'"' -f4
   ```

3. **Update workflows:**

   ```bash
   # Find all usages
   grep -r "actions/checkout@" .github/

   # Update with new SHA
   sed -i 's|actions/checkout@OLD_SHA  # v6.0.2|actions/checkout@NEW_SHA  # v6.0.3|g' \
     .github/workflows/*.yml .github/actions/**/action.yml
   ```

4. **Update this document:**
   - Update the version and SHA in the table above
   - Update the "Last updated" date
   - Commit changes with message: `chore: update actions/checkout to v6.0.3`

## Verification

To verify all actions are properly pinned:

```bash
# Check for any non-SHA action references (should return nothing)
grep -r "uses:.*@v[0-9]" .github/workflows/ .github/actions/ 2>/dev/null | \
  grep -v "^.*#.*" | \
  grep -v ".github/actions"
```

## Security Considerations

1. **Review Changes**: Before updating, review the changelog and diff between versions
2. **Test First**: Test updated actions in a feature branch before merging to main
3. **Monitor Advisories**: Subscribe to security advisories for critical actions
4. **Regular Updates**: Review and update actions quarterly (add calendar reminder)

## References

- [GitHub Actions Security Best Practices](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
- [Dependabot for GitHub Actions](https://docs.github.com/en/code-security/dependabot/working-with-dependabot/keeping-your-actions-up-to-date-with-dependabot)
- [Action Pinning Guide](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions#using-third-party-actions)
