/**
 * Spawner System
 * Spawns obstacles and collectibles at intervals
 * Supports dynamic spawn rate scaling based on difficulty progression
 * Uses biome-specific assets for visual variety
 */

import { PHYSICS, VISUAL, getLaneX } from '../../config';
import {
  calculateCollectibleSpawnInterval,
  calculateObstacleSpawnInterval,
  useGameStore,
} from '../../store';
import type { BiomeType, GameMode, Lane, PowerUpType } from '../../types';
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

/**
 * Get a random power-up type
 */
function getRandomPowerUpType(): PowerUpType {
  return POWER_UP_TYPES[Math.floor(Math.random() * POWER_UP_TYPES.length)];
}

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

  // DEBUG: Log spawner state every second
  const win =
    typeof window !== 'undefined' ? (window as typeof window & { __lastSpawnerLog?: number }) : null;
  if (win && (!win.__lastSpawnerLog || now - win.__lastSpawnerLog > 1000)) {
    win.__lastSpawnerLog = now;
    console.log(
      `[Spawner] mode=${gameMode} dist=${distance.toFixed(0)}m obsInterval=${obstacleInterval.toFixed(2)}s colInterval=${collectibleInterval.toFixed(2)}s`
    );
  }

  // Spawn obstacles (biome-specific variants) - skip in zen mode
  // Uses dynamic interval that decreases from 2s to 1s over 3000m
  if (gameMode !== 'zen' && now - state.lastObstacleSpawn > obstacleInterval * 1000) {
    const laneIndex = Math.floor(Math.random() * 3) as Lane;
    const lane = getLaneX(laneIndex);
    // Pick a random variant from the biome's available obstacles
    const variant = obstacleVariants[Math.floor(Math.random() * obstacleVariants.length)];
    spawn.rock(lane, VISUAL.positions.spawnY, variant);
    state.lastObstacleSpawn = now;
  }

  // Spawn collectibles (Kenney CC0 coins, crystals, hearts)
  // Uses dynamic interval that decreases from 3s to 1.5s over 3000m
  if (now - state.lastCollectibleSpawn > collectibleInterval * 1000) {
    const laneIndex = Math.floor(Math.random() * 3) as Lane;
    const lane = getLaneX(laneIndex);
    const roll = Math.random();
    if (roll > 0.95) {
      // 5% chance for power-up (random type from 5 available)
      const powerUpType = getRandomPowerUpType();
      spawn.powerUp(lane, VISUAL.positions.spawnY, powerUpType);
    } else if (roll > 0.7) {
      // 25% chance for gem/crystal
      const variant = Math.floor(Math.random() * 3);
      spawn.gem(lane, VISUAL.positions.spawnY, variant);
    } else {
      // 70% chance for coin (gold/silver/bronze)
      const variant = Math.floor(Math.random() * 3);
      spawn.coin(lane, VISUAL.positions.spawnY, variant);
    }
    state.lastCollectibleSpawn = now;
  }

  // Spawn decorations (lily pads, reeds, mushrooms, flowers - biome-specific)
  // Decoration spawn rate remains constant
  if (now - state.lastDecorationSpawn > PHYSICS.spawnInterval.decorations * 1000) {
    // Decorations spawn at random X positions (not locked to lanes)
    const x = (Math.random() - 0.5) * 6; // Random position across the river
    // Pick a random variant from the biome's available decorations
    const variant = decorationVariants[Math.floor(Math.random() * decorationVariants.length)];
    spawn.decoration(x, VISUAL.positions.spawnY, variant);
    state.lastDecorationSpawn = now;
  }
}
