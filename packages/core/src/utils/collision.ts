/**
 * Collision Detection Utilities
 * AABB (Axis-Aligned Bounding Box) collision detection
 */

import type { With } from 'miniplex';
import type { Entity } from '@otter-river-rush/types';

/**
 * Check AABB collision between two entities
 */
export function checkCollision(
  a: With<Entity, 'position' | 'collider'>,
  b: With<Entity, 'position' | 'collider'>
): boolean {
  const aBox = {
    minX: a.position.x - a.collider.width / 2,
    maxX: a.position.x + a.collider.width / 2,
    minY: a.position.y - a.collider.height / 2,
    maxY: a.position.y + a.collider.height / 2,
  };

  const bBox = {
    minX: b.position.x - b.collider.width / 2,
    maxX: b.position.x + b.collider.width / 2,
    minY: b.position.y - b.collider.height / 2,
    maxY: b.position.y + b.collider.height / 2,
  };

  return (
    aBox.minX < bBox.maxX &&
    aBox.maxX > bBox.minX &&
    aBox.minY < bBox.maxY &&
    aBox.maxY > bBox.minY
  );
}

/**
 * Calculate distance between two entities
 */
export function distance(
  a: With<Entity, 'position'>,
  b: With<Entity, 'position'>
): number {
  const dx = a.position.x - b.position.x;
  const dy = a.position.y - b.position.y;
  const dz = a.position.z - b.position.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Check if entity is within radius of a point
 */
export function isWithinRadius(
  entity: With<Entity, 'position'>,
  x: number,
  y: number,
  radius: number
): boolean {
  const dx = entity.position.x - x;
  const dy = entity.position.y - y;
  return Math.sqrt(dx * dx + dy * dy) <= radius;
}

/**
 * River boundary collision result
 */
export interface BoundaryCollisionResult {
  /** Whether the entity hit a boundary */
  hitBoundary: boolean;
  /** Which boundary was hit */
  side: 'left' | 'right' | 'none';
  /** The clamped X position within boundaries */
  clampedX: number;
  /** How far the entity was pushed back */
  pushback: number;
}

/**
 * Check if an entity position is within river boundaries
 * Returns the clamped position if outside boundaries
 */
export function checkRiverBoundaries(
  entityX: number,
  entityWidth: number,
  boundaries: { left: number; right: number }
): BoundaryCollisionResult {
  const halfWidth = entityWidth / 2;
  const entityLeft = entityX - halfWidth;
  const entityRight = entityX + halfWidth;

  if (entityLeft < boundaries.left) {
    const clampedX = boundaries.left + halfWidth;
    return {
      hitBoundary: true,
      side: 'left',
      clampedX,
      pushback: clampedX - entityX,
    };
  }

  if (entityRight > boundaries.right) {
    const clampedX = boundaries.right - halfWidth;
    return {
      hitBoundary: true,
      side: 'right',
      clampedX,
      pushback: clampedX - entityX,
    };
  }

  return {
    hitBoundary: false,
    side: 'none',
    clampedX: entityX,
    pushback: 0,
  };
}

/**
 * Clamp a position to stay within river boundaries
 * Simpler version that just returns the clamped X value
 */
export function clampToRiverBoundaries(
  x: number,
  entityWidth: number,
  boundaries: { left: number; right: number }
): number {
  const halfWidth = entityWidth / 2;
  const minX = boundaries.left + halfWidth;
  const maxX = boundaries.right - halfWidth;
  return Math.max(minX, Math.min(maxX, x));
}
