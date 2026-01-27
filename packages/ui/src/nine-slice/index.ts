/**
 * Nine-Slice UI Component System
 * Exports all components and types for 9-slice sprite rendering
 */

// Utilities
export {
  clamp,
  computeNineSliceRects,
  computeTileRect,
  getMinimumSize,
  getStateIndex,
  scaleContentInsets,
  scaleInsets,
} from './atlas-utils';
// Components
export { CloseIconButton } from './CloseIconButton';
export { NineSliceButton } from './NineSliceButton';
export { NineSlicePanel, usePanelProps } from './NineSlicePanel';
export { NineSliceSprite } from './NineSliceSprite';

// Types
export type {
  AtlasConfig,
  AtlasMetadata,
  ButtonSize,
  ButtonState,
  ButtonVariant,
  DeviceType,
  ImageSourceType,
  NineSliceInsets,
  NineSliceRects,
  NineSliceRenderInfo,
  PanelState,
  Rect,
  SliceRenderInfo,
  TileSize,
} from './types';
