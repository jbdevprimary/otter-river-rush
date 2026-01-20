/**
 * Game State Store using Zustand
 * Central state management for the game
 */

import { getCharacter, getDefaultCharacter, type OtterCharacter } from '@otter-river-rush/config';
import { resetWorld } from '@otter-river-rush/core';
import type { GameMode, GameStatus, PowerUpType } from '@otter-river-rush/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { updatePlayerProgress } from './progress';

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

  // Player stats (current session)
  score: number;
  distance: number;
  coins: number;
  gems: number;
  combo: number;
  lives: number;

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
  loseLife: () => void;

  activatePowerUp: (type: PowerUpType, duration?: number) => void;
  deactivatePowerUp: (type: PowerUpType) => void;

  updateSettings: (
    settings: Partial<Pick<GameState, 'soundEnabled' | 'musicEnabled' | 'volume'>>
  ) => void;

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
      score: 0,
      distance: 0,
      coins: 0,
      gems: 0,
      combo: 0,
      lives: 3,
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

        set(() => ({
          status: 'playing',
          mode,
          activeTraits: character.traits,
          score: 0,
          distance: 0,
          coins: 0,
          gems: 0,
          combo: 0,
          lives: character.traits.startingHealth,
          powerUps: { ...initialPowerUps },
        }));
      },

      pauseGame: () => set({ status: 'paused' }),
      resumeGame: () => set({ status: 'playing' }),

      endGame: () =>
        set((state) => ({
          status: 'game_over',
          progress: updatePlayerProgress(state),
          lives: 0,
        })),

      returnToMenu: () => {
        // Reset the ECS world to clear all entities
        resetWorld();

        set({
          status: 'menu',
          activeTraits: null,
          score: 0,
          distance: 0,
          coins: 0,
          gems: 0,
          combo: 0,
          lives: 3,
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
        set((state) => ({
          distance: state.distance + meters,
        })),

      collectCoin: (value) =>
        set((state) => {
          // Apply character coin multiplier
          const multiplier = state.activeTraits?.coinValueMod ?? 1;
          const adjustedValue = Math.round(value * multiplier);
          return {
            coins: state.coins + adjustedValue,
            score: state.score + adjustedValue * 10,
          };
        }),

      collectGem: (value) =>
        set((state) => {
          // Apply character gem multiplier
          const multiplier = state.activeTraits?.gemValueMod ?? 1;
          const adjustedValue = Math.round(value * multiplier);
          return {
            gems: state.gems + adjustedValue,
            score: state.score + adjustedValue * 50,
          };
        }),

      incrementCombo: () =>
        set((state) => ({
          combo: state.combo + 1,
        })),

      resetCombo: () => set({ combo: 0 }),

      loseLife: () => {
        const state = get();
        const newLives = state.lives - 1;
        if (newLives <= 0) {
          get().endGame();
        } else {
          set({ lives: newLives });
        }
      },

      activatePowerUp: (type, duration) =>
        set((state) => {
          const now = Date.now();
          const endTime = duration ? now + duration : now + 5000;

          switch (type) {
            case 'shield':
              return {
                powerUps: { ...state.powerUps, shield: true },
              };
            case 'multiplier':
              return {
                powerUps: { ...state.powerUps, multiplier: 2 },
              };
            default:
              return {
                powerUps: { ...state.powerUps, [type]: endTime },
              };
          }
        }),

      deactivatePowerUp: (type) =>
        set((state) => {
          switch (type) {
            case 'shield':
              return {
                powerUps: { ...state.powerUps, shield: false },
              };
            case 'multiplier':
              return {
                powerUps: { ...state.powerUps, multiplier: 1 },
              };
            default:
              return {
                powerUps: { ...state.powerUps, [type]: 0 },
              };
          }
        }),

      updateSettings: (settings) => set(() => ({ ...settings })),

      reset: () =>
        set({
          status: 'menu',
          mode: 'classic',
          activeTraits: null,
          score: 0,
          distance: 0,
          coins: 0,
          gems: 0,
          combo: 0,
          lives: 3,
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
