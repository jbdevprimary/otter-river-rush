import type { GameStats } from '@/types/Game.types';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  condition: (stats: GameStats) => boolean;
  unlocked: boolean;
}

export class AchievementSystem {
  private achievements: Achievement[];
  private unlockedIds: Set<string>;

  constructor(unlockedIds: string[] = []) {
    this.unlockedIds = new Set(unlockedIds);
    this.achievements = [
      {
        id: 'first_game',
        name: 'First Steps',
        description: 'Play your first game',
        condition: (stats) => stats.gamesPlayed >= 1,
        unlocked: false,
      },
      {
        id: 'score_100',
        name: 'Century',
        description: 'Score 100 points',
        condition: (stats) => stats.score >= 100,
        unlocked: false,
      },
      {
        id: 'score_500',
        name: 'High Roller',
        description: 'Score 500 points',
        condition: (stats) => stats.score >= 500,
        unlocked: false,
      },
      {
        id: 'score_1000',
        name: 'Master Otter',
        description: 'Score 1000 points',
        condition: (stats) => stats.score >= 1000,
        unlocked: false,
      },
      {
        id: 'powerups_10',
        name: 'Power Collector',
        description: 'Collect 10 power-ups',
        condition: (stats) => stats.powerUpsCollected >= 10,
        unlocked: false,
      },
      {
        id: 'rocks_50',
        name: 'Skilled Navigator',
        description: 'Avoid 50 rocks',
        condition: (stats) =>
          (stats.rocksAvoided || stats.obstaclesAvoided) >= 50,
        unlocked: false,
      },
    ];

    this.achievements.forEach((achievement) => {
      achievement.unlocked = this.unlockedIds.has(achievement.id);
    });
  }

  check(stats: GameStats): Achievement[] {
    const newlyUnlocked: Achievement[] = [];

    this.achievements.forEach((achievement) => {
      if (!achievement.unlocked && achievement.condition(stats)) {
        achievement.unlocked = true;
        this.unlockedIds.add(achievement.id);
        newlyUnlocked.push(achievement);
      }
    });

    return newlyUnlocked;
  }

  getAchievements(): Achievement[] {
    return this.achievements;
  }

  getUnlockedIds(): string[] {
    return Array.from(this.unlockedIds);
  }
}
