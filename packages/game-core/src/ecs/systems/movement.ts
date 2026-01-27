/**
 * Movement System
 * Updates entity positions based on velocity
 * Supports dynamic speed scaling based on difficulty progression
 * Supports river path following for curved river segments
 * Includes slope physics for terrain-aware movement
 */

import { getSlopeSpeedModifier } from '../../river/terrain-physics';
import { calculateSpeedMultiplier, useGameStore, useRiverPathStore } from '../../store';
import { queries } from '../world';

/**
 * Update all moving entities
 * @param deltaTime Time elapsed since last frame (in seconds)
 * @param speedMultiplier Optional speed multiplier (defaults to difficulty-based calculation)
 */
export function updateMovement(deltaTime: number, speedMultiplier?: number): void {
  // Get speed multiplier from difficulty progression if not provided
  const gameState = useGameStore.getState();
  const multiplier = speedMultiplier ?? calculateSpeedMultiplier(gameState.distance);

  // Get river path store for curved path following
  const riverPathStore = useRiverPathStore.getState();
  const hasRiverPath = riverPathStore.segments.length > 0;

  for (const entity of queries.moving) {
    // Apply speed multiplier only to non-player entities (obstacles, collectibles)
    // Player movement speed remains constant for consistent control feel
    let entityMultiplier = entity.player ? 1 : multiplier;

    // River path following for curved rivers
    // Non-player entities with riverPath component follow the curved path
    if (hasRiverPath && entity.riverPath && !entity.player) {
      // Get path point at current river distance for slope physics
      const pathResult = riverPathStore.getPointAtDistance(entity.riverPath.distance);

      if (pathResult) {
        const { point } = pathResult;

        // Apply slope physics - entities move faster downhill, slower uphill
        const slopeModifier = getSlopeSpeedModifier(point.slopeType);
        entityMultiplier *= slopeModifier;

        // Update river distance based on scroll speed (entities move toward player)
        entity.riverPath.distance += entity.velocity!.y * deltaTime * entityMultiplier;

        // Calculate X position: path center + lane offset (adjusted for curve angle)
        const perpAngle = point.angleXY + Math.PI / 2;
        const perpX = Math.cos(perpAngle);
        entity.position!.x = point.centerX + entity.riverPath.laneOffset * perpX;

        // Y position is the entity's distance relative to player
        entity.position!.y = point.distance - gameState.distance;

        // Z position follows terrain elevation
        entity.position!.z = point.centerZ;
      } else {
        // Fallback: no path point found, use basic movement
        entity.position!.x += entity.velocity!.x * deltaTime * entityMultiplier;
        entity.position!.y += entity.velocity!.y * deltaTime * entityMultiplier;
        entity.position!.z += entity.velocity!.z * deltaTime * entityMultiplier;
      }
    } else {
      // Standard velocity-based movement for non-path entities
      entity.position!.x += entity.velocity!.x * deltaTime * entityMultiplier;
      entity.position!.y += entity.velocity!.y * deltaTime * entityMultiplier;
      entity.position!.z += entity.velocity!.z * deltaTime * entityMultiplier;
    }
  }
}

/**
 * Player path position data with terrain information
 */
export interface PlayerPathData {
  /** X position (adjusted for curves) */
  x: number;
  /** Y position (always 0 in camera space) */
  y: number;
  /** Z position (terrain elevation) */
  z: number;
  /** Yaw rotation to face along path (radians) */
  rotation: number;
  /** Pitch rotation for terrain slope (radians) */
  pitch: number;
  /** Roll rotation for curve lean (radians) */
  roll: number;
  /** Current slope type */
  slopeType: 'flat' | 'incline' | 'decline' | 'waterfall';
  /** Current river width */
  riverWidth: number;
  /** Flow speed at current position */
  flowSpeed: number;
}

/**
 * Update player position on curved river path
 * Player follows the path but uses lane-based offset
 * Returns full terrain data including rotation for otter model
 * @param playerDistance Current player distance along the river
 * @param lane Current player lane (-1, 0, 1)
 * @param laneWidth Width between lanes
 */
export function getPlayerPathPosition(
  playerDistance: number,
  lane: -1 | 0 | 1,
  laneWidth: number
): PlayerPathData | null {
  const riverPathStore = useRiverPathStore.getState();

  if (riverPathStore.segments.length === 0) {
    // Fallback for straight river
    return null;
  }

  const pathResult = riverPathStore.getPointAtDistance(playerDistance);

  if (!pathResult) {
    return null;
  }

  const { point } = pathResult;

  // Calculate perpendicular direction for lane offset
  const perpAngle = point.angleXY + Math.PI / 2;
  const perpX = Math.cos(perpAngle);
  const laneOffset = lane * laneWidth;

  // Calculate otter rotation based on terrain
  // Pitch: tilt forward on downslopes (negative angleYZ means downhill)
  const maxPitch = 25 * (Math.PI / 180); // 25 degrees max
  const pitch = Math.min(Math.max(-point.angleYZ, -maxPitch), maxPitch);

  // Roll: lean into curves
  const roll = -point.angleXY * 0.3;

  return {
    x: point.centerX + laneOffset * perpX,
    y: 0, // Player is always at y=0 in camera space
    z: point.centerZ,
    rotation: point.angleXY, // Yaw rotation to face along the path
    pitch,
    roll,
    slopeType: point.slopeType,
    riverWidth: point.width,
    flowSpeed: point.flowSpeed,
  };
}
