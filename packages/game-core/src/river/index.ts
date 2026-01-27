/**
 * River Path System
 * Dynamic curved river generation with 3D terrain
 */

// Path utilities
export * from './path-utils';

// Path generator
export * from './path-generator';

// Scaling utilities
export * from './scaling';

// Terrain physics
export * from './terrain-physics';

// Fork management
export * from './fork-manager';

// Section configurations
export * from './section-configs';

// Whirlpool physics
export * from './whirlpool-physics';

// Section tracker
export * from './section-tracker';

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
  RiverSegment,
  RiverSectionType,
  SectionConfig,
  SegmentShape,
  ShapeWeights,
  SlopeType,
  Waterfall,
  Whirlpool,
} from '../types/river-path';
