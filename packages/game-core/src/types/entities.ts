/**
 * Entity type definitions for ECS
 * Platform-agnostic - mesh references use unknown type
 * Platform packages can cast to their specific mesh types
 */

import type { CollectibleType, PowerUpType } from './game';

// Re-export for convenience
export type { CollectibleType, PowerUpType, Vector3D } from './game';

// Lane type (3-lane system: -1, 0, 1)
export type Lane = -1 | 0 | 1;

// Base entity components
export interface PositionComponent {
  x: number;
  y: number;
  z: number;
}

export interface VelocityComponent {
  x: number;
  y: number;
  z: number;
}

export interface ModelComponent {
  url?: string;
  scale: number;
  // Platform-agnostic mesh reference - platforms cast to their specific type
  // Babylon.js: AbstractMesh | TransformNode
  // Three.js: Object3D
  // React Native: native mesh reference
  mesh?: unknown;
}

/**
 * Animation state type for otter animations
 * - idle: Standing still
 * - swim: Default moving animation
 * - hit: Taking damage from obstacle
 * - collect: Picking up a collectible
 * - dodge: Lane change animation
 * - jump: Jumping over obstacle
 * - death: Game over animation
 */
export type AnimationState = 'idle' | 'swim' | 'hit' | 'collect' | 'dodge' | 'jump' | 'death';

export interface AnimationComponent {
  /** Current animation state to play */
  current: AnimationState;
  /** Previous animation state (for transition detection) */
  previous?: AnimationState;
  /** Timestamp when current animation started */
  startTime?: number;
  /** Duration of current animation (for one-shot animations like hit, collect) */
  duration?: number;
  /** Whether current animation is a one-shot (should return to default after) */
  isOneShot?: boolean;
  /** Animation to return to after one-shot completes */
  returnTo?: AnimationState;
  /** Crossfade duration in seconds */
  fadeDuration?: number;
  /** Optional URL mapping for animation clips */
  urls?: Record<string, string>;
}

export interface ColliderComponent {
  width: number;
  height: number;
  depth: number;
}

export interface CollectibleComponent {
  type: CollectibleType;
  value: number;
}

export interface PowerUpComponent {
  type: PowerUpType;
  duration: number;
}

export interface ParticleComponent {
  color: string;
  lifetime: number;
  size: number;
}

/**
 * Jump state component for tracking jump mechanics
 */
export interface JumpComponent {
  /** Whether the entity is currently in a jump */
  isJumping: boolean;
  /** Current vertical velocity from jump */
  verticalVelocity: number;
  /** Timestamp when jump started (for cooldown tracking) */
  jumpStartTime: number;
  /** Base Z position (river surface level) - the ground level to return to */
  groundZ: number;
  /** Whether currently in the landing phase (for splash effect) */
  isLanding: boolean;
}

/**
 * River path component for entities that follow the curved river path
 * Used to calculate world position from distance along river + lane offset
 */
export interface RiverPathComponent {
  /** Distance along the river (in game Y units) */
  distance: number;
  /** Lane offset from river center (-1, 0, 1 for 3-lane, or actual world offset) */
  laneOffset: number;
}

// Entity type
export interface Entity {
  // Core components
  position?: PositionComponent;
  velocity?: VelocityComponent;
  model?: ModelComponent;
  animation?: AnimationComponent;
  collider?: ColliderComponent;
  jump?: JumpComponent;

  // River path following (optional - entities with this follow curved path)
  riverPath?: RiverPathComponent;

  // Entity type flags
  player?: boolean;
  obstacle?: boolean;
  collectible?: CollectibleComponent;
  powerUp?: PowerUpComponent;
  particle?: ParticleComponent;
  enemy?: boolean;
  decoration?: boolean;

  // Player-specific
  lane?: Lane;
  health?: number;
  speed?: number;
  handling?: number;
  invincible?: boolean;
  ghost?: boolean;
  characterId?: string;

  // Obstacle-specific
  variant?: number;

  // State flags
  collected?: boolean;
  destroyed?: boolean;

  // Platform-agnostic rendering reference
  // Platforms cast to their specific type (AbstractMesh, Object3D, etc.)
  three?: unknown;
}

// Entity queries (for Miniplex)
export interface EntityQueries {
  player: Entity[];
  enemies: Entity[];
  obstacles: Entity[];
  collectibles: Entity[];
  coins: Entity[];
  gems: Entity[];
  powerUps: Entity[];
  particles: Entity[];
  moving: Entity[];
  collidable: Entity[];
  collected: Entity[];
  destroyed: Entity[];
  renderable: Entity[];
}
