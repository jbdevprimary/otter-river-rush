/**
 * Visual Constants - Single Source of Truth
 * ALL visual properties defined here
 * Used by BOTH runtime rendering AND e2e testing
 */

import type { Lane } from '../types';

export const VISUAL = {
  // Screen & Canvas
  screen: {
    width: 900,
    height: 600,
    aspectRatio: 16 / 9,
  },

  // Camera
  camera: {
    position: { x: 0, y: 0, z: 10 },
    fov: 75,
    near: 0.1,
    far: 1000,
    zoom: 50, // Orthographic zoom
  },

  // Lanes (3-lane system)
  lanes: {
    positions: [-2, 0, 2], // x positions for left, center, right
    width: 1.5,
  },

  // Entity Scales (CRITICAL - makes models visible!)
  scales: {
    otter: 2.0, // Player needs to be big and visible!
    rock: 1.5, // Obstacles clearly visible
    coin: 0.8, // Collectibles medium size
    gem: 1.0, // Gems slightly larger than coins
    particle: 0.05, // Tiny particles
    decoration: 1.2, // Decorations (lily pads, reeds, etc.)
    tree: 2.0, // Trees along riverbank
  },

  // Entity Positions (Y-axis)
  positions: {
    player: -3, // Player at bottom of screen
    spawnY: 8, // Where obstacles/collectibles spawn (top)
    despawnY: -10, // Where entities are removed (bottom)
  },

  // Colors
  colors: {
    background: '#0a1628',
    river: '#1e3a5f',
    fog: '#0f172a',
    particle: {
      coin: '#ffd700',
      gem: '#ff1493',
      hit: '#ff6b6b',
    },
  },

  // Lighting
  lighting: {
    ambient: {
      intensity: 0.9,
      color: '#ffffff',
    },
    directional: {
      main: {
        position: [10, 10, 5] as [number, number, number],
        intensity: 0.6,
      },
      fill: {
        position: [-10, -10, -5] as [number, number, number],
        intensity: 0.3,
      },
    },
  },

  // Fog
  fog: {
    color: '#0f172a',
    near: 5,
    far: 20,
  },

  // Z-layers (depth ordering)
  layers: {
    background: -5,
    river: -2,
    riverbank: -1.5, // Trees/decorations along edges
    lanes: -1,
    decorations: -0.5, // Lily pads, reeds on water surface
    player: 0,
    obstacles: 0,
    collectibles: 0.1,
    particles: 0.5,
    ui: 1,
  },
} as const;

/**
 * Game Flow Constants
 */
export const FLOW = {
  screens: {
    sequence: ['splash', 'menu', 'game', 'gameOver'] as const,
    initial: 'menu' as const, // Start at menu (splash disabled for dev)
  },

  timings: {
    splash: {
      duration: 2000, // 2 seconds
      fadeIn: 300,
      fadeOut: 500,
    },
    transition: {
      default: 300,
      fast: 150,
      slow: 600,
    },
  },
} as const;

/**
 * Physics Constants
 */
export const PHYSICS = {
  scrollSpeed: 5, // Base scroll speed
  spawnInterval: {
    obstacles: 2, // Spawn rock every 2 seconds
    collectibles: 3, // Spawn coin/gem every 3 seconds
    decorations: 1.5, // Spawn decoration every 1.5 seconds
  },
} as const;

/**
 * Difficulty Progression Constants
 * Controls how difficulty scales with distance traveled
 */
export const DIFFICULTY = {
  // Speed scaling
  speedIncreasePerInterval: 0.1, // +10% speed increase per interval
  speedIncreaseDistanceInterval: 500, // Every 500 meters
  maxSpeedMultiplier: 2.0, // Cap at 2x base speed

  // Spawn rate scaling
  baseObstacleSpawnInterval: 2, // Starting interval (seconds)
  minObstacleSpawnInterval: 1, // Minimum interval at max difficulty (seconds)
  spawnRateMaxDistance: 3000, // Distance at which spawn rate reaches minimum

  // Collectible spawn scaling (slower increase than obstacles)
  baseCollectibleSpawnInterval: 3,
  minCollectibleSpawnInterval: 1.5,
} as const;

/**
 * Helper: Get lane X position
 */
export function getLaneX(lane: Lane): number {
  return VISUAL.lanes.positions[lane + 1];
}

/**
 * Helper: Get model scale
 */
export function getModelScale(type: keyof typeof VISUAL.scales): number {
  return VISUAL.scales[type];
}
