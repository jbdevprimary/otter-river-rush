/**
 * Achievement Checker Hook
 * Periodically checks for session-based achievements during gameplay
 */

import { useEffect, useRef } from 'react';
import { checkSessionAchievements, useAchievementStore } from './achievement-store';
import { useGameStore } from './game-store';

/**
 * Interval in milliseconds between achievement checks
 */
const CHECK_INTERVAL_MS = 1000;

/**
 * Hook that periodically checks for session-based achievements during gameplay.
 * Should be called from a component that's rendered during gameplay.
 *
 * This enables achievements like:
 * - Distance milestones (100m, 500m, 1000m)
 * - Combo achievements (5x, 10x, 20x)
 * - Collection achievements in a single run
 *
 * These achievements unlock immediately when their conditions are met,
 * providing instant feedback to the player.
 */
export function useAchievementChecker(): void {
  const lastCheckRef = useRef<number>(0);
  const intervalRef = useRef<number | null>(null);

  const status = useGameStore((state) => state.status);
  const distance = useGameStore((state) => state.distance);
  const coins = useGameStore((state) => state.coins);
  const gems = useGameStore((state) => state.gems);
  const combo = useGameStore((state) => state.combo);
  const score = useGameStore((state) => state.score);

  useEffect(() => {
    // Only run checks when playing
    if (status !== 'playing') {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Update achievement tracking values
    const achievementStore = useAchievementStore.getState();
    achievementStore.updateDistance(distance);
    achievementStore.updateCoins(coins);
    achievementStore.updateGems(gems);
    achievementStore.updateCombo(combo);
    achievementStore.updateScore(score);

    // Set up periodic achievement checking
    const checkAchievements = () => {
      const now = Date.now();
      if (now - lastCheckRef.current >= CHECK_INTERVAL_MS) {
        lastCheckRef.current = now;
        checkSessionAchievements();
      }
    };

    // Initial check
    checkAchievements();

    // Set up interval
    intervalRef.current = window.setInterval(checkAchievements, CHECK_INTERVAL_MS);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [status, distance, coins, gems, combo, score]);
}
