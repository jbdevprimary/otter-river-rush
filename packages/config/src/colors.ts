/**
 * Color Constants
 * Biome palettes, entity colors, and UI colors
 */

import type { BiomeType, PowerUpType } from '@otter-river-rush/types';

/**
 * Biome-specific color schemes
 */
export const BIOME_COLORS: Record<BiomeType, {
  water: string;
  terrain: string;
  fog: string;
  sky: string;
}> = {
  forest: {
    water: '#1e40af',
    terrain: '#166534',
    fog: '#0f172a',
    sky: '#1e3a8a',
  },
  mountain: {
    water: '#0c4a6e',
    terrain: '#475569',
    fog: '#1e3a8a',
    sky: '#0c4a6e',
  },
  canyon: {
    water: '#78350f',
    terrain: '#92400e',
    fog: '#451a03',
    sky: '#78350f',
  },
  rapids: {
    water: '#701a75',
    terrain: '#581c87',
    fog: '#3b0764',
    sky: '#701a75',
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
 * UI colors
 */
export const UI_COLORS = {
  score: '#ffffff',
  combo: '#fbbf24',
  health: '#ef4444',
  distance: '#3b82f6',
  menu: {
    background: '#0f172a',
    text: '#ffffff',
    accent: '#3b82f6',
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
