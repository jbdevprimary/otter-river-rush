/**
 * Atlas Utility Functions
 * Helpers for computing tile rectangles, 9-slice regions, and scaling
 */

import type {
  AtlasMetadata,
  NineSliceInsets,
  NineSliceRenderInfo,
  Rect,
  SliceRenderInfo,
} from './types';

/**
 * Compute the rectangle for a specific state tile within an atlas
 * @param metadata - Atlas metadata containing layout information
 * @param stateIndex - Index of the state in the tile_order array
 * @returns Rectangle defining the tile's position and size in the atlas
 */
export function computeTileRect(metadata: AtlasMetadata, stateIndex: number): Rect {
  const { tile_size, atlas } = metadata;
  const { top_pad, gap } = atlas;

  // Each tile is positioned vertically with top padding and gaps
  const y = top_pad + stateIndex * (tile_size.h + gap);

  return {
    x: 0,
    y,
    width: tile_size.w,
    height: tile_size.h,
  };
}

/**
 * Get the state index from a state name
 * @param metadata - Atlas metadata
 * @param state - State name to look up
 * @returns Index of the state, or 0 if not found
 */
export function getStateIndex(metadata: AtlasMetadata, state: string): number {
  const index = metadata.atlas.tile_order.indexOf(state);
  return index >= 0 ? index : 0;
}

/**
 * Compute the 9 slice rectangles for both source (atlas) and destination (target)
 * @param tileRect - Source tile rectangle in the atlas
 * @param insets - 9-slice insets defining border regions
 * @param targetWidth - Target render width
 * @param targetHeight - Target render height
 * @returns Complete render info for all 9 slices
 */
export function computeNineSliceRects(
  tileRect: Rect,
  insets: NineSliceInsets,
  targetWidth: number,
  targetHeight: number
): NineSliceRenderInfo {
  // Source dimensions from tile
  const srcLeft = insets.left;
  const srcRight = insets.right;
  const srcTop = insets.top;
  const srcBottom = insets.bottom;
  const srcCenterW = tileRect.width - srcLeft - srcRight;
  const srcCenterH = tileRect.height - srcTop - srcBottom;

  // Scale insets proportionally to target size
  const scaledInsets = scaleInsets(
    insets,
    { w: tileRect.width, h: tileRect.height },
    { w: targetWidth, h: targetHeight }
  );

  // Destination dimensions
  const destLeft = scaledInsets.left;
  const destRight = scaledInsets.right;
  const destTop = scaledInsets.top;
  const destBottom = scaledInsets.bottom;
  const destCenterW = Math.max(0, targetWidth - destLeft - destRight);
  const destCenterH = Math.max(0, targetHeight - destTop - destBottom);

  // Helper to create slice render info
  const createSlice = (
    srcX: number,
    srcY: number,
    srcW: number,
    srcH: number,
    destX: number,
    destY: number,
    destW: number,
    destH: number
  ): SliceRenderInfo => ({
    source: {
      x: tileRect.x + srcX,
      y: tileRect.y + srcY,
      width: srcW,
      height: srcH,
    },
    dest: {
      x: destX,
      y: destY,
      width: destW,
      height: destH,
    },
  });

  return {
    // Top row
    topLeft: createSlice(0, 0, srcLeft, srcTop, 0, 0, destLeft, destTop),
    topCenter: createSlice(srcLeft, 0, srcCenterW, srcTop, destLeft, 0, destCenterW, destTop),
    topRight: createSlice(
      srcLeft + srcCenterW,
      0,
      srcRight,
      srcTop,
      destLeft + destCenterW,
      0,
      destRight,
      destTop
    ),

    // Middle row
    middleLeft: createSlice(0, srcTop, srcLeft, srcCenterH, 0, destTop, destLeft, destCenterH),
    middleCenter: createSlice(
      srcLeft,
      srcTop,
      srcCenterW,
      srcCenterH,
      destLeft,
      destTop,
      destCenterW,
      destCenterH
    ),
    middleRight: createSlice(
      srcLeft + srcCenterW,
      srcTop,
      srcRight,
      srcCenterH,
      destLeft + destCenterW,
      destTop,
      destRight,
      destCenterH
    ),

    // Bottom row
    bottomLeft: createSlice(
      0,
      srcTop + srcCenterH,
      srcLeft,
      srcBottom,
      0,
      destTop + destCenterH,
      destLeft,
      destBottom
    ),
    bottomCenter: createSlice(
      srcLeft,
      srcTop + srcCenterH,
      srcCenterW,
      srcBottom,
      destLeft,
      destTop + destCenterH,
      destCenterW,
      destBottom
    ),
    bottomRight: createSlice(
      srcLeft + srcCenterW,
      srcTop + srcCenterH,
      srcRight,
      srcBottom,
      destLeft + destCenterW,
      destTop + destCenterH,
      destRight,
      destBottom
    ),
  };
}

/**
 * Scale insets proportionally from tile size to target size
 * Maintains visual proportion of borders
 * @param insets - Original insets in tile pixel coordinates
 * @param tileSize - Original tile size
 * @param targetSize - Target render size
 * @returns Scaled insets for the target size
 */
export function scaleInsets(
  insets: NineSliceInsets,
  tileSize: { w: number; h: number },
  targetSize: { w: number; h: number }
): NineSliceInsets {
  // Calculate scale factors
  const scaleX = targetSize.w / tileSize.w;
  const scaleY = targetSize.h / tileSize.h;

  // Use minimum scale to preserve aspect ratio of corners
  // This prevents corners from being stretched disproportionately
  const scale = Math.min(scaleX, scaleY, 1); // Cap at 1 to prevent corners from growing

  return {
    left: Math.round(insets.left * scale),
    right: Math.round(insets.right * scale),
    top: Math.round(insets.top * scale),
    bottom: Math.round(insets.bottom * scale),
  };
}

/**
 * Scale content/text insets for positioning children
 * @param insets - Original content insets
 * @param tileSize - Original tile size
 * @param targetSize - Target render size
 * @returns Scaled content insets
 */
export function scaleContentInsets(
  insets: NineSliceInsets,
  tileSize: { w: number; h: number },
  targetSize: { w: number; h: number }
): NineSliceInsets {
  const scaleX = targetSize.w / tileSize.w;
  const scaleY = targetSize.h / tileSize.h;

  return {
    left: Math.round(insets.left * scaleX),
    right: Math.round(insets.right * scaleX),
    top: Math.round(insets.top * scaleY),
    bottom: Math.round(insets.bottom * scaleY),
  };
}

/**
 * Calculate the minimum size needed to display a 9-slice without artifacts
 * @param insets - 9-slice insets
 * @returns Minimum width and height
 */
export function getMinimumSize(insets: NineSliceInsets): {
  minWidth: number;
  minHeight: number;
} {
  return {
    minWidth: insets.left + insets.right + 1,
    minHeight: insets.top + insets.bottom + 1,
  };
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
