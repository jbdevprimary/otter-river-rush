/**
 * Achievement management system
 */

import type { Achievement, GameStats, PlayerProfile } from '@/types/Game.types';
import { SaveManager } from './SaveManager';

interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  check: (
    stats: GameStats,
    profile?: import('@/types/Game.types').PlayerProfile
  ) => number; // Returns progress 0-1
  requirement: number;
}

export class AchievementManager {
  private achievements: Achievement[] = [];
  private definitions: AchievementDefinition[] = [];
  private saveManager: SaveManager;
  private unlockCallbacks: Set<(achievement: Achievement) => void> = new Set();

  constructor(saveManager: SaveManager) {
    this.saveManager = saveManager;
    this.initializeDefinitions();
    this.loadAchievements();
  }

  /**
   * Initialize achievement definitions
   */
  private initializeDefinitions(): void {
    this.definitions = [
      // Distance achievements
      {
        id: 'first_steps',
        name: 'First Steps',
        description: 'Travel 100 meters',
        icon: '🦦',
        rarity: 'common',
        requirement: 100,
        check: (stats) => stats.distance / 100,
      },
      {
        id: 'long_journey',
        name: 'Long Journey',
        description: 'Travel 1000 meters',
        icon: '🌊',
        rarity: 'common',
        requirement: 1000,
        check: (stats) => stats.distance / 1000,
      },
      {
        id: 'marathon_runner',
        name: 'Marathon Runner',
        description: 'Travel 5000 meters',
        icon: '🏃',
        rarity: 'rare',
        requirement: 5000,
        check: (stats) => stats.distance / 5000,
      },
      {
        id: 'endless_voyage',
        name: 'Endless Voyage',
        description: 'Travel 10000 meters',
        icon: '🚀',
        rarity: 'epic',
        requirement: 10000,
        check: (stats) => stats.distance / 10000,
      },

      // Score achievements
      {
        id: 'score_novice',
        name: 'Score Novice',
        description: 'Reach 1000 points',
        icon: '⭐',
        rarity: 'common',
        requirement: 1000,
        check: (stats) => stats.score / 1000,
      },
      {
        id: 'score_master',
        name: 'Score Master',
        description: 'Reach 10000 points',
        icon: '🌟',
        rarity: 'rare',
        requirement: 10000,
        check: (stats) => stats.score / 10000,
      },
      {
        id: 'score_legend',
        name: 'Score Legend',
        description: 'Reach 50000 points',
        icon: '💫',
        rarity: 'epic',
        requirement: 50000,
        check: (stats) => stats.score / 50000,
      },
      {
        id: 'high_scorer',
        name: 'High Scorer',
        description: 'Reach 100000 points',
        icon: '🏆',
        rarity: 'legendary',
        requirement: 100000,
        check: (stats) => stats.score / 100000,
      },

      // Coin achievements
      {
        id: 'coin_collector',
        name: 'Coin Collector',
        description: 'Collect 100 coins in one run',
        icon: '🪙',
        rarity: 'common',
        requirement: 100,
        check: (stats) => stats.coins / 100,
      },
      {
        id: 'treasure_hunter',
        name: 'Treasure Hunter',
        description: 'Collect 500 coins in one run',
        icon: '💰',
        rarity: 'rare',
        requirement: 500,
        check: (stats) => stats.coins / 500,
      },
      {
        id: 'wealthy_otter',
        name: 'Wealthy Otter',
        description: 'Collect 1000 coins in one run',
        icon: '💎',
        rarity: 'epic',
        requirement: 1000,
        check: (stats) => stats.coins / 1000,
      },

      // Combo achievements
      {
        id: 'combo_starter',
        name: 'Combo Starter',
        description: 'Reach a 10x combo',
        icon: '🔥',
        rarity: 'common',
        requirement: 10,
        check: (stats) => stats.combo / 10,
      },
      {
        id: 'combo_master',
        name: 'Combo Master',
        description: 'Reach a 50x combo',
        icon: '⚡',
        rarity: 'rare',
        requirement: 50,
        check: (stats) => stats.combo / 50,
      },
      {
        id: 'combo_god',
        name: 'Combo God',
        description: 'Reach a 100x combo',
        icon: '🌩️',
        rarity: 'legendary',
        requirement: 100,
        check: (stats) => stats.combo / 100,
      },

      // Dodge achievements
      {
        id: 'dodge_beginner',
        name: 'Dodge Beginner',
        description: 'Avoid 50 obstacles',
        icon: '🛡️',
        rarity: 'common',
        requirement: 50,
        check: (stats) => stats.obstaclesAvoided / 50,
      },
      {
        id: 'dodge_expert',
        name: 'Dodge Expert',
        description: 'Avoid 500 obstacles',
        icon: '🎯',
        rarity: 'rare',
        requirement: 500,
        check: (stats) => stats.obstaclesAvoided / 500,
      },
      {
        id: 'untouchable',
        name: 'Untouchable',
        description: 'Avoid 1000 obstacles',
        icon: '👻',
        rarity: 'epic',
        requirement: 1000,
        check: (stats) => stats.obstaclesAvoided / 1000,
      },

      // Close call achievements
      {
        id: 'close_call',
        name: 'Close Call',
        description: 'Have 10 close calls',
        icon: '😅',
        rarity: 'common',
        requirement: 10,
        check: (stats) => stats.closeCallsCount / 10,
      },
      {
        id: 'risk_taker',
        name: 'Risk Taker',
        description: 'Have 50 close calls',
        icon: '🎲',
        rarity: 'rare',
        requirement: 50,
        check: (stats) => stats.closeCallsCount / 50,
      },
      {
        id: 'thrill_seeker',
        name: 'Thrill Seeker',
        description: 'Have 100 close calls',
        icon: '🎢',
        rarity: 'epic',
        requirement: 100,
        check: (stats) => stats.closeCallsCount / 100,
      },

      // Power-up achievements
      {
        id: 'powered_up',
        name: 'Powered Up',
        description: 'Collect 10 power-ups',
        icon: '⚡',
        rarity: 'common',
        requirement: 10,
        check: (stats) => stats.powerUpsCollected / 10,
      },
      {
        id: 'power_collector',
        name: 'Power Collector',
        description: 'Collect 50 power-ups',
        icon: '🔋',
        rarity: 'rare',
        requirement: 50,
        check: (stats) => stats.powerUpsCollected / 50,
      },

      // Time-based achievements
      {
        id: 'quick_run',
        name: 'Quick Run',
        description: 'Play for 1 minute',
        icon: '⏱️',
        rarity: 'common',
        requirement: 60000,
        check: (stats) => (stats.sessionTime || 0) / 60000,
      },
      {
        id: 'endurance',
        name: 'Endurance',
        description: 'Play for 5 minutes',
        icon: '⏳',
        rarity: 'rare',
        requirement: 300000,
        check: (stats) => (stats.sessionTime || 0) / 300000,
      },
      {
        id: 'marathon',
        name: 'Marathon',
        description: 'Play for 10 minutes',
        icon: '🏃',
        rarity: 'epic',
        requirement: 600000,
        check: (stats) => (stats.sessionTime || 0) / 600000,
      },
    ];
  }

  /**
   * Load achievements from storage
   */
  private loadAchievements(): void {
    const saved = this.saveManager.loadAchievements();

    if (saved.length > 0) {
      this.achievements = saved;
    } else {
      // Initialize achievements from definitions
      this.achievements = this.definitions.map((def) => ({
        id: def.id,
        name: def.name,
        description: def.description,
        icon: def.icon,
        requirement: def.requirement,
        progress: 0,
        unlocked: false,
        rarity: def.rarity,
      }));
      this.saveAchievements();
    }
  }

  /**
   * Save achievements to storage
   */
  private saveAchievements(): void {
    this.saveManager.saveAchievements(this.achievements);
  }

  /**
   * Check and update achievements
   */
  public checkAchievements(
    stats: GameStats,
    profile?: PlayerProfile
  ): Achievement[] {
    const newlyUnlocked: Achievement[] = [];

    this.achievements.forEach((achievement) => {
      if (achievement.unlocked) return;

      const definition = this.definitions.find((d) => d.id === achievement.id);
      if (!definition) return;

      // Check progress
      const progress = Math.min(1, definition.check(stats, profile));
      achievement.progress = progress * achievement.requirement;

      // Check if unlocked
      if (progress >= 1) {
        achievement.unlocked = true;
        achievement.unlockedAt = Date.now();
        newlyUnlocked.push(achievement);

        // Notify listeners
        this.unlockCallbacks.forEach((callback) => callback(achievement));
      }
    });

    if (newlyUnlocked.length > 0) {
      this.saveAchievements();
    }

    return newlyUnlocked;
  }

  /**
   * Get all achievements
   */
  public getAchievements(): Achievement[] {
    return [...this.achievements];
  }

  /**
   * Get unlocked achievements
   */
  public getUnlockedAchievements(): Achievement[] {
    return this.achievements.filter((a) => a.unlocked);
  }

  /**
   * Get locked achievements
   */
  public getLockedAchievements(): Achievement[] {
    return this.achievements.filter((a) => !a.unlocked);
  }

  /**
   * Get achievements by rarity
   */
  public getAchievementsByRarity(
    rarity: 'common' | 'rare' | 'epic' | 'legendary'
  ): Achievement[] {
    return this.achievements.filter((a) => a.rarity === rarity);
  }

  /**
   * Get completion percentage
   */
  public getCompletionPercentage(): number {
    const unlocked = this.achievements.filter((a) => a.unlocked).length;
    return (unlocked / this.achievements.length) * 100;
  }

  /**
   * Register unlock callback
   */
  public onAchievementUnlock(
    callback: (achievement: Achievement) => void
  ): () => void {
    this.unlockCallbacks.add(callback);
    return () => {
      this.unlockCallbacks.delete(callback);
    };
  }

  /**
   * Reset all achievements
   */
  public reset(): void {
    this.achievements.forEach((achievement) => {
      achievement.unlocked = false;
      achievement.progress = 0;
      achievement.unlockedAt = undefined;
    });
    this.saveAchievements();
  }

  /**
   * Unlock achievement manually (for testing)
   */
  public unlockAchievement(id: string): boolean {
    const achievement = this.achievements.find((a) => a.id === id);
    if (!achievement || achievement.unlocked) {
      return false;
    }

    achievement.unlocked = true;
    achievement.unlockedAt = Date.now();
    achievement.progress = achievement.requirement;

    this.unlockCallbacks.forEach((callback) => callback(achievement));
    this.saveAchievements();

    return true;
  }
}
