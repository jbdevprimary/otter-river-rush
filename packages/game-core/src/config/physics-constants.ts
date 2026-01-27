/**
 * Physics Constants
 * Movement, forces, and collision behavior
 */

export const PHYSICS_CONFIG = {
  // Core physics
  GRAVITY: 9.8,
  FRICTION: 0.98,
  AIR_RESISTANCE: 0.99,

  // Player movement
  PLAYER_ACCELERATION: 0.5,
  PLAYER_MAX_SPEED: 8,
  JUMP_FORCE: 15,

  // Scroll behavior
  SCROLL_SPEED: 5,
  SCROLL_ACCELERATION: 0.01,
  MAX_SCROLL_SPEED: 12,

  // Collision
  COLLISION_TOLERANCE: 0.1,
  SPAWN_GRACE_PERIOD_MS: 500, // No collision for first 500ms after spawn

  // Lane switching
  LANE_SWITCH_SPEED: 0.15,
  LANE_SWITCH_DURATION: 200, // milliseconds

  // Entity movement
  OBSTACLE_SPAWN_Y: 8,
  ENTITY_DESPAWN_Y: -10,
  PLAYER_Y_POSITION: -3,
} as const;

/**
 * Jump Physics Constants
 * Controls jump arc, timing, and effects
 */
export const JUMP_PHYSICS = {
  /** Initial upward velocity when jumping (units per second) */
  initialVelocity: 8,
  /** Gravity applied during jump (units per second squared) */
  gravity: 20,
  /** Cooldown between jumps in milliseconds */
  cooldownMs: 500,
  /** Maximum jump height (for visual reference) */
  maxHeight: 3,
  /** Minimum swipe distance to trigger jump (pixels) */
  swipeThreshold: 50,
  /** Height threshold below which landing effects trigger */
  landingThreshold: 0.1,
  /** Number of splash particles on landing */
  splashParticleCount: 8,
  /** Color for splash particles */
  splashColor: '#64b5f6',
} as const;
