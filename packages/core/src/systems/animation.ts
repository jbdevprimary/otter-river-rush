/**
 * Animation System
 * Controls player animations based on state
 */

import type { GameStatus } from '@otter-river-rush/types';
import { queries } from '../world';

/**
 * Update player animation based on game status
 * @param status Current game status
 */
export function updateAnimation(status: GameStatus): void {
  const [player] = queries.player.entities;
  if (!player || !player.animation) return;

  // Update animation based on game state
  if (status === 'playing') {
    // Check if moving between lanes
    const isMoving = Math.abs(player.velocity!.x) > 0.1;
    player.animation.current = isMoving ? 'run' : 'walk';
  } else if (status === 'game_over') {
    player.animation.current = 'death';
  } else {
    player.animation.current = 'idle';
  }
}
