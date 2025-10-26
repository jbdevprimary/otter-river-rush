import { describe, it, expect, beforeEach } from 'vitest';
import { AchievementSystem } from '../game/AchievementSystem';
import type { GameStats } from '@/types/Game.types';

describe('AchievementSystem', () => {
  let achievementSystem: AchievementSystem;
  let stats: GameStats;

  beforeEach(() => {
    achievementSystem = new AchievementSystem();
    stats = {
      score: 0,
      distance: 0,
      coins: 0,
      gems: 0,
      multiplier: 1,
      combo: 0,
      powerUpsCollected: 0,
      obstaclesAvoided: 0,
      rocksAvoided: 0,
      closeCallsCount: 0,
      gamesPlayed: 0,
    };
  });

  it('should initialize with no unlocked achievements', () => {
    const achievements = achievementSystem.getAchievements();
    expect(achievements.every((a) => !a.unlocked)).toBe(true);
  });

  it('should unlock first game achievement', () => {
    stats.gamesPlayed = 1;
    const unlocked = achievementSystem.check(stats);

    expect(unlocked).toHaveLength(1);
    expect(unlocked[0].id).toBe('first_game');
  });

  it('should unlock score achievements', () => {
    stats.score = 100;
    const unlocked = achievementSystem.check(stats);

    expect(unlocked.some((a) => a.id === 'score_100')).toBe(true);
  });

  it('should not unlock same achievement twice', () => {
    stats.score = 100;
    achievementSystem.check(stats);
    const unlocked = achievementSystem.check(stats);

    expect(unlocked).toHaveLength(0);
  });

  it('should track unlocked achievement IDs', () => {
    stats.score = 100;
    achievementSystem.check(stats);
    const ids = achievementSystem.getUnlockedIds();

    expect(ids).toContain('score_100');
  });

  it('should load with previously unlocked achievements', () => {
    const system = new AchievementSystem(['score_100', 'first_game']);
    const achievements = system.getAchievements();

    const firstGame = achievements.find((a) => a.id === 'first_game');
    const score100 = achievements.find((a) => a.id === 'score_100');

    expect(firstGame?.unlocked).toBe(true);
    expect(score100?.unlocked).toBe(true);
  });
});
