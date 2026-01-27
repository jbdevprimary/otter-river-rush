/**
 * River Path System
 * Dynamic curved river generation with 3D terrain
 */

// Re-export types for convenience
export type {
  BezierControlPoints,
  BezierControlPoints3D,
  BranchChoice,
  DynamicScaling,
  ElevationShape,
  ForkInfo,
  GenerationConstraints,
  LaneIndex,
  LaneWorldPosition,
  PathQueryResult,
  RiverPathActions,
  RiverPathPoint,
  RiverPathState,
  RiverSectionType,
  RiverSegment,
  SectionConfig,
  SegmentShape,
  ShapeWeights,
  SlopeType,
  Waterfall,
  Whirlpool,
} from '../types/river-path';
// Fork management
export * from './fork-manager';
// Path generator
export * from './path-generator';
// Path utilities
export * from './path-utils';
// Scaling utilities
export * from './scaling';

// Section configurations
export * from './section-configs';
// Section tracker
export * from './section-tracker';
// Terrain physics
export * from './terrain-physics';
// Whirlpool physics
export * from './whirlpool-physics';
