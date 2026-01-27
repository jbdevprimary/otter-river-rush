#!/bin/bash
# Asset Copy Helper Script
# Usage: ./scripts/copy-asset.sh <category> <source-path>
#
# Categories: model, texture, audio, ui
#
# Examples:
#   ./scripts/copy-asset.sh model "assets/lib/kenney-watercraft/canoe.glb"
#   ./scripts/copy-asset.sh texture "assets/lib/ambientcg-1k/Sand001"
#   ./scripts/copy-asset.sh audio "assets/lib/kenney-interface-sounds/click_001.ogg"

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ASSETS_DIR="$PROJECT_ROOT/assets"

CATEGORY="$1"
SOURCE="$2"

if [ -z "$CATEGORY" ] || [ -z "$SOURCE" ]; then
    echo "Usage: $0 <category> <source-path>"
    echo ""
    echo "Categories:"
    echo "  model   - 3D models (.glb, .gltf)"
    echo "  texture - PBR textures (directory with maps)"
    echo "  audio   - Audio files (.ogg, .mp3)"
    echo "  ui      - UI assets (.png)"
    echo ""
    echo "Examples:"
    echo "  $0 model assets/lib/kenney-watercraft/canoe.glb"
    echo "  $0 texture assets/lib/ambientcg-1k/Sand001"
    exit 1
fi

# Resolve source path
if [[ "$SOURCE" == assets/* ]]; then
    SOURCE="$PROJECT_ROOT/$SOURCE"
elif [[ "$SOURCE" != /* ]]; then
    SOURCE="$PROJECT_ROOT/$SOURCE"
fi

if [ ! -e "$SOURCE" ]; then
    echo "Error: Source not found: $SOURCE"
    exit 1
fi

BASENAME=$(basename "$SOURCE")

case "$CATEGORY" in
    model)
        DEST_DIR="$ASSETS_DIR/models"
        echo "Copying model to $DEST_DIR..."
        cp "$SOURCE" "$DEST_DIR/"
        echo "Done! Add to src/game/assets/AssetRegistry.ts:"
        echo "  path: 'models/$BASENAME',"
        ;;
    texture)
        if [ -d "$SOURCE" ]; then
            DEST_DIR="$ASSETS_DIR/textures/pbr/$(basename "$SOURCE" | tr '[:upper:]' '[:lower:]' | sed 's/[0-9]*$//')"
            mkdir -p "$DEST_DIR"
            cp -r "$SOURCE" "$DEST_DIR/"
            echo "Copied texture set to $DEST_DIR/$(basename "$SOURCE")"
        else
            echo "Error: Texture source should be a directory"
            exit 1
        fi
        ;;
    audio)
        if [[ "$SOURCE" == *interface* ]] || [[ "$SOURCE" == *click* ]] || [[ "$SOURCE" == *confirm* ]]; then
            DEST_DIR="$ASSETS_DIR/audio/sfx"
        elif [[ "$SOURCE" == *music* ]] || [[ "$SOURCE" == *loop* ]]; then
            DEST_DIR="$ASSETS_DIR/audio/music"
        elif [[ "$SOURCE" == *impact* ]]; then
            DEST_DIR="$ASSETS_DIR/audio/sfx"
        else
            DEST_DIR="$ASSETS_DIR/audio/sfx"
        fi
        echo "Copying audio to $DEST_DIR..."
        cp "$SOURCE" "$DEST_DIR/"
        echo "Done! Add to src/game/assets/AssetRegistry.ts:"
        echo "  path: 'audio/sfx/$BASENAME',"
        ;;
    ui)
        DEST_DIR="$ASSETS_DIR/ui"
        mkdir -p "$DEST_DIR"
        echo "Copying UI asset to $DEST_DIR..."
        cp "$SOURCE" "$DEST_DIR/"
        echo "Done!"
        ;;
    *)
        echo "Unknown category: $CATEGORY"
        echo "Valid categories: model, texture, audio, ui"
        exit 1
        ;;
esac

echo ""
echo "Remember to:"
echo "1. Register the asset in packages/assets/src/registry.ts"
echo "2. Update the relevant config (biome-assets.ts, etc.)"
