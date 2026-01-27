/**
 * Leaderboard utilities for localStorage persistence
 * Stores top 10 runs with score, distance, date, and character used
 */

import type { GameMode } from '../types';

export interface LeaderboardEntry {
  rank: number;
  score: number;
  distance: number;
  date: number;
  characterId: string;
  mode: GameMode;
}

const STORAGE_KEY = 'otter-river-rush-leaderboard';
const MAX_ENTRIES = 10;

/**
 * Get the current leaderboard from localStorage
 * Returns an array of top 10 entries sorted by score (descending)
 */
export function getLeaderboard(): LeaderboardEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const entries: LeaderboardEntry[] = JSON.parse(stored);

    // Validate and sanitize entries
    return entries
      .filter(
        (entry) =>
          typeof entry.score === 'number' &&
          typeof entry.distance === 'number' &&
          typeof entry.date === 'number' &&
          typeof entry.characterId === 'string'
      )
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_ENTRIES)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));
  } catch {
    // If parsing fails, return empty leaderboard
    return [];
  }
}

/**
 * Check if a score qualifies for the leaderboard
 * Returns true if the score would be in the top 10
 */
export function isHighScore(score: number): boolean {
  if (score <= 0) {
    return false;
  }

  const leaderboard = getLeaderboard();

  // If leaderboard has fewer than MAX_ENTRIES, any positive score qualifies
  if (leaderboard.length < MAX_ENTRIES) {
    return true;
  }

  // Check if score beats the lowest entry
  const lowestScore = leaderboard[leaderboard.length - 1]?.score ?? 0;
  return score > lowestScore;
}

/**
 * Add a new score to the leaderboard
 * Returns the rank of the new entry (1-10), or null if it didn't qualify
 */
export function addScore(
  score: number,
  distance: number,
  characterId: string,
  mode: GameMode = 'classic'
): number | null {
  if (!isHighScore(score)) {
    return null;
  }

  const newEntry: LeaderboardEntry = {
    rank: 0, // Will be set after sorting
    score,
    distance,
    date: Date.now(),
    characterId,
    mode,
  };

  const leaderboard = getLeaderboard();
  leaderboard.push(newEntry);

  // Sort by score descending and keep only top entries
  const sortedLeaderboard = leaderboard
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_ENTRIES)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

  // Find the rank of the newly added entry
  const newEntryRank = sortedLeaderboard.find(
    (entry) => entry.score === score && entry.distance === distance && entry.date === newEntry.date
  )?.rank;

  // Save to localStorage
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sortedLeaderboard));
  } catch {
    // If storage fails, we still return the rank
    console.warn('Failed to save leaderboard to localStorage');
  }

  return newEntryRank ?? null;
}

/**
 * Clear the entire leaderboard
 * Useful for development/testing
 */
export function clearLeaderboard(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    console.warn('Failed to clear leaderboard from localStorage');
  }
}

/**
 * Format a date timestamp for display
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format distance for display (e.g., "1.2km" or "500m")
 */
export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)}km`;
  }
  return `${Math.round(meters)}m`;
}
