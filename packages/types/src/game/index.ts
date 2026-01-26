/**
 * Core game type definitions
 * Ported from otter-river-rush with Babylon.js adaptations
 */

// Core geometric types
export interface Vector2D {
  x: number;
  y: number;
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface Transform {
  position: Vector3D;
  velocity: Vector3D;
  rotation: Vector3D;
  scale: Vector3D;
}

export interface Bounds {
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
}

export interface Collider {
  type: 'sphere' | 'box' | 'capsule';
  radius?: number;
  width?: number;
  height?: number;
  depth?: number;
  offset: Vector3D;
}

// Game state enums
export type GameStatus =
  | 'menu'
  | 'character_select'
  | 'playing'
  | 'paused'
  | 'game_over'
  | 'loading';
export type GameMode = 'classic' | 'time_trial' | 'zen' | 'daily_challenge';
export type Difficulty = 'easy' | 'normal' | 'hard' | 'expert';

// Biome types - expanded for visual variety
export type BiomeType = 'forest' | 'canyon' | 'arctic' | 'tropical' | 'volcanic';

export interface BiomeData {
  name: string;
  waterColor: string;
  fogColor: string;
  skyColor: string;
  ambient: number;
  musicTrack?: string;
}

// Power-up types
export type PowerUpType = 'shield' | 'magnet' | 'slowMotion' | 'ghost' | 'multiplier';

export interface PowerUpState {
  shield: boolean;
  speedBoost: number;
  multiplier: number;
  magnet: number;
  ghost: number;
  slowMotion: number;
}

// Collectible types
export type CollectibleType = 'coin' | 'gem' | 'special';

// Game state
export interface GameState {
  status: GameStatus;
  mode: GameMode;
  score: number;
  distance: number;
  coins: number;
  gems: number;
  combo: number;
  lives: number;
  highScore: number;
  soundEnabled: boolean;
  musicEnabled: boolean;
  volume: number;
}

// Game stats
export interface GameStats {
  distance: number;
  score: number;
  coins: number;
  gems: number;
  multiplier: number;
  combo: number;
  powerUpsCollected: number;
  obstaclesAvoided: number;
  closeCallsCount: number;
  gamesPlayed: number;
  sessionTime?: number;
  totalGames: number;
  totalDistance: number;
  totalCoins: number;
  totalGems: number;
  bestScore: number;
  longestRun: number;
  achievementsUnlocked: number;
}

// Achievements
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  progress: number;
  unlocked: boolean;
  unlockedAt?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// Leaderboard
export interface LeaderboardEntry {
  rank?: number;
  playerName?: string;
  name?: string;
  score: number;
  distance: number;
  date?: number;
  timestamp?: number;
  mode: GameMode;
}

// Player profile
export interface PlayerProfile {
  name: string;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  totalCoins: number;
  totalGems: number;
  gamesPlayed: number;
  bestScore: number;
  bestDistance: number;
  totalPlayTime: number;
  unlockedSkins: string[];
  currentSkin: string;
  achievements: Achievement[];
  settings: GameSettings;
}

// Game settings
export interface GameSettings {
  volume: {
    master: number;
    music: number;
    sfx: number;
  };
  accessibility: {
    reducedMotion: boolean;
    highContrast: boolean;
    colorblindMode: 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia';
    gameSpeed: number;
  };
  controls: {
    touchEnabled: boolean;
    mouseEnabled: boolean;
    keyboardEnabled: boolean;
  };
  graphics: {
    particleQuality: 'low' | 'medium' | 'high';
    showFPS: boolean;
    maxDevicePixelRatio: number;
  };
  gameplay: {
    hapticFeedback: boolean;
    showTutorial: boolean;
    autoSave: boolean;
  };
}

// Daily challenge
export interface DailyChallenge {
  id: string;
  date: string;
  name: string;
  description: string;
  mode: GameMode;
  difficulty: Difficulty;
  requirements: {
    type: 'score' | 'distance' | 'coins' | 'combo' | 'time';
    value: number;
  }[];
  rewards: {
    coins: number;
    gems: number;
    experience: number;
  };
  completed: boolean;
  bestScore: number;
}

// Unlockable skins
export interface UnlockableSkin {
  id: string;
  name: string;
  description: string;
  previewUrl: string;
  unlockRequirement: {
    type: 'level' | 'achievement' | 'coins' | 'gems';
    value: string | number;
  };
  isUnlocked: boolean;
  cost?: {
    coins?: number;
    gems?: number;
  };
}

// Save data
export interface SaveData {
  highScore: number;
  totalGamesPlayed: number;
  achievements: string[];
  settings: {
    soundEnabled: boolean;
    musicEnabled: boolean;
  };
  stats?: GameStats;
  leaderboard?: LeaderboardEntry[];
}

// Input state
export interface InputState {
  left: boolean;
  right: boolean;
  jump: boolean;
  pause: boolean;
  lastInputTime: number;
}

// Camera state
export interface CameraState {
  position: Vector3D;
  target: Vector3D;
  shake: { intensity: number; decay: number };
  zoom: number;
}

// Events
export interface CollisionEvent {
  entityA: unknown; // Will be typed in entities
  entityB: unknown;
  point: Vector3D;
  normal: Vector3D;
  penetration: number;
}

export interface ScoreEvent {
  points: number;
  multiplier: number;
  combo: number;
  reason: 'distance' | 'coin' | 'gem' | 'combo' | 'achievement';
}

export interface AchievementEvent {
  id: string;
  name: string;
  description: string;
  timestamp: number;
}

export interface AudioEvent {
  sound: 'collect' | 'hit' | 'powerup' | 'jump' | 'menu' | 'achievement';
  volume?: number;
  pitch?: number;
}

// Effects
export interface ParticleEffect {
  type: 'collect' | 'hit' | 'powerup' | 'splash' | 'trail';
  position: Vector3D;
  velocity: Vector3D;
  color: string;
  size: number;
  lifetime: number;
  gravity?: number;
}

export interface VisualEffect {
  type: 'bloom' | 'glow' | 'trail' | 'ripple' | 'explosion';
  position: Vector3D;
  duration: number;
  intensity: number;
}

// Level patterns
export interface LevelPattern {
  obstacles: Array<{ lane: number; type: number; distance: number }>;
  collectibles: Array<{ lane: number; type: CollectibleType; distance: number }>;
  powerUps?: Array<{ lane: number; type: PowerUpType; distance: number }>;
  difficulty: number;
}
