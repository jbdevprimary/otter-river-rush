# Native Node.js Module Build Guide

**Date**: 2025-10-10  
**Issue**: `roaring` package (native C++ module) fails to build without proper toolchain

## Problem

The `roaring` package is a native Node.js addon that requires compilation during installation. Without the proper build toolchain, `npm install` fails with:

```
gyp ERR! build error
gyp ERR! stack Error: Failed to execute '/usr/local/bin/node ...'
node-pre-gyp ERR! build error
```

## Root Cause

Native Node.js modules require:
1. **C++ compiler** (`g++`)
2. **Build tools** (`make`, `build-essential`)
3. **Python 3** (for node-gyp build scripts)
4. **Node headers** (automatically available with full Node.js installation)

The `roaring` package specifically compiles RoaringBitmap C++ library bindings for high-performance bitmap operations (used in our fog-of-war and spatial indexing systems).

## Solution

### In Development Environment (Dockerfile)

The `.cursor/Dockerfile` already includes the necessary build tools:

```dockerfile
RUN apt-get update && apt-get install -y --no-install-recommends \
    # Build essentials for native modules
    build-essential \
    pkg-config \
    # Python for node-gyp
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*
```

**These packages MUST be installed BEFORE running `npm install`.**

### If Build Fails After Clean Clone

If you encounter roaring build failures:

```bash
# 1. Ensure build tools are installed
apt-get update
apt-get install -y build-essential python3 make g++

# 2. Rebuild the native module
npm rebuild roaring

# 3. If that fails, do a clean reinstall
rm -rf node_modules package-lock.json
npm install
```

### For CI/CD Environments

Ensure the CI image has build tools:

```yaml
# GitHub Actions example
- name: Install build dependencies
  run: |
    sudo apt-get update
    sudo apt-get install -y build-essential python3
    
- name: Install Node dependencies
  run: npm ci
```

## Why Roaring?

The `roaring` package provides compressed bitmap data structures used for:

1. **Fog of War**: Efficiently store which hexes are revealed (1 bit per hex)
2. **Spatial Indexing**: Fast lookup of entities in chunk regions
3. **Chunk Management**: Track which chunks are loaded/generated

Benefits:
- **Memory efficient**: 95% compression vs raw bit arrays
- **Fast operations**: O(1) set/get, O(n) unions/intersections
- **Persistent**: Serializes to database efficiently

Alternative would be JavaScript arrays (100x larger, 10x slower).

## Verification

After installation, verify the module works:

```bash
node -e "const roaring = require('roaring'); console.log('Roaring loaded:', typeof roaring.RoaringBitmap32)"
```

Expected output:
```
Roaring loaded: function
```

## Other Native Modules in Project

- `better-sqlite3`: SQLite database bindings (also requires build-essential)
- `sqlite3`: Alternative SQLite bindings (requires same toolchain)

Both follow the same build requirements as `roaring`.

## Dockerfile Best Practices

**✅ CORRECT** (tools installed first):
```dockerfile
FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y build-essential python3
COPY package*.json ./
RUN npm ci
```

**❌ WRONG** (tools missing):
```dockerfile
FROM node:24-alpine
# Alpine doesn't include build-essential by default!
COPY package*.json ./
RUN npm ci  # WILL FAIL
```

**Fix for Alpine**:
```dockerfile
FROM node:24-alpine
RUN apk add --no-cache python3 make g++  # Alpine package manager
RUN npm ci
```

## Future Considerations

If native module build times become problematic:

1. **Prebuilt binaries**: Check if `roaring` provides prebuilt binaries for Node 24
2. **Docker caching**: Use multi-stage builds to cache node_modules
3. **Alternative packages**: Pure JS implementations exist (trade performance for ease)

For now, the current approach (build from source) is appropriate for a development-focused project.

## CRITICAL: Node.js Version Requirement

**The `roaring` package v2.4.0 does NOT support Node.js 24.**

Error when using Node 24:
```
error: 'class v8utils::TypedArrayContent<unsigned int>' has no member named 'bufferPersistent'
```

This is a V8 API incompatibility. The roaring package has not been updated for Node.js 24's V8 engine changes.

**SOLUTION: Use Node.js 22 (LTS)**

The project MUST use Node.js 22 until roaring releases a Node 24-compatible version.

Check roaring compatibility: https://www.npmjs.com/package/roaring

## Updated: 2025-10-10

- **CRITICAL FIX**: Downgraded from Node 24 to Node 22 due to roaring incompatibility
- Verified build-essential is in .cursor/Dockerfile
- Updated Dockerfile: `FROM node:22-bookworm-slim`
- roaring@2.4.0 builds successfully with Node 22
