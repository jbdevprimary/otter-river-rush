/**
 * River Path System Types
 * Definitions for dynamic curved river generation with 3D terrain
 */

import type { BiomeType, Vector2D, Vector3D } from './game';

// ============================================================================
// Core Enums & Unions
// ============================================================================

/**
 * Shape of a river segment (horizontal curves)
 */
export type SegmentShape =
  | 'straight' // No horizontal curve
  | 'curve_left' // Gentle left bend
  | 'curve_right' // Gentle right bend
  | 's_curve_left' // S-bend starting left
  | 's_curve_right' // S-bend starting right
  | 'fork' // Splits into two paths
  | 'merge'; // Two paths rejoin

/**
 * Type of river section affecting gameplay
 */
export type RiverSectionType =
  | 'normal' // Standard gameplay
  | 'rapids' // Narrow, fast, more obstacles
  | 'calm_pool' // Wide, slow, more collectibles
  | 'whirlpool'; // Wide with central hazard

/**
 * Elevation profile of a river segment (vertical curves)
 */
export type ElevationShape =
  | 'flat' // No Z change
  | 'gentle_incline' // Gradual uphill (5-15 degrees)
  | 'gentle_decline' // Gradual downhill (5-15 degrees)
  | 'steep_slope' // Steep section (20-35 degrees)
  | 'waterfall' // Sharp drop (60-90 degrees)
  | 'rapids_drop'; // Series of small drops

/**
 * Current slope type at a path point
 */
export type SlopeType = 'flat' | 'incline' | 'decline' | 'waterfall';

// ============================================================================
// Path Point & Segment
// ============================================================================

/**
 * A single sampled point along the river path
 * These are generated every 2 meters for smooth interpolation
 */
export interface RiverPathPoint {
  /** Distance along the river from game start (Y-axis) */
  distance: number;
  /** River center offset from world origin (X-axis) */
  centerX: number;
  /** Elevation at this point (Z-axis) */
  centerZ: number;
  /** River width at this point */
  width: number;
  /** Speed multiplier for entities (0.6 - 1.5) */
  flowSpeed: number;
  /** Horizontal tangent angle in radians (curve direction) */
  angleXY: number;
  /** Vertical tangent angle in radians (slope/waterfall) */
  angleYZ: number;
  /** Classification of the slope at this point */
  slopeType: SlopeType;
}

/**
 * A river segment is a chunk of river with consistent characteristics
 */
export interface RiverSegment {
  /** Unique identifier */
  id: string;
  /** Horizontal curve shape */
  shape: SegmentShape;
  /** Section type affecting gameplay */
  sectionType: RiverSectionType;
  /** Elevation profile */
  elevationShape: ElevationShape;
  /** Distance from game start where segment begins */
  startDistance: number;
  /** Length of this segment in meters (30-80m typical) */
  length: number;
  /** River width at segment start */
  entryWidth: number;
  /** River width at segment end */
  exitWidth: number;
  /** Entry elevation (Z) */
  entryZ: number;
  /** Exit elevation (Z) */
  exitZ: number;
  /** Bezier control points for horizontal curve (XY plane) */
  curveControlPoints?: BezierControlPoints;
  /** Bezier control points for vertical curve (YZ plane) */
  elevationControlPoints?: BezierControlPoints;
  /** Sampled path points (every 2m) */
  pathPoints: RiverPathPoint[];
  /** Biome for visual theming */
  biome: BiomeType;
  /** For fork segments: info about branches */
  forkInfo?: ForkInfo;
}

// ============================================================================
// Bezier Curves
// ============================================================================

/**
 * Control points for a cubic Bezier curve
 */
export interface BezierControlPoints {
  /** Start point */
  p0: Vector2D;
  /** First control point */
  p1: Vector2D;
  /** Second control point */
  p2: Vector2D;
  /** End point */
  p3: Vector2D;
}

/**
 * 3D control points for full 3D Bezier curves
 */
export interface BezierControlPoints3D {
  p0: Vector3D;
  p1: Vector3D;
  p2: Vector3D;
  p3: Vector3D;
}

// ============================================================================
// Fork/Merge System
// ============================================================================

/**
 * Information about a fork in the river
 */
export interface ForkInfo {
  /** X position where fork begins */
  forkCenterX: number;
  /** Distance where player must commit to a branch */
  commitDistance: number;
  /** Left branch segment ID */
  leftBranchId: string;
  /** Right branch segment ID */
  rightBranchId: string;
  /** Which branch is "safe" (wider, slower, fewer obstacles) */
  safeSide: 'left' | 'right';
  /** Merge segment ID where branches rejoin */
  mergeSegmentId: string;
}

/**
 * Player's chosen branch after a fork
 */
export type BranchChoice = 'left' | 'right' | 'undecided';

// ============================================================================
// Hazards
// ============================================================================

/**
 * Whirlpool hazard that pulls the player
 */
export interface Whirlpool {
  /** Unique identifier */
  id: string;
  /** X position (center of whirlpool) */
  centerX: number;
  /** Y position (distance along river) */
  distance: number;
  /** Inner hazard radius (instant damage zone) */
  radius: number;
  /** Outer pull force radius */
  pullRadius: number;
  /** Pull strength in units/second at edge */
  pullStrength: number;
  /** Damage rate (health/second when inside) */
  damageRate: number;
  /** Width of safe channels on each side */
  safeChannelWidth: number;
  /** Rotation speed of visual effect */
  rotationSpeed: number;
}

/**
 * Waterfall hazard/feature
 */
export interface Waterfall {
  /** Unique identifier */
  id: string;
  /** Distance where waterfall starts */
  startDistance: number;
  /** Height of the drop in Z units (2-8) */
  dropHeight: number;
  /** Horizontal distance of the drop */
  dropLength: number;
  /** Angle of the drop in degrees (60-90) */
  dropAngle: number;
  /** Visual effect radius at bottom */
  splashRadius: number;
  /** Speed multiplier at waterfall edge (1.5-2.0) */
  speedBoost: number;
  /** Whether to trigger camera shake on landing */
  cameraShake: boolean;
}

// ============================================================================
// Section Configurations
// ============================================================================

/**
 * Configuration for a river section type
 */
export interface SectionConfig {
  /** Multiplier for river width */
  widthMultiplier: number;
  /** Multiplier for flow/scroll speed */
  flowSpeedMultiplier: number;
  /** Multiplier for obstacle spawn rate */
  obstacleSpawnRate: number;
  /** Multiplier for collectible spawn rate */
  collectibleSpawnRate: number;
  /** Min/max duration in meters */
  duration: { min: number; max: number };
  /** Visual effects to apply */
  visualEffects: string[];
}

// ============================================================================
// Scaling
// ============================================================================

/**
 * Dynamic scaling values based on river width
 */
export interface DynamicScaling {
  /** Otter model scale (0.6 - 1.5) */
  otterScale: number;
  /** Bank width on each side (0 - 4) */
  bankWidth: number;
  /** Camera FOV adjustment */
  cameraFovMultiplier: number;
}

// ============================================================================
// Generation
// ============================================================================

/**
 * Shape weights for random segment generation
 */
export interface ShapeWeights {
  straight: number;
  curve_left: number;
  curve_right: number;
  s_curve_left: number;
  s_curve_right: number;
  fork: number;
}

/**
 * Constraints for segment generation
 */
export interface GenerationConstraints {
  /** Minimum distance before forks can appear */
  minDistanceForFork: number;
  /** Minimum distance between forks */
  minDistanceBetweenForks: number;
  /** Minimum segment length in meters */
  minSegmentLength: number;
  /** Maximum segment length in meters */
  maxSegmentLength: number;
  /** Path point sample interval in meters */
  sampleInterval: number;
  /** Lookahead distance for generation */
  lookaheadDistance: number;
}

// ============================================================================
// State
// ============================================================================

/**
 * River path state for Zustand store
 */
export interface RiverPathState {
  /** All generated segments */
  segments: RiverSegment[];
  /** Total distance generated */
  generatedDistance: number;
  /** Active whirlpools */
  whirlpools: Whirlpool[];
  /** Active waterfalls */
  waterfalls: Waterfall[];
  /** Current branch choice (if in fork) */
  currentBranch: BranchChoice;
  /** ID of current fork (if any) */
  currentForkId: string | null;
  /** Seed for deterministic generation */
  seed: string;
}

/**
 * River path store actions
 */
export interface RiverPathActions {
  /** Initialize with a seed */
  initialize: (seed: string) => void;
  /** Generate segments to reach target distance */
  generateTo: (targetDistance: number) => void;
  /** Add a segment to the path */
  addSegment: (segment: RiverSegment) => void;
  /** Add a whirlpool hazard */
  addWhirlpool: (whirlpool: Whirlpool) => void;
  /** Add a waterfall feature */
  addWaterfall: (waterfall: Waterfall) => void;
  /** Set the player's branch choice */
  setBranchChoice: (choice: BranchChoice) => void;
  /** Clear old segments behind the player */
  pruneOldSegments: (playerDistance: number) => void;
  /** Reset the path system */
  reset: () => void;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Lane position (-2, -1, 0, 1, 2 for 5 lanes or -1, 0, 1 for 3 lanes)
 */
export type LaneIndex = -2 | -1 | 0 | 1 | 2;

/**
 * Result of querying a path point at a distance
 */
export interface PathQueryResult {
  /** The interpolated path point */
  point: RiverPathPoint;
  /** The segment containing this point */
  segment: RiverSegment;
  /** Progress through the segment (0-1) */
  segmentProgress: number;
}

/**
 * World position for an entity at a lane and distance
 */
export interface LaneWorldPosition {
  x: number;
  y: number;
  z: number;
  /** Rotation to face along path */
  rotationY: number;
  /** Rotation to match slope */
  rotationX: number;
}
