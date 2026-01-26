/**
 * @otter-river-rush/game-core/store
 * Zustand state management stores
 */

export {
  type AccessibilitySettings,
  BIOME_THRESHOLDS,
  BIOME_TRANSITION_DISTANCE,
  calculateCollectibleSpawnInterval,
  calculateObstacleSpawnInterval,
  calculateScrollSpeed,
  calculateSpeedMultiplier,
  type ColorblindMode,
  type GameSpeedOption,
  type GameState,
  getActivePowerUps,
  getComboMultiplier,
  getComboTimeRemaining,
  getPowerUpTimeRemaining,
  getTimeTrialTimeRemaining,
  getTutorialTimeRemaining,
  isComboExpired,
  isPowerUpActive,
  isTutorialActive,
  type PlayerProgress,
  POWER_UP_DISPLAYS,
  type PowerUpDisplay,
  type PowerUpState,
  TIME_TRIAL_DURATION_MS,
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
