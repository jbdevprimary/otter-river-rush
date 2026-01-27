/**
 * River Path Generator
 * Procedural generation of curved river segments with 3D terrain
 */

import type { BiomeType } from '../types/game';
import type {
  BezierControlPoints,
  ElevationShape,
  ForkInfo,
  GenerationConstraints,
  RiverPathPoint,
  RiverSegment,
  RiverSectionType,
  SegmentShape,
  ShapeWeights,
  Whirlpool,
} from '../types/river-path';
import type { SeededRNG } from '../utils/seeded-random';
import { createWhirlpool } from './whirlpool-physics';

import {
  generateLeftCurveControlPoints,
  generateRightCurveControlPoints,
  generateSCurveLeftControlPoints,
  generateSCurveRightControlPoints,
  generateSlopeControlPoints,
  generateWaterfallControlPoints,
  sampleBezierPath,
  sampleStraightPath,
} from './path-utils';

// ============================================================================
// Constants
// ============================================================================

/** Default shape weights for segment generation */
export const DEFAULT_SHAPE_WEIGHTS: ShapeWeights = {
  straight: 0.35,
  curve_left: 0.15,
  curve_right: 0.15,
  s_curve_left: 0.10,
  s_curve_right: 0.10,
  fork: 0.15,
};

/** Section type probabilities by biome */
const SECTION_PROBABILITIES: Record<BiomeType, Partial<Record<RiverSectionType, number>>> = {
  forest: { normal: 0.7, calm_pool: 0.2, rapids: 0.1 },
  canyon: { normal: 0.5, rapids: 0.4, whirlpool: 0.1 },
  arctic: { normal: 0.6, rapids: 0.3, calm_pool: 0.1 },
  tropical: { normal: 0.4, calm_pool: 0.4, whirlpool: 0.2 },
  volcanic: { normal: 0.3, rapids: 0.5, whirlpool: 0.2 },
};

/** Elevation shape probabilities */
const ELEVATION_WEIGHTS: Record<ElevationShape, number> = {
  flat: 0.50,
  gentle_incline: 0.15,
  gentle_decline: 0.20,
  steep_slope: 0.08,
  waterfall: 0.05,
  rapids_drop: 0.02,
};

/** Base river width */
const BASE_WIDTH = 8;

/** Width ranges by section type */
const SECTION_WIDTHS: Record<RiverSectionType, { min: number; max: number }> = {
  normal: { min: 6, max: 10 },
  rapids: { min: 4, max: 6 },
  calm_pool: { min: 10, max: 14 },
  whirlpool: { min: 10, max: 14 },
};

/** Flow speed ranges by section type */
const SECTION_FLOW_SPEEDS: Record<RiverSectionType, { min: number; max: number }> = {
  normal: { min: 0.9, max: 1.1 },
  rapids: { min: 1.3, max: 1.6 },
  calm_pool: { min: 0.5, max: 0.7 },
  whirlpool: { min: 0.6, max: 0.8 },
};

/** Curve intensity ranges */
const CURVE_INTENSITY = {
  gentle: { min: 2, max: 4 },
  moderate: { min: 4, max: 6 },
  sharp: { min: 6, max: 8 },
};

// ============================================================================
// Generator State
// ============================================================================

export interface GeneratorState {
  /** Last generated distance */
  lastDistance: number;
  /** Last X position (center of river) */
  lastCenterX: number;
  /** Last Z position (elevation) */
  lastCenterZ: number;
  /** Last width */
  lastWidth: number;
  /** Last flow speed */
  lastFlowSpeed: number;
  /** Current biome */
  currentBiome: BiomeType;
  /** Distance of last fork */
  lastForkDistance: number;
  /** Segment counter for IDs */
  segmentCounter: number;
  /** Cumulative curve offset (to prevent drifting too far) */
  cumulativeOffset: number;
}

/** Initial generator state */
export function createInitialGeneratorState(): GeneratorState {
  return {
    lastDistance: 0,
    lastCenterX: 0,
    lastCenterZ: 0,
    lastWidth: BASE_WIDTH,
    lastFlowSpeed: 1.0,
    currentBiome: 'forest',
    lastForkDistance: -1000, // Allow forks from the start after minDistanceForFork
    segmentCounter: 0,
    cumulativeOffset: 0,
  };
}

// ============================================================================
// Main Generator
// ============================================================================

/**
 * Generate the next river segment
 * Returns segment, new state, and optionally a whirlpool for whirlpool sections
 */
export function generateNextSegment(
  rng: SeededRNG,
  state: GeneratorState,
  constraints: GenerationConstraints
): { segment: RiverSegment; newState: GeneratorState; whirlpool?: Whirlpool } {
  // Pick segment length
  const length = rng.float(constraints.minSegmentLength, constraints.maxSegmentLength);

  // Pick shape
  const shape = pickShape(rng, state, constraints);

  // Pick section type based on biome
  const sectionType = pickSectionType(rng, state.currentBiome, state.lastWidth);

  // Pick elevation shape
  const elevationShape = pickElevationShape(rng, sectionType);

  // Calculate width based on section type
  const widthRange = SECTION_WIDTHS[sectionType];
  const targetWidth = rng.float(widthRange.min, widthRange.max);

  // Calculate flow speed
  const flowRange = SECTION_FLOW_SPEEDS[sectionType];
  const targetFlowSpeed = rng.float(flowRange.min, flowRange.max);

  // Generate the segment
  const segment = createSegment(
    rng,
    shape,
    sectionType,
    elevationShape,
    state,
    length,
    targetWidth,
    targetFlowSpeed,
    constraints
  );

  // Calculate new state
  const lastPoint = segment.pathPoints[segment.pathPoints.length - 1];
  const newState: GeneratorState = {
    ...state,
    lastDistance: segment.startDistance + segment.length,
    lastCenterX: lastPoint?.centerX ?? state.lastCenterX,
    lastCenterZ: lastPoint?.centerZ ?? state.lastCenterZ,
    lastWidth: segment.exitWidth,
    lastFlowSpeed: lastPoint?.flowSpeed ?? state.lastFlowSpeed,
    segmentCounter: state.segmentCounter + 1,
    cumulativeOffset: lastPoint?.centerX ?? state.cumulativeOffset,
    lastForkDistance: shape === 'fork' ? segment.startDistance : state.lastForkDistance,
  };

  // Generate whirlpool for whirlpool sections
  let whirlpool: Whirlpool | undefined;
  if (sectionType === 'whirlpool') {
    // Place whirlpool in the middle of the segment
    const whirlpoolDistance = segment.startDistance + length * 0.5;
    // Center in river with slight random offset
    const whirlpoolX = state.lastCenterX + rng.float(-1, 1);
    whirlpool = createWhirlpool(whirlpoolX, whirlpoolDistance, targetWidth);
  }

  return { segment, newState, whirlpool };
}

/**
 * Generate multiple segments up to a target distance
 */
export function generateSegmentsTo(
  rng: SeededRNG,
  state: GeneratorState,
  targetDistance: number,
  constraints: GenerationConstraints
): { segments: RiverSegment[]; newState: GeneratorState } {
  const segments: RiverSegment[] = [];
  let currentState = state;

  while (currentState.lastDistance < targetDistance) {
    const { segment, newState } = generateNextSegment(rng, currentState, constraints);
    segments.push(segment);
    currentState = newState;
  }

  return { segments, newState: currentState };
}

// ============================================================================
// Shape Selection
// ============================================================================

function pickShape(
  rng: SeededRNG,
  state: GeneratorState,
  constraints: GenerationConstraints
): SegmentShape {
  // Build weights array, excluding fork if constraints not met
  const weights = { ...DEFAULT_SHAPE_WEIGHTS };

  // Disable forks if:
  // - Not far enough into the game
  // - Too close to last fork
  // - Offset is too extreme (need to straighten out)
  const canFork =
    state.lastDistance >= constraints.minDistanceForFork &&
    state.lastDistance - state.lastForkDistance >= constraints.minDistanceBetweenForks &&
    Math.abs(state.cumulativeOffset) < 8;

  if (!canFork) {
    weights.fork = 0;
  }

  // If offset is getting extreme, bias towards straightening
  if (state.cumulativeOffset > 6) {
    weights.curve_left *= 2;
    weights.curve_right *= 0.5;
    weights.s_curve_right *= 2;
    weights.s_curve_left *= 0.5;
  } else if (state.cumulativeOffset < -6) {
    weights.curve_right *= 2;
    weights.curve_left *= 0.5;
    weights.s_curve_left *= 2;
    weights.s_curve_right *= 0.5;
  }

  // Normalize weights
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  const roll = rng.random() * totalWeight;

  let cumulative = 0;
  for (const [shape, weight] of Object.entries(weights)) {
    cumulative += weight;
    if (roll <= cumulative) {
      return shape as SegmentShape;
    }
  }

  return 'straight';
}

function pickSectionType(
  rng: SeededRNG,
  biome: BiomeType,
  currentWidth: number
): RiverSectionType {
  const probs = SECTION_PROBABILITIES[biome];

  // Whirlpool requires minimum width
  const canWhirlpool = currentWidth >= 10;
  const adjustedProbs = { ...probs };
  if (!canWhirlpool && adjustedProbs.whirlpool) {
    adjustedProbs.normal = (adjustedProbs.normal ?? 0) + (adjustedProbs.whirlpool ?? 0);
    adjustedProbs.whirlpool = 0;
  }

  const totalWeight = Object.values(adjustedProbs).reduce((a, b) => (a ?? 0) + (b ?? 0), 0) ?? 1;
  const roll = rng.random() * totalWeight;

  let cumulative = 0;
  for (const [type, weight] of Object.entries(adjustedProbs)) {
    cumulative += weight ?? 0;
    if (roll <= cumulative) {
      return type as RiverSectionType;
    }
  }

  return 'normal';
}

function pickElevationShape(rng: SeededRNG, sectionType: RiverSectionType): ElevationShape {
  // Rapids more likely to have drops
  // Calm pools more likely to be flat
  const weights = { ...ELEVATION_WEIGHTS };

  if (sectionType === 'rapids') {
    weights.steep_slope *= 2;
    weights.rapids_drop *= 3;
    weights.flat *= 0.5;
  } else if (sectionType === 'calm_pool') {
    weights.flat *= 2;
    weights.waterfall *= 0;
    weights.steep_slope *= 0.5;
  }

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  const roll = rng.random() * totalWeight;

  let cumulative = 0;
  for (const [shape, weight] of Object.entries(weights)) {
    cumulative += weight;
    if (roll <= cumulative) {
      return shape as ElevationShape;
    }
  }

  return 'flat';
}

// ============================================================================
// Segment Creation
// ============================================================================

function createSegment(
  rng: SeededRNG,
  shape: SegmentShape,
  sectionType: RiverSectionType,
  elevationShape: ElevationShape,
  state: GeneratorState,
  length: number,
  targetWidth: number,
  targetFlowSpeed: number,
  constraints: GenerationConstraints
): RiverSegment {
  const id = `segment-${state.segmentCounter}`;
  const startDistance = state.lastDistance;

  // Calculate exit values with smooth transition
  const exitWidth = lerp(state.lastWidth, targetWidth, 0.7);
  const exitFlowSpeed = lerp(state.lastFlowSpeed, targetFlowSpeed, 0.7);

  // Calculate elevation change
  const { exitZ, elevationControlPoints } = calculateElevation(
    rng,
    elevationShape,
    startDistance,
    state.lastCenterZ,
    length
  );

  // Generate control points based on shape
  let curveControlPoints: BezierControlPoints | undefined;
  let forkInfo: ForkInfo | undefined;

  switch (shape) {
    case 'curve_left':
      curveControlPoints = generateLeftCurveControlPoints(
        state.lastCenterX,
        startDistance,
        startDistance + length,
        rng.float(CURVE_INTENSITY.gentle.min, CURVE_INTENSITY.moderate.max)
      );
      break;

    case 'curve_right':
      curveControlPoints = generateRightCurveControlPoints(
        state.lastCenterX,
        startDistance,
        startDistance + length,
        rng.float(CURVE_INTENSITY.gentle.min, CURVE_INTENSITY.moderate.max)
      );
      break;

    case 's_curve_left':
      curveControlPoints = generateSCurveLeftControlPoints(
        state.lastCenterX,
        startDistance,
        startDistance + length,
        rng.float(CURVE_INTENSITY.gentle.min, CURVE_INTENSITY.moderate.max)
      );
      break;

    case 's_curve_right':
      curveControlPoints = generateSCurveRightControlPoints(
        state.lastCenterX,
        startDistance,
        startDistance + length,
        rng.float(CURVE_INTENSITY.gentle.min, CURVE_INTENSITY.moderate.max)
      );
      break;

    case 'fork':
      // Fork creates a split - for now, treat as straight with fork info
      forkInfo = {
        forkCenterX: state.lastCenterX,
        commitDistance: startDistance + length * 0.3,
        leftBranchId: `${id}-left`,
        rightBranchId: `${id}-right`,
        safeSide: rng.chance() ? 'left' : 'right',
        mergeSegmentId: `${id}-merge`,
      };
      break;

    case 'merge':
    case 'straight':
    default:
      // No curve control points needed
      break;
  }

  // Sample path points
  let pathPoints: RiverPathPoint[];

  if (curveControlPoints) {
    pathPoints = sampleBezierPath(
      curveControlPoints,
      elevationControlPoints,
      startDistance,
      length,
      state.lastWidth,
      exitWidth,
      state.lastFlowSpeed,
      exitFlowSpeed,
      constraints.sampleInterval
    );
  } else {
    pathPoints = sampleStraightPath(
      startDistance,
      length,
      state.lastWidth,
      exitWidth,
      state.lastFlowSpeed,
      exitFlowSpeed,
      state.lastCenterX,
      state.lastCenterZ,
      constraints.sampleInterval
    );

    // Apply elevation to straight path if needed
    if (elevationControlPoints) {
      pathPoints = pathPoints.map((point, i) => {
        const t = i / (pathPoints.length - 1);
        // Simple linear elevation interpolation for straight paths
        const z = lerp(state.lastCenterZ, exitZ, t);
        return { ...point, centerZ: z };
      });
    }
  }

  return {
    id,
    shape,
    sectionType,
    elevationShape,
    startDistance,
    length,
    entryWidth: state.lastWidth,
    exitWidth,
    entryZ: state.lastCenterZ,
    exitZ,
    curveControlPoints,
    elevationControlPoints,
    pathPoints,
    biome: state.currentBiome,
    forkInfo,
  };
}

function calculateElevation(
  rng: SeededRNG,
  elevationShape: ElevationShape,
  startDistance: number,
  startZ: number,
  length: number
): { exitZ: number; elevationControlPoints: BezierControlPoints | undefined } {
  switch (elevationShape) {
    case 'gentle_incline': {
      const rise = rng.float(0.5, 1.5);
      return {
        exitZ: startZ + rise,
        elevationControlPoints: generateSlopeControlPoints(startDistance, startZ, length, -rise),
      };
    }

    case 'gentle_decline': {
      const drop = rng.float(0.5, 1.5);
      return {
        exitZ: startZ - drop,
        elevationControlPoints: generateSlopeControlPoints(startDistance, startZ, length, drop),
      };
    }

    case 'steep_slope': {
      const drop = rng.float(2, 4);
      return {
        exitZ: startZ - drop,
        elevationControlPoints: generateSlopeControlPoints(startDistance, startZ, length, drop),
      };
    }

    case 'waterfall': {
      const dropHeight = rng.float(4, 8);
      const dropLength = length * 0.4; // Waterfall takes 40% of segment
      return {
        exitZ: startZ - dropHeight,
        elevationControlPoints: generateWaterfallControlPoints(
          startDistance,
          startZ,
          dropLength,
          dropHeight
        ),
      };
    }

    case 'rapids_drop': {
      // Multiple small drops
      const totalDrop = rng.float(1, 3);
      return {
        exitZ: startZ - totalDrop,
        elevationControlPoints: generateSlopeControlPoints(startDistance, startZ, length, totalDrop),
      };
    }

    case 'flat':
    default:
      return { exitZ: startZ, elevationControlPoints: undefined };
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// ============================================================================
// Biome Updates
// ============================================================================

/** Update biome based on distance thresholds */
export function updateBiome(distance: number): BiomeType {
  if (distance >= 2000) return 'volcanic';
  if (distance >= 1500) return 'tropical';
  if (distance >= 1000) return 'arctic';
  if (distance >= 500) return 'canyon';
  return 'forest';
}
