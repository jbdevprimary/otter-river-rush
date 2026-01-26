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
  shield: boolean;
  speedBoost: number;
  multiplier: number;
  magnet: number;
  ghost: number;
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

  activatePowerUp: (type: PowerUpType, duration?: number) => void;
  deactivatePowerUp: (type: PowerUpType) => void;

  updateSettings: (
    settings: Partial<Pick<GameState, 'soundEnabled' | 'musicEnabled' | 'volume'>>
  ) => void;

  updateBiome: () => void;

  reset: () => void;
}

const initialPowerUps: PowerUpState = {
  shield: false,
  speedBoost: 0,
  multiplier: 1,
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

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Initial state
      status: 'menu',
      mode: 'classic',
      selectedCharacterId: 'rusty',
      activeTraits: null,
      gameStartTime: null,
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
          const endTime = duration ? now + duration : now + 5000;

          if (type === 'shield') {
            return {
              powerUps: { ...state.powerUps, shield: true },
            };
          }

          if (type === 'multiplier') {
            return {
              powerUps: { ...state.powerUps, multiplier: 2 },
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
              powerUps: { ...state.powerUps, multiplier: 1 },
            };
          }

          return {
            powerUps: { ...state.powerUps, [type]: 0 },
          };
        }),

      updateSettings: (settings) => set(() => ({ ...settings })),

      addNearMissBonus: (bonus) =>
        set((state) => ({
          score: state.score + bonus,
          nearMissCount: state.nearMissCount + 1,
        })),

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
      }),
    }
  )
);

/**
 * Tutorial duration in milliseconds (30 seconds)
 */
export const TUTORIAL_DURATION_MS = 30000;

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
