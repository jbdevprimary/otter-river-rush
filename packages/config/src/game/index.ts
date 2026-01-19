/**
 * Game constants - single source of truth
 */

import type { VisualConfig } from '@otter-river-rush/types';

/**
 * Core game configuration constants
 */
export const GAME_CONFIG = {
  // Canvas dimensions
  CANVAS_WIDTH: 900,
  CANVAS_HEIGHT: 600,

  // Lanes
  LANES: [-2, 0, 2] as const,
  LANE_WIDTH: 2,

  // Scroll speed
  BASE_SCROLL_SPEED: 5,
  MIN_SCROLL_SPEED: 3,
  MAX_SCROLL_SPEED: 12,

  // Difficulty
  DIFFICULTY_INCREASE_INTERVAL: 30000, // 30 seconds
  DIFFICULTY_INCREASE_RATE: 0.05,
  DISTANCE_PER_DIFFICULTY: 100, // meters

  // Player
  PLAYER_HEALTH: 3,
  PLAYER_INVULNERABILITY_TIME: 1000, // 1 second after hit
  TUTORIAL_DURATION: 30000, // 30 seconds invincible

  // Scoring
  COIN_VALUE: 10,
  GEM_VALUE: 50,
  DISTANCE_POINTS_PER_METER: 1,
  COMBO_BONUS_MULTIPLIER: 0.1,
  COMBO_TIMEOUT: 2000, // 2 seconds

  // Spawning
  OBSTACLE_SPAWN_INTERVAL: 2000, // milliseconds
  COLLECTIBLE_SPAWN_INTERVAL: 3000,
  POWER_UP_SPAWN_INTERVAL: 15000,
  SPAWN_GRACE_PERIOD: 1500, // Grace period before spawning obstacles (ms)

  // Power-ups
  POWER_UP_DURATION: 5000,
  SHIELD_DURATION: 5000,
  GHOST_DURATION: 5000,
  MAGNET_DURATION: 8000,
  MAGNET_RADIUS: 3,
  MULTIPLIER_DURATION: 10000,
  MULTIPLIER_VALUE: 2,
  SLOW_MOTION_DURATION: 5000,
  SLOW_MOTION_FACTOR: 0.5,

  // Particles
  PARTICLE_LIFETIME: 1000,
  PARTICLE_COUNT_COLLECT: 12,
  PARTICLE_COUNT_COLLISION: 8,
  PARTICLE_SPEED: 200,
  PARTICLE_SIZE: 4,

  // Biomes
  BIOME_DISTANCE: 500, // meters per biome
  BIOME_TRANSITION_TIME: 3000, // milliseconds

  // Animation
  ANIMATION_TRANSITION_TIME: 300, // milliseconds
  HIT_ANIMATION_DURATION: 500,
  JUMP_ANIMATION_DURATION: 400,
  COLLECT_ANIMATION_DURATION: 300,
  DODGE_ANIMATION_DURATION: 300,

  // Physics
  GRAVITY: 9.8,
  FRICTION: 0.98,
  AIR_RESISTANCE: 0.99,
  CLOSE_CALL_DISTANCE: 0.5,

  // Camera
  CAMERA_FOLLOW_SPEED: 0.1,
  CAMERA_SHAKE_DECAY: 0.9,
  CAMERA_SHAKE_INTENSITY_HIT: 0.3,
  CAMERA_SHAKE_INTENSITY_COLLECT: 0.1,

  // Visual
  FOG_NEAR: 5,
  FOG_FAR: 20,
  AMBIENT_LIGHT_INTENSITY: 0.9,
  DIRECTIONAL_LIGHT_INTENSITY: 0.6,

  // Performance
  MAX_PARTICLES: 100,
  MAX_OBSTACLES: 20,
  MAX_COLLECTIBLES: 15,
  ENTITY_CLEANUP_DISTANCE: -10,

  // Mobile
  SWIPE_THRESHOLD: 50, // pixels
  TOUCH_SENSITIVITY: 1.0,

  // Audio
  SFX_VOLUME: 0.5,
  MUSIC_VOLUME: 0.3,

  // Accessibility
  REDUCED_MOTION_SCALE: 0.5,
  HIGH_CONTRAST_ENABLED: false,
  COLORBLIND_MODE: 'none' as 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia',
} as const;

/**
 * Visual constants - single source of truth for rendering
 */
export const VISUAL: VisualConfig = {
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
    positions: [-2, 0, 2] as const,
    width: 1.5,
  },

  // Entity Scales
  scales: {
    otter: 2.0,
    rock: 1.5,
    coin: 0.8,
    gem: 1.0,
    particle: 0.05,
  },

  // Entity Positions (Y-axis)
  positions: {
    player: -3,
    spawnY: 8,
    despawnY: -10,
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
        position: [10, 10, 5] as const,
        intensity: 0.6,
      },
      fill: {
        position: [-10, -10, -5] as const,
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
    lanes: -1,
    player: 0,
    obstacles: 0,
    collectibles: 0.1,
    particles: 0.5,
    ui: 1,
  },
} as const;

/**
 * Physics constants
 */
export const PHYSICS = {
  scrollSpeed: 5,
  spawnInterval: {
    obstacles: 2,
    collectibles: 3,
  },
  spawnGracePeriodMs: 1500,
} as const;

/**
 * Game flow constants
 */
export const FLOW = {
  screens: {
    sequence: ['splash', 'menu', 'game', 'gameOver'] as const,
    initial: 'menu' as const,
  },

  timings: {
    splash: {
      duration: 2000,
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
 * Difficulty presets
 */
export const DIFFICULTY_PRESETS = {
  easy: {
    scrollSpeedMultiplier: 0.7,
    spawnRateMultiplier: 0.8,
    healthBonus: 1,
  },
  normal: {
    scrollSpeedMultiplier: 1.0,
    spawnRateMultiplier: 1.0,
    healthBonus: 0,
  },
  hard: {
    scrollSpeedMultiplier: 1.3,
    spawnRateMultiplier: 1.2,
    healthBonus: -1,
  },
  expert: {
    scrollSpeedMultiplier: 1.5,
    spawnRateMultiplier: 1.5,
    healthBonus: -2,
  },
} as const;

/**
 * Game modes
 */
export const GAME_MODES = {
  classic: 'classic',
  time_trial: 'time_trial',
  zen: 'zen',
  daily_challenge: 'daily_challenge',
} as const;

/**
 * Helper: Get lane X position
 */
export function getLaneX(lane: -1 | 0 | 1): number {
  return VISUAL.lanes.positions[lane + 1] ?? 0;
}

/**
 * Helper: Get model scale
 */
export function getModelScale(type: keyof typeof VISUAL.scales): number {
  return VISUAL.scales[type];
}

/**
 * Helper: Get lane from X position
 */
export function getLaneFromX(x: number): -1 | 0 | 1 {
  const lanes = VISUAL.lanes.positions;
  let closestLane: -1 | 0 | 1 = 0;
  let closestDistance = Infinity;

  for (let i = 0; i < lanes.length; i++) {
    const distance = Math.abs(x - (lanes[i] ?? 0));
    if (distance < closestDistance) {
      closestDistance = distance;
      closestLane = (i - 1) as -1 | 0 | 1;
    }
  }

  return closestLane;
}
