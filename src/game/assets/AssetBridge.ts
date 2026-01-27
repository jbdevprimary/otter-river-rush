/**
 * Asset Bridge - Expo Implementation
 *
 * Uses expo-asset to resolve bundled asset URIs across web + native.
 */

import { Asset } from 'expo-asset';
import { type AssetModulePath, AssetModules } from './AssetModules';
import {
  type AssetDefinition,
  AudioAssets,
  getCoinVariants,
  getDecorationVariants,
  getGemVariants,
  getObstacleVariants,
  getPowerUpAsset,
  ModelAssets,
  TextureAssets,
} from './AssetRegistry';

const resolveAssetModule = (path: string): number => {
  const moduleId = AssetModules[path as AssetModulePath];
  if (!moduleId) {
    throw new Error(`Missing asset module for path: ${path}`);
  }
  return moduleId;
};

const resolveAssetUri = (path: string): string => Asset.fromModule(resolveAssetModule(path)).uri;

/**
 * Resolve an asset definition to a bundled URI.
 */
export function resolveAssetUrl(asset: AssetDefinition | { path: string }): string {
  return resolveAssetUri(asset.path);
}

/**
 * Resolve a texture set to bundled URIs.
 */
export function resolveTextureUrls(textureSet: {
  color: string;
  normal?: string;
  roughness?: string;
  ao?: string;
}): {
  color: string;
  normal?: string;
  roughness?: string;
  ao?: string;
} {
  return {
    color: resolveAssetUri(textureSet.color),
    normal: textureSet.normal ? resolveAssetUri(textureSet.normal) : undefined,
    roughness: textureSet.roughness ? resolveAssetUri(textureSet.roughness) : undefined,
    ao: textureSet.ao ? resolveAssetUri(textureSet.ao) : undefined,
  };
}

// =============================================================================
// PRE-RESOLVED URLS FOR CONVENIENCE
// =============================================================================

/**
 * All model URLs pre-resolved
 */
export const ModelUrls = {
  player: {
    otter: resolveAssetUrl(ModelAssets.player.otter),
    otterSilver: resolveAssetUrl(ModelAssets.player.otterSilver),
    otterGolden: resolveAssetUrl(ModelAssets.player.otterGolden),
    otterArctic: resolveAssetUrl(ModelAssets.player.otterArctic),
  },
  obstacles: Object.fromEntries(
    Object.entries(ModelAssets.obstacles).map(([k, v]) => [k, resolveAssetUrl(v)])
  ) as Record<keyof typeof ModelAssets.obstacles, string>,
  collectibles: Object.fromEntries(
    Object.entries(ModelAssets.collectibles).map(([k, v]) => [k, resolveAssetUrl(v)])
  ) as Record<keyof typeof ModelAssets.collectibles, string>,
  decorations: Object.fromEntries(
    Object.entries(ModelAssets.decorations).map(([k, v]) => [k, resolveAssetUrl(v)])
  ) as Record<keyof typeof ModelAssets.decorations, string>,
  powerUps: Object.fromEntries(
    Object.entries(ModelAssets.powerUps).map(([k, v]) => [k, resolveAssetUrl(v)])
  ) as Record<keyof typeof ModelAssets.powerUps, string>,
} as const;

/**
 * All audio URLs pre-resolved
 */
export const AudioUrls = {
  music: Object.fromEntries(
    Object.entries(AudioAssets.music).map(([k, v]) => [k, resolveAssetUrl(v)])
  ) as Record<keyof typeof AudioAssets.music, string>,
  sfx: Object.fromEntries(
    Object.entries(AudioAssets.sfx).map(([k, v]) => [k, resolveAssetUrl(v)])
  ) as Record<keyof typeof AudioAssets.sfx, string>,
  ambient: Object.fromEntries(
    Object.entries(AudioAssets.ambient).map(([k, v]) => [k, resolveAssetUrl(v)])
  ) as Record<keyof typeof AudioAssets.ambient, string>,
} as const;

/**
 * All texture URLs pre-resolved
 */
export const TextureUrls = {
  hdri: {
    dayEnvironment: resolveAssetUrl(TextureAssets.hdri.dayEnvironment),
    sunnyDay: resolveAssetUrl(TextureAssets.hdri.sunnyDay),
  },
  terrain: {
    grass: resolveTextureUrls(TextureAssets.terrain.grass),
    rock: resolveTextureUrls(TextureAssets.terrain.rock),
  },
  water: {
    foam: resolveTextureUrls(TextureAssets.water.foam),
  },
  riverbed: {
    gravel: resolveTextureUrls(TextureAssets.riverbed.gravel),
  },
} as const;

// =============================================================================
// SPAWN VARIANT HELPERS (URLs with metadata)
// =============================================================================

export interface ResolvedAsset {
  url: string;
  scale: number;
  value?: number;
}

/**
 * Get obstacle variants with resolved URLs for spawn functions
 */
export function getObstacleUrlVariants(): ResolvedAsset[] {
  return getObstacleVariants().map((asset) => ({
    url: resolveAssetUrl(asset),
    scale: asset.scale ?? 1.0,
  }));
}

/**
 * Get coin variants with resolved URLs and values for spawn functions
 */
export function getCoinUrlVariants(): ResolvedAsset[] {
  return getCoinVariants().map((asset) => ({
    url: resolveAssetUrl(asset),
    scale: asset.scale ?? 1.0,
    value: asset.value ?? 10,
  }));
}

/**
 * Get gem variants with resolved URLs and values for spawn functions
 */
export function getGemUrlVariants(): ResolvedAsset[] {
  return getGemVariants().map((asset) => ({
    url: resolveAssetUrl(asset),
    scale: asset.scale ?? 1.0,
    value: asset.value ?? 50,
  }));
}

/**
 * Get decoration variants with resolved URLs for spawn functions
 */
export function getDecorationUrlVariants(): ResolvedAsset[] {
  return getDecorationVariants().map((asset) => ({
    url: resolveAssetUrl(asset),
    scale: asset.scale ?? 1.0,
  }));
}

/**
 * Power-up types
 */
export type PowerUpVariant = 'shield' | 'magnet' | 'ghost' | 'multiplier' | 'slowMotion';

/**
 * Get power-up asset with resolved URL for spawn functions
 */
export function getPowerUpUrl(type: PowerUpVariant): ResolvedAsset {
  const asset = getPowerUpAsset(type);
  return {
    url: resolveAssetUrl(asset),
    scale: asset.scale ?? 1.0,
  };
}
