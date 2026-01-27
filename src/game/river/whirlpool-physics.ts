/**
 * Whirlpool Physics
 * Handles pull forces and damage calculations for whirlpool hazards
 *
 * Whirlpool Mechanics:
 * - Pull force increases as player gets closer to center
 * - Inner radius is the damage zone (instant damage)
 * - Safe channels on the sides allow players to pass without damage
 */

import type { Whirlpool } from '../types/river-path';

// ============================================================================
// Types
// ============================================================================

export interface WhirlpoolForce {
  /** X component of pull force */
  forceX: number;
  /** Y component of pull force (toward center along river) */
  forceY: number;
  /** Whether player is in damage zone */
  inDamageZone: boolean;
  /** Whether player is in safe channel */
  inSafeChannel: boolean;
  /** Distance to whirlpool center */
  distanceToCenter: number;
  /** Normalized pull strength (0-1) */
  pullStrength: number;
}

// ============================================================================
// Constants
// ============================================================================

/** Default whirlpool configuration */
export const WHIRLPOOL_DEFAULTS = {
  radius: 2.5,
  pullRadius: 4.0,
  pullStrength: 3.0, // Units per second at edge, scales up toward center
  damageRate: 1.0, // Health per second in damage zone
  safeChannelWidth: 2.5,
  rotationSpeed: 1.0,
};

// ============================================================================
// Force Calculations
// ============================================================================

/**
 * Calculate the pull force from a whirlpool on the player
 * @param playerX Player's X position
 * @param playerY Player's Y position (distance along river)
 * @param whirlpool The whirlpool data
 * @param riverWidth Current river width
 * @returns Force data including pull direction and damage state
 */
export function calculateWhirlpoolForce(
  playerX: number,
  playerY: number,
  whirlpool: Whirlpool,
  riverWidth: number
): WhirlpoolForce {
  // Calculate distance from player to whirlpool center
  const dx = whirlpool.centerX - playerX;
  const dy = whirlpool.distance - playerY;
  const distanceToCenter = Math.sqrt(dx * dx + dy * dy);

  // Check if in safe channel (outside pull radius, along the sides)
  const halfRiver = riverWidth / 2;
  const leftChannelEdge = whirlpool.centerX - whirlpool.pullRadius - whirlpool.safeChannelWidth;
  const rightChannelEdge = whirlpool.centerX + whirlpool.pullRadius + whirlpool.safeChannelWidth;

  const inLeftChannel =
    playerX < whirlpool.centerX - whirlpool.pullRadius &&
    playerX >= leftChannelEdge &&
    Math.abs(dy) < whirlpool.pullRadius * 1.5;

  const inRightChannel =
    playerX > whirlpool.centerX + whirlpool.pullRadius &&
    playerX <= rightChannelEdge &&
    Math.abs(dy) < whirlpool.pullRadius * 1.5;

  const inSafeChannel =
    (inLeftChannel || inRightChannel) && playerX >= -halfRiver && playerX <= halfRiver;

  // If in safe channel or outside pull radius, no force
  if (inSafeChannel || distanceToCenter > whirlpool.pullRadius) {
    return {
      forceX: 0,
      forceY: 0,
      inDamageZone: false,
      inSafeChannel,
      distanceToCenter,
      pullStrength: 0,
    };
  }

  // Calculate pull strength - stronger toward center
  // Uses inverse relationship: strength = baseStrength * (1 - dist/pullRadius)^2
  const normalizedDist = distanceToCenter / whirlpool.pullRadius;
  const pullStrength = whirlpool.pullStrength * (1 - normalizedDist) ** 2;

  // Calculate force direction (toward center)
  const forceX = distanceToCenter > 0.1 ? (dx / distanceToCenter) * pullStrength : 0;
  const forceY = distanceToCenter > 0.1 ? (dy / distanceToCenter) * pullStrength : 0;

  // Check if in damage zone (inner radius)
  const inDamageZone = distanceToCenter <= whirlpool.radius;

  return {
    forceX,
    forceY,
    inDamageZone,
    inSafeChannel,
    distanceToCenter,
    pullStrength: pullStrength / whirlpool.pullStrength, // Normalized 0-1
  };
}

/**
 * Calculate total whirlpool force from all active whirlpools
 * @param playerX Player's X position
 * @param playerY Player's Y position (distance along river)
 * @param whirlpools Array of active whirlpools
 * @param riverWidth Current river width
 */
export function calculateTotalWhirlpoolForce(
  playerX: number,
  playerY: number,
  whirlpools: Whirlpool[],
  riverWidth: number
): WhirlpoolForce {
  let totalForceX = 0;
  let totalForceY = 0;
  let inDamageZone = false;
  let inSafeChannel = false;
  let minDistance = Infinity;
  let maxPullStrength = 0;

  for (const whirlpool of whirlpools) {
    const force = calculateWhirlpoolForce(playerX, playerY, whirlpool, riverWidth);

    totalForceX += force.forceX;
    totalForceY += force.forceY;

    if (force.inDamageZone) inDamageZone = true;
    if (force.inSafeChannel) inSafeChannel = true;
    if (force.distanceToCenter < minDistance) minDistance = force.distanceToCenter;
    if (force.pullStrength > maxPullStrength) maxPullStrength = force.pullStrength;
  }

  return {
    forceX: totalForceX,
    forceY: totalForceY,
    inDamageZone,
    inSafeChannel,
    distanceToCenter: minDistance,
    pullStrength: maxPullStrength,
  };
}

/**
 * Apply whirlpool damage to player
 * @param force The calculated whirlpool force
 * @param deltaTime Time since last frame in seconds
 * @param damageRate Health loss per second in damage zone
 * @returns Damage amount to apply
 */
export function calculateWhirlpoolDamage(
  force: WhirlpoolForce,
  deltaTime: number,
  damageRate: number = WHIRLPOOL_DEFAULTS.damageRate
): number {
  if (!force.inDamageZone) return 0;

  // Damage scales with how deep into the danger zone the player is
  // At the edge of damage zone: half damage rate
  // At center: full damage rate
  const depthFactor = 0.5 + 0.5 * (1 - force.distanceToCenter / 2.5); // 2.5 is typical radius
  return damageRate * depthFactor * deltaTime;
}

// ============================================================================
// Whirlpool Generation
// ============================================================================

/**
 * Create a whirlpool at a specific position
 * @param centerX X position
 * @param distance Distance along river
 * @param riverWidth River width for safe channel calculation
 */
export function createWhirlpool(centerX: number, distance: number, riverWidth: number): Whirlpool {
  // Calculate safe channel width based on river width
  // Ensure there's always room to pass on at least one side
  const maxSafeChannelWidth = (riverWidth - WHIRLPOOL_DEFAULTS.pullRadius * 2) / 2 - 0.5;
  const safeChannelWidth = Math.max(
    1.5,
    Math.min(WHIRLPOOL_DEFAULTS.safeChannelWidth, maxSafeChannelWidth)
  );

  return {
    id: `whirlpool-${distance}`,
    centerX,
    distance,
    radius: WHIRLPOOL_DEFAULTS.radius,
    pullRadius: WHIRLPOOL_DEFAULTS.pullRadius,
    pullStrength: WHIRLPOOL_DEFAULTS.pullStrength,
    damageRate: WHIRLPOOL_DEFAULTS.damageRate,
    safeChannelWidth,
    rotationSpeed: WHIRLPOOL_DEFAULTS.rotationSpeed,
  };
}

/**
 * Check if a whirlpool can be spawned at the given position
 * Requires minimum river width and no other nearby whirlpools
 */
export function canSpawnWhirlpool(
  distance: number,
  riverWidth: number,
  existingWhirlpools: Whirlpool[],
  minDistanceBetween: number = 100
): boolean {
  // Require minimum width for whirlpool
  if (riverWidth < 10) return false;

  // Check distance from other whirlpools
  for (const wp of existingWhirlpools) {
    if (Math.abs(wp.distance - distance) < minDistanceBetween) {
      return false;
    }
  }

  return true;
}
