/**
 * @otter-river-rush/config
 * Central configuration for the game
 */

// Visual constants
export {
  VISUAL,
  FLOW,
  PHYSICS,
  getLaneX,
  getModelScale,
} from './visual-constants';

// Game constants
export {
  GAME_CONFIG,
  DIFFICULTY_PRESETS,
  GAME_MODES,
} from './game-constants';

// Physics constants
export { PHYSICS_CONFIG } from './physics-constants';

// Colors
export {
  BIOME_COLORS,
  ENTITY_COLORS,
  PARTICLE_COLORS,
  UI_COLORS,
  COLORS,
} from './colors';

// Character definitions
export {
  OTTER_CHARACTERS,
  getCharacter,
  getDefaultCharacter,
  isCharacterUnlocked,
  type OtterCharacter,
} from './characters';
