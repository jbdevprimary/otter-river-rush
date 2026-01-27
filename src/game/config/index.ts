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
// Biome assets
export {
  BIOME_ASSETS,
  type BiomeAssets,
  getAllModelPaths,
  getAllTexturePaths,
  getBiomeAssets,
  getRandomDecoration,
  getRandomPlant,
  getRandomRock,
  getRandomTree,
  type ModelAsset,
  type PBRTexture,
} from './biome-assets';
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
// Graphics quality configuration
export {
  detectRecommendedQuality,
  type GraphicsQuality,
  getQualitySettings,
  QUALITY_PRESETS,
  type QualitySettings,
} from './graphics-quality';
// Physics constants
export { JUMP_PHYSICS, OTTER_PHYSICS, PHYSICS_CONFIG } from './physics-constants';
// River width configuration
export {
  BIOME_RIVER_WIDTHS,
  calculateLanePositions,
  calculateRiverBoundaries,
  calculateTargetWidth,
  getBiomeRiverWidth,
  interpolateWidth,
  RIVER_WIDTH_CHECKPOINTS,
  type RiverWidthState,
  seededRandom,
} from './river-width';
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
  getEffectiveParticleCount,
  getWeatherConfig,
  WEATHER_CONFIGS,
  WEATHER_PERFORMANCE,
  type WeatherConfig,
} from './weather';
