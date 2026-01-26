/**
 * @otter-river-rush/game-core/config
 * Central configuration for the game
 */

// Character definitions
export {
  getCharacter,
  getDefaultCharacter,
  isCharacterUnlocked,
  OTTER_CHARACTERS,
  type OtterCharacter,
} from './characters';

// Colors
export {
  BIOME_COLORS,
  COLORS,
  ENTITY_COLORS,
  PARTICLE_COLORS,
  UI_COLORS,
} from './colors';

// Game constants
export {
  DIFFICULTY_PRESETS,
  GAME_CONFIG,
  GAME_MODES,
} from './game-constants';

// Physics constants
export { PHYSICS_CONFIG } from './physics-constants';

// Visual constants
export {
  DIFFICULTY,
  FLOW,
  getLaneX,
  getModelScale,
  PHYSICS,
  VISUAL,
} from './visual-constants';
