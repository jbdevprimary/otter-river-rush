/**
 * NineSliceButton Component
 * Interactive button using 9-slice sprite rendering with state machine
 */

import { useCallback, useMemo, useState } from 'react';
import { Pressable, Text, type TextStyle, useWindowDimensions, type ViewStyle } from 'react-native';

import { NineSliceSprite } from './NineSliceSprite';
import type { AtlasMetadata, ButtonSize, ButtonState, DeviceType, ImageSourceType } from './types';

/**
 * Minimum touch target size for accessibility (48dp per WCAG guidelines)
 */
const MIN_TOUCH_TARGET = 48;

/**
 * Default button heights per device type
 */
const BUTTON_HEIGHTS: Record<DeviceType, number> = {
  phone: 56,
  tablet: 72,
  desktop: 64,
};

/**
 * Get device type based on screen width
 */
function getDeviceType(screenWidth: number): DeviceType {
  if (screenWidth < 768) return 'phone';
  if (screenWidth < 1024) return 'tablet';
  return 'desktop';
}

interface NineSliceButtonProps {
  /** Button text content */
  children: React.ReactNode;
  /** Press handler */
  onPress?: () => void;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Size preset or 'auto' for responsive sizing */
  size?: ButtonSize;
  /** Custom width (overrides size preset) */
  width?: number;
  /** Custom height (overrides size preset) */
  height?: number;
  /** Atlas metadata for the button */
  metadata: AtlasMetadata;
  /** Atlas image source */
  atlasSource: ImageSourceType;
  /** Additional container styles */
  style?: ViewStyle;
  /** Additional text styles */
  textStyle?: TextStyle;
  /** Accessibility label */
  accessibilityLabel?: string;
}

/**
 * NineSliceButton - Interactive button with 9-slice sprite rendering
 *
 * Features:
 * - State machine for visual feedback (idle, hover, pressed, disabled)
 * - Minimum 48x48 touch target for accessibility
 * - Responsive sizing based on device type
 * - Text positioned within safe area defined by inner_text_rect_insets_px
 */
export function NineSliceButton({
  children,
  onPress,
  disabled = false,
  size = 'auto',
  width: customWidth,
  height: customHeight,
  metadata,
  atlasSource,
  style,
  textStyle,
  accessibilityLabel,
}: NineSliceButtonProps) {
  const { width: screenWidth } = useWindowDimensions();
  const [buttonState, setButtonState] = useState<ButtonState>('idle');

  // Determine device type for responsive sizing
  const deviceType = getDeviceType(screenWidth);

  // Calculate button dimensions
  const dimensions = useMemo(() => {
    let buttonHeight: number;
    let buttonWidth: number;

    // Determine height
    if (customHeight) {
      buttonHeight = customHeight;
    } else if (size === 'sm') {
      buttonHeight = 40;
    } else if (size === 'md') {
      buttonHeight = 52;
    } else if (size === 'lg') {
      buttonHeight = 64;
    } else {
      // 'auto' - responsive based on device
      buttonHeight = BUTTON_HEIGHTS[deviceType];
    }

    // Determine width
    if (customWidth) {
      buttonWidth = customWidth;
    } else {
      // Use recommended minimum from metadata, or calculate based on height
      const minWidth = metadata.recommended_min_width_px ?? 200;
      // Scale width proportionally to height
      const heightRatio = buttonHeight / (metadata.tile_size.h || 256);
      buttonWidth = Math.max(minWidth * heightRatio, minWidth * 0.5);
    }

    return { width: buttonWidth, height: buttonHeight };
  }, [customWidth, customHeight, size, deviceType, metadata]);

  // Calculate touch target padding if visual size is below minimum
  const touchPadding = useMemo(() => {
    const horizontalPad = Math.max(0, (MIN_TOUCH_TARGET - dimensions.width) / 2);
    const verticalPad = Math.max(0, (MIN_TOUCH_TARGET - dimensions.height) / 2);
    return { horizontal: horizontalPad, vertical: verticalPad };
  }, [dimensions]);

  // Get the current state for rendering
  const currentState = useMemo((): ButtonState => {
    if (disabled) return 'disabled';
    return buttonState;
  }, [disabled, buttonState]);

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

  // Get accessibility role and state
  const accessibilityProps = {
    accessible: true,
    accessibilityRole: 'button' as const,
    accessibilityState: { disabled },
    accessibilityLabel: accessibilityLabel ?? (typeof children === 'string' ? children : undefined),
  };

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
          // Add touch padding to ensure minimum tap target
          paddingHorizontal: touchPadding.horizontal,
          paddingVertical: touchPadding.vertical,
          // Ensure the touch target is at least 48x48
          minWidth: MIN_TOUCH_TARGET,
          minHeight: MIN_TOUCH_TARGET,
          justifyContent: 'center',
          alignItems: 'center',
        },
        style,
      ]}
      {...accessibilityProps}
    >
      <NineSliceSprite
        metadata={metadata}
        atlasSource={atlasSource}
        state={currentState}
        width={dimensions.width}
        height={dimensions.height}
        useTextInsets
      >
        {typeof children === 'string' ? (
          <Text
            style={[
              {
                color: '#FFFFFF',
                fontSize: getFontSize(dimensions.height),
                fontWeight: 'bold',
                fontFamily: 'monospace',
                textAlign: 'center',
              },
              disabled && { opacity: 0.6 },
              textStyle,
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {children}
          </Text>
        ) : (
          children
        )}
      </NineSliceSprite>
    </Pressable>
  );
}

/**
 * Calculate appropriate font size based on button height
 */
function getFontSize(buttonHeight: number): number {
  if (buttonHeight <= 40) return 14;
  if (buttonHeight <= 52) return 16;
  if (buttonHeight <= 64) return 18;
  return 20;
}
