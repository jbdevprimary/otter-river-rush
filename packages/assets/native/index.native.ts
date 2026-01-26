/**
 * Native Asset Bridge
 *
 * Provides asset loading utilities for React Native / Expo.
 * Uses static require() calls which Metro resolves at build time.
 *
 * Note: GLB models are not yet fully supported in this implementation.
 * The mobile app currently uses procedural geometry. This file provides
 * the foundation for future GLB loading via expo-three.
 */

import { Asset } from 'expo-asset';

// Re-export registry for access to asset definitions
export * from '../src/registry';

/**
 * Asset source type returned by require()
 */
export type AssetSource = number;

/**
 * Resolved native asset with source and metadata
 */
export interface ResolvedNativeAsset {
  source: AssetSource;
  scale: number;
  value?: number;
}

/**
 * Load an asset and get its local URI
 * Useful for expo-three model loading
 */
export async function loadAssetAsync(source: AssetSource): Promise<Asset> {
  const asset = Asset.fromModule(source);
  await asset.downloadAsync();
  return asset;
}

/**
 * Get local file URI for an asset
 */
export async function getAssetUri(source: AssetSource): Promise<string> {
  const asset = await loadAssetAsync(source);
  return asset.localUri || asset.uri;
}

/**
 * Preload multiple assets
 */
export async function preloadAssets(sources: AssetSource[]): Promise<Asset[]> {
  return Promise.all(sources.map(loadAssetAsync));
}

// =============================================================================
// PLACEHOLDER MODEL SOURCES
// =============================================================================
// These will be populated with actual require() calls when assets are moved
// to the packages/assets directory. For now, we export empty objects that
// match the web API structure.

export const ModelSources = {
  player: {} as Record<string, ResolvedNativeAsset>,
  obstacles: {} as Record<string, ResolvedNativeAsset>,
  collectibles: {} as Record<string, ResolvedNativeAsset>,
  powerUps: {} as Record<string, ResolvedNativeAsset>,
  decorations: {} as Record<string, ResolvedNativeAsset>,
} as const;

export const AudioSources = {
  music: {} as Record<string, { source: AssetSource; loop?: boolean }>,
  sfx: {} as Record<string, { source: AssetSource }>,
  ambient: {} as Record<string, { source: AssetSource }>,
} as const;

// =============================================================================
// HELPER FUNCTIONS (API-compatible with web)
// =============================================================================

/**
 * Get obstacle sources for spawn system
 * Returns empty array until assets are properly set up
 */
export function getObstacleSourceVariants(): ResolvedNativeAsset[] {
  return Object.values(ModelSources.obstacles);
}

/**
 * Get coin sources for spawn system
 */
export function getCoinSourceVariants(): ResolvedNativeAsset[] {
  return Object.values(ModelSources.collectibles).filter(
    (asset) => asset.value && asset.value <= 10
  );
}

/**
 * Get gem sources for spawn system
 */
export function getGemSourceVariants(): ResolvedNativeAsset[] {
  return Object.values(ModelSources.collectibles).filter(
    (asset) => asset.value && asset.value > 10
  );
}

/**
 * Get decoration sources for spawn system
 */
export function getDecorationSourceVariants(): ResolvedNativeAsset[] {
  return Object.values(ModelSources.decorations);
}

/**
 * Get power-up source by type
 */
export function getPowerUpSource(
  type: 'shield' | 'magnet' | 'ghost' | 'multiplier' | 'slowMotion'
): ResolvedNativeAsset | undefined {
  return ModelSources.powerUps[type];
}
