/**
 * Test suite for ScoreManager
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ScoreManager } from '@/game/managers/ScoreManager';

describe('ScoreManager', () => {
  let manager: ScoreManager;

  beforeEach(() => {
    manager = new ScoreManager();
    vi.useFakeTimers();
  });

  describe('initialization', () => {
    it('should initialize with zero stats', () => {
      const stats = manager.getStats();

      expect(stats.distance).toBe(0);
      expect(stats.score).toBe(0);
      expect(stats.coins).toBe(0);
      expect(stats.gems).toBe(0);
      expect(stats.multiplier).toBe(1);
      expect(stats.combo).toBe(0);
    });
  });

  describe('distance and score', () => {
    it('should update distance and add score', () => {
      manager.updateDistance(100);

      const stats = manager.getStats();
      expect(stats.distance).toBe(100);
      expect(stats.score).toBeGreaterThan(0);
    });

    it('should add score with current multiplier', () => {
      manager.setMultiplier(2, 5000);
      manager.addScore(100);

      const stats = manager.getStats();
      expect(stats.score).toBe(200);
    });
  });

  describe('collectibles', () => {
    it('should increment coins and score when collecting coin', () => {
      manager.collectCoin();

      const stats = manager.getStats();
      expect(stats.coins).toBe(1);
      expect(stats.score).toBeGreaterThan(0);
      expect(stats.combo).toBe(1);
    });

    it('should increment gems and score when collecting gem', () => {
      manager.collectGem();

      const stats = manager.getStats();
      expect(stats.gems).toBe(1);
      expect(stats.score).toBeGreaterThan(0);
      expect(stats.combo).toBe(1);
    });

    it('should track power-ups collected', () => {
      manager.collectPowerUp();

      const stats = manager.getStats();
      expect(stats.powerUpsCollected).toBe(1);
    });
  });

  describe('combo system', () => {
    it('should increment combo when collecting items', () => {
      manager.collectCoin();
      manager.collectCoin();
      manager.collectCoin();

      const stats = manager.getStats();
      expect(stats.combo).toBe(3);
    });

    it('should add combo bonus to score', () => {
      manager.collectCoin();
      const score1 = manager.getStats().score;

      manager.collectCoin();
      const score2 = manager.getStats().score;

      const scoreDiff = score2 - score1;
      expect(scoreDiff).toBeGreaterThan(10); // Base coin value + combo bonus
    });

    it('should break combo after timeout', () => {
      manager.collectCoin();
      expect(manager.getStats().combo).toBe(1);

      vi.advanceTimersByTime(3000); // Advance past combo timeout
      manager.update(3000);

      expect(manager.getStats().combo).toBe(0);
    });
  });

  describe('multiplier system', () => {
    it('should apply multiplier to score', () => {
      manager.setMultiplier(3, 5000);
      manager.addScore(100);

      expect(manager.getStats().score).toBe(300);
    });

    it('should reset multiplier after duration', () => {
      manager.setMultiplier(2, 1000);
      expect(manager.getStats().multiplier).toBe(2);

      vi.advanceTimersByTime(1500);
      manager.update(1500);

      expect(manager.getStats().multiplier).toBe(1);
    });

    it('should provide multiplier info', () => {
      manager.setMultiplier(2, 5000);

      const info = manager.getMultiplierInfo();
      expect(info.value).toBe(2);
      expect(info.active).toBe(true);
      expect(info.timeLeft).toBeGreaterThan(0);
    });
  });

  describe('statistics tracking', () => {
    it('should track obstacles avoided', () => {
      manager.avoidObstacle();
      manager.avoidObstacle();

      expect(manager.getStats().obstaclesAvoided).toBe(2);
    });

    it('should track close calls and add bonus', () => {
      const scoreBefore = manager.getStats().score;

      manager.recordCloseCall();

      const stats = manager.getStats();
      expect(stats.closeCallsCount).toBe(1);
      expect(stats.score).toBeGreaterThan(scoreBefore);
    });

    it('should track session time', () => {
      manager.update(1000);
      manager.update(500);

      expect(manager.getStats().sessionTime).toBe(1500);
    });
  });

  describe('formatting', () => {
    it('should format distance correctly', () => {
      manager.updateDistance(1234.56);

      expect(manager.getFormattedDistance()).toBe('1234m');
    });

    it('should format score with locale', () => {
      manager.addScore(12345);

      const formatted = manager.getFormattedScore();
      expect(formatted).toContain('12');
      expect(formatted).toContain('345');
    });
  });

  describe('final score calculation', () => {
    it('should calculate final score with bonuses', () => {
      manager.updateDistance(1000);
      manager.collectCoin();
      manager.collectGem();

      const finalScore = manager.calculateFinalScore();
      const currentScore = manager.getStats().score;

      expect(finalScore).toBeGreaterThan(currentScore);
    });

    it('should add bonus for many obstacles avoided', () => {
      for (let i = 0; i < 150; i++) {
        manager.avoidObstacle();
      }

      const finalScore = manager.calculateFinalScore();
      expect(finalScore).toBeGreaterThanOrEqual(1000);
    });
  });

  describe('reset', () => {
    it('should reset all stats to initial values', () => {
      manager.collectCoin();
      manager.updateDistance(100);
      manager.setMultiplier(2, 5000);

      manager.reset();

      const stats = manager.getStats();
      expect(stats.distance).toBe(0);
      expect(stats.score).toBe(0);
      expect(stats.coins).toBe(0);
      expect(stats.multiplier).toBe(1);
    });
  });

  describe('export and import', () => {
    it('should export current stats', () => {
      manager.collectCoin();
      manager.updateDistance(100);

      const exported = manager.exportStats();

      expect(exported.coins).toBe(1);
      expect(exported.distance).toBe(100);
    });

    it('should import stats correctly', () => {
      const stats = {
        distance: 500,
        score: 1000,
        coins: 10,
      };

      manager.importStats(stats);

      const imported = manager.getStats();
      expect(imported.distance).toBe(500);
      expect(imported.score).toBe(1000);
      expect(imported.coins).toBe(10);
    });
  });
});
