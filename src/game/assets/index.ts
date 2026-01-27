/**
 * Asset Management Module
 *
 * Single source of truth for all game assets.
 * Use AssetBridge.web for web/Babylon.js environments.
 * Use AssetBridge.native for React Native/Expo environments.
 */

// Web bridge (default for Babylon.js)
export * from './AssetBridge.web';
// Core registry (platform-agnostic)
export * from './AssetRegistry';

// Note: For React Native, import from './AssetBridge.native' directly
