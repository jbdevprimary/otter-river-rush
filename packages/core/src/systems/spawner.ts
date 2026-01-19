/**
 * Spawner System
 * Spawns obstacles and collectibles at intervals
 */

import { PHYSICS, VISUAL, getLaneX } from '@otter-river-rush/config';
import type { Lane } from '@otter-river-rush/types';
import { spawn } from '../world';

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
 * @param state Spawner state
 * @param now Current timestamp (milliseconds)
 * @param isPlaying Whether game is actively playing
 */
export function updateSpawner(
  state: SpawnerState,
  now: number,
  isPlaying: boolean
): void {
  if (!isPlaying) return;

  // DEBUG: Log spawner state every second
  const win = window as typeof window & { __lastSpawnerLog?: number };
  if (!win.__lastSpawnerLog || now - win.__lastSpawnerLog > 1000) {
    win.__lastSpawnerLog = now;
    console.log(`[Spawner] now=${now} lastObs=${state.lastObstacleSpawn} interval=${PHYSICS.spawnInterval.obstacles * 1000} diff=${now - state.lastObstacleSpawn}`);
  }

  // Spawn obstacles (7 Kenney CC0 variants)
  if (now - state.lastObstacleSpawn > PHYSICS.spawnInterval.obstacles * 1000) {
    const laneIndex = Math.floor(Math.random() * 3) as Lane;
    const lane = getLaneX(laneIndex);
    const variant = Math.floor(Math.random() * 7);
    spawn.rock(lane, VISUAL.positions.spawnY, variant);
    state.lastObstacleSpawn = now;
  }

  // Spawn collectibles (Kenney CC0 coins, crystals, hearts)
  if (now - state.lastCollectibleSpawn > PHYSICS.spawnInterval.collectibles * 1000) {
    const laneIndex = Math.floor(Math.random() * 3) as Lane;
    const lane = getLaneX(laneIndex);
    const roll = Math.random();
    if (roll > 0.9) {
      // 10% chance for power-up (heart)
      spawn.powerUp(lane, VISUAL.positions.spawnY);
    } else if (roll > 0.65) {
      // 25% chance for gem/crystal
      const variant = Math.floor(Math.random() * 3);
      spawn.gem(lane, VISUAL.positions.spawnY, variant);
    } else {
      // 65% chance for coin (gold/silver/bronze)
      const variant = Math.floor(Math.random() * 3);
      spawn.coin(lane, VISUAL.positions.spawnY, variant);
    }
    state.lastCollectibleSpawn = now;
  }

  // Spawn decorations (lily pads, reeds, etc.)
  if (now - state.lastDecorationSpawn > PHYSICS.spawnInterval.decorations * 1000) {
    // Decorations spawn at random X positions (not locked to lanes)
    const x = (Math.random() - 0.5) * 6; // Random position across the river
    const variant = Math.floor(Math.random() * 6); // 6 decoration variants
    spawn.decoration(x, VISUAL.positions.spawnY, variant);
    state.lastDecorationSpawn = now;
  }
}
