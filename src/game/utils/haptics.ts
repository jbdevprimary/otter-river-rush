/**
 * Haptic Feedback Utility
 * Cross-platform haptic feedback for game events
 *
 * Supports:
 * - Native (iOS/Android) via expo-haptics (when available)
 * - Web vibration API (when available)
 * - Graceful fallback (no-op when unsupported)
 *
 * Usage:
 * - Call haptics.light() for subtle feedback (collecting coins)
 * - Call haptics.medium() for noticeable feedback (lane change, power-up)
 * - Call haptics.heavy() for impactful feedback (collision, damage)
 * - Call haptics.warning() for alerts (approaching danger)
 * - Call haptics.success() for achievements
 */

// ============================================================================
// Types
// ============================================================================

export type HapticIntensity = 'light' | 'medium' | 'heavy';
export type HapticFeedbackType =
  | 'selection' // Light tap (coin, gem)
  | 'impact_light' // Light impact (lane change)
  | 'impact_medium' // Medium impact (power-up)
  | 'impact_heavy' // Heavy impact (collision)
  | 'notification_success' // Positive (achievement)
  | 'notification_warning' // Warning (danger ahead)
  | 'notification_error'; // Error (damage)

// ============================================================================
// Platform Detection
// ============================================================================

/** Check if we're running on a native platform with expo-haptics */
function isNativePlatform(): boolean {
  return typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

/** Check if web vibration API is available */
function hasVibrationAPI(): boolean {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
}

// ============================================================================
// Haptic Engine
// ============================================================================

// Expo haptics interface (simplified for type safety)
interface ExpoHapticsLike {
  selectionAsync: () => Promise<void>;
  impactAsync: (style: number) => Promise<void>;
  notificationAsync: (type: number) => Promise<void>;
  ImpactFeedbackStyle: {
    Light: number;
    Medium: number;
    Heavy: number;
  };
  NotificationFeedbackType: {
    Success: number;
    Warning: number;
    Error: number;
  };
}

let expoHaptics: ExpoHapticsLike | null = null;
let hapticsEnabled = true;

/**
 * Initialize expo-haptics if available (async import)
 * This should be called once at app startup
 */
export async function initHaptics(): Promise<void> {
  if (isNativePlatform()) {
    try {
      // Dynamic import for expo-haptics (only on native)
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const haptics = (await import('expo-haptics' as string)) as ExpoHapticsLike;
      expoHaptics = haptics;
    } catch {
      // expo-haptics not available
      console.log('Haptics: expo-haptics not available, using web fallback');
    }
  }
}

/**
 * Enable or disable haptic feedback globally
 */
export function setHapticsEnabled(enabled: boolean): void {
  hapticsEnabled = enabled;
}

/**
 * Check if haptics are currently enabled
 */
export function isHapticsEnabled(): boolean {
  return hapticsEnabled;
}

// ============================================================================
// Feedback Functions
// ============================================================================

/**
 * Trigger a selection feedback (lightest)
 * Use for: collecting coins, selecting UI elements
 */
export function selectionFeedback(): void {
  if (!hapticsEnabled) return;

  if (expoHaptics) {
    expoHaptics.selectionAsync();
  } else if (hasVibrationAPI()) {
    navigator.vibrate(10);
  }
}

/**
 * Trigger a light impact
 * Use for: lane changes, minor interactions
 */
export function lightImpact(): void {
  if (!hapticsEnabled) return;

  if (expoHaptics) {
    expoHaptics.impactAsync(expoHaptics.ImpactFeedbackStyle.Light);
  } else if (hasVibrationAPI()) {
    navigator.vibrate(15);
  }
}

/**
 * Trigger a medium impact
 * Use for: power-up collection, entering rapids
 */
export function mediumImpact(): void {
  if (!hapticsEnabled) return;

  if (expoHaptics) {
    expoHaptics.impactAsync(expoHaptics.ImpactFeedbackStyle.Medium);
  } else if (hasVibrationAPI()) {
    navigator.vibrate(25);
  }
}

/**
 * Trigger a heavy impact
 * Use for: collision, waterfall landing
 */
export function heavyImpact(): void {
  if (!hapticsEnabled) return;

  if (expoHaptics) {
    expoHaptics.impactAsync(expoHaptics.ImpactFeedbackStyle.Heavy);
  } else if (hasVibrationAPI()) {
    navigator.vibrate(50);
  }
}

/**
 * Trigger a success notification
 * Use for: achievements, completing challenges
 */
export function successNotification(): void {
  if (!hapticsEnabled) return;

  if (expoHaptics) {
    expoHaptics.notificationAsync(expoHaptics.NotificationFeedbackType.Success);
  } else if (hasVibrationAPI()) {
    navigator.vibrate([30, 50, 30]);
  }
}

/**
 * Trigger a warning notification
 * Use for: approaching whirlpool, low health
 */
export function warningNotification(): void {
  if (!hapticsEnabled) return;

  if (expoHaptics) {
    expoHaptics.notificationAsync(expoHaptics.NotificationFeedbackType.Warning);
  } else if (hasVibrationAPI()) {
    navigator.vibrate([20, 30, 20, 30, 20]);
  }
}

/**
 * Trigger an error notification
 * Use for: taking damage, losing life
 */
export function errorNotification(): void {
  if (!hapticsEnabled) return;

  if (expoHaptics) {
    expoHaptics.notificationAsync(expoHaptics.NotificationFeedbackType.Error);
  } else if (hasVibrationAPI()) {
    navigator.vibrate([50, 30, 50]);
  }
}

/**
 * Trigger a continuous vibration pattern
 * Use for: whirlpool pull (while in range)
 * @param duration Duration in ms
 */
export function continuousVibration(duration: number): void {
  if (!hapticsEnabled) return;

  // Expo doesn't have continuous vibration, use repeated impacts
  if (expoHaptics) {
    // Create a pulse pattern
    const pulseCount = Math.ceil(duration / 100);
    let i = 0;
    const interval = setInterval(() => {
      if (i >= pulseCount || !hapticsEnabled) {
        clearInterval(interval);
        return;
      }
      expoHaptics?.impactAsync(expoHaptics?.ImpactFeedbackStyle.Light);
      i++;
    }, 100);
  } else if (hasVibrationAPI()) {
    navigator.vibrate(duration);
  }
}

// ============================================================================
// Convenience Namespace Export
// ============================================================================

export const haptics = {
  init: initHaptics,
  setEnabled: setHapticsEnabled,
  isEnabled: isHapticsEnabled,
  selection: selectionFeedback,
  light: lightImpact,
  medium: mediumImpact,
  heavy: heavyImpact,
  success: successNotification,
  warning: warningNotification,
  error: errorNotification,
  continuous: continuousVibration,
};
