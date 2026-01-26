/**
 * Color Constants
 * Biome palettes, entity colors, and UI colors
 */

import type { BiomeType, PowerUpType } from '../types';

/**
 * Biome-specific color schemes
 */
export const BIOME_COLORS: Record<
  BiomeType,
  {
    water: string;
    terrain: string;
    fog: string;
    sky: string;
  }
> = {
  forest: {
    water: '#4a9079',
    terrain: '#166534',
    fog: '#8fbc8f',
    sky: '#87ceeb',
  },
  canyon: {
    water: '#8b7355',
    terrain: '#92400e',
    fog: '#d2691e',
    sky: '#ff7f50',
  },
  arctic: {
    water: '#4682b4',
    terrain: '#e6f3ff',
    fog: '#b0e0e6',
    sky: '#e6f3ff',
  },
  tropical: {
    water: '#40e0d0',
    terrain: '#228b22',
    fog: '#98fb98',
    sky: '#00bfff',
  },
  volcanic: {
    water: '#ff4500',
    terrain: '#2f1010',
    fog: '#8b0000',
    sky: '#2f1010',
  },
};

/**
 * Entity colors
 */
export const ENTITY_COLORS = {
  // Player
  player: '#f59e0b',

  // Obstacles
  obstacle: '#64748b',

  // Collectibles
  coin: '#ffd700',
  gem: '#ef4444',

  // Power-ups
  powerUp: {
    shield: '#3b82f6',
    magnet: '#a855f7',
    slowMotion: '#06b6d4',
    ghost: '#9ca3af',
    multiplier: '#fbbf24',
  } satisfies Record<PowerUpType, string>,
};

/**
 * Particle colors
 */
export const PARTICLE_COLORS = {
  collect: '#ffd700',
  hit: '#ff6b6b',
  powerUp: '#fbbf24',
  splash: '#ffffff',
};

/**
 * UI colors for HUD and menu elements
 */
export const UI_COLORS = {
  score: '#ffd700',
  distance: '#94a3b8',
  health: '#ef4444',
  combo: '#10b981',
  text: '#ffffff',
  textMuted: '#94a3b8',
  primary: '#3b82f6',
  secondary: '#6b7280',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  // Menu-specific colors
  menu: {
    text: '#ffffff',
    accent: '#3b82f6',
    background: '#0f172a',
    surface: '#1e293b',
  },
};

/**
 * All colors combined for easy import
 */
export const COLORS = {
  biome: BIOME_COLORS,
  entities: ENTITY_COLORS,
  particles: PARTICLE_COLORS,
  ui: UI_COLORS,
} as const;
