/**
 * Entity type definitions for ECS
 * Compatible with Miniplex ECS
 */

import type { AbstractMesh, TransformNode } from '@babylonjs/core';
import type { CollectibleType, PowerUpType } from '../game';

// Re-export types for convenience
export type { Vector3D, CollectibleType, PowerUpType } from '../game';

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
  mesh?: AbstractMesh | TransformNode;
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
  
  // Player-specific
  lane?: Lane;
  health?: number;
  speed?: number;
  handling?: number;
  invincible?: boolean;
  ghost?: boolean;
  
  // Obstacle-specific
  variant?: number;
  
  // State flags
  collected?: boolean;
  destroyed?: boolean;
  
  // Rendering
  three?: AbstractMesh | TransformNode; // Babylon.js mesh reference
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
