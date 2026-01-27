#!/bin/bash
# Link ~/assets library to project for development
# Run this script after cloning to set up asset symlinks

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ASSETS_SOURCE="$HOME/assets"
ASSETS_LIB="$PROJECT_ROOT/assets/lib"

echo "=== Linking Asset Library ==="
echo "Source: $ASSETS_SOURCE"
echo "Target: $ASSETS_LIB"
echo ""

# Check if ~/assets exists
if [ ! -d "$ASSETS_SOURCE" ]; then
    echo "ERROR: ~/assets directory not found"
    echo "Please download assets from:"
    echo "  - AmbientCG: https://ambientcg.com/"
    echo "  - Kenney: https://kenney.nl/assets"
    exit 1
fi

# Create lib directory
mkdir -p "$ASSETS_LIB"

# Link Kenney Nature Kit models
if [ -d "$ASSETS_SOURCE/Kenney/3D assets/Nature Kit/Models/GLTF format" ]; then
    rm -f "$ASSETS_LIB/kenney-nature"
    ln -s "$ASSETS_SOURCE/Kenney/3D assets/Nature Kit/Models/GLTF format" "$ASSETS_LIB/kenney-nature"
    echo "Linked: kenney-nature"
else
    echo "WARNING: Kenney Nature Kit not found"
fi

# Link Kenney Audio
if [ -d "$ASSETS_SOURCE/Kenney/Audio" ]; then
    rm -f "$ASSETS_LIB/kenney-audio"
    ln -s "$ASSETS_SOURCE/Kenney/Audio" "$ASSETS_LIB/kenney-audio"
    echo "Linked: kenney-audio"
else
    echo "WARNING: Kenney Audio not found"
fi

# Link AmbientCG 1K textures
if [ -d "$ASSETS_SOURCE/AmbientCG/Assets/MATERIAL/1K-JPG" ]; then
    rm -f "$ASSETS_LIB/ambientcg-1k"
    ln -s "$ASSETS_SOURCE/AmbientCG/Assets/MATERIAL/1K-JPG" "$ASSETS_LIB/ambientcg-1k"
    echo "Linked: ambientcg-1k"
else
    echo "WARNING: AmbientCG 1K textures not found"
fi

# Link KayKit (optional)
if [ -d "$ASSETS_SOURCE/KayKit_Adventurers_1.0_EXTRA" ]; then
    rm -f "$ASSETS_LIB/kaykit"
    ln -s "$ASSETS_SOURCE/KayKit_Adventurers_1.0_EXTRA" "$ASSETS_LIB/kaykit"
    echo "Linked: kaykit (optional)"
fi

# Link Quaternius (optional)
if [ -d "$ASSETS_SOURCE/Quaternius" ]; then
    rm -f "$ASSETS_LIB/quaternius"
    ln -s "$ASSETS_SOURCE/Quaternius" "$ASSETS_LIB/quaternius"
    echo "Linked: quaternius (optional)"
fi

echo ""
echo "=== Asset Linking Complete ==="
echo ""
echo "Available assets:"
ls -la "$ASSETS_LIB/"
echo ""
echo "Usage in code:"
echo "  Kenney models: /assets/lib/kenney-nature/rock_largeA.glb"
echo "  AmbientCG:     /assets/lib/ambientcg-1k/Grass001/*.jpg"
echo "  Audio:         /assets/lib/kenney-audio/Impact Sounds/*.ogg"
