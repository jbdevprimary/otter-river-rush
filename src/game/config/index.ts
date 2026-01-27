/**
 * @otter-river-rush/game-core/config
 * Central configuration for the game
 */

// Accessibility
export {
  COLORBLIND_FILTERS,
  COLORBLIND_PALETTES,
  GAME_SPEED_LABELS,
  getAccessibilityFilter,
  getColorPalette,
  HIGH_CONTRAST_COLORS,
  REDUCED_MOTION_CLASS,
  REDUCED_MOTION_STYLES,
} from './accessibility';

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
export { JUMP_PHYSICS, OTTER_PHYSICS, PHYSICS_CONFIG } from './physics-constants';

// Visual constants
export {
  DIFFICULTY,
  FLOW,
  getLaneX,
  getModelScale,
  PHYSICS,
  VISUAL,
} from './visual-constants';

// Weather constants
export {
  WEATHER_CONFIGS,
  WEATHER_PERFORMANCE,
  getEffectiveParticleCount,
  getWeatherConfig,
  type WeatherConfig,
} from './weather';

// Biome assets
export {
  BIOME_ASSETS,
  getAllModelPaths,
  getAllTexturePaths,
  getBiomeAssets,
  getRandomDecoration,
  getRandomPlant,
  getRandomRock,
  getRandomTree,
  type BiomeAssets,
  type ModelAsset,
  type PBRTexture,
} from './biome-assets';

// River width configuration
export {
  BIOME_RIVER_WIDTHS,
  RIVER_WIDTH_CHECKPOINTS,
  calculateLanePositions,
  calculateRiverBoundaries,
  calculateTargetWidth,
  getBiomeRiverWidth,
  interpolateWidth,
  seededRandom,
  type RiverWidthState,
} from './river-width';

// Graphics quality configuration
export {
  detectRecommendedQuality,
  getQualitySettings,
  QUALITY_PRESETS,
  type GraphicsQuality,
  type QualitySettings,
} from './graphics-quality';
