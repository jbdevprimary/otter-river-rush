# Cursor Agent Container Rebuild Instructions

## Why Rebuild is Needed

The `.cursor/Dockerfile` has been updated to use **Node.js 22** (was Node 24).

**Reason**: The `roaring` package v2.4.0 does not support Node.js 24 due to V8 API incompatibilities.

## Current State

- ✅ Dockerfile updated: `FROM node:22-bookworm-slim`
- ✅ Documentation added: `NODE_VERSION_REQUIREMENTS.md`
- ✅ Version files created: `.nvmrc`, `.node-version`
- ✅ package.json engines field added
- ⚠️ **Container is still running Node 24** (rebuild required)

## Rebuild Container

The Cursor agent environment needs to be rebuilt to use the new Dockerfile.

### For Cursor Users:

1. **Close this Cursor session**
2. **Rebuild the remote environment**:
   - Option A: Cursor should detect Dockerfile changes and prompt rebuild
   - Option B: Manually trigger rebuild via Cursor settings
   - Option C: Delete and recreate the remote environment
3. **Verify Node version after rebuild**:
   ```bash
   node --version  # Should show v22.x.x
   ```
4. **Test roaring installation**:
   ```bash
   npm install
   node -e "const r = require('roaring'); console.log('Roaring OK')"
   ```

### For Docker Users:

```bash
# Rebuild the container
docker build -f .cursor/Dockerfile -t realm-walker-dev .

# Run with new container
docker run -it -v $(pwd):/workspace realm-walker-dev bash

# Verify
node --version  # v22.x.x
```

## What Happens After Rebuild

1. Container will start with Node 22
2. `npm install` will succeed (roaring will build properly)
3. All native modules (roaring, better-sqlite3) will compile correctly
4. Development can continue normally

## Temporary Workaround (If Rebuild Not Possible)

If you cannot rebuild the container right now, you can work without roaring:

1. **Comment out roaring in code** (temporary)
2. **Use mock implementation** for fog-of-war
3. **Focus on non-roaring features** (UI, RWMD content, etc.)

However, the following features will be blocked:
- Fog-of-war rendering
- Chunk-based spatial queries
- Efficient bitmap operations

## Verification Checklist

After rebuild:

- [ ] `node --version` shows v22.x.x
- [ ] `npm install` completes without errors
- [ ] `npm rebuild roaring` succeeds
- [ ] TypeScript compilation works
- [ ] Vite build succeeds
- [ ] Tests pass

## Questions?

See `NODE_VERSION_REQUIREMENTS.md` for full details on why Node 22 is required.
