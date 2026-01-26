/**
 * Weather Configuration Constants
 * Defines particle behavior and appearance for biome-specific weather effects
 */

import type { BiomeType } from '../types';

/**
 * Weather particle configuration per biome
 */
export interface WeatherConfig {
  /** Number of particles to render */
  particleCount: number;
  /** Particle color (hex string) */
  color: string;
  /** Particle opacity (0-1) */
  opacity: number;
  /** Particle size */
  size: number;
  /** Movement speed per axis */
  speed: { x: number; y: number; z: number };
  /** Spawn volume dimensions */
  spread: { x: number; y: number; z: number };
  /** Random movement intensity */
  turbulence: number;
  /** Whether this weather effect is active */
  active: boolean;
  /** Description for debugging/docs */
  description: string;
}

/**
 * Weather configurations for each biome
 */
export const WEATHER_CONFIGS: Record<BiomeType, WeatherConfig> = {
  /**
   * Forest: Light rain
   * Occasional vertical streaks simulating gentle rainfall
   */
  forest: {
    particleCount: 150,
    color: '#a0c4ff',
    opacity: 0.6,
    size: 0.03,
    speed: { x: 0.2, y: -3, z: 0 },
    spread: { x: 12, y: 20, z: 8 },
    turbulence: 0.1,
    active: true,
    description: 'Light rain with gentle vertical streaks',
  },

  /**
   * Mountain: Snow
   * Slow-falling snow particles with gentle drift
   */
  mountain: {
    particleCount: 200,
    color: '#ffffff',
    opacity: 0.8,
    size: 0.08,
    speed: { x: 0.5, y: -0.8, z: 0.3 },
    spread: { x: 15, y: 25, z: 10 },
    turbulence: 0.3,
    active: true,
    description: 'Gentle snowfall with soft drifting motion',
  },

  /**
   * Canyon: Dust/Sand
   * Horizontal-drifting dust particles simulating desert winds
   */
  canyon: {
    particleCount: 100,
    color: '#d4a574',
    opacity: 0.5,
    size: 0.05,
    speed: { x: 2, y: -0.3, z: 0.5 },
    spread: { x: 15, y: 20, z: 8 },
    turbulence: 0.5,
    active: true,
    description: 'Horizontal dust and sand particles',
  },

  /**
   * Rapids: Water spray/mist
   * Fast chaotic particles simulating water spray from turbulent rapids
   */
  rapids: {
    particleCount: 300,
    color: '#e0f7ff',
    opacity: 0.7,
    size: 0.04,
    speed: { x: 0, y: 1.5, z: 0.8 },
    spread: { x: 10, y: 15, z: 6 },
    turbulence: 1.2,
    active: true,
    description: 'Fast chaotic water spray from rapids',
  },
};

/**
 * Performance limits for weather effects
 */
export const WEATHER_PERFORMANCE = {
  /** Maximum particle count regardless of settings */
  maxParticles: 500,

  /** Particle count multipliers by quality level */
  qualityMultipliers: {
    low: 0.4,
    medium: 0.7,
    high: 1.0,
  },

  /** Recommended max particles for mobile devices */
  mobileMaxParticles: 200,
} as const;

/**
 * Helper to get effective particle count based on quality and device
 */
export function getEffectiveParticleCount(
  baseCount: number,
  quality: 'low' | 'medium' | 'high',
  isMobile: boolean = false
): number {
  const qualityMultiplier = WEATHER_PERFORMANCE.qualityMultipliers[quality];
  const maxAllowed = isMobile
    ? WEATHER_PERFORMANCE.mobileMaxParticles
    : WEATHER_PERFORMANCE.maxParticles;

  return Math.min(Math.round(baseCount * qualityMultiplier), maxAllowed);
}

/**
 * Get weather config for a biome with quality adjustments
 */
export function getWeatherConfig(
  biome: BiomeType,
  quality: 'low' | 'medium' | 'high' = 'medium',
  isMobile: boolean = false
): WeatherConfig {
  const config = { ...WEATHER_CONFIGS[biome] };
  config.particleCount = getEffectiveParticleCount(
    config.particleCount,
    quality,
    isMobile
  );
  return config;
}
