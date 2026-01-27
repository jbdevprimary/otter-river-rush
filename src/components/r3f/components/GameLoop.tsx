/**
 * Game Loop Component
 * Implements fixed timestep game loop using React Three Fiber's useFrame hook
 *
 * This component handles:
 * - Fixed timestep updates for deterministic physics (60 FPS target)
 * - Delta time accumulation for consistent gameplay across frame rates
 * - Game state checks (only runs when playing)
 */

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

// Fixed timestep for deterministic updates (60 FPS)
const FIXED_TIMESTEP = 1000 / 60; // 16.67ms

export interface GameLoopProps {
  /**
   * Whether the game loop should run
   */
  isPlaying: boolean;
  /**
   * Callback for each fixed timestep update
   * @param deltaSeconds - Delta time in seconds (fixed at ~0.0167s)
   */
  onUpdate: (deltaSeconds: number) => void;
}

/**
 * Fixed Timestep Game Loop Component
 *
 * Usage:
 * ```tsx
 * <GameLoop
 *   isPlaying={gameState === 'PLAYING'}
 *   onUpdate={(delta) => updateGame(delta)}
 * />
 * ```
 */
export function GameLoop({ isPlaying, onUpdate }: GameLoopProps) {
  const accumulatedTime = useRef(0);

  useFrame((_state, delta) => {
    if (!isPlaying) return;

    // delta is in seconds, convert to ms for accumulator
    const deltaMs = delta * 1000;
    accumulatedTime.current += deltaMs;

    // Fixed timestep updates - may run multiple times per frame to catch up
    while (accumulatedTime.current >= FIXED_TIMESTEP) {
      onUpdate(FIXED_TIMESTEP / 1000); // Pass delta in seconds
      accumulatedTime.current -= FIXED_TIMESTEP;
    }
  });

  // This component renders nothing - it's just logic
  return null;
}

/**
 * Hook version for custom game loop logic
 * Use this if you need more control over the game loop
 */
export function useGameLoop(isPlaying: boolean, onUpdate: (deltaSeconds: number) => void) {
  const accumulatedTime = useRef(0);

  useFrame((_state, delta) => {
    if (!isPlaying) return;

    const deltaMs = delta * 1000;
    accumulatedTime.current += deltaMs;

    while (accumulatedTime.current >= FIXED_TIMESTEP) {
      onUpdate(FIXED_TIMESTEP / 1000);
      accumulatedTime.current -= FIXED_TIMESTEP;
    }
  });
}
