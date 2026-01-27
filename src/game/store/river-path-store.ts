/**
 * River Path Store using Zustand
 * Manages dynamic river path generation with curves, forks, and terrain
 */

import { create } from 'zustand';
import {
  createInitialGeneratorState,
  type GeneratorState,
  generateNextSegment,
  updateBiome,
} from '../river/path-generator';
import {
  findSegmentAtDistance,
  getLaneWorldPosition,
  getPathPointAtDistance,
} from '../river/path-utils';
import type {
  BranchChoice,
  GenerationConstraints,
  LaneIndex,
  LaneWorldPosition,
  PathQueryResult,
  RiverPathActions,
  RiverPathPoint,
  RiverPathState,
  RiverSegment,
  Waterfall,
  Whirlpool,
} from '../types/river-path';
import { createSeededRNG, type SeededRNG } from '../utils/seeded-random';

// ============================================================================
// Constants
// ============================================================================

/** Default generation constraints */
export const DEFAULT_CONSTRAINTS: GenerationConstraints = {
  minDistanceForFork: 500,
  minDistanceBetweenForks: 300,
  minSegmentLength: 30,
  maxSegmentLength: 80,
  sampleInterval: 2,
  lookaheadDistance: 400,
};

/** Distance behind player before segments are pruned */
const PRUNE_DISTANCE = 100;

// ============================================================================
// Initial State
// ============================================================================

const initialState: RiverPathState = {
  segments: [],
  generatedDistance: 0,
  whirlpools: [],
  waterfalls: [],
  currentBranch: 'undecided',
  currentForkId: null,
  seed: '',
};

// ============================================================================
// Store Type with Actions
// ============================================================================

export interface RiverPathStore extends RiverPathState, RiverPathActions {
  /** Internal RNG instance */
  _rng: SeededRNG | null;

  /** Generator state for path creation */
  _generatorState: GeneratorState | null;

  /** Generation constraints */
  constraints: GenerationConstraints;

  // Selectors
  /** Get path point at a specific distance */
  getPointAtDistance: (distance: number) => PathQueryResult | null;
  /** Get world position for lane and distance */
  getLanePosition: (distance: number, lane: LaneIndex) => LaneWorldPosition | null;
  /** Get current river width at player position */
  getRiverWidthAt: (distance: number) => number;
  /** Get the segment containing a distance */
  getSegmentAt: (distance: number) => RiverSegment | null;
  /** Check if player is in a fork decision zone */
  isInForkDecisionZone: (distance: number) => boolean;
  /** Get all path points in a range */
  getPathPointsInRange: (startDistance: number, endDistance: number) => RiverPathPoint[];
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useRiverPathStore = create<RiverPathStore>()((set, get) => ({
  // Initial state
  ...initialState,
  _rng: null,
  _generatorState: null,
  constraints: { ...DEFAULT_CONSTRAINTS },

  // ============================================================================
  // Actions
  // ============================================================================

  initialize: (seed: string) => {
    const rng = createSeededRNG(seed);
    const generatorState = createInitialGeneratorState();
    set({
      ...initialState,
      seed,
      _rng: rng,
      _generatorState: generatorState,
    });
  },

  generateTo: (targetDistance: number) => {
    const state = get();
    if (!state._rng || !state._generatorState) {
      console.warn('RiverPathStore: Cannot generate without initialization');
      return;
    }

    // Generate until we have enough lookahead
    const targetWithLookahead = targetDistance + state.constraints.lookaheadDistance;
    let currentGeneratorState = state._generatorState;

    while (currentGeneratorState.lastDistance < targetWithLookahead) {
      // Update biome based on distance
      currentGeneratorState = {
        ...currentGeneratorState,
        currentBiome: updateBiome(currentGeneratorState.lastDistance),
      };

      // Generate next segment using the actual generator
      const { segment, newState, whirlpool } = generateNextSegment(
        state._rng,
        currentGeneratorState,
        state.constraints
      );

      set((s) => ({
        segments: [...s.segments, segment],
        generatedDistance: newState.lastDistance,
        _generatorState: newState,
        // Add whirlpool if one was generated
        whirlpools: whirlpool ? [...s.whirlpools, whirlpool] : s.whirlpools,
      }));

      currentGeneratorState = newState;
    }
  },

  addSegment: (segment: RiverSegment) => {
    set((state) => ({
      segments: [...state.segments, segment],
      generatedDistance: Math.max(state.generatedDistance, segment.startDistance + segment.length),
    }));
  },

  addWhirlpool: (whirlpool: Whirlpool) => {
    set((state) => ({
      whirlpools: [...state.whirlpools, whirlpool],
    }));
  },

  addWaterfall: (waterfall: Waterfall) => {
    set((state) => ({
      waterfalls: [...state.waterfalls, waterfall],
    }));
  },

  setBranchChoice: (choice: BranchChoice) => {
    set({ currentBranch: choice });
  },

  pruneOldSegments: (playerDistance: number) => {
    const pruneThreshold = playerDistance - PRUNE_DISTANCE;

    set((state) => ({
      segments: state.segments.filter((seg) => seg.startDistance + seg.length > pruneThreshold),
      whirlpools: state.whirlpools.filter((wp) => wp.distance > pruneThreshold),
      waterfalls: state.waterfalls.filter(
        (wf) => wf.startDistance + wf.dropLength > pruneThreshold
      ),
    }));
  },

  reset: () => {
    set({
      ...initialState,
      _rng: null,
      _generatorState: null,
    });
  },

  // ============================================================================
  // Selectors
  // ============================================================================

  getPointAtDistance: (distance: number): PathQueryResult | null => {
    const state = get();
    return getPathPointAtDistance(state.segments, distance);
  },

  getLanePosition: (distance: number, lane: LaneIndex): LaneWorldPosition | null => {
    const state = get();
    return getLaneWorldPosition(state.segments, distance, lane);
  },

  getRiverWidthAt: (distance: number): number => {
    const state = get();
    const result = getPathPointAtDistance(state.segments, distance);
    return result?.point.width ?? 8; // Default width
  },

  getSegmentAt: (distance: number): RiverSegment | null => {
    const state = get();
    return findSegmentAtDistance(state.segments, distance);
  },

  isInForkDecisionZone: (distance: number): boolean => {
    const state = get();
    const segment = findSegmentAtDistance(state.segments, distance);
    if (!segment || segment.shape !== 'fork' || !segment.forkInfo) {
      return false;
    }
    return distance < segment.forkInfo.commitDistance;
  },

  getPathPointsInRange: (startDistance: number, endDistance: number): RiverPathPoint[] => {
    const state = get();
    const points: RiverPathPoint[] = [];

    for (const segment of state.segments) {
      const segmentEnd = segment.startDistance + segment.length;

      // Skip segments completely outside range
      if (segmentEnd < startDistance || segment.startDistance > endDistance) {
        continue;
      }

      // Add relevant path points from this segment
      for (const point of segment.pathPoints) {
        if (point.distance >= startDistance && point.distance <= endDistance) {
          points.push(point);
        }
      }
    }

    return points.sort((a, b) => a.distance - b.distance);
  },
}));

// ============================================================================
// Selector Hooks
// ============================================================================

/**
 * Get the current river width at a specific distance
 */
export function useRiverWidth(distance: number): number {
  return useRiverPathStore((state) => {
    const result = getPathPointAtDistance(state.segments, distance);
    return result?.point.width ?? 8;
  });
}

/**
 * Get the current flow speed at a specific distance
 */
export function useFlowSpeed(distance: number): number {
  return useRiverPathStore((state) => {
    const result = getPathPointAtDistance(state.segments, distance);
    return result?.point.flowSpeed ?? 1.0;
  });
}

/**
 * Get the current slope type at a specific distance
 */
export function useSlopeType(distance: number) {
  return useRiverPathStore((state) => {
    const result = getPathPointAtDistance(state.segments, distance);
    return result?.point.slopeType ?? 'flat';
  });
}

/**
 * Check if currently in a fork
 */
export function useIsInFork(): boolean {
  return useRiverPathStore((state) => state.currentForkId !== null);
}

/**
 * Get active whirlpools in a distance range
 */
export function useWhirlpoolsInRange(startDistance: number, endDistance: number): Whirlpool[] {
  return useRiverPathStore((state) =>
    state.whirlpools.filter((wp) => wp.distance >= startDistance && wp.distance <= endDistance)
  );
}

/**
 * Get active waterfalls in a distance range
 */
export function useWaterfallsInRange(startDistance: number, endDistance: number): Waterfall[] {
  return useRiverPathStore((state) =>
    state.waterfalls.filter(
      (wf) => wf.startDistance <= endDistance && wf.startDistance + wf.dropLength >= startDistance
    )
  );
}

// ============================================================================
// Scaling Hooks
// ============================================================================

/** Base river width for scale calculations */
const BASE_WIDTH = 8;
const OTTER_SCALE_MIN = 0.6;
const OTTER_SCALE_MAX = 1.5;

/**
 * Get otter scale based on river width at current distance
 * Inversely proportional: wider river = smaller otter
 */
export function useOtterScale(distance: number): number {
  return useRiverPathStore((state) => {
    const result = getPathPointAtDistance(state.segments, distance);
    const width = result?.point.width ?? BASE_WIDTH;

    // Inversely proportional to river width
    const scale = BASE_WIDTH / width;

    // Clamp to reasonable bounds
    return Math.min(Math.max(scale, OTTER_SCALE_MIN), OTTER_SCALE_MAX);
  });
}

/**
 * Get complete river scaling data at a distance
 * Returns otter scale, bank width, and section flags
 */
export interface RiverScalingData {
  otterScale: number;
  bankWidth: number;
  isNarrow: boolean;
  isWide: boolean;
}

export function useRiverScaling(distance: number): RiverScalingData {
  return useRiverPathStore((state) => {
    const result = getPathPointAtDistance(state.segments, distance);
    const width = result?.point.width ?? BASE_WIDTH;

    // Otter scale (inverse)
    const otterScale = Math.min(Math.max(BASE_WIDTH / width, OTTER_SCALE_MIN), OTTER_SCALE_MAX);

    // Bank width calculation
    const NARROW_THRESHOLD = 6;
    const WIDE_THRESHOLD = 12;
    const MAX_BANK = 4.0;
    const MIN_BANK = 0;

    let bankWidth: number;
    if (width >= WIDE_THRESHOLD) {
      bankWidth = MIN_BANK;
    } else if (width <= NARROW_THRESHOLD) {
      bankWidth = MAX_BANK;
    } else {
      const t = (width - NARROW_THRESHOLD) / (WIDE_THRESHOLD - NARROW_THRESHOLD);
      bankWidth = MAX_BANK + (MIN_BANK - MAX_BANK) * t;
    }

    return {
      otterScale,
      bankWidth,
      isNarrow: width <= 6,
      isWide: width >= 12,
    };
  });
}
