/**
 * River Path Utilities
 * Bezier curve sampling and path point calculations
 */

import type {
  BezierControlPoints,
  LaneIndex,
  LaneWorldPosition,
  PathQueryResult,
  RiverPathPoint,
  RiverSegment,
  SlopeType,
} from '../types/river-path';
import type { Vector2D, Vector3D } from '../types/game';

// ============================================================================
// Constants
// ============================================================================

/** Degrees to radians conversion factor */
const DEG_TO_RAD = Math.PI / 180;

/** Radians to degrees conversion factor */
const RAD_TO_DEG = 180 / Math.PI;

/** Default sample interval for path points (meters) */
export const DEFAULT_SAMPLE_INTERVAL = 2;

/** Small epsilon for floating point comparisons */
const EPSILON = 0.0001;

// ============================================================================
// Bezier Curve Functions
// ============================================================================

/**
 * Cubic Bezier interpolation for a single dimension
 * P(t) = (1-t)^3 * P0 + 3(1-t)^2 * t * P1 + 3(1-t) * t^2 * P2 + t^3 * P3
 */
export function cubicBezier(
  t: number,
  p0: number,
  p1: number,
  p2: number,
  p3: number
): number {
  const t2 = t * t;
  const t3 = t2 * t;
  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;
  return mt3 * p0 + 3 * mt2 * t * p1 + 3 * mt * t2 * p2 + t3 * p3;
}

/**
 * Cubic Bezier interpolation for 2D points
 */
export function cubicBezier2D(
  t: number,
  p0: Vector2D,
  p1: Vector2D,
  p2: Vector2D,
  p3: Vector2D
): Vector2D {
  return {
    x: cubicBezier(t, p0.x, p1.x, p2.x, p3.x),
    y: cubicBezier(t, p0.y, p1.y, p2.y, p3.y),
  };
}

/**
 * Cubic Bezier interpolation for 3D points
 */
export function cubicBezier3D(
  t: number,
  p0: Vector3D,
  p1: Vector3D,
  p2: Vector3D,
  p3: Vector3D
): Vector3D {
  return {
    x: cubicBezier(t, p0.x, p1.x, p2.x, p3.x),
    y: cubicBezier(t, p0.y, p1.y, p2.y, p3.y),
    z: cubicBezier(t, p0.z, p1.z, p2.z, p3.z),
  };
}

/**
 * Bezier curve derivative for calculating tangent
 * P'(t) = 3(1-t)^2 * (P1-P0) + 6(1-t) * t * (P2-P1) + 3t^2 * (P3-P2)
 */
export function cubicBezierDerivative(
  t: number,
  p0: number,
  p1: number,
  p2: number,
  p3: number
): number {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;
  return (
    3 * mt2 * (p1 - p0) + 6 * mt * t * (p2 - p1) + 3 * t2 * (p3 - p2)
  );
}

/**
 * Calculate tangent angle in XY plane (horizontal curve direction)
 */
export function calculateTangentAngleXY(
  t: number,
  controlPoints: BezierControlPoints
): number {
  const { p0, p1, p2, p3 } = controlPoints;
  const dx = cubicBezierDerivative(t, p0.x, p1.x, p2.x, p3.x);
  const dy = cubicBezierDerivative(t, p0.y, p1.y, p2.y, p3.y);
  return Math.atan2(dx, dy); // atan2(x, y) because Y is forward direction
}

/**
 * Calculate tangent angle in YZ plane (vertical slope direction)
 */
export function calculateTangentAngleYZ(
  t: number,
  controlPoints: BezierControlPoints
): number {
  const { p0, p1, p2, p3 } = controlPoints;
  const dy = cubicBezierDerivative(t, p0.x, p1.x, p2.x, p3.x); // Y mapped to X in 2D
  const dz = cubicBezierDerivative(t, p0.y, p1.y, p2.y, p3.y); // Z mapped to Y in 2D
  return Math.atan2(-dz, dy); // Negative Z because down is negative
}

// ============================================================================
// Path Sampling
// ============================================================================

/**
 * Sample a Bezier path into discrete path points
 */
export function sampleBezierPath(
  controlPoints: BezierControlPoints,
  elevationPoints: BezierControlPoints | null | undefined,
  startDistance: number,
  length: number,
  startWidth: number,
  endWidth: number,
  startFlowSpeed: number,
  endFlowSpeed: number,
  sampleInterval: number = DEFAULT_SAMPLE_INTERVAL
): RiverPathPoint[] {
  const numSamples = Math.max(2, Math.ceil(length / sampleInterval));
  const points: RiverPathPoint[] = [];

  for (let i = 0; i <= numSamples; i++) {
    const t = i / numSamples;
    const distance = startDistance + t * length;

    // Sample horizontal curve
    const pos2D = cubicBezier2D(
      t,
      controlPoints.p0,
      controlPoints.p1,
      controlPoints.p2,
      controlPoints.p3
    );

    // Sample elevation if provided
    let centerZ = 0;
    let angleYZ = 0;
    if (elevationPoints) {
      const elev2D = cubicBezier2D(
        t,
        elevationPoints.p0,
        elevationPoints.p1,
        elevationPoints.p2,
        elevationPoints.p3
      );
      centerZ = elev2D.y; // Y component is Z elevation
      angleYZ = calculateTangentAngleYZ(t, elevationPoints);
    }

    // Interpolate width and flow speed
    const width = lerp(startWidth, endWidth, t);
    const flowSpeed = lerp(startFlowSpeed, endFlowSpeed, t);

    // Calculate horizontal tangent angle
    const angleXY = calculateTangentAngleXY(t, controlPoints);

    // Determine slope type from vertical angle
    const slopeType = classifySlopeType(angleYZ);

    points.push({
      distance,
      centerX: pos2D.x,
      centerZ,
      width,
      flowSpeed,
      angleXY,
      angleYZ,
      slopeType,
    });
  }

  return points;
}

/**
 * Sample a straight path (no curves)
 */
export function sampleStraightPath(
  startDistance: number,
  length: number,
  startWidth: number,
  endWidth: number,
  startFlowSpeed: number,
  endFlowSpeed: number,
  centerX: number = 0,
  centerZ: number = 0,
  sampleInterval: number = DEFAULT_SAMPLE_INTERVAL
): RiverPathPoint[] {
  const numSamples = Math.max(2, Math.ceil(length / sampleInterval));
  const points: RiverPathPoint[] = [];

  for (let i = 0; i <= numSamples; i++) {
    const t = i / numSamples;
    const distance = startDistance + t * length;
    const width = lerp(startWidth, endWidth, t);
    const flowSpeed = lerp(startFlowSpeed, endFlowSpeed, t);

    points.push({
      distance,
      centerX,
      centerZ,
      width,
      flowSpeed,
      angleXY: 0,
      angleYZ: 0,
      slopeType: 'flat',
    });
  }

  return points;
}

// ============================================================================
// Control Point Generation
// ============================================================================

/**
 * Generate control points for a left curve
 */
export function generateLeftCurveControlPoints(
  startX: number,
  startY: number,
  endY: number,
  curveIntensity: number = 4
): BezierControlPoints {
  const length = endY - startY;
  return {
    p0: { x: startX, y: startY },
    p1: { x: startX - curveIntensity, y: startY + length * 0.33 },
    p2: { x: startX - curveIntensity, y: startY + length * 0.67 },
    p3: { x: startX, y: endY },
  };
}

/**
 * Generate control points for a right curve
 */
export function generateRightCurveControlPoints(
  startX: number,
  startY: number,
  endY: number,
  curveIntensity: number = 4
): BezierControlPoints {
  const length = endY - startY;
  return {
    p0: { x: startX, y: startY },
    p1: { x: startX + curveIntensity, y: startY + length * 0.33 },
    p2: { x: startX + curveIntensity, y: startY + length * 0.67 },
    p3: { x: startX, y: endY },
  };
}

/**
 * Generate control points for an S-curve starting left
 */
export function generateSCurveLeftControlPoints(
  startX: number,
  startY: number,
  endY: number,
  curveIntensity: number = 3
): BezierControlPoints {
  const length = endY - startY;
  return {
    p0: { x: startX, y: startY },
    p1: { x: startX - curveIntensity, y: startY + length * 0.25 },
    p2: { x: startX + curveIntensity, y: startY + length * 0.75 },
    p3: { x: startX, y: endY },
  };
}

/**
 * Generate control points for an S-curve starting right
 */
export function generateSCurveRightControlPoints(
  startX: number,
  startY: number,
  endY: number,
  curveIntensity: number = 3
): BezierControlPoints {
  const length = endY - startY;
  return {
    p0: { x: startX, y: startY },
    p1: { x: startX + curveIntensity, y: startY + length * 0.25 },
    p2: { x: startX - curveIntensity, y: startY + length * 0.75 },
    p3: { x: startX, y: endY },
  };
}

/**
 * Generate control points for a waterfall
 */
export function generateWaterfallControlPoints(
  startY: number,
  startZ: number,
  dropLength: number,
  dropHeight: number
): BezierControlPoints {
  return {
    p0: { x: startY, y: startZ },
    p1: { x: startY + dropLength * 0.3, y: startZ - dropHeight * 0.1 },
    p2: { x: startY + dropLength * 0.7, y: startZ - dropHeight * 0.9 },
    p3: { x: startY + dropLength, y: startZ - dropHeight },
  };
}

/**
 * Generate control points for a gentle slope
 */
export function generateSlopeControlPoints(
  startY: number,
  startZ: number,
  length: number,
  heightChange: number
): BezierControlPoints {
  return {
    p0: { x: startY, y: startZ },
    p1: { x: startY + length * 0.33, y: startZ - heightChange * 0.33 },
    p2: { x: startY + length * 0.67, y: startZ - heightChange * 0.67 },
    p3: { x: startY + length, y: startZ - heightChange },
  };
}

// ============================================================================
// Path Queries
// ============================================================================

/**
 * Find the segment containing a given distance using binary search
 */
export function findSegmentAtDistance(
  segments: RiverSegment[],
  distance: number
): RiverSegment | null {
  if (segments.length === 0) return null;

  let left = 0;
  let right = segments.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const segment = segments[mid];
    const segmentEnd = segment.startDistance + segment.length;

    if (distance < segment.startDistance) {
      right = mid - 1;
    } else if (distance >= segmentEnd) {
      left = mid + 1;
    } else {
      return segment;
    }
  }

  // If not found exactly, return the closest segment
  if (left >= segments.length) {
    return segments[segments.length - 1];
  }
  if (left <= 0) {
    return segments[0];
  }

  return segments[left];
}

/**
 * Get the interpolated path point at a given distance
 */
export function getPathPointAtDistance(
  segments: RiverSegment[],
  distance: number
): PathQueryResult | null {
  const segment = findSegmentAtDistance(segments, distance);
  if (!segment) return null;

  const points = segment.pathPoints;
  if (points.length === 0) return null;

  // Find the two points to interpolate between
  const localDistance = distance - segment.startDistance;
  const segmentProgress = Math.max(0, Math.min(1, localDistance / segment.length));

  // Binary search for the point
  let left = 0;
  let right = points.length - 1;

  while (left < right - 1) {
    const mid = Math.floor((left + right) / 2);
    const midLocalDist = points[mid].distance - segment.startDistance;

    if (localDistance < midLocalDist) {
      right = mid;
    } else {
      left = mid;
    }
  }

  // Interpolate between left and right points
  const p0 = points[left];
  const p1 = points[right];

  if (p0.distance === p1.distance) {
    return { point: p0, segment, segmentProgress };
  }

  const t =
    (distance - p0.distance) / (p1.distance - p0.distance);
  const clampedT = Math.max(0, Math.min(1, t));

  const point: RiverPathPoint = {
    distance,
    centerX: lerp(p0.centerX, p1.centerX, clampedT),
    centerZ: lerp(p0.centerZ, p1.centerZ, clampedT),
    width: lerp(p0.width, p1.width, clampedT),
    flowSpeed: lerp(p0.flowSpeed, p1.flowSpeed, clampedT),
    angleXY: lerpAngle(p0.angleXY, p1.angleXY, clampedT),
    angleYZ: lerpAngle(p0.angleYZ, p1.angleYZ, clampedT),
    slopeType: clampedT < 0.5 ? p0.slopeType : p1.slopeType,
  };

  return { point, segment, segmentProgress };
}

/**
 * Get world position for an entity at a lane and distance
 */
export function getLaneWorldPosition(
  segments: RiverSegment[],
  distance: number,
  lane: LaneIndex,
  laneCount: 3 | 5 = 3
): LaneWorldPosition | null {
  const result = getPathPointAtDistance(segments, distance);
  if (!result) return null;

  const { point } = result;

  // Calculate lane offset based on width
  // For 3 lanes: -1, 0, 1 -> -width/3, 0, +width/3
  // For 5 lanes: -2, -1, 0, 1, 2 -> -width/2.5, -width/5, 0, +width/5, +width/2.5
  const laneOffset = laneCount === 3 ? point.width / 3 : point.width / 5;
  const xOffset = lane * laneOffset;

  // Apply the curve angle to offset
  const rotatedX = point.centerX + xOffset * Math.cos(point.angleXY);
  const rotatedY = distance - xOffset * Math.sin(point.angleXY);

  return {
    x: rotatedX,
    y: rotatedY,
    z: point.centerZ,
    rotationY: point.angleXY,
    rotationX: point.angleYZ,
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Linear interpolation
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Linear interpolation for angles (handles wrap-around)
 */
export function lerpAngle(a: number, b: number, t: number): number {
  let diff = b - a;

  // Handle wrap-around at PI/-PI
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;

  return a + diff * t;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Classify slope type based on vertical angle
 */
export function classifySlopeType(angleYZ: number): SlopeType {
  const angleDeg = angleYZ * RAD_TO_DEG;

  if (angleDeg < -45) return 'waterfall';
  if (angleDeg < -5) return 'decline';
  if (angleDeg > 5) return 'incline';
  return 'flat';
}

/**
 * Calculate river boundaries at a path point
 */
export function getRiverBoundaries(
  point: RiverPathPoint
): { left: number; right: number } {
  const halfWidth = point.width / 2;
  return {
    left: point.centerX - halfWidth,
    right: point.centerX + halfWidth,
  };
}

/**
 * Check if an X position is within the river at a given path point
 */
export function isWithinRiver(x: number, point: RiverPathPoint): boolean {
  const bounds = getRiverBoundaries(point);
  return x >= bounds.left && x <= bounds.right;
}

/**
 * Get the approximate arc length of a Bezier curve (used for accurate sampling)
 */
export function estimateBezierLength(
  controlPoints: BezierControlPoints,
  samples: number = 20
): number {
  let length = 0;
  let prevPoint = cubicBezier2D(
    0,
    controlPoints.p0,
    controlPoints.p1,
    controlPoints.p2,
    controlPoints.p3
  );

  for (let i = 1; i <= samples; i++) {
    const t = i / samples;
    const point = cubicBezier2D(
      t,
      controlPoints.p0,
      controlPoints.p1,
      controlPoints.p2,
      controlPoints.p3
    );
    const dx = point.x - prevPoint.x;
    const dy = point.y - prevPoint.y;
    length += Math.sqrt(dx * dx + dy * dy);
    prevPoint = point;
  }

  return length;
}

// ============================================================================
// Exports for testing
// ============================================================================

export const __test__ = {
  DEG_TO_RAD,
  RAD_TO_DEG,
  EPSILON,
};
