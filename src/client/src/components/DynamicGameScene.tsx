/**
 * Dynamic Game Scene
 * Example integration of dynamic river width with the game loop
 *
 * This component demonstrates how to use the dynamic river width system:
 * - Initializes river width on game start
 * - Updates river width based on distance traveled
 * - Passes dynamic lane positions to spawner and input systems
 * - Renders the environment with dynamic width
 */

import { useRef, useCallback, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import type { BiomeType, GameMode, Lane } from '../../../../game/types';
import { BIOME_COLORS } from '../../../../game/config';
import {
  useRiverWidthStore,
  getCurrentLanePositions,
} from '../../../../game/store';
import { DynamicRiverEnvironment } from './DynamicRiverEnvironment';
import { EntityRenderer } from './EntityRenderer';
import { useRiverWidth } from '../hooks/useRiverWidth';

interface DynamicGameSceneProps {
  /** Whether the game is currently playing */
  isPlaying: boolean;
  /** Current distance traveled (meters) */
  distance: number;
  /** Current biome */
  biome: BiomeType;
  /** Optional callback when river width changes */
  onWidthChange?: (width: number, isNarrow: boolean) => void;
}

/**
 * Dynamic Game Scene with river width support
 *
 * Usage:
 * ```tsx
 * function Game() {
 *   const { status, distance } = useGameStore();
 *   const [biome, setBiome] = useState<BiomeType>('forest');
 *
 *   return (
 *     <Canvas>
 *       <DynamicGameScene
 *         isPlaying={status === 'playing'}
 *         distance={distance}
 *         biome={biome}
 *         onWidthChange={(width, isNarrow) => {
 *           console.log(`River width: ${width}, narrow: ${isNarrow}`);
 *         }}
 *       />
 *     </Canvas>
 *   );
 * }
 * ```
 */
export function DynamicGameScene({
  isPlaying,
  distance,
  biome,
  onWidthChange,
}: DynamicGameSceneProps) {
  const lastWidth = useRef<number>(0);
  const lastNarrow = useRef<boolean>(false);

  // Use the river width hook for reactive updates
  const {
    width,
    lanePositions,
    isNarrow,
    getLaneX,
    boundaries,
  } = useRiverWidth({
    isPlaying,
    distance,
    biome,
  });

  // Notify when width changes
  useEffect(() => {
    if (width !== lastWidth.current || isNarrow !== lastNarrow.current) {
      lastWidth.current = width;
      lastNarrow.current = isNarrow;
      onWidthChange?.(width, isNarrow);
    }
  }, [width, isNarrow, onWidthChange]);

  return (
    <>
      {/* Dynamic river environment with responsive width */}
      <DynamicRiverEnvironment
        biome={biome}
        riverWidth={width}
        lanePositions={lanePositions}
        isNarrow={isNarrow}
      />

      {/* Entity renderer for player, obstacles, collectibles */}
      <EntityRenderer />

      {/* Optional: Fog that responds to biome */}
      <fog
        attach="fog"
        args={[BIOME_COLORS[biome].fog, 5, 25]}
      />
    </>
  );
}

/**
 * Hook for getting dynamic lane X position in game systems
 * Use this in spawner and input systems
 */
export function useDynamicLaneX(): (lane: Lane) => number {
  const store = useRiverWidthStore();

  return useCallback(
    (lane: Lane) => store.getLaneX(lane),
    [store]
  );
}

/**
 * Hook for getting current river boundaries
 * Use this for collision detection
 */
export function useDynamicBoundaries(): { left: number; right: number } {
  return useRiverWidthStore((state) => state.boundaries);
}

/**
 * Non-reactive getter for use in game loop systems
 * Call this inside useFrame or game update functions
 */
export function getDynamicLaneXImmediate(lane: Lane): number {
  const positions = getCurrentLanePositions();
  return positions[lane + 1];
}

export default DynamicGameScene;
