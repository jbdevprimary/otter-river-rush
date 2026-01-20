/**
 * @otter-river-rush/game-core/types
 * Platform-agnostic type definitions
 */

// Component types (re-export for convenience)
export type {
  AnimationComponent as AnimationClip,
  ColliderComponent as BoxCollider,
  ModelComponent as Model,
  PositionComponent as Position,
  VelocityComponent as Velocity,
} from './components';

// Config types
export type {
  BiomeConfig,
  ColorsConfig,
  GameConfig,
  PhysicsConfig,
  VisualConfig,
} from './config';

// Entity types
export type {
  AnimationComponent,
  CollectibleComponent,
  ColliderComponent,
  Entity,
  EntityQueries,
  Lane,
  ModelComponent,
  ParticleComponent,
  PositionComponent,
  PowerUpComponent,
  VelocityComponent,
} from './entities';

// Game types
export type {
  Achievement,
  AchievementEvent,
  AudioEvent,
  BiomeData,
  BiomeType,
  Bounds,
  CameraState,
  CollectibleType,
  Collider,
  CollisionEvent,
  DailyChallenge,
  Difficulty,
  GameMode,
  GameSettings,
  GameState,
  GameStats,
  GameStatus,
  InputState,
  LeaderboardEntry,
  LevelPattern,
  ParticleEffect,
  PlayerProfile,
  PowerUpState,
  PowerUpType,
  SaveData,
  ScoreEvent,
  Transform,
  UnlockableSkin,
  Vector2D,
  Vector3D,
  VisualEffect,
} from './game';
