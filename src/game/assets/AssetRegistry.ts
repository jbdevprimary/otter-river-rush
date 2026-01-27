/**
 * Asset Registry - Single Source of Truth
 *
 * All game assets are defined here. Platform bridges resolve these to actual paths/requires.
 * NO HARDCODED PATHS ANYWHERE ELSE IN THE CODEBASE.
 */

export interface AssetDefinition {
  path: string;
  source: 'kenney' | 'quaternius' | 'ambientcg' | 'meshy';
  scale?: number;
  value?: number;
  loop?: boolean;
}

export interface TextureSet {
  color: string;
  normal?: string;
  roughness?: string;
  ao?: string;
  displacement?: string;
  source: string;
}

// =============================================================================
// MODEL ASSETS
// =============================================================================

export const ModelAssets = {
  player: {
    otter: {
      path: 'models/player/otter-player/model.glb',
      source: 'meshy' as const,
      scale: 2.0,
    },
    otterSilver: {
      path: 'models/player/otter-silver/model.glb',
      source: 'meshy' as const,
      scale: 2.0,
    },
    otterGolden: {
      path: 'models/player/otter-golden/model.glb',
      source: 'meshy' as const,
      scale: 2.0,
    },
    otterArctic: {
      path: 'models/player/otter-arctic/model.glb',
      source: 'meshy' as const,
      scale: 2.0,
    },
  },

  obstacles: {
    // Shared rocks (used across biomes)
    rockSmallC: {
      path: 'models/environment/shared/rock_smallC.glb',
      source: 'kenney' as const,
      scale: 1.5,
    },
    rockSmallD: {
      path: 'models/environment/shared/rock_smallD.glb',
      source: 'kenney' as const,
      scale: 1.5,
    },
    rockSmallE: {
      path: 'models/environment/shared/rock_smallE.glb',
      source: 'kenney' as const,
      scale: 1.5,
    },
    // Canyon/volcanic large rocks
    rockLargeA: {
      path: 'models/environment/canyon/rock_largeA.glb',
      source: 'kenney' as const,
      scale: 1.2,
    },
    rockLargeB: {
      path: 'models/environment/canyon/rock_largeB.glb',
      source: 'kenney' as const,
      scale: 1.2,
    },
    rockTallA: {
      path: 'models/environment/canyon/rock_tallA.glb',
      source: 'kenney' as const,
      scale: 1.0,
    },
    // Stumps
    stumpRound: {
      path: 'models/environment/shared/stump_round.glb',
      source: 'kenney' as const,
      scale: 1.0,
    },
    stumpOld: {
      path: 'models/environment/shared/stump_old.glb',
      source: 'kenney' as const,
      scale: 1.0,
    },
    // Forest logs
    log: {
      path: 'models/environment/forest/log.glb',
      source: 'kenney' as const,
      scale: 1.2,
    },
    logLarge: {
      path: 'models/environment/forest/log_large.glb',
      source: 'kenney' as const,
      scale: 1.0,
    },
  },

  collectibles: {
    // CC0 Kenney coins
    coinGold: {
      path: 'models/collectible/coins/coin-gold.glb',
      source: 'kenney' as const,
      scale: 0.8,
      value: 10,
    },
    coinSilver: {
      path: 'models/collectible/coins/coin-silver.glb',
      source: 'kenney' as const,
      scale: 0.8,
      value: 5,
    },
    coinBronze: {
      path: 'models/collectible/coins/coin-bronze.glb',
      source: 'kenney' as const,
      scale: 0.8,
      value: 2,
    },
    // CC0 Kenney gems
    crystalSmall: {
      path: 'models/collectible/gems/detail-crystal.glb',
      source: 'kenney' as const,
      scale: 1.0,
      value: 50,
    },
    crystalLarge: {
      path: 'models/collectible/gems/detail-crystal-large.glb',
      source: 'kenney' as const,
      scale: 1.0,
      value: 75,
    },
    heart: {
      path: 'models/collectible/gems/heart.glb',
      source: 'kenney' as const,
      scale: 1.0,
      value: 100,
    },
  },

  powerUps: {
    // Shield - blue crystal represents protection
    shield: {
      path: 'models/collectible/gems/detail-crystal.glb',
      source: 'kenney' as const,
      scale: 1.2,
    },
    // Magnet - gold coin with larger scale
    magnet: {
      path: 'models/collectible/coins/coin-gold.glb',
      source: 'kenney' as const,
      scale: 1.4,
    },
    // Ghost - crystal large for ethereal effect
    ghost: {
      path: 'models/collectible/gems/detail-crystal-large.glb',
      source: 'kenney' as const,
      scale: 1.2,
    },
    // Multiplier - heart for value boost
    multiplier: {
      path: 'models/collectible/gems/heart.glb',
      source: 'kenney' as const,
      scale: 1.3,
    },
    // Slow Motion - silver coin for time effect
    slowMotion: {
      path: 'models/collectible/coins/coin-silver.glb',
      source: 'kenney' as const,
      scale: 1.4,
    },
  },

  decorations: {
    // Water decorations (shared)
    lilyLarge: {
      path: 'models/environment/shared/lily_large.glb',
      source: 'kenney' as const,
      scale: 1.0,
    },
    lilySmall: {
      path: 'models/environment/shared/lily_small.glb',
      source: 'kenney' as const,
      scale: 0.8,
    },
    // Forest plants
    grass: {
      path: 'models/environment/forest/grass.glb',
      source: 'kenney' as const,
      scale: 1.0,
    },
    grassLarge: {
      path: 'models/environment/forest/grass_large.glb',
      source: 'kenney' as const,
      scale: 1.0,
    },
    mushroomRed: {
      path: 'models/environment/forest/mushroom_red.glb',
      source: 'kenney' as const,
      scale: 1.2,
    },
    mushroomTan: {
      path: 'models/environment/forest/mushroom_tan.glb',
      source: 'kenney' as const,
      scale: 1.2,
    },
    // Flowers
    flowerYellow: {
      path: 'models/environment/forest/flower_yellowA.glb',
      source: 'kenney' as const,
      scale: 1.0,
    },
    flowerPurple: {
      path: 'models/environment/forest/flower_purpleA.glb',
      source: 'kenney' as const,
      scale: 1.0,
    },
    flowerRed: {
      path: 'models/environment/tropical/flower_redA.glb',
      source: 'kenney' as const,
      scale: 1.0,
    },
  },
} as const;

// =============================================================================
// AUDIO ASSETS
// =============================================================================

export const AudioAssets = {
  music: {
    gameplay: {
      path: 'audio/music/flowing-rocks.ogg',
      source: 'kenney' as const,
      loop: true,
    },
    ambient: {
      path: 'audio/music/night-at-beach.ogg',
      source: 'kenney' as const,
      loop: true,
    },
    gameOver: {
      path: 'audio/music/game-over.ogg',
      source: 'kenney' as const,
      loop: false,
    },
  },

  sfx: {
    coinPickup: {
      path: 'audio/sfx/coin-pickup.ogg',
      source: 'kenney' as const,
    },
    gemPickup: {
      path: 'audio/sfx/gem-pickup.ogg',
      source: 'kenney' as const,
    },
    bonus: {
      path: 'audio/sfx/bonus.ogg',
      source: 'kenney' as const,
    },
    hit: {
      path: 'audio/sfx/hit.ogg',
      source: 'kenney' as const,
    },
    click: {
      path: 'audio/sfx/click.ogg',
      source: 'kenney' as const,
    },
    confirm: {
      path: 'audio/sfx/confirm.ogg',
      source: 'kenney' as const,
    },
  },

  ambient: {
    waterDrip1: {
      path: 'audio/ambient/water-drip1.ogg',
      source: 'kenney' as const,
    },
    waterDrip2: {
      path: 'audio/ambient/water-drip2.ogg',
      source: 'kenney' as const,
    },
  },
} as const;

// =============================================================================
// TEXTURE ASSETS
// =============================================================================

export const TextureAssets = {
  hdri: {
    dayEnvironment: {
      path: 'textures/hdri/day-environment.jpg',
      source: 'ambientcg' as const,
    },
    sunnyDay: {
      path: 'textures/hdri/sunny-day.jpg',
      source: 'ambientcg' as const,
    },
  },

  terrain: {
    grass: {
      color: 'textures/terrain/grass/Grass001_1K-JPG_Color.jpg',
      normal: 'textures/terrain/grass/Grass001_1K-JPG_NormalGL.jpg',
      roughness: 'textures/terrain/grass/Grass001_1K-JPG_Roughness.jpg',
      ao: 'textures/terrain/grass/Grass001_1K-JPG_AmbientOcclusion.jpg',
      source: 'ambientcg',
    },
    rock: {
      color: 'textures/terrain/rock/Rock001_1K-JPG_Color.jpg',
      normal: 'textures/terrain/rock/Rock001_1K-JPG_NormalGL.jpg',
      roughness: 'textures/terrain/rock/Rock001_1K-JPG_Roughness.jpg',
      source: 'ambientcg',
    },
  },

  water: {
    foam: {
      color: 'textures/water/Foam001_1K-JPG_Color.jpg',
      normal: 'textures/water/Foam001_1K-JPG_NormalGL.jpg',
      roughness: 'textures/water/Foam001_1K-JPG_Roughness.jpg',
      source: 'ambientcg',
    },
  },

  riverbed: {
    gravel: {
      color: 'textures/riverbed/Gravel001_1K-JPG_Color.jpg',
      normal: 'textures/riverbed/Gravel001_1K-JPG_NormalGL.jpg',
      source: 'ambientcg',
    },
  },
} as const;

// =============================================================================
// TYPE HELPERS
// =============================================================================

export type ModelCategory = keyof typeof ModelAssets;
export type AudioCategory = keyof typeof AudioAssets;
export type TextureCategory = keyof typeof TextureAssets;

export type PlayerModelKey = keyof typeof ModelAssets.player;
export type ObstacleModelKey = keyof typeof ModelAssets.obstacles;
export type CollectibleModelKey = keyof typeof ModelAssets.collectibles;
export type DecorationModelKey = keyof typeof ModelAssets.decorations;
export type PowerUpModelKey = keyof typeof ModelAssets.powerUps;

// Union of all model keys for spawn functions
export type AnyModelKey =
  | `player.${PlayerModelKey}`
  | `obstacles.${ObstacleModelKey}`
  | `collectibles.${CollectibleModelKey}`
  | `decorations.${DecorationModelKey}`;

/**
 * Get asset definition by dot-notation key
 * e.g., getModelAsset('obstacles.cliffRock')
 */
export function getModelAsset(key: AnyModelKey): AssetDefinition {
  const [category, name] = key.split('.') as [ModelCategory, string];
  const categoryAssets = ModelAssets[category] as Record<string, AssetDefinition>;
  return categoryAssets[name];
}

/**
 * Get all obstacle assets as array for spawn variant selection
 */
export function getObstacleVariants(): AssetDefinition[] {
  return Object.values(ModelAssets.obstacles);
}

/**
 * Get all coin assets as array for spawn variant selection
 */
export function getCoinVariants(): AssetDefinition[] {
  return [
    ModelAssets.collectibles.coinGold,
    ModelAssets.collectibles.coinSilver,
    ModelAssets.collectibles.coinBronze,
  ];
}

/**
 * Get all gem assets as array for spawn variant selection
 */
export function getGemVariants(): AssetDefinition[] {
  return [
    ModelAssets.collectibles.crystalSmall,
    ModelAssets.collectibles.crystalLarge,
    ModelAssets.collectibles.heart,
  ];
}

/**
 * Get all decoration assets as array for spawn variant selection
 */
export function getDecorationVariants(): AssetDefinition[] {
  return Object.values(ModelAssets.decorations);
}

/**
 * Get power-up asset by type
 */
export function getPowerUpAsset(
  type: 'shield' | 'magnet' | 'ghost' | 'multiplier' | 'slowMotion'
): AssetDefinition {
  return ModelAssets.powerUps[type];
}
