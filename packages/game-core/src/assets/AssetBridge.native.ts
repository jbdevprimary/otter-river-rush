/**
 * Asset Bridge - React Native Implementation (Stub)
 *
 * For React Native/Expo, assets must use static require() calls
 * because Metro bundler needs to resolve them at build time.
 *
 * TODO: Implement when adding React Native support.
 * Pattern from protocol-silent-night:
 *
 * export const ModelSources = {
 *   player: {
 *     otter: require('../../assets/models/player/otter-player/model.glb'),
 *   },
 * } as const;
 */

// Placeholder exports - implement when adding React Native
export const ModelSources = {} as const;
export const AudioSources = {} as const;
export const TextureSources = {} as const;

// Re-export registry types for native consumers
export * from './AssetRegistry';
