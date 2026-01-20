/**
 * Collision Detection Utilities
 * AABB (Axis-Aligned Bounding Box) collision detection
 */

import type { With } from 'miniplex';
import type { Entity } from '../../types';

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
