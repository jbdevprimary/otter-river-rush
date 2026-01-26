/**
 * Web Asset Bridge
 *
 * Resolves asset paths to URLs for Vite-based web builds.
 * Assets are served from the public/assets folder.
 */

// Type declaration for Vite's import.meta.env
declare global {
  interface ImportMeta {
    readonly env: {
      readonly BASE_URL?: string;
      readonly MODE?: string;
      readonly DEV?: boolean;
      readonly PROD?: boolean;
      readonly SSR?: boolean;
    };
  }
}

import {
  ModelAssets,
  AudioAssets,
  TextureAssets,
  type AssetDefinition,
} from '../src/registry';

// For Metro web, assets are served from public/ at root
const BASE_URL = '';

/**
 * Resolve an asset path to a full URL
 */
export function resolveAssetUrl(path: string): string {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${BASE_URL}/${cleanPath}`;
}

/**
 * Resolved asset with URL and metadata
 */
export interface ResolvedAsset {
  url: string;
  scale: number;
  value?: number;
}

// =============================================================================
// MODEL URL RESOLUTION
// =============================================================================

function resolveModelAsset(asset: AssetDefinition): ResolvedAsset {
  return {
    url: resolveAssetUrl(asset.path),
    scale: asset.scale ?? 1.0,
    value: asset.value,
  };
}

export const ModelUrls = {
  player: {
    otter: resolveModelAsset(ModelAssets.player.otter),
    otterSilver: resolveModelAsset(ModelAssets.player.otterSilver),
    otterGolden: resolveModelAsset(ModelAssets.player.otterGolden),
    otterArctic: resolveModelAsset(ModelAssets.player.otterArctic),
  },
  obstacles: Object.fromEntries(
    Object.entries(ModelAssets.obstacles).map(([key, asset]) => [
      key,
      resolveModelAsset(asset),
    ])
  ) as Record<keyof typeof ModelAssets.obstacles, ResolvedAsset>,
  collectibles: Object.fromEntries(
    Object.entries(ModelAssets.collectibles).map(([key, asset]) => [
      key,
      resolveModelAsset(asset),
    ])
  ) as Record<keyof typeof ModelAssets.collectibles, ResolvedAsset>,
  powerUps: Object.fromEntries(
    Object.entries(ModelAssets.powerUps).map(([key, asset]) => [
      key,
      resolveModelAsset(asset),
    ])
  ) as Record<keyof typeof ModelAssets.powerUps, ResolvedAsset>,
  decorations: Object.fromEntries(
    Object.entries(ModelAssets.decorations).map(([key, asset]) => [
      key,
      resolveModelAsset(asset),
    ])
  ) as Record<keyof typeof ModelAssets.decorations, ResolvedAsset>,
} as const;

// =============================================================================
// AUDIO URL RESOLUTION
// =============================================================================

export const AudioUrls = {
  music: Object.fromEntries(
    Object.entries(AudioAssets.music).map(([key, asset]) => [
      key,
      { url: resolveAssetUrl(asset.path), loop: asset.loop ?? false },
    ])
  ),
  sfx: Object.fromEntries(
    Object.entries(AudioAssets.sfx).map(([key, asset]) => [
      key,
      { url: resolveAssetUrl(asset.path) },
    ])
  ),
  ambient: Object.fromEntries(
    Object.entries(AudioAssets.ambient).map(([key, asset]) => [
      key,
      { url: resolveAssetUrl(asset.path) },
    ])
  ),
} as const;

// =============================================================================
// TEXTURE URL RESOLUTION
// =============================================================================

export const TextureUrls = {
  hdri: Object.fromEntries(
    Object.entries(TextureAssets.hdri).map(([key, asset]) => [
      key,
      resolveAssetUrl(asset.path),
    ])
  ),
  terrain: {
    grass: {
      color: resolveAssetUrl(TextureAssets.terrain.grass.color),
      normal: resolveAssetUrl(TextureAssets.terrain.grass.normal!),
      roughness: resolveAssetUrl(TextureAssets.terrain.grass.roughness!),
      ao: resolveAssetUrl(TextureAssets.terrain.grass.ao!),
    },
    rock: {
      color: resolveAssetUrl(TextureAssets.terrain.rock.color),
      normal: resolveAssetUrl(TextureAssets.terrain.rock.normal!),
      roughness: resolveAssetUrl(TextureAssets.terrain.rock.roughness!),
    },
  },
  water: {
    foam: {
      color: resolveAssetUrl(TextureAssets.water.foam.color),
      normal: resolveAssetUrl(TextureAssets.water.foam.normal!),
      roughness: resolveAssetUrl(TextureAssets.water.foam.roughness!),
    },
  },
  riverbed: {
    gravel: {
      color: resolveAssetUrl(TextureAssets.riverbed.gravel.color),
      normal: resolveAssetUrl(TextureAssets.riverbed.gravel.normal!),
    },
  },
} as const;

// =============================================================================
// HELPER FUNCTIONS FOR SPAWN SYSTEM
// =============================================================================

/**
 * Get obstacle URL variants for spawn system
 */
export function getObstacleUrlVariants(): ResolvedAsset[] {
  return Object.values(ModelUrls.obstacles);
}

/**
 * Get coin URL variants for spawn system
 */
export function getCoinUrlVariants(): ResolvedAsset[] {
  return [
    ModelUrls.collectibles.coinGold,
    ModelUrls.collectibles.coinSilver,
    ModelUrls.collectibles.coinBronze,
  ];
}

/**
 * Get gem URL variants for spawn system
 */
export function getGemUrlVariants(): ResolvedAsset[] {
  return [
    ModelUrls.collectibles.crystalSmall,
    ModelUrls.collectibles.crystalLarge,
    ModelUrls.collectibles.heart,
  ];
}

/**
 * Get decoration URL variants for spawn system
 */
export function getDecorationUrlVariants(): ResolvedAsset[] {
  return Object.values(ModelUrls.decorations);
}

/**
 * Get power-up URL by type
 */
export function getPowerUpUrl(
  type: 'shield' | 'magnet' | 'ghost' | 'multiplier' | 'slowMotion'
): ResolvedAsset {
  return ModelUrls.powerUps[type];
}

/**
 * Get default player character URL
 */
export function getDefaultCharacterUrl(): ResolvedAsset {
  return ModelUrls.player.otter;
}

// Re-export registry types and functions
export * from '../src/registry';
