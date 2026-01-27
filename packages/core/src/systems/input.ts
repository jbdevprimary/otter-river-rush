/**
 * Input System
 * Handles player input for keyboard and touch controls
 * Supports dynamic river width for lane positioning
 */

import type { Lane } from '@otter-river-rush/types';
import { queries } from '../world';
import { getLaneX } from '@otter-river-rush/config';
import { clampToRiverBoundaries } from '../utils/collision';

export interface InputState {
  targetLane: Lane;
  isJumping: boolean;
}

/**
 * Lane position provider type for dynamic width support
 */
export type LanePositionProvider = (lane: Lane) => number;

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
 * Uses static lane positions (for backward compatibility)
 */
export function updatePlayerInput(state: InputState, deltaTime: number): void {
  updatePlayerInputDynamic(state, deltaTime, getLaneX);
}

/**
 * Update player position to target lane with dynamic width support
 * @param state Input state
 * @param deltaTime Time elapsed since last frame
 * @param getLanePosition Function to get lane X position (supports dynamic width)
 * @param boundaries Optional river boundaries for collision clamping
 */
export function updatePlayerInputDynamic(
  state: InputState,
  deltaTime: number,
  getLanePosition: LanePositionProvider = getLaneX,
  boundaries?: { left: number; right: number }
): void {
  const [player] = queries.player.entities;
  if (!player || !player.position) return;

  // Smoothly move to target lane
  const targetX = getLanePosition(state.targetLane);
  const diff = targetX - player.position.x;
  const speed = 10; // Lane switch speed

  if (Math.abs(diff) > 0.01) {
    let newX = player.position.x + diff * speed * deltaTime;

    // Clamp to river boundaries if provided
    if (boundaries) {
      const playerWidth = player.collider?.width ?? 0.8;
      newX = clampToRiverBoundaries(newX, playerWidth, boundaries);
    }

    player.position.x = newX;
  } else {
    player.position.x = targetX;
  }
}
