/**
 * River Scaling Utilities
 * Dynamic scaling calculations for otter and banks based on river width
 *
 * Visual Impact:
 * | River Width | Otter Scale | Bank Width | Feel         |
 * |-------------|-------------|------------|--------------|
 * | 4 (rapids)  | 1.4x        | 4.0        | Claustrophobic |
 * | 8 (normal)  | 1.0x        | 2.0        | Balanced     |
 * | 12 (wide)   | 0.75x       | 0.5        | Expansive    |
 * | 14 (pool)   | 0.65x       | 0          | Ocean-like   |
 */

// ============================================================================
// Constants
// ============================================================================

/** Base/normal river width for scaling calculations */
const BASE_RIVER_WIDTH = 8;

/** Otter scale limits */
const OTTER_SCALE = {
  min: 0.6,
  max: 1.5,
  base: 1.0,
} as const;

/** Bank width limits */
const BANK_WIDTH = {
  min: 0,
  max: 4.0,
  narrowThreshold: 6, // Width below which banks are at max
  wideThreshold: 12, // Width above which banks are at min
} as const;

// ============================================================================
// Otter Scaling
// ============================================================================

/**
 * Calculate otter scale based on river width
 * Inversely proportional to river width for visual consistency
 *
 * - Wide river (14) → smaller otter (0.65x) - feels expansive
 * - Normal river (8) → normal otter (1.0x) - balanced
 * - Narrow river (4) → larger otter (1.4x) - feels claustrophobic
 *
 * @param riverWidth Current river width
 * @returns Scale factor for otter model
 */
export function calculateOtterScale(riverWidth: number): number {
  // Inversely proportional to river width
  const scale = OTTER_SCALE.base * (BASE_RIVER_WIDTH / riverWidth);

  // Clamp to reasonable bounds
  return clamp(scale, OTTER_SCALE.min, OTTER_SCALE.max);
}

/**
 * Calculate otter rotation adjustment for river curves
 * Otter should lean slightly into turns
 *
 * @param angleXY Horizontal curve angle (radians)
 * @param leanFactor How much to lean (0-1)
 * @returns Rotation adjustment in radians
 */
export function calculateOtterLean(angleXY: number, leanFactor: number = 0.3): number {
  // Lean into the curve (positive angle = leaning right for right turn)
  return angleXY * leanFactor;
}

// ============================================================================
// Bank Scaling
// ============================================================================

/**
 * Calculate bank width based on river width
 * Banks thin out as river widens, disappear in very wide sections
 *
 * - Narrow river (4-6) → thick banks (4.0) - rocky, constrained
 * - Normal river (6-10) → medium banks (2.0) - balanced
 * - Wide river (10-12) → thin banks (0.5) - mostly water
 * - Very wide (12+) → no banks (0) - open water feel
 *
 * @param riverWidth Current river width
 * @returns Bank width on each side
 */
export function calculateBankWidth(riverWidth: number): number {
  // Banks disappear in very wide sections
  if (riverWidth >= BANK_WIDTH.wideThreshold) {
    return BANK_WIDTH.min;
  }

  // Banks at maximum in narrow sections
  if (riverWidth <= BANK_WIDTH.narrowThreshold) {
    return BANK_WIDTH.max;
  }

  // Linear interpolation between thresholds
  const t = (riverWidth - BANK_WIDTH.narrowThreshold) /
    (BANK_WIDTH.wideThreshold - BANK_WIDTH.narrowThreshold);

  return lerp(BANK_WIDTH.max, BANK_WIDTH.min, t);
}

/**
 * Calculate bank opacity based on river width
 * Banks fade out before completely disappearing
 *
 * @param riverWidth Current river width
 * @returns Opacity value (0-1)
 */
export function calculateBankOpacity(riverWidth: number): number {
  // Fully opaque for narrow rivers
  if (riverWidth <= 10) {
    return 1.0;
  }

  // Fade out between width 10 and 14
  if (riverWidth >= 14) {
    return 0;
  }

  return 1 - (riverWidth - 10) / 4;
}

// ============================================================================
// Combined Scaling Data
// ============================================================================

/**
 * River scaling data for a given width
 */
export interface RiverScaling {
  /** Otter model scale factor */
  otterScale: number;
  /** Bank width on each side */
  bankWidth: number;
  /** Bank opacity for fading */
  bankOpacity: number;
  /** Whether this is considered a "narrow" section */
  isNarrow: boolean;
  /** Whether this is considered a "wide" section */
  isWide: boolean;
}

/**
 * Get all scaling values for a given river width
 *
 * @param riverWidth Current river width
 * @returns Complete scaling data
 */
export function getRiverScaling(riverWidth: number): RiverScaling {
  return {
    otterScale: calculateOtterScale(riverWidth),
    bankWidth: calculateBankWidth(riverWidth),
    bankOpacity: calculateBankOpacity(riverWidth),
    isNarrow: riverWidth <= 6,
    isWide: riverWidth >= 12,
  };
}

// ============================================================================
// Smooth Transitions
// ============================================================================

/**
 * Smoothly interpolate scaling between two values
 * Use this for smooth visual transitions during width changes
 *
 * @param current Current scaling values
 * @param target Target scaling values
 * @param t Interpolation factor (0-1)
 * @returns Interpolated scaling values
 */
export function lerpScaling(
  current: RiverScaling,
  target: RiverScaling,
  t: number
): RiverScaling {
  return {
    otterScale: lerp(current.otterScale, target.otterScale, t),
    bankWidth: lerp(current.bankWidth, target.bankWidth, t),
    bankOpacity: lerp(current.bankOpacity, target.bankOpacity, t),
    isNarrow: t > 0.5 ? target.isNarrow : current.isNarrow,
    isWide: t > 0.5 ? target.isWide : current.isWide,
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Linear interpolation
 */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Clamp value between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
