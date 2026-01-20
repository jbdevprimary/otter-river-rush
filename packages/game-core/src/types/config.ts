/**
 * Configuration type definitions
 */

import type { PowerUpType } from './game';

// Re-export types for convenience
export type { BiomeType, PowerUpType } from './game';

export interface VisualConfig {
  screen: {
    width: number;
    height: number;
    aspectRatio: number;
  };
  camera: {
    position: { x: number; y: number; z: number };
    fov: number;
    near: number;
    far: number;
    zoom: number;
  };
  lanes: {
    positions: number[];
    width: number;
  };
  scales: {
    otter: number;
    rock: number;
    coin: number;
    gem: number;
    particle: number;
  };
  positions: {
    player: number;
    spawnY: number;
    despawnY: number;
  };
  colors: {
    background: string;
    river: string;
    fog: string;
    particle: {
      coin: string;
      gem: string;
      hit: string;
    };
  };
  lighting: {
    ambient: {
      intensity: number;
      color: string;
    };
    directional: {
      main: {
        position: [number, number, number];
        intensity: number;
      };
      fill: {
        position: [number, number, number];
        intensity: number;
      };
    };
  };
  fog: {
    color: string;
    near: number;
    far: number;
  };
  layers: {
    background: number;
    river: number;
    lanes: number;
    player: number;
    obstacles: number;
    collectibles: number;
    particles: number;
    ui: number;
  };
}

export interface PhysicsConfig {
  gravity: number;
  scrollSpeed: number;
  playerAcceleration: number;
  playerMaxSpeed: number;
  jumpForce: number;
  spawnGracePeriodMs: number;
}

export interface GameConfig {
  PLAYER_INVULNERABILITY_TIME: number;
  OBSTACLE_SPAWN_INTERVAL: number;
  COLLECTIBLE_SPAWN_INTERVAL: number;
  POWER_UP_SPAWN_INTERVAL: number;
  DISTANCE_POINTS_PER_METER: number;
  COMBO_TIMEOUT_MS: number;
  NEAR_MISS_DISTANCE: number;
}

export interface BiomeConfig {
  [key: string]: {
    water: string;
    terrain: string;
    fog: string;
    sky: string;
  };
}

export interface ColorsConfig {
  biome: BiomeConfig;
  entities: {
    player: string;
    obstacle: string;
    coin: string;
    gem: string;
    powerUp: Record<PowerUpType, string>;
  };
}
