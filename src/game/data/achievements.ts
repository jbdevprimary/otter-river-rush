/**
 * Achievement Definitions
 * Contains all achievement configurations for the game
 */

import type { Achievement } from '../types';

/**
 * Achievement category for organization
 */
export type AchievementCategory = 'distance' | 'collection' | 'combo' | 'survival' | 'mastery';

/**
 * Extended achievement definition with tracking metadata
 */
export interface AchievementDefinition
  extends Omit<Achievement, 'progress' | 'unlocked' | 'unlockedAt'> {
  category: AchievementCategory;
  /** The stat key used to track progress */
  trackingKey: AchievementTrackingKey;
  /** Whether this achievement is tracked per-session or across all sessions */
  trackingScope: 'session' | 'lifetime';
}

/**
 * Keys used to track achievement progress
 */
export type AchievementTrackingKey =
  | 'distance'
  | 'totalDistance'
  | 'coins'
  | 'totalCoins'
  | 'gems'
  | 'totalGems'
  | 'combo'
  | 'maxCombo'
  | 'survivalTime'
  | 'gamesPlayed'
  | 'score'
  | 'highScore'
  | 'charactersUnlocked'
  | 'perfectRuns';

/**
 * All achievement definitions
 * 20+ achievements across 5 categories
 */
export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  // ============================================
  // DISTANCE ACHIEVEMENTS (4)
  // ============================================
  {
    id: 'first_hundred',
    name: 'First Splash',
    description: 'Swim 100 meters in a single run',
    icon: 'wave',
    requirement: 100,
    category: 'distance',
    trackingKey: 'distance',
    trackingScope: 'session',
    rarity: 'common',
  },
  {
    id: 'half_kilometer',
    name: 'River Runner',
    description: 'Swim 500 meters in a single run',
    icon: 'river',
    requirement: 500,
    category: 'distance',
    trackingKey: 'distance',
    trackingScope: 'session',
    rarity: 'common',
  },
  {
    id: 'kilometer_club',
    name: 'Kilometer Club',
    description: 'Swim 1000 meters in a single run',
    icon: 'medal',
    requirement: 1000,
    category: 'distance',
    trackingKey: 'distance',
    trackingScope: 'session',
    rarity: 'rare',
  },
  {
    id: 'marathon_swimmer',
    name: 'Marathon Swimmer',
    description: 'Swim 5000 meters in a single run',
    icon: 'trophy',
    requirement: 5000,
    category: 'distance',
    trackingKey: 'distance',
    trackingScope: 'session',
    rarity: 'legendary',
  },

  // ============================================
  // COLLECTION ACHIEVEMENTS - COINS (4)
  // ============================================
  {
    id: 'first_coin',
    name: 'Shiny!',
    description: 'Collect your first coin',
    icon: 'coin',
    requirement: 1,
    category: 'collection',
    trackingKey: 'coins',
    trackingScope: 'session',
    rarity: 'common',
  },
  {
    id: 'coin_collector',
    name: 'Coin Collector',
    description: 'Collect 100 coins in a single run',
    icon: 'coins',
    requirement: 100,
    category: 'collection',
    trackingKey: 'coins',
    trackingScope: 'session',
    rarity: 'common',
  },
  {
    id: 'coin_hoarder',
    name: 'Coin Hoarder',
    description: 'Collect 1000 coins total',
    icon: 'treasure',
    requirement: 1000,
    category: 'collection',
    trackingKey: 'totalCoins',
    trackingScope: 'lifetime',
    rarity: 'rare',
  },
  {
    id: 'golden_otter',
    name: 'Golden Otter',
    description: 'Collect 10000 coins total',
    icon: 'crown',
    requirement: 10000,
    category: 'collection',
    trackingKey: 'totalCoins',
    trackingScope: 'lifetime',
    rarity: 'legendary',
  },

  // ============================================
  // COLLECTION ACHIEVEMENTS - GEMS (3)
  // ============================================
  {
    id: 'first_gem',
    name: 'Gem Hunter',
    description: 'Collect your first gem',
    icon: 'gem',
    requirement: 1,
    category: 'collection',
    trackingKey: 'gems',
    trackingScope: 'session',
    rarity: 'common',
  },
  {
    id: 'gem_collector',
    name: 'Gem Collector',
    description: 'Collect 50 gems total',
    icon: 'gems',
    requirement: 50,
    category: 'collection',
    trackingKey: 'totalGems',
    trackingScope: 'lifetime',
    rarity: 'rare',
  },
  {
    id: 'gem_master',
    name: 'Gem Master',
    description: 'Collect 500 gems total',
    icon: 'diamond',
    requirement: 500,
    category: 'collection',
    trackingKey: 'totalGems',
    trackingScope: 'lifetime',
    rarity: 'epic',
  },

  // ============================================
  // COMBO ACHIEVEMENTS (4)
  // ============================================
  {
    id: 'combo_starter',
    name: 'Combo Starter',
    description: 'Reach a 5x combo',
    icon: 'fire',
    requirement: 5,
    category: 'combo',
    trackingKey: 'combo',
    trackingScope: 'session',
    rarity: 'common',
  },
  {
    id: 'combo_master',
    name: 'Combo Master',
    description: 'Reach a 10x combo',
    icon: 'flame',
    requirement: 10,
    category: 'combo',
    trackingKey: 'combo',
    trackingScope: 'session',
    rarity: 'rare',
  },
  {
    id: 'combo_legend',
    name: 'Combo Legend',
    description: 'Reach a 20x combo',
    icon: 'inferno',
    requirement: 20,
    category: 'combo',
    trackingKey: 'combo',
    trackingScope: 'session',
    rarity: 'epic',
  },
  {
    id: 'combo_god',
    name: 'Unstoppable',
    description: 'Reach a 50x combo',
    icon: 'star',
    requirement: 50,
    category: 'combo',
    trackingKey: 'combo',
    trackingScope: 'session',
    rarity: 'legendary',
  },

  // ============================================
  // SURVIVAL ACHIEVEMENTS (3)
  // ============================================
  {
    id: 'survivor',
    name: 'Survivor',
    description: 'Survive for 1 minute without taking damage',
    icon: 'shield',
    requirement: 60,
    category: 'survival',
    trackingKey: 'survivalTime',
    trackingScope: 'session',
    rarity: 'rare',
  },
  {
    id: 'untouchable',
    name: 'Untouchable',
    description: 'Survive for 5 minutes without taking damage',
    icon: 'heart',
    requirement: 300,
    category: 'survival',
    trackingKey: 'survivalTime',
    trackingScope: 'session',
    rarity: 'epic',
  },
  {
    id: 'perfect_run',
    name: 'Perfect Run',
    description: 'Complete a run without taking any damage',
    icon: 'sparkle',
    requirement: 1,
    category: 'survival',
    trackingKey: 'perfectRuns',
    trackingScope: 'session',
    rarity: 'legendary',
  },

  // ============================================
  // MASTERY ACHIEVEMENTS (4)
  // ============================================
  {
    id: 'first_game',
    name: 'Welcome to the River',
    description: 'Play your first game',
    icon: 'wave',
    requirement: 1,
    category: 'mastery',
    trackingKey: 'gamesPlayed',
    trackingScope: 'lifetime',
    rarity: 'common',
  },
  {
    id: 'dedicated_player',
    name: 'Dedicated Player',
    description: 'Play 50 games',
    icon: 'calendar',
    requirement: 50,
    category: 'mastery',
    trackingKey: 'gamesPlayed',
    trackingScope: 'lifetime',
    rarity: 'rare',
  },
  {
    id: 'high_scorer',
    name: 'High Scorer',
    description: 'Achieve a score of 10000 points',
    icon: 'trophy',
    requirement: 10000,
    category: 'mastery',
    trackingKey: 'score',
    trackingScope: 'session',
    rarity: 'epic',
  },
  {
    id: 'character_collector',
    name: 'Character Collector',
    description: 'Unlock all otter characters',
    icon: 'team',
    requirement: 4,
    category: 'mastery',
    trackingKey: 'charactersUnlocked',
    trackingScope: 'lifetime',
    rarity: 'legendary',
  },
];

/**
 * Get achievement definition by ID
 */
export function getAchievementDefinition(id: string): AchievementDefinition | undefined {
  return ACHIEVEMENT_DEFINITIONS.find((a) => a.id === id);
}

/**
 * Get all achievements in a category
 */
export function getAchievementsByCategory(category: AchievementCategory): AchievementDefinition[] {
  return ACHIEVEMENT_DEFINITIONS.filter((a) => a.category === category);
}

/**
 * Get all achievement IDs
 */
export function getAllAchievementIds(): string[] {
  return ACHIEVEMENT_DEFINITIONS.map((a) => a.id);
}

/**
 * Get achievement count
 */
export function getAchievementCount(): number {
  return ACHIEVEMENT_DEFINITIONS.length;
}
