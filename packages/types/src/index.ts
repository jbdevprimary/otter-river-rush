/**
 * @otter-river-rush/types
 * Central type definitions for the game
 */

// Game types
export type {
  Vector2D,
  Vector3D,
  Transform,
  Bounds,
  Collider,
  GameStatus,
  GameMode,
  Difficulty,
  BiomeType,
  BiomeData,
  PowerUpType,
  PowerUpState,
  CollectibleType,
  GameState,
  GameStats,
  Achievement,
  LeaderboardEntry,
  PlayerProfile,
  GameSettings,
  DailyChallenge,
  UnlockableSkin,
  SaveData,
  InputState,
  CameraState,
  CollisionEvent,
  ScoreEvent,
  AchievementEvent,
  AudioEvent,
  ParticleEffect,
  VisualEffect,
  LevelPattern,
} from './game';

// Entity types
export type {
  Lane,
  PositionComponent,
  VelocityComponent,
  ModelComponent,
  AnimationComponent,
  ColliderComponent,
  CollectibleComponent,
  PowerUpComponent,
  ParticleComponent,
  Entity,
  EntityQueries,
} from './entities';

// Component types (re-export for convenience)
export type {
  PositionComponent as Position,
  VelocityComponent as Velocity,
  ModelComponent as Model,
  AnimationComponent as AnimationClip,
  ColliderComponent as BoxCollider,
} from './components';

// Config types
export type {
  VisualConfig,
  PhysicsConfig,
  GameConfig,
  BiomeConfig,
  ColorsConfig,
} from './config';
