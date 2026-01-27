/**
 * NineSliceSprite Component
 * Core 9-slice renderer using 9 React Native Image components
 * Renders a scalable sprite by dividing it into 9 regions that stretch appropriately
 */

import { useMemo } from 'react';
import { Image, View, type ViewStyle } from 'react-native';

import {
  computeNineSliceRects,
  computeTileRect,
  getStateIndex,
  scaleContentInsets,
} from './atlas-utils';
import type { AtlasMetadata, ImageSourceType, NineSliceInsets, SliceRenderInfo } from './types';

interface NineSliceSpriteProps {
  /** Atlas metadata containing tile layout and insets */
  metadata: AtlasMetadata;
  /** Image source for the atlas (require() or { uri: string }) */
  atlasSource: ImageSourceType;
  /** Current state to display (e.g., 'idle', 'hover', 'pressed') */
  state: string;
  /** Target width in device pixels */
  width: number;
  /** Target height in device pixels */
  height: number;
  /** Optional children to render in the content area */
  children?: React.ReactNode;
  /** Optional style overrides for the container */
  style?: ViewStyle;
  /** Whether to use inner_text_rect_insets_px for content padding (default: false uses content_rect_insets_px) */
  useTextInsets?: boolean;
}

/**
 * Individual slice component that renders one of the 9 regions
 */
function Slice({
  atlasSource,
  atlasWidth,
  atlasHeight,
  sliceInfo,
}: {
  atlasSource: ImageSourceType;
  atlasWidth: number;
  atlasHeight: number;
  sliceInfo: SliceRenderInfo;
}) {
  const { source, dest } = sliceInfo;

  // Skip rendering if the slice has no visible area
  if (dest.width <= 0 || dest.height <= 0) {
    return null;
  }

  // Calculate scale to make the source region fill the dest region
  const scaleX = dest.width / source.width;
  const scaleY = dest.height / source.height;

  // Calculate the offset to position the correct part of the atlas
  const offsetX = -source.x * scaleX;
  const offsetY = -source.y * scaleY;

  return (
    <View
      style={{
        position: 'absolute',
        left: dest.x,
        top: dest.y,
        width: dest.width,
        height: dest.height,
        overflow: 'hidden',
      }}
    >
      <Image
        source={atlasSource}
        style={{
          position: 'absolute',
          left: offsetX,
          top: offsetY,
          width: atlasWidth * scaleX,
          height: atlasHeight * scaleY,
        }}
        resizeMode="stretch"
      />
    </View>
  );
}

/**
 * NineSliceSprite - Renders a 9-slice scalable sprite
 *
 * The sprite is divided into 9 regions:
 * - Corners (4): Fixed size, never stretch
 * - Edges (4): Stretch in one direction only
 * - Center (1): Stretches in both directions
 *
 * This allows the sprite to scale to any size while preserving
 * the appearance of borders and corners.
 */
export function NineSliceSprite({
  metadata,
  atlasSource,
  state,
  width,
  height,
  children,
  style,
  useTextInsets = false,
}: NineSliceSpriteProps) {
  // Get default insets if not provided (fallback to reasonable defaults)
  const defaultInsets: NineSliceInsets = {
    left: 32,
    right: 32,
    top: 32,
    bottom: 32,
  };

  const insets = metadata.nine_slice_insets_px ?? defaultInsets;

  // Compute all the slice rectangles
  const slices = useMemo(() => {
    const stateIndex = getStateIndex(metadata, state);
    const tileRect = computeTileRect(metadata, stateIndex);
    return computeNineSliceRects(tileRect, insets, width, height);
  }, [metadata, state, insets, width, height]);

  // Get atlas dimensions
  const atlasWidth = metadata.atlas.atlas_w;
  const atlasHeight = metadata.atlas.atlas_h;

  // Calculate content padding from metadata
  const contentPadding = useMemo(() => {
    const contentInsets = useTextInsets
      ? metadata.inner_text_rect_insets_px
      : metadata.content_rect_insets_px;

    if (!contentInsets) {
      return { top: 0, right: 0, bottom: 0, left: 0 };
    }

    const scaled = scaleContentInsets(contentInsets, metadata.tile_size, { w: width, h: height });

    return {
      top: scaled.top,
      right: scaled.right,
      bottom: scaled.bottom,
      left: scaled.left,
    };
  }, [metadata, width, height, useTextInsets]);

  return (
    <View
      style={[
        {
          width,
          height,
          position: 'relative',
        },
        style,
      ]}
    >
      {/* Render all 9 slices */}
      <Slice
        atlasSource={atlasSource}
        atlasWidth={atlasWidth}
        atlasHeight={atlasHeight}
        sliceInfo={slices.topLeft}
      />
      <Slice
        atlasSource={atlasSource}
        atlasWidth={atlasWidth}
        atlasHeight={atlasHeight}
        sliceInfo={slices.topCenter}
      />
      <Slice
        atlasSource={atlasSource}
        atlasWidth={atlasWidth}
        atlasHeight={atlasHeight}
        sliceInfo={slices.topRight}
      />
      <Slice
        atlasSource={atlasSource}
        atlasWidth={atlasWidth}
        atlasHeight={atlasHeight}
        sliceInfo={slices.middleLeft}
      />
      <Slice
        atlasSource={atlasSource}
        atlasWidth={atlasWidth}
        atlasHeight={atlasHeight}
        sliceInfo={slices.middleCenter}
      />
      <Slice
        atlasSource={atlasSource}
        atlasWidth={atlasWidth}
        atlasHeight={atlasHeight}
        sliceInfo={slices.middleRight}
      />
      <Slice
        atlasSource={atlasSource}
        atlasWidth={atlasWidth}
        atlasHeight={atlasHeight}
        sliceInfo={slices.bottomLeft}
      />
      <Slice
        atlasSource={atlasSource}
        atlasWidth={atlasWidth}
        atlasHeight={atlasHeight}
        sliceInfo={slices.bottomCenter}
      />
      <Slice
        atlasSource={atlasSource}
        atlasWidth={atlasWidth}
        atlasHeight={atlasHeight}
        sliceInfo={slices.bottomRight}
      />

      {/* Content area with proper padding */}
      {children && (
        <View
          style={{
            position: 'absolute',
            top: contentPadding.top,
            left: contentPadding.left,
            right: contentPadding.right,
            bottom: contentPadding.bottom,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {children}
        </View>
      )}
    </View>
  );
}
