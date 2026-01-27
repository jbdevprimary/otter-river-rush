/**
 * River Width Hook
 * Integrates river width updates with the game loop
 */

import { useCallback, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  useRiverWidthStore,
  getCurrentLanePositions,
  getCurrentRiverWidth,
} from '@otter-river-rush/game-core/store';
import type { BiomeType } from '@otter-river-rush/types';

interface UseRiverWidthOptions {
  /** Whether the game is currently playing */
  isPlaying: boolean;
  /** Current distance traveled */
  distance: number;
  /** Current biome */
  biome: BiomeType;
}

interface UseRiverWidthResult {
  /** Current river width */
  width: number;
  /** Current lane positions */
  lanePositions: [number, number, number];
  /** Whether currently in a narrow section */
  isNarrow: boolean;
  /** Get X position for a specific lane */
  getLaneX: (lane: -1 | 0 | 1) => number;
  /** Check if a position is within river boundaries */
  isWithinBoundaries: (x: number) => boolean;
  /** River boundaries for collision */
  boundaries: { left: number; right: number };
}

/**
 * Hook for managing dynamic river width in the game
 *
 * Usage:
 * ```tsx
 * function GameScene() {
 *   const { width, lanePositions, isNarrow, getLaneX } = useRiverWidth({
 *     isPlaying: gameStatus === 'playing',
 *     distance,
 *     biome: currentBiome,
 *   });
 *
 *   return (
 *     <DynamicRiverEnvironment
 *       biome={currentBiome}
 *       riverWidth={width}
 *       lanePositions={lanePositions}
 *       isNarrow={isNarrow}
 *     />
 *   );
 * }
 * ```
 */
export function useRiverWidth({
  isPlaying,
  distance,
  biome,
}: UseRiverWidthOptions): UseRiverWidthResult {
  const store = useRiverWidthStore();

  // Initialize on game start
  useEffect(() => {
    if (isPlaying && distance === 0) {
      store.initialize(biome);
    }
  }, [isPlaying, distance, biome, store]);

  // Update biome when it changes
  useEffect(() => {
    if (store.currentBiome !== biome) {
      store.setBiome(biome);
    }
  }, [biome, store]);

  // Update river width based on distance (in game loop)
  useFrame((_, delta) => {
    if (!isPlaying) return;
    store.updateForDistance(distance, delta);
  });

  // Get lane X position with bounds checking
  const getLaneX = useCallback(
    (lane: -1 | 0 | 1): number => {
      return store.getLaneX(lane);
    },
    [store]
  );

  // Check if position is within boundaries
  const isWithinBoundaries = useCallback(
    (x: number): boolean => {
      return store.isWithinBoundaries(x);
    },
    [store]
  );

  return {
    width: store.currentWidth,
    lanePositions: store.lanePositions,
    isNarrow: store.isNarrow,
    getLaneX,
    isWithinBoundaries,
    boundaries: store.boundaries,
  };
}

/**
 * Lightweight hook that only subscribes to specific river width properties
 * Use this for components that only need certain values (better performance)
 */
export function useRiverWidthValue(): number {
  return useRiverWidthStore((state) => state.currentWidth);
}

export function useRiverLanePositions(): [number, number, number] {
  return useRiverWidthStore((state) => state.lanePositions);
}

export function useRiverBoundaries(): { left: number; right: number } {
  return useRiverWidthStore((state) => state.boundaries);
}

export function useIsNarrowSection(): boolean {
  return useRiverWidthStore((state) => state.isNarrow);
}

/**
 * Non-reactive getters for use in game systems
 * These don't cause re-renders - use inside useFrame or game loops
 */
export { getCurrentLanePositions, getCurrentRiverWidth };

export function getDynamicLaneX(lane: -1 | 0 | 1): number {
  const positions = getCurrentLanePositions();
  return positions[lane + 1];
}
