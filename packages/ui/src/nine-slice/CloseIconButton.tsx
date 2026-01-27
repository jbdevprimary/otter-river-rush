/**
 * CloseIconButton Component
 * Simple icon button for close actions (not 9-slice, single sprite per state)
 */

import { useCallback, useMemo, useState } from 'react';
import { Image, Pressable, View, type ViewStyle } from 'react-native';

import { computeTileRect, getStateIndex } from './atlas-utils';
import type { AtlasMetadata, ButtonState, ImageSourceType } from './types';

/**
 * Fixed touch target size for accessibility (48dp)
 */
const TOUCH_TARGET_SIZE = 48;

/**
 * Visual icon size (smaller than touch target)
 */
const ICON_VISUAL_SIZE = 36;

interface CloseIconButtonProps {
  /** Atlas metadata for the icon */
  metadata: AtlasMetadata;
  /** Atlas image source */
  atlasSource: ImageSourceType;
  /** Press handler */
  onPress?: () => void;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Visual icon size (default: 36dp) */
  iconSize?: number;
  /** Additional container styles */
  style?: ViewStyle;
  /** Accessibility label */
  accessibilityLabel?: string;
}

/**
 * CloseIconButton - Icon button for close/dismiss actions
 *
 * Features:
 * - Fixed 48x48 touch target for accessibility
 * - Visual icon centered (default 36dp)
 * - State machine for visual feedback
 * - Uses sprite sheet with different states
 */
export function CloseIconButton({
  metadata,
  atlasSource,
  onPress,
  disabled = false,
  iconSize = ICON_VISUAL_SIZE,
  style,
  accessibilityLabel = 'Close',
}: CloseIconButtonProps) {
  const [buttonState, setButtonState] = useState<ButtonState>('idle');

  // Get the current state for rendering
  const currentState = useMemo((): ButtonState => {
    if (disabled) return 'disabled';
    return buttonState;
  }, [disabled, buttonState]);

  // Calculate the source rectangle for the current state
  const sourceRect = useMemo(() => {
    const stateIndex = getStateIndex(metadata, currentState);
    return computeTileRect(metadata, stateIndex);
  }, [metadata, currentState]);

  // Calculate scale and offset to show the correct sprite
  const imageStyle = useMemo(() => {
    const { tile_size, atlas } = metadata;

    // Scale to fit the icon size
    const scale = iconSize / tile_size.w;

    return {
      width: atlas.atlas_w * scale,
      height: atlas.atlas_h * scale,
      left: -sourceRect.x * scale,
      top: -sourceRect.y * scale,
    };
  }, [metadata, iconSize, sourceRect]);

  // Handle press in
  const handlePressIn = useCallback(() => {
    if (!disabled) {
      setButtonState('pressed');
    }
  }, [disabled]);

  // Handle press out
  const handlePressOut = useCallback(() => {
    if (!disabled) {
      setButtonState('idle');
    }
  }, [disabled]);

  // Handle hover in (web)
  const handleHoverIn = useCallback(() => {
    if (!disabled && buttonState !== 'pressed') {
      setButtonState('hover');
    }
  }, [disabled, buttonState]);

  // Handle hover out (web)
  const handleHoverOut = useCallback(() => {
    if (!disabled && buttonState !== 'pressed') {
      setButtonState('idle');
    }
  }, [disabled, buttonState]);

  // Handle press
  const handlePress = useCallback(() => {
    if (!disabled && onPress) {
      onPress();
    }
  }, [disabled, onPress]);

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onHoverIn={handleHoverIn}
      onHoverOut={handleHoverOut}
      disabled={disabled}
      style={[
        {
          width: TOUCH_TARGET_SIZE,
          height: TOUCH_TARGET_SIZE,
          justifyContent: 'center',
          alignItems: 'center',
        },
        style,
      ]}
      accessible
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
    >
      <View
        style={{
          width: iconSize,
          height: iconSize,
          overflow: 'hidden',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <Image
          source={atlasSource}
          style={{
            position: 'absolute',
            left: imageStyle.left,
            top: imageStyle.top,
            width: imageStyle.width,
            height: imageStyle.height,
          }}
          resizeMode="stretch"
        />
      </View>
    </Pressable>
  );
}
