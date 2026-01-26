/**
 * Game State Store using Zustand
 * Central state management for the game
 */

import {
  DIFFICULTY,
  GAME_CONFIG,
  getCharacter,
  getDefaultCharacter,
  PHYSICS,
  type OtterCharacter,
} from '../config';
import { resetWorld } from '../ecs';
import type { BiomeType, GameMode, GameStatus, PowerUpType } from '../types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Lazy import to avoid circular dependency - will be loaded at runtime
let achievementStoreModule: typeof import('./achievement-store') | null = null;
const getAchievementStore = async () => {
  if (!achievementStoreModule) {
    achievementStoreModule = await import('./achievement-store');
  }
  return achievementStoreModule.useAchievementStore;
};

/**
 * Calculate the combo multiplier based on current combo count.
 * At 10x combo, score multiplier becomes 2x.
 * Formula: 1 + floor(combo/10)
 */
export function getComboMultiplier(combo: number): number {
  return 1 + Math.floor(combo / 10);
}

/**
 * Calculate the remaining combo time as a ratio (0-1).
 * Returns 0 if no combo is active, 1 if combo was just triggered.
 */
export function getComboTimeRemaining(comboTimer: number | null): number {
  if (comboTimer === null) return 0;
  const elapsed = Date.now() - comboTimer;
  const remaining = Math.max(0, GAME_CONFIG.COMBO_TIMEOUT - elapsed);
  return remaining / GAME_CONFIG.COMBO_TIMEOUT;
}

/**
 * Check if combo has expired based on the timer timestamp.
 */
export function isComboExpired(comboTimer: number | null): boolean {
  if (comboTimer === null) return true;
  return Date.now() - comboTimer > GAME_CONFIG.COMBO_TIMEOUT;
}

/**
 * Calculate the speed multiplier based on distance traveled
 * Speed increases by 10% every 500m, capped at 2x base speed
 */
export function calculateSpeedMultiplier(distance: number): number {
  const intervals = Math.floor(distance / DIFFICULTY.speedIncreaseDistanceInterval);
  const multiplier = 1 + intervals * DIFFICULTY.speedIncreasePerInterval;
  return Math.min(multiplier, DIFFICULTY.maxSpeedMultiplier);
}

/**
 * Calculate the current scroll speed based on distance
 */
export function calculateScrollSpeed(distance: number): number {
  return PHYSICS.scrollSpeed * calculateSpeedMultiplier(distance);
}

/**
 * Calculate the obstacle spawn interval based on distance
 * Spawn rate increases (interval decreases) from 2s to 1s over 3000m
 */
export function calculateObstacleSpawnInterval(distance: number): number {
  const progress = Math.min(distance / DIFFICULTY.spawnRateMaxDistance, 1);
  const intervalRange = DIFFICULTY.baseObstacleSpawnInterval - DIFFICULTY.minObstacleSpawnInterval;
  return DIFFICULTY.baseObstacleSpawnInterval - progress * intervalRange;
}

/**
 * Calculate the collectible spawn interval based on distance
 * Spawn rate increases (interval decreases) from 3s to 1.5s over 3000m
 */
export function calculateCollectibleSpawnInterval(distance: number): number {
  const progress = Math.min(distance / DIFFICULTY.spawnRateMaxDistance, 1);
  const intervalRange = DIFFICULTY.baseCollectibleSpawnInterval - DIFFICULTY.minCollectibleSpawnInterval;
  return DIFFICULTY.baseCollectibleSpawnInterval - progress * intervalRange;
}

/**
 * Biome distance thresholds (in meters)
 */
export const BIOME_THRESHOLDS: Record<BiomeType, number> = {
  forest: 0,
  mountain: 1000,
  canyon: 2000,
  rapids: 3000,
};

/**
 * Transition distance for smooth color lerping between biomes
 */
export const BIOME_TRANSITION_DISTANCE = 100;

export interface PowerUpState {
  /** Shield blocks one hit (true = active) */
  shield: boolean;
  /** Speed boost end timestamp (0 = inactive) */
  speedBoost: number;
  /** Score multiplier value (1 = no bonus, 2 = 2x score) */
  multiplier: number;
  /** Multiplier power-up end timestamp (0 = inactive) */
  multiplierEndTime: number;
  /** Magnet auto-collect end timestamp (0 = inactive) */
  magnet: number;
  /** Ghost pass-through end timestamp (0 = inactive) */
  ghost: number;
  /** Slow motion end timestamp (0 = inactive) */
  slowMotion: number;
}

// Persistent player progress (saved across sessions)
export interface PlayerProgress {
  totalDistance: number;
  totalCoins: number;
  totalGems: number;
  gamesPlayed: number;
  highScore: number;
  unlockedCharacters: string[];
}

/**
 * Colorblind mode types
 */
export type ColorblindMode = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';

/**
 * Game speed multiplier options
 */
export type GameSpeedOption = 0.5 | 0.75 | 1;

/**
 * Accessibility settings
 */
export interface AccessibilitySettings {
  highContrast: boolean;
  colorblindMode: ColorblindMode;
  reducedMotion: boolean;
  gameSpeedMultiplier: GameSpeedOption;
}

export interface GameState {
  // Game status
  status: GameStatus;
  mode: GameMode;

  // Selected character
  selectedCharacterId: string;

  // Current character traits (applied at game start)
  activeTraits: OtterCharacter['traits'] | null;

  // Tutorial tracking (timestamp when game started, null if not a fresh game start)
  // Only set on initial game start from menu, not on respawn
  gameStartTime: number | null;

  // Time Trial mode: remaining time in milliseconds (null when not in time trial)
  timeRemaining: number | null;

  // Player stats (current session)
  score: number;
  distance: number;
  coins: number;
  gems: number;
  combo: number;
  comboTimer: number | null; // Timestamp of last collection, null if no active combo
  lives: number;
  nearMissCount: number;

  // Biome tracking
  currentBiome: BiomeType;
  biomeProgress: number; // 0-1 progress through transition to next biome

  // Power-ups
  powerUps: PowerUpState;

  // Settings
  soundEnabled: boolean;
  musicEnabled: boolean;
  volume: number;

  // Accessibility settings
  accessibility: AccessibilitySettings;

  // Persistent progress
  progress: PlayerProgress;

  // Character actions
  selectCharacter: (characterId: string) => void;
  getSelectedCharacter: () => OtterCharacter;

  // Actions
  startGame: (mode: GameMode) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
  returnToMenu: () => void;
  goToCharacterSelect: () => void;

  updateScore: (points: number) => void;
  updateDistance: (meters: number) => void;
  collectCoin: (value: number) => void;
  collectGem: (value: number) => void;
  incrementCombo: () => void;
  resetCombo: () => void;
  checkComboTimeout: () => void;
  loseLife: () => void;
  addNearMissBonus: (bonus: number) => void;

  // Time Trial mode
  updateTimeRemaining: (deltaMs: number) => void;

  activatePowerUp: (type: PowerUpType, duration?: number) => void;
  deactivatePowerUp: (type: PowerUpType) => void;
  checkPowerUpExpiration: () => void;

  updateSettings: (
    settings: Partial<Pick<GameState, 'soundEnabled' | 'musicEnabled' | 'volume'>>
  ) => void;

  updateAccessibility: (settings: Partial<AccessibilitySettings>) => void;

  updateBiome: () => void;

  reset: () => void;
}

const initialPowerUps: PowerUpState = {
  shield: false,
  speedBoost: 0,
  multiplier: 1,
  multiplierEndTime: 0,
  magnet: 0,
  ghost: 0,
  slowMotion: 0,
};

const initialProgress: PlayerProgress = {
  totalDistance: 0,
  totalCoins: 0,
  totalGems: 0,
  gamesPlayed: 0,
  highScore: 0,
  unlockedCharacters: ['rusty'], // Rusty is unlocked by default
};

const initialAccessibility: AccessibilitySettings = {
  highContrast: false,
  colorblindMode: 'none',
  reducedMotion: false,
  gameSpeedMultiplier: 1,
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Initial state
      status: 'menu',
      mode: 'classic',
      selectedCharacterId: 'rusty',
      activeTraits: null,
      gameStartTime: null,
      timeRemaining: null,
      score: 0,
      distance: 0,
      coins: 0,
      gems: 0,
      combo: 0,
      comboTimer: null,
      lives: 3,
      nearMissCount: 0,
      currentBiome: 'forest',
      biomeProgress: 0,
      powerUps: { ...initialPowerUps },
      soundEnabled: true,
      musicEnabled: true,
      volume: 0.7,
      accessibility: { ...initialAccessibility },
      progress: { ...initialProgress },

      // Character actions
      selectCharacter: (characterId) => {
        const character = getCharacter(characterId);
        if (character) {
          set({ selectedCharacterId: characterId });
        }
      },

      getSelectedCharacter: () => {
        const state = get();
        return getCharacter(state.selectedCharacterId) ?? getDefaultCharacter();
      },

      // Actions
      startGame: (mode) => {
        const state = get();
        const character = getCharacter(state.selectedCharacterId) ?? getDefaultCharacter();

        // Reset the ECS world to clear all entities
        resetWorld();

        // Start achievement tracking session
        getAchievementStore().then((store) => {
          store.getState().startSession();
        });

        set(() => ({
          status: 'playing',
          mode,
          activeTraits: character.traits,
          gameStartTime: Date.now(), // Track when game started for tutorial
          timeRemaining: mode === 'time_trial' ? TIME_TRIAL_DURATION_MS : null,
          score: 0,
          distance: 0,
          coins: 0,
          gems: 0,
          combo: 0,
          comboTimer: null,
          lives: character.traits.startingHealth,
          nearMissCount: 0,
          currentBiome: 'forest',
          biomeProgress: 0,
          powerUps: { ...initialPowerUps },
        }));
      },

      pauseGame: () => set({ status: 'paused' }),
      resumeGame: () => set({ status: 'playing' }),

      endGame: () =>
        set((state) => {
          // Update persistent progress
          const newProgress = {
            ...state.progress,
            totalDistance: state.progress.totalDistance + state.distance,
            totalCoins: state.progress.totalCoins + state.coins,
            totalGems: state.progress.totalGems + state.gems,
            gamesPlayed: state.progress.gamesPlayed + 1,
            highScore: Math.max(state.score, state.progress.highScore),
          };

          // Check for character unlocks
          const unlockedCharacters = [...newProgress.unlockedCharacters];

          // Sterling unlocks at 1000m total distance
          if (newProgress.totalDistance >= 1000 && !unlockedCharacters.includes('sterling')) {
            unlockedCharacters.push('sterling');
          }

          // Goldie unlocks at 5000 total coins
          if (newProgress.totalCoins >= 5000 && !unlockedCharacters.includes('goldie')) {
            unlockedCharacters.push('goldie');
          }

          // Frost unlocks at 10000 high score
          if (newProgress.highScore >= 10000 && !unlockedCharacters.includes('frost')) {
            unlockedCharacters.push('frost');
          }

          newProgress.unlockedCharacters = unlockedCharacters;

          // End achievement tracking session and check for achievements
          getAchievementStore().then((store) => {
            store.getState().endSession({
              distance: state.distance,
              coins: state.coins,
              gems: state.gems,
              score: state.score,
              gamesPlayed: newProgress.gamesPlayed,
              totalCoins: newProgress.totalCoins,
              totalGems: newProgress.totalGems,
              totalDistance: newProgress.totalDistance,
              charactersUnlocked: newProgress.unlockedCharacters.length,
            });
          });

          return {
            status: 'game_over',
            progress: newProgress,
            lives: 0,
          };
        }),

      returnToMenu: () => {
        // Reset the ECS world to clear all entities
        resetWorld();

        set({
          status: 'menu',
          activeTraits: null,
          gameStartTime: null,
          timeRemaining: null,
          score: 0,
          distance: 0,
          coins: 0,
          gems: 0,
          combo: 0,
          comboTimer: null,
          lives: 3,
          currentBiome: 'forest',
          biomeProgress: 0,
          powerUps: { ...initialPowerUps },
        });
      },

      goToCharacterSelect: () => {
        set({ status: 'character_select' });
      },

      updateScore: (points) =>
        set((state) => ({
          score: state.score + points,
        })),

      updateDistance: (meters) =>
        set((state) => {
          const newDistance = state.distance + meters;

          // Update achievement tracking
          getAchievementStore().then((store) => {
            store.getState().updateDistance(newDistance);
          });

          return { distance: newDistance };
        }),

      collectCoin: (value) =>
        set((state) => {
          // Apply character coin multiplier
          const charMultiplier = state.activeTraits?.coinValueMod ?? 1;
          // Apply combo multiplier (1x base, 2x at 10+ combo, 3x at 20+ combo, etc.)
          const comboMultiplier = getComboMultiplier(state.combo);
          const adjustedValue = Math.round(value * charMultiplier);
          const newCoins = state.coins + adjustedValue;
          const scoreGain = adjustedValue * 10 * comboMultiplier;

          // Update achievement tracking
          getAchievementStore().then((store) => {
            store.getState().updateCoins(newCoins);
          });

          return {
            coins: newCoins,
            score: state.score + scoreGain,
            combo: state.combo + 1,
            comboTimer: Date.now(), // Reset combo timer on collection
          };
        }),

      collectGem: (value) =>
        set((state) => {
          // Apply character gem multiplier
          const charMultiplier = state.activeTraits?.gemValueMod ?? 1;
          // Apply combo multiplier (1x base, 2x at 10+ combo, 3x at 20+ combo, etc.)
          const comboMultiplier = getComboMultiplier(state.combo);
          const adjustedValue = Math.round(value * charMultiplier);
          const newGems = state.gems + adjustedValue;
          const scoreGain = adjustedValue * 50 * comboMultiplier;

          // Update achievement tracking
          getAchievementStore().then((store) => {
            store.getState().updateGems(newGems);
          });

          return {
            gems: newGems,
            score: state.score + scoreGain,
            combo: state.combo + 1,
            comboTimer: Date.now(), // Reset combo timer on collection
          };
        }),

      incrementCombo: () =>
        set((state) => {
          const newCombo = state.combo + 1;

          // Update achievement tracking
          getAchievementStore().then((store) => {
            store.getState().updateCombo(newCombo);
          });

          return { combo: newCombo, comboTimer: Date.now() };
        }),

      resetCombo: () => set({ combo: 0, comboTimer: null }),

      /**
       * Check if combo has timed out and reset if needed.
       * Should be called in the game loop.
       */
      checkComboTimeout: () => {
        const state = get();
        if (state.combo > 0 && isComboExpired(state.comboTimer)) {
          set({ combo: 0, comboTimer: null });
        }
      },

      loseLife: () => {
        const state = get();
        const newLives = state.lives - 1;

        // Record damage for achievement tracking
        getAchievementStore().then((store) => {
          store.getState().recordDamage();
        });

        if (newLives <= 0) {
          get().endGame();
        } else {
          // Reset combo when hit
          set({ lives: newLives, combo: 0, comboTimer: null });
        }
      },

      activatePowerUp: (type, duration) =>
        set((state) => {
          const now = Date.now();
          // Use type-specific durations from GAME_CONFIG
          const durations: Record<PowerUpType, number> = {
            shield: GAME_CONFIG.SHIELD_DURATION,
            ghost: GAME_CONFIG.GHOST_DURATION,
            magnet: GAME_CONFIG.MAGNET_DURATION,
            multiplier: GAME_CONFIG.MULTIPLIER_DURATION,
            slowMotion: GAME_CONFIG.SLOW_MOTION_DURATION,
          };
          const endTime = now + (duration ?? durations[type]);

          if (type === 'shield') {
            // Shield is a one-hit protection, not time-based
            return {
              powerUps: { ...state.powerUps, shield: true },
            };
          }

          if (type === 'multiplier') {
            // Multiplier has both a value and an end time
            return {
              powerUps: { ...state.powerUps, multiplier: GAME_CONFIG.MULTIPLIER_VALUE, multiplierEndTime: endTime },
            };
          }

          return {
            powerUps: { ...state.powerUps, [type]: endTime },
          };
        }),

      deactivatePowerUp: (type) =>
        set((state) => {
          if (type === 'shield') {
            return {
              powerUps: { ...state.powerUps, shield: false },
            };
          }

          if (type === 'multiplier') {
            return {
              powerUps: { ...state.powerUps, multiplier: 1, multiplierEndTime: 0 },
            };
          }

          return {
            powerUps: { ...state.powerUps, [type]: 0 },
          };
        }),

      /**
       * Check for expired power-ups and deactivate them.
       * Should be called in the game loop.
       */
      checkPowerUpExpiration: () => {
        const state = get();
        const now = Date.now();
        const updates: Partial<PowerUpState> = {};

        // Check each timed power-up
        if (state.powerUps.magnet > 0 && now >= state.powerUps.magnet) {
          updates.magnet = 0;
        }
        if (state.powerUps.ghost > 0 && now >= state.powerUps.ghost) {
          updates.ghost = 0;
        }
        if (state.powerUps.slowMotion > 0 && now >= state.powerUps.slowMotion) {
          updates.slowMotion = 0;
        }
        if (state.powerUps.multiplierEndTime > 0 && now >= state.powerUps.multiplierEndTime) {
          updates.multiplier = 1;
          updates.multiplierEndTime = 0;
        }
        if (state.powerUps.speedBoost > 0 && now >= state.powerUps.speedBoost) {
          updates.speedBoost = 0;
        }

        // Only update if there are changes
        if (Object.keys(updates).length > 0) {
          set({ powerUps: { ...state.powerUps, ...updates } });
        }
      },

      updateSettings: (settings) => set(() => ({ ...settings })),

      updateAccessibility: (settings) =>
        set((state) => ({
          accessibility: { ...state.accessibility, ...settings },
        })),

      addNearMissBonus: (bonus) =>
        set((state) => ({
          score: state.score + bonus,
          nearMissCount: state.nearMissCount + 1,
        })),

      updateTimeRemaining: (deltaMs) => {
        const state = get();
        if (state.mode !== 'time_trial' || state.timeRemaining === null) return;

        const newTime = state.timeRemaining - deltaMs;
        if (newTime <= 0) {
          // Time's up - end the game
          set({ timeRemaining: 0 });
          get().endGame();
        } else {
          set({ timeRemaining: newTime });
        }
      },

      updateBiome: () =>
        set((state) => {
          const distance = state.distance;

          // Determine current biome based on distance thresholds
          let currentBiome: BiomeType = 'forest';
          let biomeProgress = 0;

          if (distance >= BIOME_THRESHOLDS.rapids) {
            currentBiome = 'rapids';
            biomeProgress = 1; // Past all transitions
          } else if (distance >= BIOME_THRESHOLDS.canyon) {
            currentBiome = 'canyon';
            const progressToRapids =
              (distance - BIOME_THRESHOLDS.canyon) /
              (BIOME_THRESHOLDS.rapids - BIOME_THRESHOLDS.canyon);
            biomeProgress = Math.min(progressToRapids, 1);
          } else if (distance >= BIOME_THRESHOLDS.mountain) {
            currentBiome = 'mountain';
            const progressToCanyon =
              (distance - BIOME_THRESHOLDS.mountain) /
              (BIOME_THRESHOLDS.canyon - BIOME_THRESHOLDS.mountain);
            biomeProgress = Math.min(progressToCanyon, 1);
          } else {
            currentBiome = 'forest';
            const progressToMountain = distance / BIOME_THRESHOLDS.mountain;
            biomeProgress = Math.min(progressToMountain, 1);
          }

          return { currentBiome, biomeProgress };
        }),

      reset: () =>
        set({
          status: 'menu',
          mode: 'classic',
          activeTraits: null,
          gameStartTime: null,
          timeRemaining: null,
          score: 0,
          distance: 0,
          coins: 0,
          gems: 0,
          combo: 0,
          comboTimer: null,
          lives: 3,
          nearMissCount: 0,
          currentBiome: 'forest',
          biomeProgress: 0,
          powerUps: { ...initialPowerUps },
        }),
    }),
    {
      name: 'otter-river-rush-storage',
      // Only persist certain fields
      partialize: (state) => ({
        selectedCharacterId: state.selectedCharacterId,
        progress: state.progress,
        soundEnabled: state.soundEnabled,
        musicEnabled: state.musicEnabled,
        volume: state.volume,
        accessibility: state.accessibility,
      }),
    }
  )
);

/**
 * Tutorial duration in milliseconds (30 seconds)
 */
export const TUTORIAL_DURATION_MS = 30000;

/**
 * Time Trial mode duration in milliseconds (60 seconds)
 */
export const TIME_TRIAL_DURATION_MS = 60000;

/**
 * Check if the tutorial period is currently active
 * Tutorial is active for the first 30 seconds after game start
 * Only applies to fresh game starts from menu, not respawns
 * @returns true if tutorial invincibility is active
 */
export function isTutorialActive(): boolean {
  const state = useGameStore.getState();
  if (state.gameStartTime === null) return false;

  const elapsed = Date.now() - state.gameStartTime;
  return elapsed < TUTORIAL_DURATION_MS;
}

/**
 * Get remaining tutorial time in seconds
 * @returns remaining seconds, or 0 if tutorial is not active
 */
export function getTutorialTimeRemaining(): number {
  const state = useGameStore.getState();
  if (state.gameStartTime === null) return 0;

  const elapsed = Date.now() - state.gameStartTime;
  const remaining = TUTORIAL_DURATION_MS - elapsed;
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
}

/**
 * Get remaining time trial time in seconds
 * @returns remaining seconds, or 0 if not in time trial mode
 */
export function getTimeTrialTimeRemaining(): number {
  const state = useGameStore.getState();
  if (state.timeRemaining === null) return 0;
  return Math.ceil(state.timeRemaining / 1000);
}

/**
 * Power-up display configuration
 */
export interface PowerUpDisplay {
  type: PowerUpType;
  name: string;
  color: string;
  icon: string;
}

/**
 * Power-up display configurations
 */
export const POWER_UP_DISPLAYS: Record<PowerUpType, PowerUpDisplay> = {
  shield: { type: 'shield', name: 'Shield', color: '#3b82f6', icon: 'S' },
  magnet: { type: 'magnet', name: 'Magnet', color: '#f59e0b', icon: 'M' },
  ghost: { type: 'ghost', name: 'Ghost', color: '#8b5cf6', icon: 'G' },
  multiplier: { type: 'multiplier', name: '2x Score', color: '#ef4444', icon: 'X' },
  slowMotion: { type: 'slowMotion', name: 'Slow Mo', color: '#06b6d4', icon: 'T' },
};

/**
 * Get remaining time for a power-up in seconds
 * @param type The power-up type
 * @returns remaining seconds, or 0 if not active
 */
export function getPowerUpTimeRemaining(type: PowerUpType): number {
  const state = useGameStore.getState();
  const now = Date.now();

  // Shield is binary, not time-based
  if (type === 'shield') {
    return state.powerUps.shield ? -1 : 0; // -1 indicates "until hit"
  }

  // Multiplier has a separate end time
  if (type === 'multiplier') {
    const endTime = state.powerUps.multiplierEndTime;
    if (endTime === 0) return 0;
    const remaining = endTime - now;
    return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
  }

  // Other power-ups store their end time directly
  const endTime = state.powerUps[type];
  if (endTime === 0) return 0;
  const remaining = endTime - now;
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
}

/**
 * Check if a power-up is currently active
 * @param type The power-up type
 * @returns true if the power-up is active
 */
export function isPowerUpActive(type: PowerUpType): boolean {
  const state = useGameStore.getState();
  const now = Date.now();

  if (type === 'shield') {
    return state.powerUps.shield;
  }

  if (type === 'multiplier') {
    return state.powerUps.multiplierEndTime > now;
  }

  const endTime = state.powerUps[type];
  return endTime > now;
}

/**
 * Get all currently active power-ups with their remaining time
 * @returns Array of active power-ups with type and remaining time
 */
export function getActivePowerUps(): Array<{ type: PowerUpType; timeRemaining: number }> {
  const powerUpTypes: PowerUpType[] = ['shield', 'magnet', 'ghost', 'multiplier', 'slowMotion'];
  const active: Array<{ type: PowerUpType; timeRemaining: number }> = [];

  for (const type of powerUpTypes) {
    if (isPowerUpActive(type)) {
      active.push({
        type,
        timeRemaining: getPowerUpTimeRemaining(type),
      });
    }
  }

  return active;
}
