/**
 * Asset Bridge - Web Implementation
 *
 * Resolves asset paths to URLs for web/Babylon.js environments.
 * Assets are served from /assets/ directory.
 */

import {
  type AssetDefinition,
  ModelAssets,
  AudioAssets,
  TextureAssets,
  getObstacleVariants,
  getCoinVariants,
  getGemVariants,
  getDecorationVariants,
} from './AssetRegistry';

// Use Vite's base URL for GitHub Pages subdirectory deployment
// import.meta.env.BASE_URL is '/otter-river-rush/' in production, '/' in dev
const BASE_URL = `${import.meta.env.BASE_URL ?? '/'}assets`;

/**
 * Resolve an asset definition to a full URL
 */
export function resolveAssetUrl(asset: AssetDefinition | { path: string }): string {
  return `${BASE_URL}/${asset.path}`;
}

/**
 * Resolve a texture set to full URLs
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
    color: `${BASE_URL}/${textureSet.color}`,
    normal: textureSet.normal ? `${BASE_URL}/${textureSet.normal}` : undefined,
    roughness: textureSet.roughness ? `${BASE_URL}/${textureSet.roughness}` : undefined,
    ao: textureSet.ao ? `${BASE_URL}/${textureSet.ao}` : undefined,
  };
}

// =============================================================================
// PRE-RESOLVED URLS FOR CONVENIENCE
// =============================================================================

/**
 * All model URLs pre-resolved for web
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
} as const;

/**
 * All audio URLs pre-resolved for web
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
 * All texture URLs pre-resolved for web
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
