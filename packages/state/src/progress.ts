
import type { GameState, PlayerProgress } from './game-store';

/**
 * Checks for and unlocks new characters based on player progress.
 * @param progress The player's current progress.
 * @returns A new array of unlocked character IDs.
 */
export function checkCharacterUnlocks(progress: PlayerProgress): string[] {
  const unlockedCharacters = [...progress.unlockedCharacters];

  // Sterling unlocks at 1000m total distance
  if (progress.totalDistance >= 1000 && !unlockedCharacters.includes('sterling')) {
    unlockedCharacters.push('sterling');
  }

  // Goldie unlocks at 5000 total coins
  if (progress.totalCoins >= 5000 && !unlockedCharacters.includes('goldie')) {
    unlockedCharacters.push('goldie');
  }

  // Frost unlocks at 10000 high score
  if (progress.highScore >= 10000 && !unlockedCharacters.includes('frost')) {
    unlockedCharacters.push('frost');
  }

  return unlockedCharacters;
}

/**
 * Updates the player's progress at the end of a game.
 * @param state The current game state.
 * @returns The updated player progress.
 */
export function updatePlayerProgress(state: GameState): PlayerProgress {
  const newProgress: PlayerProgress = {
    ...state.progress,
    totalDistance: state.progress.totalDistance + state.distance,
    totalCoins: state.progress.totalCoins + state.coins,
    totalGems: state.progress.totalGems + state.gems,
    gamesPlayed: state.progress.gamesPlayed + 1,
    highScore: Math.max(state.score, state.progress.highScore),
    unlockedCharacters: state.progress.unlockedCharacters,
  };

  newProgress.unlockedCharacters = checkCharacterUnlocks(newProgress);

  return newProgress;
}
