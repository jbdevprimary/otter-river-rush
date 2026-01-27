/**
 * Nine-Slice UI Component Types
 * TypeScript interfaces for 9-slice rendering with atlas-based sprites
 */

/**
 * Insets defining the border regions for 9-slice or content areas
 */
export interface NineSliceInsets {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

/**
 * Tile size dimensions
 */
export interface TileSize {
  w: number;
  h: number;
}

/**
 * Atlas configuration for sprite sheets
 */
export interface AtlasConfig {
  /** Original path from generation (for reference) */
  path: string;
  /** Order of states in the atlas from top to bottom */
  tile_order: string[];
  /** Padding at the top of the atlas in pixels */
  top_pad: number;
  /** Gap between tiles in pixels */
  gap: number;
  /** Atlas width in pixels */
  atlas_w: number;
  /** Atlas height in pixels */
  atlas_h: number;
}

/**
 * Complete metadata for a 9-slice asset atlas
 */
export interface AtlasMetadata {
  /** Asset identifier */
  asset: string;
  /** Size of each tile in the atlas */
  tile_size: TileSize;
  /** Available states for this asset */
  states: string[];
  /** Atlas configuration */
  atlas: AtlasConfig;
  /** 9-slice border insets for stretching */
  nine_slice_insets_px?: NineSliceInsets;
  /** Safe area insets for text content (buttons) */
  inner_text_rect_insets_px?: NineSliceInsets;
  /** Safe area insets for general content (panels) */
  content_rect_insets_px?: NineSliceInsets;
  /** Recommended minimum height */
  recommended_min_height_px?: number;
  /** Recommended minimum width */
  recommended_min_width_px?: number;
}

/**
 * Button interaction states
 */
export type ButtonState = 'idle' | 'hover' | 'pressed' | 'disabled';

/**
 * Button visual variants
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

/**
 * Panel states (panels are typically static)
 */
export type PanelState = 'idle' | 'disabled';

/**
 * Rectangle definition for UV mapping and positioning
 */
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * The 9 regions of a 9-slice sprite
 */
export interface NineSliceRects {
  topLeft: Rect;
  topCenter: Rect;
  topRight: Rect;
  middleLeft: Rect;
  middleCenter: Rect;
  middleRight: Rect;
  bottomLeft: Rect;
  bottomCenter: Rect;
  bottomRight: Rect;
}

/**
 * Source and destination rects for a single slice
 */
export interface SliceRenderInfo {
  /** Source rectangle in the atlas (pixel coordinates) */
  source: Rect;
  /** Destination rectangle in the target (scaled coordinates) */
  dest: Rect;
}

/**
 * Complete render info for all 9 slices
 */
export interface NineSliceRenderInfo {
  topLeft: SliceRenderInfo;
  topCenter: SliceRenderInfo;
  topRight: SliceRenderInfo;
  middleLeft: SliceRenderInfo;
  middleCenter: SliceRenderInfo;
  middleRight: SliceRenderInfo;
  bottomLeft: SliceRenderInfo;
  bottomCenter: SliceRenderInfo;
  bottomRight: SliceRenderInfo;
}

/**
 * Size presets for responsive button sizing
 */
export type ButtonSize = 'sm' | 'md' | 'lg' | 'auto';

/**
 * Device type for responsive breakpoints
 */
export type DeviceType = 'phone' | 'tablet' | 'desktop';

/**
 * Image source type for React Native Image component
 */
export type ImageSourceType = number | { uri: string };
