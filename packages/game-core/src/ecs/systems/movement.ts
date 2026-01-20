/**
 * Movement System
 * Updates entity positions based on velocity
 */

import { queries } from '../world';

/**
 * Update all moving entities
 * @param deltaTime Time elapsed since last frame (in seconds)
 */
export function updateMovement(deltaTime: number): void {
  for (const entity of queries.moving) {
    entity.position.x += entity.velocity!.x * deltaTime;
    entity.position.y += entity.velocity!.y * deltaTime;
    entity.position.z += entity.velocity!.z * deltaTime;
  }
}
