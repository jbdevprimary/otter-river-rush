/**
 * Spawner System
 * Spawns obstacles and collectibles at intervals
 * Supports dynamic spawn rate scaling based on difficulty progression
 * Uses biome-specific assets for visual variety
 * Uses seeded RNG for deterministic, reproducible game generation
 *
 * Pattern-based spawning creates natural-feeling layouts:
 * - Obstacle patterns prevent unfair spawns (e.g., blocking all lanes)
 * - Collectible arcs and lines for satisfying collection
 * - Power-ups placed strategically before difficult sections
 */

import { PHYSICS, VISUAL, getLaneX } from '../../config';
import { detectBranchChoice, getBranchSpawnModifiers } from '../../river/fork-manager';
import { getSectionSpawnModifiers } from '../../river/section-configs';
import {
  calculateCollectibleSpawnInterval,
  calculateObstacleSpawnInterval,
  useGameStore,
  useRiverPathStore,
} from '../../store';
import type { BiomeType, GameMode, Lane, PowerUpType } from '../../types';
import { getGameRNG } from '../../utils';
import { spawn } from '../world';

/**
 * Lane index type for spawner (0=left, 1=center, 2=right)
 * Note: This maps to Lane type (-1, 0, 1) via index offset
 */
type LaneIndex = 0 | 1 | 2;

/**
 * Convert lane index (0, 1, 2) to Lane type (-1, 0, 1)
 */
function laneIndexToLane(index: LaneIndex): Lane {
  return (index - 1) as Lane;
}

/**
 * Obstacle variants per biome
 * Each biome uses different obstacle models for visual variety
 */
const BIOME_OBSTACLE_VARIANTS: Record<BiomeType, number[]> = {
  forest: [0, 1, 2, 6, 7, 8, 9], // Small rocks, stumps, logs
  canyon: [0, 1, 2, 3, 4, 5], // Various rock sizes
  arctic: [0, 1, 2], // Small rocks only (icy)
  tropical: [0, 1, 2, 6, 7], // Small rocks, stumps
  volcanic: [3, 4, 5], // Large/tall rocks
};

/**
 * Decoration variants per biome
 */
const BIOME_DECORATION_VARIANTS: Record<BiomeType, number[]> = {
  forest: [0, 1, 2, 3, 4, 5, 6, 7], // Lily pads, grass, mushrooms, flowers
  canyon: [0, 1], // Just lily pads (sparse)
  arctic: [0, 1], // Lily pads only
  tropical: [0, 1, 2, 3, 8], // Lily pads, grass, red flowers
  volcanic: [0, 1], // Sparse decorations
};

/**
 * Power-up types available for spawning
 */
const POWER_UP_TYPES: PowerUpType[] = ['shield', 'magnet', 'ghost', 'multiplier', 'slowMotion'];

/**
 * Obstacle placement patterns for variety
 * Each pattern is an array of lane indices (0=left, 1=center, 2=right)
 * Multiple lanes = multiple obstacles at once
 * Always leaves at least one lane open for fair gameplay
 */
const OBSTACLE_PATTERNS: LaneIndex[][] = [
  // Single obstacle patterns (common, easy)
  [0], [1], [2],
  // Two obstacle patterns (harder, less common)
  [0, 1], [1, 2], [0, 2],
  // Single patterns repeated for higher weight
  [0], [1], [2], [0], [1], [2],
];

/**
 * Collectible placement patterns
 * Creates satisfying collection arcs and lines
 */
interface CollectiblePattern {
  /** Lane positions for each collectible in sequence */
  lanes: LaneIndex[];
  /** Type of collectible for each position */
  types: ('coin' | 'gem')[];
  /** Spacing multiplier between spawns (1 = normal interval) */
  spacing: number;
}

const COLLECTIBLE_PATTERNS: CollectiblePattern[] = [
  // Single collectibles (most common)
  { lanes: [0], types: ['coin'], spacing: 1 },
  { lanes: [1], types: ['coin'], spacing: 1 },
  { lanes: [2], types: ['coin'], spacing: 1 },
  // Gem singles
  { lanes: [1], types: ['gem'], spacing: 1 },
  // Coin lines (same lane, quick succession)
  { lanes: [0, 0, 0], types: ['coin', 'coin', 'coin'], spacing: 0.4 },
  { lanes: [1, 1, 1], types: ['coin', 'coin', 'coin'], spacing: 0.4 },
  { lanes: [2, 2, 2], types: ['coin', 'coin', 'coin'], spacing: 0.4 },
  // Coin arcs (sweep across lanes)
  { lanes: [0, 1, 2], types: ['coin', 'coin', 'coin'], spacing: 0.5 },
  { lanes: [2, 1, 0], types: ['coin', 'coin', 'coin'], spacing: 0.5 },
  // Mixed arcs with gem reward
  { lanes: [0, 1, 2], types: ['coin', 'gem', 'coin'], spacing: 0.5 },
  { lanes: [2, 1, 0], types: ['coin', 'gem', 'coin'], spacing: 0.5 },
];

export interface SpawnerState {
  lastObstacleSpawn: number;
  lastCollectibleSpawn: number;
  lastDecorationSpawn: number;
  /** Current obstacle pattern index (for multi-obstacle patterns) */
  obstaclePatternIndex: number;
  /** Current obstacle pattern being executed */
  currentObstaclePattern: LaneIndex[] | null;
  /** Current collectible pattern state */
  collectiblePatternState: {
    pattern: CollectiblePattern | null;
    index: number;
    lastSpawnTime: number;
  };
  /** Track last obstacle lanes to prevent immediate repeats */
  lastObstacleLanes: LaneIndex[];
  /** Counter for difficulty-based pattern selection */
  spawnCounter: number;
}

/**
 * Create spawner state
 */
export function createSpawnerState(): SpawnerState {
  return {
    lastObstacleSpawn: 0,
    lastCollectibleSpawn: 0,
    lastDecorationSpawn: 0,
    obstaclePatternIndex: 0,
    currentObstaclePattern: null,
    collectiblePatternState: {
      pattern: null,
      index: 0,
      lastSpawnTime: 0,
    },
    lastObstacleLanes: [],
    spawnCounter: 0,
  };
}

/**
 * Select an obstacle pattern that avoids immediate repeats
 * Uses seeded RNG for deterministic selection
 */
function selectObstaclePattern(
  rng: ReturnType<typeof getGameRNG>,
  lastLanes: LaneIndex[],
  distance: number
): LaneIndex[] {
  // Increase chance of multi-obstacle patterns based on distance
  const difficultyFactor = Math.min(distance / 2000, 1); // 0-1 over 2000m

  // Filter patterns to avoid exact repeats and ensure fairness
  const availablePatterns = OBSTACLE_PATTERNS.filter(pattern => {
    // Don't immediately repeat the same pattern
    if (pattern.length === lastLanes.length &&
        pattern.every((lane, i) => lane === lastLanes[i])) {
      return false;
    }
    // At lower difficulty, prefer single-obstacle patterns
    if (pattern.length > 1 && rng.random() > difficultyFactor) {
      return false;
    }
    return true;
  });

  // If all filtered out, fall back to single-lane patterns
  if (availablePatterns.length === 0) {
    return [rng.int(0, 2) as LaneIndex];
  }

  return rng.pick(availablePatterns);
}

/**
 * Select a collectible pattern based on game state
 */
function selectCollectiblePattern(
  rng: ReturnType<typeof getGameRNG>,
  distance: number
): CollectiblePattern {
  // Higher chance of multi-collectible patterns as game progresses
  const progressFactor = Math.min(distance / 1000, 1);

  // Weight patterns by distance - more complex patterns later
  const weightedPatterns = COLLECTIBLE_PATTERNS.filter(pattern => {
    // Always allow single collectibles
    if (pattern.lanes.length === 1) return true;
    // Multi-collectible patterns based on progress
    return rng.random() < progressFactor * 0.6;
  });

  return rng.pick(weightedPatterns);
}

/**
 * Get river width multiplier from game state for spawn positioning
 */
function getRiverWidthMultiplier(): number {
  const { riverWidth } = useGameStore.getState();
  return riverWidth?.currentWidth ?? 1.0;
}

/**
 * Get spawn position and river distance for curved river path
 * @param laneOffset Lane offset from river center
 * @param playerDistance Current player distance along the river
 * @returns Spawn position and river distance, or null if no path initialized
 */
function getPathSpawnPosition(
  laneOffset: number,
  playerDistance: number
): { x: number; y: number; z: number; riverDistance: number } | null {
  const riverPathStore = useRiverPathStore.getState();

  // Check if river path is initialized
  if (riverPathStore.segments.length === 0) {
    return null;
  }

  // Calculate spawn distance along the river
  // Spawn Y position (8) is ahead of player, so add to player distance
  const spawnDistance = playerDistance + VISUAL.positions.spawnY;

  // Get path point at spawn distance
  const pathResult = riverPathStore.getPointAtDistance(spawnDistance);

  if (!pathResult) {
    return null;
  }

  const { point } = pathResult;

  // Calculate spawn X position based on path curve and lane offset
  const perpAngle = point.angleXY + Math.PI / 2;
  const perpX = Math.cos(perpAngle);

  return {
    x: point.centerX + laneOffset * perpX,
    y: VISUAL.positions.spawnY, // Y position is still relative for initial placement
    z: point.centerZ,
    riverDistance: spawnDistance,
  };
}

/**
 * Update spawner - spawn obstacles, collectibles, and decorations
 * Spawn intervals decrease (spawn rate increases) based on distance traveled
 * Uses pattern-based spawning for natural, fair, and satisfying gameplay
 * Supports curved river path spawning when path is initialized
 * @param state Spawner state
 * @param now Current timestamp (milliseconds)
 * @param isPlaying Whether game is actively playing
 * @param gameMode Current game mode (defaults to 'classic')
 */
export function updateSpawner(
  state: SpawnerState,
  now: number,
  isPlaying: boolean,
  gameMode: GameMode = 'classic'
): void {
  if (!isPlaying) return;

  // Get current distance and biome for difficulty scaling and visual variety
  const { distance, currentBiome, playerX } = useGameStore.getState();
  const biome: BiomeType = currentBiome ?? 'forest';

  // Calculate base spawn intervals based on distance
  const baseObstacleInterval = calculateObstacleSpawnInterval(distance);
  const baseCollectibleInterval = calculateCollectibleSpawnInterval(distance);

  // Get current segment for section and branch modifiers
  const riverPathStore = useRiverPathStore.getState();
  const currentSegment = riverPathStore.getSegmentAt(distance);

  // Start with section-based modifiers (rapids, calm_pool, etc.)
  const sectionType = currentSegment?.sectionType ?? 'normal';
  const sectionModifiers = getSectionSpawnModifiers(sectionType);
  let spawnModifiers = {
    obstacleRate: sectionModifiers.obstacleRate,
    collectibleRate: sectionModifiers.collectibleRate,
    gemRate: 1.0,
  };

  // Layer on branch modifiers if in a fork
  if (currentSegment?.forkInfo) {
    // Detect which branch player is in
    const branchChoice = detectBranchChoice(
      playerX ?? 0,
      currentSegment.forkInfo,
      distance
    );
    // Get spawn rate modifiers for the chosen branch
    const branchModifiers = getBranchSpawnModifiers(branchChoice, currentSegment.forkInfo.safeSide);
    // Multiply section and branch modifiers together
    spawnModifiers = {
      obstacleRate: spawnModifiers.obstacleRate * branchModifiers.obstacleRate,
      collectibleRate: spawnModifiers.collectibleRate * branchModifiers.collectibleRate,
      gemRate: branchModifiers.gemRate,
    };
  }

  // Apply modifiers to spawn intervals
  // Higher rate = shorter interval (more spawns)
  const obstacleInterval = baseObstacleInterval / spawnModifiers.obstacleRate;
  const collectibleInterval = baseCollectibleInterval / spawnModifiers.collectibleRate;

  // Get biome-specific variants
  const obstacleVariants = BIOME_OBSTACLE_VARIANTS[biome];
  const decorationVariants = BIOME_DECORATION_VARIANTS[biome];

  // Get the seeded RNG for deterministic spawning
  const rng = getGameRNG();

  // Get river width for position adjustments
  const riverWidth = getRiverWidthMultiplier();

  // Spawn obstacles (biome-specific variants) - skip in zen mode
  // Uses pattern-based spawning for variety and fairness
  if (gameMode !== 'zen' && now - state.lastObstacleSpawn > obstacleInterval * 1000) {
    // If no current pattern, select a new one
    if (!state.currentObstaclePattern || state.obstaclePatternIndex >= state.currentObstaclePattern.length) {
      state.currentObstaclePattern = selectObstaclePattern(rng, state.lastObstacleLanes, distance);
      state.obstaclePatternIndex = 0;
      state.lastObstacleLanes = [...state.currentObstaclePattern];
    }

    // Spawn obstacle at current pattern position
    const laneIndex = state.currentObstaclePattern[state.obstaclePatternIndex];
    const baseLaneX = getLaneX(laneIndexToLane(laneIndex));
    // Apply river width variation to lane position
    const laneOffset = baseLaneX * riverWidth;
    const variant = rng.pick(obstacleVariants);

    // Try to spawn with river path positioning
    const pathSpawn = getPathSpawnPosition(laneOffset, distance);
    if (pathSpawn) {
      spawn.rock(pathSpawn.x, pathSpawn.y, variant, pathSpawn.riverDistance);
    } else {
      // Fallback to straight river spawning
      spawn.rock(laneOffset, VISUAL.positions.spawnY, variant);
    }

    state.obstaclePatternIndex++;
    state.lastObstacleSpawn = now;
    state.spawnCounter++;
  }

  // Spawn collectibles using pattern-based system
  const collectibleState = state.collectiblePatternState;
  const shouldSpawnCollectible = collectibleState.pattern
    ? now - collectibleState.lastSpawnTime > collectibleInterval * 1000 * collectibleState.pattern.spacing
    : now - state.lastCollectibleSpawn > collectibleInterval * 1000;

  if (shouldSpawnCollectible) {
    // If no current pattern or pattern complete, select a new one
    if (!collectibleState.pattern || collectibleState.index >= collectibleState.pattern.lanes.length) {
      collectibleState.pattern = selectCollectiblePattern(rng, distance);
      collectibleState.index = 0;
      state.lastCollectibleSpawn = now;
    }

    const pattern = collectibleState.pattern;
    const laneIndex = pattern.lanes[collectibleState.index];
    let type = pattern.types[collectibleState.index];
    const baseLaneX = getLaneX(laneIndexToLane(laneIndex));
    const laneOffset = baseLaneX * riverWidth;

    // Try to spawn with river path positioning
    const pathSpawn = getPathSpawnPosition(laneOffset, distance);

    // Apply gem rate modifier: higher gem rate (risky branch) can upgrade coins to gems
    // E.g., 2.5x gem rate = 15% chance to upgrade coin to gem
    if (type === 'coin' && spawnModifiers.gemRate > 1.0) {
      const upgradeChance = (spawnModifiers.gemRate - 1.0) * 0.1;
      if (rng.random() < upgradeChance) {
        type = 'gem';
      }
    }

    // Check for power-up spawn (5% chance, replaces current collectible)
    const roll = rng.random();
    if (roll > 0.95) {
      const powerUpType = rng.pick(POWER_UP_TYPES);
      if (pathSpawn) {
        spawn.powerUp(pathSpawn.x, pathSpawn.y, powerUpType, pathSpawn.riverDistance);
      } else {
        spawn.powerUp(laneOffset, VISUAL.positions.spawnY, powerUpType);
      }
    } else if (type === 'gem') {
      const variant = rng.int(0, 2);
      if (pathSpawn) {
        spawn.gem(pathSpawn.x, pathSpawn.y, variant, pathSpawn.riverDistance);
      } else {
        spawn.gem(laneOffset, VISUAL.positions.spawnY, variant);
      }
    } else {
      const variant = rng.int(0, 2);
      if (pathSpawn) {
        spawn.coin(pathSpawn.x, pathSpawn.y, variant, pathSpawn.riverDistance);
      } else {
        spawn.coin(laneOffset, VISUAL.positions.spawnY, variant);
      }
    }

    collectibleState.index++;
    collectibleState.lastSpawnTime = now;
  }

  // Spawn decorations (lily pads, reeds, mushrooms, flowers - biome-specific)
  // Decoration spawn rate remains constant, positions adjusted for river width
  if (now - state.lastDecorationSpawn > PHYSICS.spawnInterval.decorations * 1000) {
    // Decorations spawn at random X positions (not locked to lanes)
    // Scale spawn range based on river width
    const spawnRange = 3 * riverWidth;
    const randomOffset = rng.float(-spawnRange, spawnRange);
    // Pick a random variant from the biome's available decorations
    const variant = rng.pick(decorationVariants);

    // Try to spawn with river path positioning
    const pathSpawn = getPathSpawnPosition(randomOffset, distance);
    if (pathSpawn) {
      spawn.decoration(pathSpawn.x, pathSpawn.y, variant, pathSpawn.riverDistance);
    } else {
      spawn.decoration(randomOffset, VISUAL.positions.spawnY, variant);
    }

    state.lastDecorationSpawn = now;
  }
}
