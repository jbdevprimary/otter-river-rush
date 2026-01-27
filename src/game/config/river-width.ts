/**
 * River Width Configuration
 * Controls dynamic river width based on distance, biome, and random variation
 */

import type { BiomeType } from '../types';

/**
 * River width configuration per biome
 * Each biome has its own width characteristics
 */
export const BIOME_RIVER_WIDTHS: Record<
  BiomeType,
  {
    baseWidth: number; // Base river width in world units
    minWidth: number; // Minimum width (for narrow sections)
    maxWidth: number; // Maximum width (for wide sections)
    variationScale: number; // How much random variation (0-1)
  }
> = {
  forest: {
    baseWidth: 8,
    minWidth: 6,
    maxWidth: 10,
    variationScale: 0.3,
  },
  canyon: {
    baseWidth: 5,
    minWidth: 4,
    maxWidth: 7,
    variationScale: 0.2,
  },
  arctic: {
    baseWidth: 9,
    minWidth: 7,
    maxWidth: 12,
    variationScale: 0.4,
  },
  tropical: {
    baseWidth: 10,
    minWidth: 8,
    maxWidth: 14,
    variationScale: 0.5,
  },
  volcanic: {
    baseWidth: 6,
    minWidth: 4,
    maxWidth: 8,
    variationScale: 0.15,
  },
};

/**
 * Distance-based width variation checkpoints
 * River width changes at these distance thresholds
 */
export const RIVER_WIDTH_CHECKPOINTS = {
  /** Distance interval for potential width changes (meters) */
  changeInterval: 200,
  /** Transition duration in seconds for smooth width changes */
  transitionDuration: 3.0,
  /** Minimum distance between narrow sections (meters) */
  minNarrowGap: 500,
  /** Probability of width change at each checkpoint (0-1) */
  changeProbability: 0.4,
};

/**
 * River width state interface
 */
export interface RiverWidthState {
  /** Current actual width (with transition) */
  currentWidth: number;
  /** Target width we're transitioning to */
  targetWidth: number;
  /** Base width for current biome */
  baseWidth: number;
  /** Last checkpoint distance */
  lastCheckpointDistance: number;
  /** Whether currently in a narrow section */
  isNarrow: boolean;
  /** Transition progress (0-1, 1 = complete) */
  transitionProgress: number;
}

/**
 * Calculate lane positions based on river width
 * Lanes are evenly distributed across the river width
 */
export function calculateLanePositions(riverWidth: number): [number, number, number] {
  // Lanes are positioned at 25%, 50%, 75% of the river width
  // Centered at 0, so they span from -width/2 to +width/2
  const laneSpacing = riverWidth / 4;

  return [
    -laneSpacing, // Left lane
    0, // Center lane
    laneSpacing, // Right lane
  ];
}

/**
 * Calculate the collision boundary for the river edges
 * Players should not be able to move beyond these boundaries
 */
export function calculateRiverBoundaries(riverWidth: number): { left: number; right: number } {
  const halfWidth = riverWidth / 2;
  // Add a small buffer so the player doesn't visually clip the edge
  const buffer = 0.5;
  return {
    left: -halfWidth + buffer,
    right: halfWidth - buffer,
  };
}

/**
 * Get interpolated river width between current and target
 */
export function interpolateWidth(
  currentWidth: number,
  targetWidth: number,
  progress: number
): number {
  // Use smooth step for natural-feeling transitions
  const smoothProgress = smoothStep(progress);
  return currentWidth + (targetWidth - currentWidth) * smoothProgress;
}

/**
 * Smooth step function for easing transitions
 */
function smoothStep(t: number): number {
  // Clamp to 0-1
  const x = Math.max(0, Math.min(1, t));
  // Smooth step: 3x^2 - 2x^3
  return x * x * (3 - 2 * x);
}

/**
 * Simple seeded random number generator
 * Used for deterministic width variations based on distance
 */
export function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Calculate target width based on distance and biome
 */
export function calculateTargetWidth(
  distance: number,
  biome: BiomeType,
  lastNarrowDistance: number
): { width: number; isNarrow: boolean } {
  const config = BIOME_RIVER_WIDTHS[biome];
  const checkpoint = RIVER_WIDTH_CHECKPOINTS;

  // Use distance as seed for deterministic randomness
  const seed = Math.floor(distance / checkpoint.changeInterval);
  const random = seededRandom(seed);

  // Determine if this should be a narrow section
  const canBeNarrow = distance - lastNarrowDistance >= checkpoint.minNarrowGap;
  const shouldChange = random < checkpoint.changeProbability;

  if (shouldChange && canBeNarrow) {
    // Create a narrow section
    const narrowFactor = 0.3 + seededRandom(seed + 1) * 0.4; // 30-70% narrowing
    const narrowWidth = config.minWidth + (config.baseWidth - config.minWidth) * narrowFactor;
    return { width: narrowWidth, isNarrow: true };
  }

  // Apply random variation to base width
  const variation = (seededRandom(seed + 2) - 0.5) * 2 * config.variationScale;
  const variedWidth = config.baseWidth * (1 + variation);

  // Clamp to min/max
  const clampedWidth = Math.max(config.minWidth, Math.min(config.maxWidth, variedWidth));

  return { width: clampedWidth, isNarrow: false };
}

/**
 * Get biome-specific river width configuration
 */
export function getBiomeRiverWidth(biome: BiomeType) {
  return BIOME_RIVER_WIDTHS[biome];
}
