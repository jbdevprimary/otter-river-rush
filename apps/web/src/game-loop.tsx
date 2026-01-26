/**
 * Fixed Timestep Game Loop
 *
 * Implements deterministic physics with the accumulator pattern:
 * - Fixed timestep of 16.67ms (60 FPS target)
 * - Accumulator pattern for consistent physics updates
 * - Interpolation for smooth rendering between physics steps
 * - Handles variable frame rates gracefully
 */

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

import {
  playCoinPickup,
  playGemPickup,
  playHit,
  playNearMiss,
  stopMusic,
} from '@otter-river-rush/audio';
import { GAME_CONFIG, VISUAL } from '@otter-river-rush/config';
import { isPowerUpActive } from '@otter-river-rush/state';
import type { GameMode, PositionComponent } from '@otter-river-rush/types';
import {
  type CollisionHandlers,
  createInputState,
  createSpawnerState,
  updateAnimation,
  updateCleanup,
  updateCollision,
  updateMovement,
  updateParticles,
  updatePlayerInput,
  updateSpawner,
  queries,
} from '@otter-river-rush/core';
import { useGameStore } from '@otter-river-rush/state';

// ============================================================================
// Fixed Timestep Constants
// ============================================================================
/** Fixed physics timestep in milliseconds (16.67ms = 60 FPS) */
export const FIXED_TIMESTEP_MS = 1000 / 60;
/** Fixed physics timestep in seconds for physics calculations */
export const FIXED_TIMESTEP_S = FIXED_TIMESTEP_MS / 1000;
/** Maximum accumulated time to prevent spiral of death (5 frames worth) */
export const MAX_ACCUMULATED_TIME_MS = FIXED_TIMESTEP_MS * 5;

// ============================================================================
// Interpolation State for Smooth Rendering
// ============================================================================
/**
 * Stores previous frame positions for all entities
 * Used to interpolate between physics steps for smooth rendering
 */
export interface InterpolationState {
  /** Previous positions keyed by entity identifier */
  previousPositions: Map<string, PositionComponent>;
  /** Current interpolation alpha (0-1) */
  alpha: number;
}

/**
 * Create initial interpolation state
 */
export function createInterpolationState(): InterpolationState {
  return {
    previousPositions: new Map(),
    alpha: 0,
  };
}

/**
 * Store current positions as previous positions before physics update
 */
export function storePreviousPositions(state: InterpolationState): void {
  state.previousPositions.clear();

  // Store player position
  for (const entity of queries.player.entities) {
    if (entity.position) {
      state.previousPositions.set('player', { ...entity.position });
    }
  }

  // Store obstacle positions
  let obstacleIndex = 0;
  for (const entity of queries.obstacles.entities) {
    if (entity.position && !entity.destroyed) {
      state.previousPositions.set(`obstacle-${obstacleIndex}`, { ...entity.position });
      obstacleIndex++;
    }
  }

  // Store collectible positions
  let collectibleIndex = 0;
  for (const entity of queries.collectibles.entities) {
    if (entity.position && !entity.collected) {
      state.previousPositions.set(`collectible-${collectibleIndex}`, { ...entity.position });
      collectibleIndex++;
    }
  }
}

/**
 * Linear interpolation between two numbers
 */
export function lerpNumber(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// ============================================================================
// Callback Types
// ============================================================================
export type NearMissCallback = (
  position: { x: number; y: number; z: number },
  bonus: number
) => void;

export type CollectionCallback = (
  position: { x: number; y: number; z: number },
  type: 'coin' | 'gem'
) => void;

export type DamageCallback = () => void;

// ============================================================================
// Fixed Timestep Game Loop Props
// ============================================================================
export interface FixedTimestepGameLoopProps {
  spawnerStateRef: React.RefObject<ReturnType<typeof createSpawnerState>>;
  inputStateRef: React.RefObject<ReturnType<typeof createInputState>>;
  onNearMissRef: React.RefObject<NearMissCallback | null>;
  onCollectionRef?: React.RefObject<CollectionCallback | null>;
  onDamageRef?: React.RefObject<DamageCallback | null>;
  interpolationStateRef: React.RefObject<InterpolationState>;
}

/**
 * Run a single physics update step
 * Called with fixed delta time for deterministic physics
 */
function runPhysicsUpdate(
  fixedDeltaS: number,
  physicsTime: number,
  spawnerStateRef: React.RefObject<ReturnType<typeof createSpawnerState>>,
  inputStateRef: React.RefObject<ReturnType<typeof createInputState>>,
  onNearMissRef: React.RefObject<NearMissCallback | null>,
  onCollectionRef: React.RefObject<CollectionCallback | null> | undefined,
  onDamageRef: React.RefObject<DamageCallback | null> | undefined,
  currentStatus: 'playing',
  currentMode: GameMode
): void {
  // Update player input (lane switching)
  if (inputStateRef.current) {
    updatePlayerInput(inputStateRef.current, fixedDeltaS);
  }

  // Update entity movement with fixed delta
  updateMovement(fixedDeltaS);

  // Spawn new entities based on physics time
  if (spawnerStateRef.current) {
    updateSpawner(spawnerStateRef.current, physicsTime, true, currentMode);
  }

  // Collision detection and handling
  const handlers: CollisionHandlers = {
    onObstacleHit: () => {
      playHit();
      if (onDamageRef?.current) {
        onDamageRef.current();
      }
    },
    onCollectCoin: (value) => {
      playCoinPickup();
      useGameStore.getState().collectCoin(value);
      const [player] = queries.player.entities;
      if (player?.position && onCollectionRef?.current) {
        onCollectionRef.current(player.position, 'coin');
      }
    },
    onCollectGem: (value) => {
      playGemPickup();
      useGameStore.getState().collectGem(value);
      const [player] = queries.player.entities;
      if (player?.position && onCollectionRef?.current) {
        onCollectionRef.current(player.position, 'gem');
      }
    },
    onGameOver: () => {
      stopMusic();
      useGameStore.getState().endGame();
    },
    onNearMiss: (event) => {
      playNearMiss();
      useGameStore.getState().addNearMissBonus(event.bonus);
      if (onNearMissRef.current) {
        onNearMissRef.current(event.position, event.bonus);
      }
    },
  };

  updateCollision(currentStatus, handlers, currentMode);

  // Update distance progression with fixed delta
  useGameStore.getState().updateDistance(fixedDeltaS * VISUAL.camera.zoom * 0.5);
}

/**
 * Fixed Timestep Game Loop Component
 *
 * Uses the accumulator pattern to ensure physics updates happen at a consistent
 * rate regardless of frame rate. This provides:
 * 1. Deterministic physics across all devices
 * 2. Consistent gameplay feel
 * 3. Reproducible runs for testing
 * 4. Frame-rate independent logic
 */
export function FixedTimestepGameLoop({
  spawnerStateRef,
  inputStateRef,
  onNearMissRef,
  onCollectionRef,
  onDamageRef,
  interpolationStateRef,
}: FixedTimestepGameLoopProps) {
  const lastTimeRef = useRef<number>(0);
  const accumulatorRef = useRef<number>(0);
  const physicsTimeRef = useRef<number>(0);

  useFrame((state) => {
    const time = state.clock.elapsedTime * 1000; // Convert to ms

    // Initialize on first frame
    if (!lastTimeRef.current) {
      lastTimeRef.current = time;
      physicsTimeRef.current = time;
    }

    // Calculate delta time since last frame
    let deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;

    const gameState = useGameStore.getState();
    const currentStatus = gameState.status;
    const currentMode = gameState.mode;
    const gameSpeedMultiplier = gameState.accessibility?.gameSpeedMultiplier ?? 1;

    // Apply game speed multiplier for accessibility
    deltaTime *= gameSpeedMultiplier;

    // Apply slow motion power-up effect
    if (isPowerUpActive('slowMotion')) {
      deltaTime *= GAME_CONFIG.SLOW_MOTION_FACTOR;
    }

    // Only run game loop when playing
    if (currentStatus !== 'playing') {
      // Reset accumulator when not playing to avoid large jumps on resume
      accumulatorRef.current = 0;
      return;
    }

    // Cap accumulated time to prevent spiral of death
    // This happens when the game falls behind (e.g., browser tab in background)
    if (deltaTime > MAX_ACCUMULATED_TIME_MS) {
      deltaTime = MAX_ACCUMULATED_TIME_MS;
    }

    // Add frame time to accumulator
    accumulatorRef.current += deltaTime;

    // Store previous positions before physics updates for interpolation
    if (interpolationStateRef.current) {
      storePreviousPositions(interpolationStateRef.current);
    }

    // Fixed timestep physics updates
    // Run as many fixed updates as needed to catch up
    while (accumulatorRef.current >= FIXED_TIMESTEP_MS) {
      // Update physics time
      physicsTimeRef.current += FIXED_TIMESTEP_MS;

      // Run physics systems with fixed delta time
      runPhysicsUpdate(
        FIXED_TIMESTEP_S,
        physicsTimeRef.current,
        spawnerStateRef,
        inputStateRef,
        onNearMissRef,
        onCollectionRef,
        onDamageRef,
        currentStatus,
        currentMode
      );

      // Subtract fixed timestep from accumulator
      accumulatorRef.current -= FIXED_TIMESTEP_MS;
    }

    // Calculate interpolation alpha for smooth rendering
    // Alpha represents how far we are between physics steps (0-1)
    if (interpolationStateRef.current) {
      interpolationStateRef.current.alpha = accumulatorRef.current / FIXED_TIMESTEP_MS;
    }

    // Update non-physics systems that can use variable delta time
    updateAnimation(currentStatus);
    updateParticles(deltaTime);
    updateCleanup();

    // Update UI-related state
    useGameStore.getState().updateBiome();
    useGameStore.getState().checkComboTimeout();
    useGameStore.getState().checkPowerUpExpiration();
  });

  return null;
}

/**
 * Legacy Game Loop Component (variable timestep)
 * Kept for backward compatibility, but FixedTimestepGameLoop is preferred
 */
export interface LegacyGameLoopProps {
  spawnerStateRef: React.RefObject<ReturnType<typeof createSpawnerState>>;
  inputStateRef: React.RefObject<ReturnType<typeof createInputState>>;
  onNearMissRef: React.RefObject<NearMissCallback | null>;
  onCollectionRef?: React.RefObject<CollectionCallback | null>;
  onDamageRef?: React.RefObject<DamageCallback | null>;
}

export function LegacyGameLoop({
  spawnerStateRef,
  inputStateRef,
  onNearMissRef,
  onCollectionRef,
  onDamageRef,
}: LegacyGameLoopProps) {
  const lastTimeRef = useRef<number>(0);

  useFrame((state) => {
    const time = state.clock.elapsedTime * 1000; // Convert to ms

    if (!lastTimeRef.current) {
      lastTimeRef.current = time;
    }

    const rawDeltaTime = (time - lastTimeRef.current) / 1000; // Convert to seconds
    lastTimeRef.current = time;

    const gameState = useGameStore.getState();
    const currentStatus = gameState.status;
    const currentMode = gameState.mode;
    const gameSpeedMultiplier = gameState.accessibility?.gameSpeedMultiplier ?? 1;

    // Apply game speed multiplier for accessibility
    let deltaTime = rawDeltaTime * gameSpeedMultiplier;

    // Apply slow motion power-up effect
    if (isPowerUpActive('slowMotion')) {
      deltaTime *= GAME_CONFIG.SLOW_MOTION_FACTOR;
    }

    // Run game systems only when playing
    if (currentStatus === 'playing') {
      if (inputStateRef.current) {
        updatePlayerInput(inputStateRef.current, deltaTime);
      }
      updateMovement(deltaTime);
      updateAnimation(currentStatus);
      if (spawnerStateRef.current) {
        updateSpawner(spawnerStateRef.current, time, true, currentMode);
      }

      const handlers: CollisionHandlers = {
        onObstacleHit: () => {
          playHit();
          if (onDamageRef?.current) {
            onDamageRef.current();
          }
        },
        onCollectCoin: (value) => {
          playCoinPickup();
          useGameStore.getState().collectCoin(value);
          const [player] = queries.player.entities;
          if (player?.position && onCollectionRef?.current) {
            onCollectionRef.current(player.position, 'coin');
          }
        },
        onCollectGem: (value) => {
          playGemPickup();
          useGameStore.getState().collectGem(value);
          const [player] = queries.player.entities;
          if (player?.position && onCollectionRef?.current) {
            onCollectionRef.current(player.position, 'gem');
          }
        },
        onGameOver: () => {
          stopMusic();
          useGameStore.getState().endGame();
        },
        onNearMiss: (event) => {
          playNearMiss();
          useGameStore.getState().addNearMissBonus(event.bonus);
          if (onNearMissRef.current) {
            onNearMissRef.current(event.position, event.bonus);
          }
        },
      };
      updateCollision(currentStatus, handlers, currentMode);

      updateParticles(deltaTime * 1000);
      updateCleanup();

      useGameStore.getState().updateDistance(deltaTime * VISUAL.camera.zoom * 0.5);
      useGameStore.getState().updateBiome();
      useGameStore.getState().checkComboTimeout();
      useGameStore.getState().checkPowerUpExpiration();
    }
  });

  return null;
}
