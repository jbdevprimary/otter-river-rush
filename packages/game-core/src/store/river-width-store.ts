/**
 * River Width State Store
 * Manages dynamic river width transitions and state
 */

import { create } from 'zustand';
import {
  BIOME_RIVER_WIDTHS,
  RIVER_WIDTH_CHECKPOINTS,
  calculateTargetWidth,
  calculateLanePositions,
  calculateRiverBoundaries,
  interpolateWidth,
} from '../config';

/**
 * Biome type (duplicated to avoid import chain issues)
 */
type BiomeType = 'forest' | 'canyon' | 'arctic' | 'tropical' | 'volcanic';

/**
 * River width state properties
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

export interface RiverWidthStore extends RiverWidthState {
  /** Current biome affecting river width */
  currentBiome: BiomeType;
  /** Distance when last narrow section ended */
  lastNarrowEndDistance: number;
  /** Calculated lane positions based on current width */
  lanePositions: [number, number, number];
  /** River boundaries for collision */
  boundaries: { left: number; right: number };

  // Actions
  /** Initialize river width for a new game */
  initialize: (biome: BiomeType) => void;
  /** Update river width based on distance traveled */
  updateForDistance: (distance: number, deltaTime: number) => void;
  /** Change biome and update base width */
  setBiome: (biome: BiomeType) => void;
  /** Force a specific width (for special events) */
  setTargetWidth: (width: number) => void;
  /** Get the current lane X position */
  getLaneX: (lane: -1 | 0 | 1) => number;
  /** Check if a position is within river boundaries */
  isWithinBoundaries: (x: number) => boolean;
  /** Reset to initial state */
  reset: () => void;
}

const DEFAULT_BIOME: BiomeType = 'forest';
const DEFAULT_WIDTH = BIOME_RIVER_WIDTHS[DEFAULT_BIOME].baseWidth;

export const useRiverWidthStore = create<RiverWidthStore>((set, get) => ({
  // Initial state
  currentWidth: DEFAULT_WIDTH,
  targetWidth: DEFAULT_WIDTH,
  baseWidth: DEFAULT_WIDTH,
  lastCheckpointDistance: 0,
  isNarrow: false,
  transitionProgress: 1,
  currentBiome: DEFAULT_BIOME,
  lastNarrowEndDistance: 0,
  lanePositions: calculateLanePositions(DEFAULT_WIDTH),
  boundaries: calculateRiverBoundaries(DEFAULT_WIDTH),

  // Actions
  initialize: (biome: BiomeType) => {
    const config = BIOME_RIVER_WIDTHS[biome];
    const width = config.baseWidth;
    set({
      currentWidth: width,
      targetWidth: width,
      baseWidth: width,
      lastCheckpointDistance: 0,
      isNarrow: false,
      transitionProgress: 1,
      currentBiome: biome,
      lastNarrowEndDistance: 0,
      lanePositions: calculateLanePositions(width),
      boundaries: calculateRiverBoundaries(width),
    });
  },

  updateForDistance: (distance: number, deltaTime: number) => {
    const state = get();
    const checkpoint = RIVER_WIDTH_CHECKPOINTS;

    // Check if we've reached a new checkpoint
    const currentCheckpoint = Math.floor(distance / checkpoint.changeInterval) * checkpoint.changeInterval;

    if (currentCheckpoint > state.lastCheckpointDistance) {
      // Calculate new target width
      const result = calculateTargetWidth(
        distance,
        state.currentBiome,
        state.lastNarrowEndDistance
      );

      // Start transition to new width
      set({
        targetWidth: result.width,
        isNarrow: result.isNarrow,
        lastCheckpointDistance: currentCheckpoint,
        transitionProgress: 0,
      });
    }

    // Update transition progress
    if (state.transitionProgress < 1) {
      const progressIncrement = deltaTime / checkpoint.transitionDuration;
      const newProgress = Math.min(1, state.transitionProgress + progressIncrement);

      // Calculate interpolated width
      const newWidth = interpolateWidth(
        state.currentWidth,
        state.targetWidth,
        newProgress
      );

      // Update lane positions and boundaries
      const newLanePositions = calculateLanePositions(newWidth);
      const newBoundaries = calculateRiverBoundaries(newWidth);

      // Track when narrow section ends
      let lastNarrowEnd = state.lastNarrowEndDistance;
      if (state.isNarrow && newProgress >= 1) {
        lastNarrowEnd = distance;
      }

      set({
        currentWidth: newWidth,
        transitionProgress: newProgress,
        lanePositions: newLanePositions,
        boundaries: newBoundaries,
        lastNarrowEndDistance: lastNarrowEnd,
      });
    }
  },

  setBiome: (biome: BiomeType) => {
    const config = BIOME_RIVER_WIDTHS[biome];

    // Start transition to new biome's base width
    set({
      currentBiome: biome,
      baseWidth: config.baseWidth,
      targetWidth: config.baseWidth,
      transitionProgress: 0,
    });
  },

  setTargetWidth: (width: number) => {
    set({
      targetWidth: width,
      transitionProgress: 0,
    });
  },

  getLaneX: (lane: -1 | 0 | 1) => {
    const state = get();
    return state.lanePositions[lane + 1];
  },

  isWithinBoundaries: (x: number) => {
    const state = get();
    return x >= state.boundaries.left && x <= state.boundaries.right;
  },

  reset: () => {
    const width = DEFAULT_WIDTH;
    set({
      currentWidth: width,
      targetWidth: width,
      baseWidth: width,
      lastCheckpointDistance: 0,
      isNarrow: false,
      transitionProgress: 1,
      currentBiome: DEFAULT_BIOME,
      lastNarrowEndDistance: 0,
      lanePositions: calculateLanePositions(width),
      boundaries: calculateRiverBoundaries(width),
    });
  },
}));

/**
 * Hook to get the current lane X position
 * Use this instead of the static getLaneX function
 */
export function useDynamicLaneX(lane: -1 | 0 | 1): number {
  return useRiverWidthStore((state) => state.lanePositions[lane + 1]);
}

/**
 * Get current river width (non-reactive)
 */
export function getCurrentRiverWidth(): number {
  return useRiverWidthStore.getState().currentWidth;
}

/**
 * Get current lane positions (non-reactive)
 */
export function getCurrentLanePositions(): [number, number, number] {
  return useRiverWidthStore.getState().lanePositions;
}

/**
 * Get current river boundaries (non-reactive)
 */
export function getCurrentBoundaries(): { left: number; right: number } {
  return useRiverWidthStore.getState().boundaries;
}
