/**
 * useResponsiveLayout - Hook for responsive layout management
 *
 * Detects screen size, orientation, and device type to enable
 * adaptive layouts for phones, tablets, and foldables.
 *
 * Supported devices:
 * - Pixel 8A (phone)
 * - Pixel Fold (foldable)
 * - Pixel Tablet
 * - iPad
 * - iPhone 17
 */

import { useCallback, useEffect, useState } from 'react';
import { Dimensions, type ScaledSize } from 'react-native';

export type DeviceType = 'phone' | 'tablet' | 'foldable';
export type Orientation = 'portrait' | 'landscape';

export interface ScreenBreakpoints {
  isPhone: boolean;
  isTablet: boolean;
  isFoldable: boolean;
  isLandscape: boolean;
  isPortrait: boolean;
}

export interface ResponsiveLayout {
  // Screen dimensions
  width: number;
  height: number;

  // Device classification
  deviceType: DeviceType;
  orientation: Orientation;

  // Breakpoint flags for conditional rendering
  breakpoints: ScreenBreakpoints;

  // Game-specific layout hints
  gameLayout: {
    // Whether HUD should be minimized (small screens in landscape)
    minimizeHUD: boolean;
    // Whether to show compact controls
    compactControls: boolean;
    // Suggested game canvas aspect ratio
    suggestedAspectRatio: number;
    // Whether there's enough space for side panels
    canShowSidePanels: boolean;
  };
}

// Screen size thresholds (in dp/points)
const _PHONE_MAX_WIDTH = 600;
const TABLET_MIN_WIDTH = 768;
const FOLDABLE_THRESHOLD = 840; // Pixel Fold unfolded width

/**
 * Determine device type based on screen dimensions
 */
function getDeviceType(width: number, height: number): DeviceType {
  const minDimension = Math.min(width, height);
  const maxDimension = Math.max(width, height);

  // Foldable detection: unusual aspect ratio or known foldable dimensions
  const aspectRatio = maxDimension / minDimension;
  if (
    width >= FOLDABLE_THRESHOLD ||
    (aspectRatio > 1.3 && aspectRatio < 1.6 && minDimension > 600)
  ) {
    return 'foldable';
  }

  // Tablet: larger screens
  if (minDimension >= TABLET_MIN_WIDTH) {
    return 'tablet';
  }

  // Phone: everything else
  return 'phone';
}

/**
 * Get orientation from dimensions
 */
function getOrientation(width: number, height: number): Orientation {
  return width > height ? 'landscape' : 'portrait';
}

/**
 * Calculate game layout hints based on screen characteristics
 */
function getGameLayout(
  width: number,
  height: number,
  deviceType: DeviceType,
  orientation: Orientation
) {
  const isSmallScreen = Math.min(width, height) < 400;
  const isVeryWide = width / height > 2;

  return {
    // Minimize HUD on small screens in landscape or very wide screens
    minimizeHUD: (isSmallScreen && orientation === 'landscape') || isVeryWide,

    // Use compact controls on phones
    compactControls: deviceType === 'phone',

    // Suggest aspect ratio for game canvas
    // Prefer 16:9 on phones, allow more flexibility on tablets
    suggestedAspectRatio: deviceType === 'phone' ? 16 / 9 : width / height,

    // Show side panels only on tablets/foldables in landscape
    canShowSidePanels:
      (deviceType === 'tablet' || deviceType === 'foldable') &&
      orientation === 'landscape' &&
      width >= 1024,
  };
}

/**
 * Hook for responsive layout detection
 */
export function useResponsiveLayout(): ResponsiveLayout {
  const [dimensions, setDimensions] = useState(() => Dimensions.get('window'));

  const handleDimensionChange = useCallback(
    ({ window }: { window: ScaledSize; screen: ScaledSize }) => {
      setDimensions(window);
    },
    []
  );

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', handleDimensionChange);
    return () => subscription.remove();
  }, [handleDimensionChange]);

  const { width, height } = dimensions;
  const deviceType = getDeviceType(width, height);
  const orientation = getOrientation(width, height);

  const breakpoints: ScreenBreakpoints = {
    isPhone: deviceType === 'phone',
    isTablet: deviceType === 'tablet',
    isFoldable: deviceType === 'foldable',
    isLandscape: orientation === 'landscape',
    isPortrait: orientation === 'portrait',
  };

  return {
    width,
    height,
    deviceType,
    orientation,
    breakpoints,
    gameLayout: getGameLayout(width, height, deviceType, orientation),
  };
}

/**
 * Hook for detecting fold/unfold events on foldable devices
 * Returns true when the device is in unfolded state
 */
export function useFoldableState(): boolean {
  const { width, breakpoints } = useResponsiveLayout();

  // On foldables, unfolded state typically has width >= 840
  // This is a simplified detection - real implementation would use
  // Jetpack WindowManager on Android
  return breakpoints.isFoldable && width >= FOLDABLE_THRESHOLD;
}

export default useResponsiveLayout;
