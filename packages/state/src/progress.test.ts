
import { describe, it, expect } from 'vitest';
import { checkCharacterUnlocks, updatePlayerProgress } from './progress';
import type { GameState, PlayerProgress } from './game-store';

describe('Progress', () => {
  describe('checkCharacterUnlocks', () => {
    it('should not unlock any character if conditions are not met', () => {
      const progress: PlayerProgress = {
        totalDistance: 0,
        totalCoins: 0,
        highScore: 0,
        unlockedCharacters: ['rusty'],
        totalGems: 0,
        gamesPlayed: 0
      };
      const unlocked = checkCharacterUnlocks(progress);
      expect(unlocked).toEqual(['rusty']);
    });

    it('should unlock Sterling if total distance is >= 1000', () => {
      const progress: PlayerProgress = {
        totalDistance: 1000,
        totalCoins: 0,
        highScore: 0,
        unlockedCharacters: ['rusty'],
        totalGems: 0,
        gamesPlayed: 0
      };
      const unlocked = checkCharacterUnlocks(progress);
      expect(unlocked).toEqual(['rusty', 'sterling']);
    });

    it('should unlock Goldie if total coins is >= 5000', () => {
        const progress: PlayerProgress = {
            totalDistance: 0,
            totalCoins: 5000,
            highScore: 0,
            unlockedCharacters: ['rusty'],
            totalGems: 0,
            gamesPlayed: 0
        };
        const unlocked = checkCharacterUnlocks(progress);
        expect(unlocked).toEqual(['rusty', 'goldie']);
    });

    it('should unlock Frost if high score is >= 10000', () => {
        const progress: PlayerProgress = {
            totalDistance: 0,
            totalCoins: 0,
            highScore: 10000,
            unlockedCharacters: ['rusty'],
            totalGems: 0,
            gamesPlayed: 0
        };
        const unlocked = checkCharacterUnlocks(progress);
        expect(unlocked).toEqual(['rusty', 'frost']);
    });

    it('should unlock multiple characters if all conditions are met', () => {
      const progress: PlayerProgress = {
        totalDistance: 1000,
        totalCoins: 5000,
        highScore: 10000,
        unlockedCharacters: ['rusty'],
        totalGems: 0,
        gamesPlayed: 0,
      };
      const unlocked = checkCharacterUnlocks(progress);
      expect(unlocked).toEqual(['rusty', 'sterling', 'goldie', 'frost']);
    });
  });

  describe('updatePlayerProgress', () => {
    it('should correctly update player progress', () => {
      const state: GameState = {
        distance: 100,
        coins: 50,
        gems: 10,
        score: 1000,
        progress: {
          totalDistance: 0,
          totalCoins: 0,
          totalGems: 0,
          gamesPlayed: 0,
          highScore: 0,
          unlockedCharacters: ['rusty'],
        },
        status: 'playing',
        mode: 'classic',
        selectedCharacterId: 'rusty',
        activeTraits: null,
        combo: 0,
        lives: 3,
        powerUps: {
          shield: false,
          speedBoost: 0,
          multiplier: 1,
          magnet: 0,
          ghost: 0,
          slowMotion: 0,
        },
        soundEnabled: false,
        musicEnabled: false,
        volume: 0,
        selectCharacter: () => {},
        getSelectedCharacter: () => ({}) as any,
        startGame: () => {},
        pauseGame: () => {},
        resumeGame: () => {},
        endGame: () => {},
        returnToMenu: () => {},
        goToCharacterSelect: () => {},
        updateScore: () => {},
        updateDistance: () => {},
        collectCoin: () => {},
        collectGem: () => {},
        incrementCombo: () => {},
        resetCombo: () => {},
        loseLife: () => {},
        activatePowerUp: () => {},
        deactivatePowerUp: () => {},
        updateSettings: () => {},
        reset: () => {},
      };

      const updatedProgress = updatePlayerProgress(state);

      expect(updatedProgress.totalDistance).toBe(100);
      expect(updatedProgress.totalCoins).toBe(50);
      expect(updatedProgress.totalGems).toBe(10);
      expect(updatedProgress.gamesPlayed).toBe(1);
      expect(updatedProgress.highScore).toBe(1000);
    });
  });
});
