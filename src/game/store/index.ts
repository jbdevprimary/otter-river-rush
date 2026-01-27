/**
 * @otter-river-rush/game-core/store
 * Zustand state management stores
 */

export {
  type AchievementNotification,
  type AchievementProgress,
  type AchievementState,
  type AchievementUnlock,
  checkSessionAchievements,
  type SessionTracking,
  useAchievementStore,
} from './achievement-store';
export {
  type AccessibilitySettings,
  BIOME_THRESHOLDS,
  BIOME_TRANSITION_DISTANCE,
  type ColorblindMode,
  calculateCollectibleSpawnInterval,
  calculateObstacleSpawnInterval,
  calculateScrollSpeed,
  calculateSpeedMultiplier,
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
// Graphics quality store
export {
  useGraphicsStore,
  useQualityLevel,
  useQualitySettings,
} from './graphics-store';
export {
  addScore,
  clearLeaderboard,
  formatDate,
  formatDistance,
  getLeaderboard,
  isHighScore,
  type LeaderboardEntry,
} from './leaderboard';
// River path store
export {
  DEFAULT_CONSTRAINTS,
  type RiverPathStore,
  type RiverScalingData,
  useFlowSpeed,
  useIsInFork,
  useOtterScale,
  useRiverPathStore,
  useRiverScaling,
  useRiverWidth,
  useSlopeType,
  useWaterfallsInRange,
  useWhirlpoolsInRange,
} from './river-path-store';
// River width store
export {
  getCurrentBoundaries,
  getCurrentLanePositions,
  getCurrentRiverWidth,
  type RiverWidthState,
  type RiverWidthStore,
  useDynamicLaneX,
  useRiverWidthStore,
} from './river-width-store';
export { useAchievementChecker } from './use-achievement-checker';
