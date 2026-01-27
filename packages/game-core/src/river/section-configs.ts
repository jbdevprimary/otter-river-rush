/**
 * Section Configurations
 * Defines spawn rate modifiers and characteristics for each river section type
 *
 * Section Types:
 * - normal: Standard gameplay (base rates)
 * - rapids: Narrow, fast, dangerous (more obstacles, fewer collectibles)
 * - calm_pool: Wide, slow, rewarding (fewer obstacles, more collectibles)
 * - whirlpool: Wide with central hazard (special handling)
 */

import type { RiverSectionType, SectionConfig } from '../types/river-path';

// ============================================================================
// Section Configurations
// ============================================================================

/**
 * Configuration for each section type
 * Defines how spawning and flow behave in each section
 */
export const SECTION_CONFIGS: Record<RiverSectionType, SectionConfig> = {
  normal: {
    widthMultiplier: 1.0,
    flowSpeedMultiplier: 1.0,
    obstacleSpawnRate: 1.0,
    collectibleSpawnRate: 1.0,
    duration: { min: 40, max: 80 },
    visualEffects: [],
  },

  rapids: {
    widthMultiplier: 0.7, // 30% narrower
    flowSpeedMultiplier: 1.5, // 50% faster
    obstacleSpawnRate: 1.5, // 50% more obstacles
    collectibleSpawnRate: 0.6, // 40% fewer collectibles
    duration: { min: 50, max: 100 },
    visualEffects: ['white_water', 'foam', 'rocks_jutting'],
  },

  calm_pool: {
    widthMultiplier: 1.4, // 40% wider
    flowSpeedMultiplier: 0.6, // 40% slower
    obstacleSpawnRate: 0.3, // 70% fewer obstacles
    collectibleSpawnRate: 2.0, // 2x collectibles
    duration: { min: 60, max: 120 },
    visualEffects: ['lily_pads', 'calm_ripples', 'dragonflies'],
  },

  whirlpool: {
    widthMultiplier: 1.3, // Wide to allow side channels
    flowSpeedMultiplier: 0.8, // Slightly slower overall
    obstacleSpawnRate: 0.5, // Fewer obstacles (whirlpool is the main hazard)
    collectibleSpawnRate: 1.5, // More collectibles to reward risk
    duration: { min: 80, max: 150 },
    visualEffects: ['spiral_water', 'mist', 'bubbles'],
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get spawn rate modifiers for a section type
 * Returns multipliers for obstacle and collectible spawn intervals
 */
export function getSectionSpawnModifiers(sectionType: RiverSectionType): {
  obstacleRate: number;
  collectibleRate: number;
} {
  const config = SECTION_CONFIGS[sectionType];
  return {
    obstacleRate: config.obstacleSpawnRate,
    collectibleRate: config.collectibleSpawnRate,
  };
}

/**
 * Get flow speed modifier for a section type
 */
export function getSectionFlowModifier(sectionType: RiverSectionType): number {
  return SECTION_CONFIGS[sectionType].flowSpeedMultiplier;
}

/**
 * Get visual effects for a section type
 */
export function getSectionVisualEffects(sectionType: RiverSectionType): string[] {
  return SECTION_CONFIGS[sectionType].visualEffects;
}

/**
 * Check if a section type has a specific visual effect
 */
export function sectionHasEffect(sectionType: RiverSectionType, effect: string): boolean {
  return SECTION_CONFIGS[sectionType].visualEffects.includes(effect);
}
