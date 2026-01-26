/**
 * @otter-river-rush/game-core
 *
 * Shared game logic, types, configuration, and asset management.
 * Platform-agnostic - no rendering framework dependencies.
 *
 * Used by: Babylon.js, Reactylon, React Native, Web, Mobile
 *
 * Import submodules directly for granular access:
 * - @otter-river-rush/game-core/assets
 * - @otter-river-rush/game-core/data
 * - @otter-river-rush/game-core/ecs
 * - @otter-river-rush/game-core/store
 * - @otter-river-rush/game-core/types
 * - @otter-river-rush/game-core/config
 * - @otter-river-rush/game-core/schemas
 */

// Asset Registry Bridge - the core new functionality
export * from './assets';

// Game Data (achievements, etc.)
export * from './data';

// Validation Schemas
export * from './schemas';

// Re-export key items from submodules
// Note: Use granular imports to avoid namespace conflicts
export { world, spawn, queries, resetWorld } from './ecs';
export { useGameStore, useAchievementStore } from './store';
