/**
 * Fork Manager
 * Handles river forks - branching paths, player choice detection, and merging
 *
 * Fork System:
 * - River splits into two branches (left/right)
 * - Player's X position at commit point determines branch
 * - One branch is "safe" (wider, slower, fewer obstacles)
 * - Other branch is "risky" (narrower, faster, more obstacles, more gems)
 * - Branches merge back after 100-200m
 */

import type {
  BranchChoice,
  ForkInfo,
  RiverPathPoint,
  RiverSegment,
} from '../types/river-path';
import type { SeededRNG } from '../utils/seeded-random';

// ============================================================================
// Constants
// ============================================================================

/** Branch characteristics */
export const BRANCH_CONFIG = {
  safe: {
    widthMultiplier: 1.2, // 20% wider
    speedMultiplier: 0.8, // 20% slower
    obstacleRate: 0.5, // 50% fewer obstacles
    collectibleRate: 1.0, // Normal collectibles
    gemRate: 1.0, // Normal gems
  },
  risky: {
    widthMultiplier: 0.8, // 20% narrower
    speedMultiplier: 1.2, // 20% faster
    obstacleRate: 1.5, // 50% more obstacles
    collectibleRate: 0.8, // Fewer collectibles
    gemRate: 2.5, // 2.5x more gems
  },
} as const;

/** Fork geometry */
const FORK_GEOMETRY = {
  /** Distance before fork where river starts widening */
  approachLength: 20,
  /** Distance from fork start to commit point */
  commitOffset: 30,
  /** Minimum branch length */
  minBranchLength: 100,
  /** Maximum branch length */
  maxBranchLength: 200,
  /** Lateral offset for each branch from center */
  branchOffset: 4,
  /** Merge approach distance */
  mergeApproachLength: 30,
};

// ============================================================================
// Fork Detection
// ============================================================================

/**
 * Determine which branch the player has chosen based on position
 * @param playerX Player's X position
 * @param forkInfo Fork information from segment
 * @param playerDistance Player's distance along the river
 */
export function detectBranchChoice(
  playerX: number,
  forkInfo: ForkInfo,
  playerDistance: number
): BranchChoice {
  // If player hasn't reached commit point, still undecided
  if (playerDistance < forkInfo.commitDistance) {
    return 'undecided';
  }

  // Player's X relative to fork center determines branch
  return playerX < forkInfo.forkCenterX ? 'left' : 'right';
}

/**
 * Check if player is approaching a fork
 * @param segments River segments
 * @param playerDistance Player's current distance
 * @param lookahead Distance to look ahead for forks
 */
export function getUpcomingFork(
  segments: RiverSegment[],
  playerDistance: number,
  lookahead: number = 100
): { segment: RiverSegment; distanceToFork: number } | null {
  for (const segment of segments) {
    if (segment.shape !== 'fork' || !segment.forkInfo) continue;

    const forkStart = segment.startDistance;
    const distanceToFork = forkStart - playerDistance;

    // Fork is within lookahead range
    if (distanceToFork > 0 && distanceToFork <= lookahead) {
      return { segment, distanceToFork };
    }
  }

  return null;
}

// ============================================================================
// Fork Generation
// ============================================================================

/**
 * Generate a complete fork with two branches and merge segment
 */
export interface ForkGenerationResult {
  /** The main fork segment (where split begins) */
  forkSegment: RiverSegment;
  /** Left branch segment */
  leftBranch: RiverSegment;
  /** Right branch segment */
  rightBranch: RiverSegment;
  /** Merge segment (where branches rejoin) */
  mergeSegment: RiverSegment;
}

/**
 * Generate fork segments with two branches
 * @param rng Seeded RNG for deterministic generation
 * @param startDistance Where the fork begins
 * @param centerX Center X position
 * @param startZ Starting elevation
 * @param startWidth Starting river width
 * @param baseId Base ID for segment naming
 */
export function generateForkSegments(
  rng: SeededRNG,
  startDistance: number,
  centerX: number,
  startZ: number,
  startWidth: number,
  baseId: string
): ForkGenerationResult {
  const branchLength = rng.float(
    FORK_GEOMETRY.minBranchLength,
    FORK_GEOMETRY.maxBranchLength
  );

  // Determine which side is safe (random)
  const safeSide: 'left' | 'right' = rng.chance() ? 'left' : 'right';

  // Fork segment IDs
  const forkId = `${baseId}-fork`;
  const leftBranchId = `${baseId}-left`;
  const rightBranchId = `${baseId}-right`;
  const mergeId = `${baseId}-merge`;

  // Fork info
  const forkInfo: ForkInfo = {
    forkCenterX: centerX,
    commitDistance: startDistance + FORK_GEOMETRY.commitOffset,
    leftBranchId,
    rightBranchId,
    safeSide,
    mergeSegmentId: mergeId,
  };

  // Generate the main fork segment (short, just the split point)
  const forkSegment: RiverSegment = {
    id: forkId,
    shape: 'fork',
    sectionType: 'normal',
    elevationShape: 'flat',
    startDistance,
    length: FORK_GEOMETRY.approachLength,
    entryWidth: startWidth,
    exitWidth: startWidth * 1.5, // Widen at fork
    entryZ: startZ,
    exitZ: startZ,
    pathPoints: generateForkApproachPoints(
      startDistance,
      FORK_GEOMETRY.approachLength,
      centerX,
      startZ,
      startWidth
    ),
    biome: 'forest', // Will be overridden by caller
    forkInfo,
  };

  // Generate left branch
  const leftConfig = safeSide === 'left' ? BRANCH_CONFIG.safe : BRANCH_CONFIG.risky;
  const leftWidth = startWidth * leftConfig.widthMultiplier;
  const leftBranch = generateBranchSegment(
    leftBranchId,
    startDistance + FORK_GEOMETRY.approachLength,
    branchLength,
    centerX - FORK_GEOMETRY.branchOffset,
    startZ,
    leftWidth,
    leftConfig.speedMultiplier,
    -0.3 // Slight left curve
  );

  // Generate right branch
  const rightConfig = safeSide === 'right' ? BRANCH_CONFIG.safe : BRANCH_CONFIG.risky;
  const rightWidth = startWidth * rightConfig.widthMultiplier;
  const rightBranch = generateBranchSegment(
    rightBranchId,
    startDistance + FORK_GEOMETRY.approachLength,
    branchLength,
    centerX + FORK_GEOMETRY.branchOffset,
    startZ,
    rightWidth,
    rightConfig.speedMultiplier,
    0.3 // Slight right curve
  );

  // Generate merge segment
  const mergeStart = startDistance + FORK_GEOMETRY.approachLength + branchLength;
  const mergeSegment: RiverSegment = {
    id: mergeId,
    shape: 'merge',
    sectionType: 'normal',
    elevationShape: 'flat',
    startDistance: mergeStart,
    length: FORK_GEOMETRY.mergeApproachLength,
    entryWidth: startWidth * 1.5,
    exitWidth: startWidth,
    entryZ: startZ,
    exitZ: startZ,
    pathPoints: generateMergePoints(
      mergeStart,
      FORK_GEOMETRY.mergeApproachLength,
      centerX,
      startZ,
      startWidth
    ),
    biome: 'forest',
  };

  return {
    forkSegment,
    leftBranch,
    rightBranch,
    mergeSegment,
  };
}

/**
 * Generate path points for fork approach (widening section)
 */
function generateForkApproachPoints(
  startDistance: number,
  length: number,
  centerX: number,
  centerZ: number,
  startWidth: number
): RiverPathPoint[] {
  const points: RiverPathPoint[] = [];
  const interval = 2; // 2m sampling

  for (let d = 0; d <= length; d += interval) {
    const t = d / length;
    // Width increases as we approach fork
    const width = startWidth * (1 + t * 0.5);

    points.push({
      distance: startDistance + d,
      centerX,
      centerZ,
      width,
      flowSpeed: 1.0,
      angleXY: 0,
      angleYZ: 0,
      slopeType: 'flat',
    });
  }

  return points;
}

/**
 * Generate a branch segment
 */
function generateBranchSegment(
  id: string,
  startDistance: number,
  length: number,
  centerX: number,
  centerZ: number,
  width: number,
  flowSpeed: number,
  curveFactor: number
): RiverSegment {
  const points: RiverPathPoint[] = [];
  const interval = 2;

  for (let d = 0; d <= length; d += interval) {
    const t = d / length;
    // Gentle S-curve within the branch
    const curveOffset = Math.sin(t * Math.PI) * curveFactor * 2;

    points.push({
      distance: startDistance + d,
      centerX: centerX + curveOffset,
      centerZ,
      width,
      flowSpeed,
      angleXY: Math.cos(t * Math.PI) * curveFactor * 0.5,
      angleYZ: 0,
      slopeType: 'flat',
    });
  }

  return {
    id,
    shape: 'straight', // Branch is essentially a curved segment
    sectionType: 'normal',
    elevationShape: 'flat',
    startDistance,
    length,
    entryWidth: width,
    exitWidth: width,
    entryZ: centerZ,
    exitZ: centerZ,
    pathPoints: points,
    biome: 'forest',
  };
}

/**
 * Generate path points for merge section (narrowing back)
 */
function generateMergePoints(
  startDistance: number,
  length: number,
  centerX: number,
  centerZ: number,
  targetWidth: number
): RiverPathPoint[] {
  const points: RiverPathPoint[] = [];
  const interval = 2;

  for (let d = 0; d <= length; d += interval) {
    const t = d / length;
    // Width decreases as branches merge
    const width = targetWidth * (1.5 - t * 0.5);

    points.push({
      distance: startDistance + d,
      centerX,
      centerZ,
      width,
      flowSpeed: 1.0,
      angleXY: 0,
      angleYZ: 0,
      slopeType: 'flat',
    });
  }

  return points;
}

// ============================================================================
// Branch Spawn Rate Modifiers
// ============================================================================

/**
 * Get spawn rate modifiers for the current branch
 * @param branchChoice Player's chosen branch
 * @param safeSide Which side is the safe branch
 */
export function getBranchSpawnModifiers(
  branchChoice: BranchChoice,
  safeSide: 'left' | 'right'
): {
  obstacleRate: number;
  collectibleRate: number;
  gemRate: number;
} {
  if (branchChoice === 'undecided') {
    return { obstacleRate: 1.0, collectibleRate: 1.0, gemRate: 1.0 };
  }

  const isSafe = branchChoice === safeSide;
  const config = isSafe ? BRANCH_CONFIG.safe : BRANCH_CONFIG.risky;

  return {
    obstacleRate: config.obstacleRate,
    collectibleRate: config.collectibleRate,
    gemRate: config.gemRate,
  };
}

// ============================================================================
// Fork Visibility
// ============================================================================

/**
 * Calculate visibility/opacity for each branch based on player choice
 * Used for rendering - non-chosen branch fades out after commit
 */
export function getBranchVisibility(
  branchChoice: BranchChoice,
  playerDistance: number,
  commitDistance: number
): { leftOpacity: number; rightOpacity: number } {
  if (branchChoice === 'undecided') {
    return { leftOpacity: 1.0, rightOpacity: 1.0 };
  }

  // Fade out non-chosen branch over 50m after commit
  const distanceAfterCommit = playerDistance - commitDistance;
  const fadeProgress = Math.min(distanceAfterCommit / 50, 1);

  if (branchChoice === 'left') {
    return {
      leftOpacity: 1.0,
      rightOpacity: 1 - fadeProgress,
    };
  } else {
    return {
      leftOpacity: 1 - fadeProgress,
      rightOpacity: 1.0,
    };
  }
}
