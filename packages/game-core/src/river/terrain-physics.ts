/**
 * Terrain Physics Utilities
 * Handles slope effects, gravity, and waterfall acceleration
 */

import type { SlopeType } from '../types/river-path';

// ============================================================================
// Constants
// ============================================================================

/** Slope speed modifiers */
const SLOPE_SPEED_MODIFIERS: Record<SlopeType, number> = {
  flat: 1.0,
  incline: 0.7, // 30% slower going uphill
  decline: 1.3, // 30% faster going downhill
  waterfall: 1.8, // 80% faster on waterfalls
};

/** Gravity acceleration for waterfall drops (units/s²) */
const WATERFALL_GRAVITY = 9.8;

/** Maximum fall speed */
const MAX_FALL_SPEED = 15;

/** Camera tilt limits (degrees) */
const CAMERA_TILT = {
  maxPitch: 15, // Max forward/back tilt
  maxRoll: 10, // Max left/right tilt (for curves)
  pitchFactor: 0.3, // How much of slope angle to apply
  rollFactor: 0.2, // How much of curve angle to apply
};

/** Otter rotation limits */
const OTTER_ROTATION = {
  maxPitch: 25, // Max forward/back rotation (degrees)
  leanFactor: 0.3, // How much to lean into curves
};

// ============================================================================
// Slope Physics
// ============================================================================

/**
 * Calculate speed modifier based on slope type
 * @param slopeType Current terrain slope type
 * @returns Speed multiplier (1.0 = normal, <1 = slower, >1 = faster)
 */
export function getSlopeSpeedModifier(slopeType: SlopeType): number {
  return SLOPE_SPEED_MODIFIERS[slopeType];
}

/**
 * Calculate slope effect on entity movement
 * Returns speed modifier and vertical velocity for waterfalls
 */
export interface SlopeEffect {
  /** Speed multiplier for horizontal movement */
  speedMultiplier: number;
  /** Vertical velocity (negative = falling) */
  verticalVelocity: number;
  /** Whether gravity should be applied */
  applyGravity: boolean;
}

/**
 * Calculate slope physics effects
 * @param slopeType Current terrain slope
 * @param angleYZ Vertical angle (radians, negative = downhill)
 * @param currentVerticalVelocity Current falling speed
 * @param deltaTime Time step
 */
export function calculateSlopeEffect(
  slopeType: SlopeType,
  _angleYZ: number, // Reserved for future gradient-based physics
  currentVerticalVelocity: number,
  deltaTime: number
): SlopeEffect {
  const speedMultiplier = getSlopeSpeedModifier(slopeType);

  // No gravity for non-waterfall slopes
  if (slopeType !== 'waterfall') {
    return {
      speedMultiplier,
      verticalVelocity: 0,
      applyGravity: false,
    };
  }

  // Waterfall physics - apply gravity
  let verticalVelocity = currentVerticalVelocity - WATERFALL_GRAVITY * deltaTime;
  verticalVelocity = Math.max(verticalVelocity, -MAX_FALL_SPEED);

  return {
    speedMultiplier,
    verticalVelocity,
    applyGravity: true,
  };
}

// ============================================================================
// Camera Effects
// ============================================================================

/**
 * Camera tilt data for terrain following
 */
export interface CameraTilt {
  /** Pitch rotation (forward/back tilt) in radians */
  pitch: number;
  /** Roll rotation (left/right tilt) in radians */
  roll: number;
}

/**
 * Calculate camera tilt for terrain slope and curves
 * @param angleYZ Vertical slope angle (radians)
 * @param angleXY Horizontal curve angle (radians)
 */
export function calculateCameraTilt(angleYZ: number, angleXY: number): CameraTilt {
  const DEG_TO_RAD = Math.PI / 180;

  // Pitch: tilt camera forward/back based on terrain slope
  // Clamp to max tilt
  const rawPitch = angleYZ * CAMERA_TILT.pitchFactor;
  const maxPitchRad = CAMERA_TILT.maxPitch * DEG_TO_RAD;
  const pitch = clamp(rawPitch, -maxPitchRad, maxPitchRad);

  // Roll: tilt camera into horizontal curves
  const rawRoll = angleXY * CAMERA_TILT.rollFactor;
  const maxRollRad = CAMERA_TILT.maxRoll * DEG_TO_RAD;
  const roll = clamp(rawRoll, -maxRollRad, maxRollRad);

  return { pitch, roll };
}

// ============================================================================
// Otter Rotation
// ============================================================================

/**
 * Otter rotation data for terrain matching
 */
export interface OtterRotation {
  /** Pitch rotation (nose up/down) in radians */
  pitch: number;
  /** Roll rotation (lean left/right) in radians */
  roll: number;
  /** Yaw rotation (facing direction) in radians */
  yaw: number;
}

/**
 * Calculate otter rotation to match terrain
 * @param angleYZ Vertical slope angle (radians, negative = downhill)
 * @param angleXY Horizontal curve angle (radians)
 * @param lane Current lane (-1, 0, 1) for lean calculation
 */
export function calculateOtterRotation(
  angleYZ: number,
  angleXY: number,
  _lane: -1 | 0 | 1 = 0 // Reserved for lane-specific lean adjustments
): OtterRotation {
  const DEG_TO_RAD = Math.PI / 180;

  // Pitch: otter tilts forward on downslopes, back on upslopes
  const rawPitch = -angleYZ; // Negative because otter faces camera
  const maxPitchRad = OTTER_ROTATION.maxPitch * DEG_TO_RAD;
  const pitch = clamp(rawPitch, -maxPitchRad, maxPitchRad);

  // Roll: lean into curves (opposite direction of curve for natural look)
  const roll = -angleXY * OTTER_ROTATION.leanFactor;

  // Yaw: face slightly into the turn
  const yaw = angleXY * 0.5;

  return { pitch, roll, yaw };
}

/**
 * Get complete terrain transform data for otter
 */
export interface OtterTerrainTransform {
  /** Position offset from path center */
  position: { x: number; y: number; z: number };
  /** Rotation in radians */
  rotation: OtterRotation;
  /** Scale factor based on river width */
  scale: number;
}

/**
 * Calculate complete otter transform for terrain
 * @param pathPoint Current path point data
 * @param lane Current lane
 * @param laneWidth Width between lanes
 */
export function calculateOtterTerrainTransform(
  centerX: number,
  centerZ: number,
  angleXY: number,
  angleYZ: number,
  width: number,
  lane: -1 | 0 | 1,
  laneWidth: number
): OtterTerrainTransform {
  // Calculate lane offset
  const perpAngle = angleXY + Math.PI / 2;
  const perpX = Math.cos(perpAngle);
  const laneOffset = lane * laneWidth;

  // Position
  const position = {
    x: centerX + laneOffset * perpX,
    y: 0, // Player always at y=0 in camera space
    z: centerZ,
  };

  // Rotation
  const rotation = calculateOtterRotation(angleYZ, angleXY, lane);

  // Scale based on river width
  const BASE_WIDTH = 8;
  const scale = Math.min(Math.max(BASE_WIDTH / width, 0.6), 1.5);

  return { position, rotation, scale };
}

// ============================================================================
// Utilities
// ============================================================================

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
