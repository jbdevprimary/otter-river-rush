/**
 * @otter-river-rush/game-core/store
 * Zustand state management stores
 */

export {
  BIOME_THRESHOLDS,
  BIOME_TRANSITION_DISTANCE,
  calculateCollectibleSpawnInterval,
  calculateObstacleSpawnInterval,
  calculateScrollSpeed,
  calculateSpeedMultiplier,
  type GameState,
  getComboMultiplier,
  getComboTimeRemaining,
  getTutorialTimeRemaining,
  isComboExpired,
  isTutorialActive,
  type PlayerProgress,
  type PowerUpState,
  TUTORIAL_DURATION_MS,
  useGameStore,
} from './game-store';
export {
  addScore,
  clearLeaderboard,
  formatDate,
  formatDistance,
  getLeaderboard,
  isHighScore,
  type LeaderboardEntry,
} from './leaderboard';
export {
  checkSessionAchievements,
  type AchievementNotification,
  type AchievementProgress,
  type AchievementState,
  type AchievementUnlock,
  type SessionTracking,
  useAchievementStore,
} from './achievement-store';
export { useAchievementChecker } from './use-achievement-checker';
