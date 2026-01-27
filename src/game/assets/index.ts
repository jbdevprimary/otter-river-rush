/**
 * Asset Management Module
 *
 * Single source of truth for all game assets.
 * Use AssetBridge for Expo environments (web + native).
 */

// Expo asset bridge (platform aware via expo-asset)
export * from './AssetBridge';
// Core registry (platform-agnostic)
export * from './AssetRegistry';

// Note: For explicit platform imports, use './AssetBridge.native' or './AssetBridge.web'
