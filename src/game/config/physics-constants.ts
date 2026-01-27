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
 * Otter Physics Constants
 * Realistic movement, rotation, and animation parameters
 */
export const OTTER_PHYSICS = {
  // Lane change momentum
  laneChange: {
    acceleration: 25, // How fast otter accelerates toward target lane
    maxVelocity: 12, // Maximum horizontal velocity
    damping: 0.92, // Velocity damping when not accelerating (lower = more friction)
    snapThreshold: 0.05, // Distance threshold to snap to target position
    velocitySnapThreshold: 0.1, // Velocity threshold to consider otter stopped
  },

  // Rotation angles (radians)
  rotation: {
    // Tilt (roll) when changing lanes - leans into the turn
    maxTilt: Math.PI / 6, // 30 degrees max roll
    tiltResponsiveness: 8, // How fast tilt responds to movement
    tiltDamping: 0.85, // How fast tilt returns to neutral

    // Pitch based on speed/acceleration
    maxPitch: Math.PI / 12, // 15 degrees max pitch
    pitchResponsiveness: 4, // How fast pitch responds to speed changes
    pitchDamping: 0.9, // How fast pitch returns to neutral

    // Yaw (turn direction) when changing lanes
    maxYaw: Math.PI / 8, // 22.5 degrees max yaw
    yawResponsiveness: 6, // How fast yaw responds to direction
    yawDamping: 0.88, // How fast yaw returns to neutral

    // Rotation interpolation (lower = smoother, higher = snappier)
    lerpSpeed: 8,
  },

  // Water bobbing animation
  bobbing: {
    frequency: 2.5, // Oscillations per second
    amplitude: 0.08, // Vertical displacement amount
    phaseOffset: 0, // Starting phase offset
  },

  // Idle animation (subtle movements when not moving)
  idle: {
    swayFrequency: 0.8, // Slow side-to-side sway
    swayAmplitude: Math.PI / 36, // 5 degrees
    breathFrequency: 1.2, // Breathing rhythm
    breathAmplitude: 0.02, // Subtle vertical movement
    headBobFrequency: 1.5, // Occasional head bob
    headBobAmplitude: Math.PI / 24, // 7.5 degrees
  },
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
