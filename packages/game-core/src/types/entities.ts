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

export interface AnimationComponent {
  current: string;
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

// Entity type
export interface Entity {
  // Core components
  position?: PositionComponent;
  velocity?: VelocityComponent;
  model?: ModelComponent;
  animation?: AnimationComponent;
  collider?: ColliderComponent;

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
