/**
 * NineSlicePanel Component
 * Container panel using 9-slice sprite rendering
 */

import { useMemo } from 'react';
import { View, type ViewStyle } from 'react-native';

import { scaleContentInsets } from './atlas-utils';
import { CloseIconButton } from './CloseIconButton';
import { NineSliceSprite } from './NineSliceSprite';
import type { AtlasMetadata, ImageSourceType, PanelState } from './types';

interface NineSlicePanelProps {
  /** Panel content */
  children: React.ReactNode;
  /** Panel width */
  width: number;
  /** Panel height */
  height: number;
  /** Atlas metadata for the panel */
  metadata: AtlasMetadata;
  /** Atlas image source */
  atlasSource: ImageSourceType;
  /** Whether to show a close button */
  showCloseButton?: boolean;
  /** Close button handler */
  onClose?: () => void;
  /** Close button metadata (required if showCloseButton is true) */
  closeButtonMetadata?: AtlasMetadata;
  /** Close button atlas source (required if showCloseButton is true) */
  closeButtonAtlasSource?: ImageSourceType;
  /** Panel state (idle or disabled) */
  state?: PanelState;
  /** Additional container styles */
  style?: ViewStyle;
  /** Additional content container styles */
  contentStyle?: ViewStyle;
  /** Accessibility label for the panel */
  accessibilityLabel?: string;
}

/**
 * NineSlicePanel - Container panel with 9-slice sprite rendering
 *
 * Features:
 * - Scalable panel using 9-slice technique
 * - Optional close button positioned in header area
 * - Content area with padding from content_rect_insets_px
 * - Support for disabled state
 */
export function NineSlicePanel({
  children,
  width,
  height,
  metadata,
  atlasSource,
  showCloseButton = false,
  onClose,
  closeButtonMetadata,
  closeButtonAtlasSource,
  state = 'idle',
  style,
  contentStyle,
  accessibilityLabel,
}: NineSlicePanelProps) {
  // Calculate content padding from metadata
  const contentPadding = useMemo(() => {
    const contentInsets = metadata.content_rect_insets_px;

    if (!contentInsets) {
      // Default padding if not specified
      return { top: 16, right: 16, bottom: 16, left: 16 };
    }

    return scaleContentInsets(contentInsets, metadata.tile_size, {
      w: width,
      h: height,
    });
  }, [metadata, width, height]);

  // Calculate close button position (top-right corner within content area)
  const closeButtonPosition = useMemo(() => {
    // Position the close button at top-right of content area
    // Account for button size (48dp) and some margin
    const margin = 8;
    return {
      top: contentPadding.top - 24 + margin,
      right: contentPadding.right - 24 + margin,
    };
  }, [contentPadding]);

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
      accessible
      accessibilityRole="none"
      accessibilityLabel={accessibilityLabel}
    >
      {/* Panel background */}
      <NineSliceSprite
        metadata={metadata}
        atlasSource={atlasSource}
        state={state}
        width={width}
        height={height}
      />

      {/* Content area */}
      <View
        style={[
          {
            position: 'absolute',
            top: contentPadding.top,
            left: contentPadding.left,
            right: contentPadding.right,
            bottom: contentPadding.bottom,
          },
          contentStyle,
        ]}
      >
        {children}
      </View>

      {/* Optional close button */}
      {showCloseButton && closeButtonMetadata && closeButtonAtlasSource && (
        <View
          style={{
            position: 'absolute',
            top: closeButtonPosition.top,
            right: closeButtonPosition.right,
            zIndex: 10,
          }}
        >
          <CloseIconButton
            metadata={closeButtonMetadata}
            atlasSource={closeButtonAtlasSource}
            onPress={onClose}
          />
        </View>
      )}
    </View>
  );
}

/**
 * Hook to create panel props with loaded metadata
 * This can be used to simplify panel creation when metadata is pre-loaded
 */
export function usePanelProps(
  metadata: AtlasMetadata,
  atlasSource: ImageSourceType,
  closeMetadata?: AtlasMetadata,
  closeAtlasSource?: ImageSourceType
) {
  return useMemo(
    () => ({
      metadata,
      atlasSource,
      closeButtonMetadata: closeMetadata,
      closeButtonAtlasSource: closeAtlasSource,
    }),
    [metadata, atlasSource, closeMetadata, closeAtlasSource]
  );
}
