/**
 * Spawner System
 * Spawns obstacles and collectibles at intervals
 * Supports dynamic spawn rate scaling based on difficulty progression
 * Uses biome-specific assets for visual variety
 * Uses seeded RNG for deterministic, reproducible game generation
 */

import { getLaneX, PHYSICS, VISUAL } from '../../config';
import {
  calculateCollectibleSpawnInterval,
  calculateObstacleSpawnInterval,
  useGameStore,
} from '../../store';
import type { BiomeType, GameMode, Lane, PowerUpType } from '../../types';
import { getGameRNG } from '../../utils';
import { spawn } from '../world';

/**
 * Obstacle variants per biome
 * Each biome uses different obstacle models for visual variety
 */
const BIOME_OBSTACLE_VARIANTS: Record<BiomeType, number[]> = {
  forest: [0, 1, 2, 6, 7, 8, 9], // Small rocks, stumps, logs
  canyon: [0, 1, 2, 3, 4, 5], // Various rock sizes
  arctic: [0, 1, 2], // Small rocks only (icy)
  tropical: [0, 1, 2, 6, 7], // Small rocks, stumps
  volcanic: [3, 4, 5], // Large/tall rocks
};

/**
 * Decoration variants per biome
 */
const BIOME_DECORATION_VARIANTS: Record<BiomeType, number[]> = {
  forest: [0, 1, 2, 3, 4, 5, 6, 7], // Lily pads, grass, mushrooms, flowers
  canyon: [0, 1], // Just lily pads (sparse)
  arctic: [0, 1], // Lily pads only
  tropical: [0, 1, 2, 3, 8], // Lily pads, grass, red flowers
  volcanic: [0, 1], // Sparse decorations
};

/**
 * Power-up types available for spawning
 */
const POWER_UP_TYPES: PowerUpType[] = ['shield', 'magnet', 'ghost', 'multiplier', 'slowMotion'];

export interface SpawnerState {
  lastObstacleSpawn: number;
  lastCollectibleSpawn: number;
  lastDecorationSpawn: number;
}

/**
 * Create spawner state
 */
export function createSpawnerState(): SpawnerState {
  return {
    lastObstacleSpawn: 0,
    lastCollectibleSpawn: 0,
    lastDecorationSpawn: 0,
  };
}

/**
 * Update spawner - spawn obstacles, collectibles, and decorations
 * Spawn intervals decrease (spawn rate increases) based on distance traveled
 * @param state Spawner state
 * @param now Current timestamp (milliseconds)
 * @param isPlaying Whether game is actively playing
 * @param gameMode Current game mode (defaults to 'classic')
 */
export function updateSpawner(
  state: SpawnerState,
  now: number,
  isPlaying: boolean,
  gameMode: GameMode = 'classic'
): void {
  if (!isPlaying) return;

  // Get current distance and biome for difficulty scaling and visual variety
  const { distance, currentBiome } = useGameStore.getState();
  const biome: BiomeType = currentBiome ?? 'forest';

  // Calculate dynamic spawn intervals based on distance
  const obstacleInterval = calculateObstacleSpawnInterval(distance);
  const collectibleInterval = calculateCollectibleSpawnInterval(distance);

  // Get biome-specific variants
  const obstacleVariants = BIOME_OBSTACLE_VARIANTS[biome];
  const decorationVariants = BIOME_DECORATION_VARIANTS[biome];

  // Get the seeded RNG for deterministic spawning
  const rng = getGameRNG();

  // Spawn obstacles (biome-specific variants) - skip in zen mode
  // Uses dynamic interval that decreases from 2s to 1s over 3000m
  if (gameMode !== 'zen' && now - state.lastObstacleSpawn > obstacleInterval * 1000) {
    const laneIndex = rng.int(0, 2) as Lane;
    const lane = getLaneX(laneIndex);
    // Pick a random variant from the biome's available obstacles
    const variant = rng.pick(obstacleVariants);
    spawn.rock(lane, VISUAL.positions.spawnY, variant);
    state.lastObstacleSpawn = now;
  }

  // Spawn collectibles (Kenney CC0 coins, crystals, hearts)
  // Uses dynamic interval that decreases from 3s to 1.5s over 3000m
  if (now - state.lastCollectibleSpawn > collectibleInterval * 1000) {
    const laneIndex = rng.int(0, 2) as Lane;
    const lane = getLaneX(laneIndex);
    const roll = rng.random();
    if (roll > 0.95) {
      // 5% chance for power-up (random type from 5 available)
      const powerUpType = rng.pick(POWER_UP_TYPES);
      spawn.powerUp(lane, VISUAL.positions.spawnY, powerUpType);
    } else if (roll > 0.7) {
      // 25% chance for gem/crystal
      const variant = rng.int(0, 2);
      spawn.gem(lane, VISUAL.positions.spawnY, variant);
    } else {
      // 70% chance for coin (gold/silver/bronze)
      const variant = rng.int(0, 2);
      spawn.coin(lane, VISUAL.positions.spawnY, variant);
    }
    state.lastCollectibleSpawn = now;
  }

  // Spawn decorations (lily pads, reeds, mushrooms, flowers - biome-specific)
  // Decoration spawn rate remains constant
  if (now - state.lastDecorationSpawn > PHYSICS.spawnInterval.decorations * 1000) {
    // Decorations spawn at random X positions (not locked to lanes)
    const x = rng.float(-3, 3); // Random position across the river
    // Pick a random variant from the biome's available decorations
    const variant = rng.pick(decorationVariants);
    spawn.decoration(x, VISUAL.positions.spawnY, variant);
    state.lastDecorationSpawn = now;
  }
}
