/**
 * Cleanup System
 * Removes entities that are off-screen or destroyed
 */

import { VISUAL } from '../../config';
import { queries, world } from '../world';

/**
 * Clean up destroyed, collected, and off-screen entities
 */
export function updateCleanup(): void {
  // Remove destroyed entities
  for (const entity of queries.destroyed) {
    world.remove(entity);
  }

  // Remove collected entities
  for (const entity of queries.collected) {
    world.remove(entity);
  }

  // Remove entities that scrolled off bottom
  for (const entity of queries.moving) {
    if (entity.position.y < VISUAL.positions.despawnY) {
      world.remove(entity);
    }
  }
}
