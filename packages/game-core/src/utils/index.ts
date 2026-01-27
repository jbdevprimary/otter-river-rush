/**
 * Game utilities
 */

export {
  createSeededRNG,
  generateSeedPhrase,
  getCurrentSeed,
  getCurrentSeedPhrase,
  getDailyChallengeSeed,
  getGameRNG,
  getSeedForSharing,
  initGameRNG,
  isCurrentDailyChallenge,
  isValidSeedPhrase,
  parseSeedFromUrl,
  resetGameRNG,
  WORD_POOL,
  type SeededRNG,
} from './seeded-random';

export {
  haptics,
  initHaptics,
  setHapticsEnabled,
  isHapticsEnabled,
  selectionFeedback,
  lightImpact,
  mediumImpact,
  heavyImpact,
  successNotification,
  warningNotification,
  errorNotification,
  continuousVibration,
  type HapticIntensity,
  type HapticFeedbackType,
} from './haptics';
