/**
 * Achievement Store using Zustand
 * Handles achievement tracking, progress, and unlocking
 */

import { create, type StateCreator } from 'zustand';
import { persist } from '../../lib/zustand-middleware';
import {
  ACHIEVEMENT_DEFINITIONS,
  type AchievementDefinition,
  type AchievementTrackingKey,
  getAchievementDefinition,
} from '../data/achievements';

/**
 * Runtime achievement progress tracking
 */
export interface AchievementProgress {
  [achievementId: string]: number;
}

/**
 * Achievement unlock record
 */
export interface AchievementUnlock {
  id: string;
  unlockedAt: number;
}

/**
 * Session-specific tracking values (reset each game)
 */
export interface SessionTracking {
  distance: number;
  coins: number;
  gems: number;
  combo: number;
  maxCombo: number;
  survivalTime: number;
  damageTaken: boolean;
  score: number;
  gameStartTime: number;
  lastDamageTime: number;
}

/**
 * Achievement notification queue item
 */
export interface AchievementNotification {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  timestamp: number;
}

export interface AchievementState {
  // Persistent state
  unlockedAchievements: AchievementUnlock[];
  lifetimeProgress: AchievementProgress;

  // Session state
  sessionTracking: SessionTracking;

  // Notification queue
  pendingNotifications: AchievementNotification[];

  // Actions
  startSession: () => void;
  endSession: (finalStats: {
    distance: number;
    coins: number;
    gems: number;
    score: number;
    gamesPlayed: number;
    totalCoins: number;
    totalGems: number;
    totalDistance: number;
    charactersUnlocked: number;
  }) => AchievementNotification[];

  // Tracking updates (called during gameplay)
  updateDistance: (distance: number) => void;
  updateCoins: (coins: number) => void;
  updateGems: (gems: number) => void;
  updateCombo: (combo: number) => void;
  recordDamage: () => void;
  updateScore: (score: number) => void;

  // Check and unlock achievements
  checkAchievements: (
    stats: Partial<Record<AchievementTrackingKey, number>>
  ) => AchievementNotification[];

  // Notification management
  dismissNotification: (id: string) => void;
  clearNotifications: () => void;

  // Queries
  isUnlocked: (achievementId: string) => boolean;
  getProgress: (achievementId: string) => number;
  getUnlockedCount: () => number;
  getTotalCount: () => number;
  getUnlockedAchievements: () => AchievementDefinition[];
  getLockedAchievements: () => AchievementDefinition[];
}

const initialSessionTracking: SessionTracking = {
  distance: 0,
  coins: 0,
  gems: 0,
  combo: 0,
  maxCombo: 0,
  survivalTime: 0,
  damageTaken: false,
  score: 0,
  gameStartTime: 0,
  lastDamageTime: 0,
};

const createAchievementState: StateCreator<AchievementState> = (set, get) => ({
  // Initial state
  unlockedAchievements: [],
  lifetimeProgress: {},
  sessionTracking: { ...initialSessionTracking },
  pendingNotifications: [],

  // Start a new game session
  startSession: () => {
    const now = Date.now();
    set({
      sessionTracking: {
        ...initialSessionTracking,
        gameStartTime: now,
        lastDamageTime: now,
      },
    });
  },

  // End game session and check for achievements
  endSession: (finalStats) => {
    const state = get();
    const now = Date.now();

    // Calculate survival time (time since last damage)
    const survivalTimeSeconds = state.sessionTracking.damageTaken
      ? Math.max(
          0,
          Math.floor(
            (state.sessionTracking.lastDamageTime - state.sessionTracking.gameStartTime) / 1000
          )
        )
      : Math.max(0, Math.floor((now - state.sessionTracking.gameStartTime) / 1000));

    // Check for perfect run
    const perfectRuns = !state.sessionTracking.damageTaken && finalStats.distance >= 100 ? 1 : 0;

    // Combine session and lifetime stats for checking
    const combinedStats: Partial<Record<AchievementTrackingKey, number>> = {
      // Session stats
      distance: finalStats.distance,
      coins: finalStats.coins,
      gems: finalStats.gems,
      combo: state.sessionTracking.maxCombo,
      maxCombo: state.sessionTracking.maxCombo,
      survivalTime: survivalTimeSeconds,
      score: finalStats.score,
      perfectRuns,

      // Lifetime stats
      totalDistance: finalStats.totalDistance,
      totalCoins: finalStats.totalCoins,
      totalGems: finalStats.totalGems,
      gamesPlayed: finalStats.gamesPlayed,
      highScore: finalStats.score, // Will be compared against requirement
      charactersUnlocked: finalStats.charactersUnlocked,
    };

    // Update lifetime progress
    const newLifetimeProgress = { ...state.lifetimeProgress };
    newLifetimeProgress.totalDistance = finalStats.totalDistance;
    newLifetimeProgress.totalCoins = finalStats.totalCoins;
    newLifetimeProgress.totalGems = finalStats.totalGems;
    newLifetimeProgress.gamesPlayed = finalStats.gamesPlayed;
    newLifetimeProgress.charactersUnlocked = finalStats.charactersUnlocked;
    newLifetimeProgress.highScore = Math.max(newLifetimeProgress.highScore ?? 0, finalStats.score);

    set({ lifetimeProgress: newLifetimeProgress });

    // Check for new achievements
    return get().checkAchievements(combinedStats);
  },

  // Update distance during gameplay
  updateDistance: (distance) => {
    set((state) => ({
      sessionTracking: {
        ...state.sessionTracking,
        distance,
      },
    }));
  },

  // Update coins during gameplay
  updateCoins: (coins) => {
    set((state) => ({
      sessionTracking: {
        ...state.sessionTracking,
        coins,
      },
    }));
  },

  // Update gems during gameplay
  updateGems: (gems) => {
    set((state) => ({
      sessionTracking: {
        ...state.sessionTracking,
        gems,
      },
    }));
  },

  // Update combo during gameplay
  updateCombo: (combo) => {
    set((state) => ({
      sessionTracking: {
        ...state.sessionTracking,
        combo,
        maxCombo: Math.max(state.sessionTracking.maxCombo, combo),
      },
    }));
  },

  // Record damage taken
  recordDamage: () => {
    set((state) => ({
      sessionTracking: {
        ...state.sessionTracking,
        damageTaken: true,
        lastDamageTime: Date.now(),
      },
    }));
  },

  // Update score during gameplay
  updateScore: (score) => {
    set((state) => ({
      sessionTracking: {
        ...state.sessionTracking,
        score,
      },
    }));
  },

  // Check achievements and return any newly unlocked
  checkAchievements: (stats) => {
    const state = get();
    const newlyUnlocked: AchievementNotification[] = [];
    const now = Date.now();

    for (const achievement of ACHIEVEMENT_DEFINITIONS) {
      // Skip already unlocked achievements
      if (state.isUnlocked(achievement.id)) {
        continue;
      }

      // Get the relevant stat value
      const statValue = stats[achievement.trackingKey] ?? 0;

      // Check if requirement is met
      if (statValue >= achievement.requirement) {
        // Unlock the achievement
        const unlock: AchievementUnlock = {
          id: achievement.id,
          unlockedAt: now,
        };

        const notification: AchievementNotification = {
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          rarity: achievement.rarity,
          timestamp: now,
        };

        newlyUnlocked.push(notification);

        // Update state
        set((prevState) => ({
          unlockedAchievements: [...prevState.unlockedAchievements, unlock],
          pendingNotifications: [...prevState.pendingNotifications, notification],
        }));
      }
    }

    return newlyUnlocked;
  },

  // Dismiss a notification
  dismissNotification: (id) => {
    set((state) => ({
      pendingNotifications: state.pendingNotifications.filter((n) => n.id !== id),
    }));
  },

  // Clear all notifications
  clearNotifications: () => {
    set({ pendingNotifications: [] });
  },

  // Check if an achievement is unlocked
  isUnlocked: (achievementId) => {
    return get().unlockedAchievements.some((a) => a.id === achievementId);
  },

  // Get progress for an achievement
  getProgress: (achievementId) => {
    const state = get();
    const definition = getAchievementDefinition(achievementId);

    if (!definition) return 0;

    // For session achievements, return session tracking value
    if (definition.trackingScope === 'session') {
      const sessionValue = state.sessionTracking[definition.trackingKey as keyof SessionTracking];
      if (typeof sessionValue === 'number') {
        return Math.min(sessionValue, definition.requirement);
      }
      return 0;
    }

    // For lifetime achievements, return lifetime progress
    return state.lifetimeProgress[definition.trackingKey] ?? 0;
  },

  // Get count of unlocked achievements
  getUnlockedCount: () => {
    return get().unlockedAchievements.length;
  },

  // Get total achievement count
  getTotalCount: () => {
    return ACHIEVEMENT_DEFINITIONS.length;
  },

  // Get all unlocked achievement definitions
  getUnlockedAchievements: () => {
    const state = get();
    return ACHIEVEMENT_DEFINITIONS.filter((a) =>
      state.unlockedAchievements.some((u) => u.id === a.id)
    );
  },

  // Get all locked achievement definitions
  getLockedAchievements: () => {
    const state = get();
    return ACHIEVEMENT_DEFINITIONS.filter(
      (a) => !state.unlockedAchievements.some((u) => u.id === a.id)
    );
  },
});

export const useAchievementStore = create<AchievementState>()(
  persist(createAchievementState, {
    name: 'otter-river-rush-achievements',
    // Only persist unlocked achievements and lifetime progress
    partialize: (state) => ({
      unlockedAchievements: state.unlockedAchievements,
      lifetimeProgress: state.lifetimeProgress,
    }),
  })
);

/**
 * Hook to check achievements during gameplay
 * Call this in the game loop or on relevant events
 */
export function checkSessionAchievements(): AchievementNotification[] {
  const store = useAchievementStore.getState();
  const session = store.sessionTracking;

  return store.checkAchievements({
    distance: session.distance,
    coins: session.coins,
    gems: session.gems,
    combo: session.maxCombo,
    maxCombo: session.maxCombo,
    score: session.score,
  });
}
