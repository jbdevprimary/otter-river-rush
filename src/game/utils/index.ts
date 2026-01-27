/**
 * Game utilities
 */

// Haptic feedback
export { haptics } from './haptics';
export {
  createSeededRNG,
  generateSeedPhrase,
  getCurrentSeedPhrase,
  getGameRNG,
  initGameRNG,
  isValidSeedPhrase,
  resetGameRNG,
  type SeededRNG,
  WORD_POOL,
} from './seeded-random';
