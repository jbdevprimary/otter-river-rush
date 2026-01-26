/**
 * Movement System
 * Updates entity positions based on velocity
 * Supports dynamic speed scaling based on difficulty progression
 */

import { calculateSpeedMultiplier, useGameStore } from '../../store';
import { queries } from '../world';

/**
 * Update all moving entities
 * @param deltaTime Time elapsed since last frame (in seconds)
 * @param speedMultiplier Optional speed multiplier (defaults to difficulty-based calculation)
 */
export function updateMovement(deltaTime: number, speedMultiplier?: number): void {
  // Get speed multiplier from difficulty progression if not provided
  const multiplier = speedMultiplier ?? calculateSpeedMultiplier(useGameStore.getState().distance);

  for (const entity of queries.moving) {
    // Apply speed multiplier only to non-player entities (obstacles, collectibles)
    // Player movement speed remains constant for consistent control feel
    const entityMultiplier = entity.player ? 1 : multiplier;

    entity.position.x += entity.velocity!.x * deltaTime * entityMultiplier;
    entity.position.y += entity.velocity!.y * deltaTime * entityMultiplier;
    entity.position.z += entity.velocity!.z * deltaTime * entityMultiplier;
  }
}
