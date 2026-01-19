/**
 * Input System
 * Handles player input for keyboard and touch controls
 */

import type { Lane } from '@otter-river-rush/types';
import { queries } from '../world';
import { getLaneX } from '@otter-river-rush/config';

export interface InputState {
  targetLane: Lane;
  isJumping: boolean;
}

export function createInputState(): InputState {
  return {
    targetLane: 0,
    isJumping: false,
  };
}

/**
 * Setup keyboard input handlers
 */
export function setupKeyboardInput(state: InputState): () => void {
  const handleKeyDown = (e: KeyboardEvent) => {
    const [player] = queries.player.entities;
    if (!player || !player.position) return;

    switch (e.key) {
      case 'ArrowLeft':
      case 'a':
      case 'A':
        e.preventDefault();
        if (state.targetLane > -1) {
          state.targetLane = (state.targetLane - 1) as Lane;
        }
        break;

      case 'ArrowRight':
      case 'd':
      case 'D':
        e.preventDefault();
        if (state.targetLane < 1) {
          state.targetLane = (state.targetLane + 1) as Lane;
        }
        break;

      case 'ArrowUp':
      case 'w':
      case 'W':
      case ' ':
        e.preventDefault();
        if (!state.isJumping && player.velocity) {
          state.isJumping = true;
          player.velocity.y = 0.3; // Jump velocity
          setTimeout(() => {
            state.isJumping = false;
          }, 500);
        }
        break;
    }
  };

  window.addEventListener('keydown', handleKeyDown);

  return () => {
    window.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Update player position to target lane
 */
export function updatePlayerInput(state: InputState, deltaTime: number): void {
  const [player] = queries.player.entities;
  if (!player || !player.position) return;

  // Smoothly move to target lane
  const targetX = getLaneX(state.targetLane);
  const diff = targetX - player.position.x;
  const speed = 10; // Lane switch speed

  if (Math.abs(diff) > 0.01) {
    player.position.x += diff * speed * deltaTime;
  } else {
    player.position.x = targetX;
  }
}
