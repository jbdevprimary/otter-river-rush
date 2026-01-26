/**
 * Input System
 * Handles player input for keyboard and touch controls
 */

import type { Lane } from '../../types';
import { queries } from '../world';
import { getLaneX } from '../../config';

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
 * Setup touch/swipe input handlers
 * Uses pointer events for compatibility with both touch and mouse
 */
export function setupTouchInput(
  state: InputState,
  element: HTMLElement
): () => void {
  const MIN_SWIPE_DISTANCE = 50; // Minimum swipe distance in pixels

  let pointerStartX: number | null = null;
  let pointerStartY: number | null = null;
  let isTracking = false;

  const handlePointerDown = (e: PointerEvent) => {
    pointerStartX = e.clientX;
    pointerStartY = e.clientY;
    isTracking = true;
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!isTracking || pointerStartX === null) return;

    const deltaX = e.clientX - pointerStartX;
    const deltaY = e.clientY - pointerStartY!;

    // Check if horizontal swipe exceeds threshold
    // Also ensure horizontal movement is greater than vertical (intentional swipe)
    if (Math.abs(deltaX) >= MIN_SWIPE_DISTANCE && Math.abs(deltaX) > Math.abs(deltaY)) {
      const [player] = queries.player.entities;
      if (!player || !player.position) return;

      if (deltaX < 0 && state.targetLane > -1) {
        // Swipe left
        state.targetLane = (state.targetLane - 1) as Lane;
      } else if (deltaX > 0 && state.targetLane < 1) {
        // Swipe right
        state.targetLane = (state.targetLane + 1) as Lane;
      }

      // Reset tracking to require a new swipe for next lane change
      pointerStartX = e.clientX;
      pointerStartY = e.clientY;
    }
  };

  const handlePointerUp = () => {
    pointerStartX = null;
    pointerStartY = null;
    isTracking = false;
  };

  const handlePointerCancel = () => {
    pointerStartX = null;
    pointerStartY = null;
    isTracking = false;
  };

  // Add pointer event listeners
  element.addEventListener('pointerdown', handlePointerDown);
  element.addEventListener('pointermove', handlePointerMove);
  element.addEventListener('pointerup', handlePointerUp);
  element.addEventListener('pointercancel', handlePointerCancel);

  // Prevent default touch behaviors (scrolling, zooming) on the game canvas
  const preventDefaultTouch = (e: TouchEvent) => {
    e.preventDefault();
  };
  element.addEventListener('touchstart', preventDefaultTouch, { passive: false });
  element.addEventListener('touchmove', preventDefaultTouch, { passive: false });

  return () => {
    element.removeEventListener('pointerdown', handlePointerDown);
    element.removeEventListener('pointermove', handlePointerMove);
    element.removeEventListener('pointerup', handlePointerUp);
    element.removeEventListener('pointercancel', handlePointerCancel);
    element.removeEventListener('touchstart', preventDefaultTouch);
    element.removeEventListener('touchmove', preventDefaultTouch);
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
