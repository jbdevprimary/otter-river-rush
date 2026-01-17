/**
 * Event type definitions
 */

import type { Entity } from '../entities';
import type { PowerUpType, Vector3D } from '../game';

/**
 * Collision event
 */
export interface CollisionEvent {
  entityA: Entity;
  entityB: Entity;
  point: Vector3D;
  normal: Vector3D;
  penetration: number;
}

/**
 * Score event
 */
export interface ScoreEvent {
  points: number;
  multiplier: number;
  combo: number;
  reason: 'distance' | 'coin' | 'gem' | 'combo' | 'achievement' | 'close_call';
}

/**
 * Achievement event
 */
export interface AchievementEvent {
  id: string;
  name: string;
  description: string;
  timestamp: number;
}

/**
 * Power-up event
 */
export interface PowerUpEvent {
  type: PowerUpType;
  action: 'activated' | 'deactivated' | 'collected';
  duration?: number;
  timestamp: number;
}

/**
 * Particle effect event
 */
export interface ParticleEffectEvent {
  type: 'collect' | 'hit' | 'powerup' | 'splash' | 'trail';
  position: Vector3D;
  velocity: Vector3D;
  color: string;
  size: number;
  lifetime: number;
  gravity?: number;
}

/**
 * Audio event
 */
export interface AudioEvent {
  sound:
    | 'collect'
    | 'hit'
    | 'powerup'
    | 'jump'
    | 'menu'
    | 'achievement'
    | 'game_over'
    | 'level_up';
  volume?: number;
  pitch?: number;
}

/**
 * Visual effect event
 */
export interface VisualEffectEvent {
  type: 'bloom' | 'glow' | 'trail' | 'ripple' | 'explosion' | 'flash';
  position: Vector3D;
  duration: number;
  intensity: number;
}

/**
 * Input state
 */
export interface InputState {
  left: boolean;
  right: boolean;
  jump: boolean;
  pause: boolean;
  lastInputTime: number;
}

/**
 * Camera state
 */
export interface CameraState {
  position: Vector3D;
  target: Vector3D;
  shake: {
    intensity: number;
    decay: number;
  };
  zoom: number;
}

/**
 * Game lifecycle events
 */
export type GameLifecycleEvent =
  | { type: 'game_start'; mode: string }
  | { type: 'game_pause' }
  | { type: 'game_resume' }
  | { type: 'game_over'; score: number; distance: number }
  | { type: 'game_reset' }
  | { type: 'level_complete'; level: number }
  | { type: 'biome_change'; biome: string };

/**
 * Entity lifecycle events
 */
export type EntityLifecycleEvent =
  | { type: 'entity_spawn'; entity: Entity }
  | { type: 'entity_destroy'; entity: Entity }
  | { type: 'entity_collect'; entity: Entity; value: number }
  | { type: 'entity_collision'; a: Entity; b: Entity };

/**
 * UI events
 */
export type UIEvent =
  | { type: 'menu_open'; menu: string }
  | { type: 'menu_close'; menu: string }
  | { type: 'button_click'; button: string }
  | { type: 'setting_change'; setting: string; value: unknown };

/**
 * Combined game event type
 */
export type GameEvent =
  | GameLifecycleEvent
  | EntityLifecycleEvent
  | UIEvent
  | { type: 'collision'; event: CollisionEvent }
  | { type: 'score'; event: ScoreEvent }
  | { type: 'achievement'; event: AchievementEvent }
  | { type: 'powerup'; event: PowerUpEvent }
  | { type: 'particle'; event: ParticleEffectEvent }
  | { type: 'audio'; event: AudioEvent }
  | { type: 'visual'; event: VisualEffectEvent };

/**
 * Event listener type
 */
export type GameEventListener<T extends GameEvent = GameEvent> = (event: T) => void;

/**
 * Event emitter interface
 */
export interface EventEmitter {
  on<T extends GameEvent>(type: T['type'], listener: GameEventListener<T>): void;
  off<T extends GameEvent>(type: T['type'], listener: GameEventListener<T>): void;
  emit<T extends GameEvent>(event: T): void;
}
