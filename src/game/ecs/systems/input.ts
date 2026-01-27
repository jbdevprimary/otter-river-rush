/**
 * Input System
 * Handles player input for keyboard and touch controls
 *
 * Supports:
 * - Keyboard: WASD/Arrow keys for movement, Space/W/Up for jump
 * - Touch: Swipe left/right for lanes, swipe up for jump
 */

import { getLaneX, JUMP_PHYSICS } from '../../config';
import type { Entity, Lane } from '../../types';
import { queries } from '../world';
import { triggerJumpAnimation } from './animation';
import { initializeJumpComponent, triggerJump } from './jump';
import { initializeOtterPhysics, setTargetLane } from './otter-physics';

export interface InputState {
  targetLane: Lane;
  /** @deprecated Use jump system instead - kept for backward compatibility */
  isJumping: boolean;
}

export function createInputState(): InputState {
  return {
    targetLane: 0,
    isJumping: false,
  };
}

/**
 * Attempt to trigger a jump via the jump system
 * Handles initialization and animation triggering
 */
function attemptJump(): boolean {
  const [player] = queries.player.entities;
  if (!player) return false;

  // Initialize jump component if not present
  if (!player.jump) {
    initializeJumpComponent();
  }

  // Try to trigger jump
  if (triggerJump()) {
    // Trigger jump animation
    triggerJumpAnimation();
    return true;
  }

  return false;
}

/**
 * Setup keyboard input handlers
 */
export function setupKeyboardInput(state: InputState): () => void {
  const handleKeyDown = (e: KeyboardEvent) => {
    const [player] = queries.player.entities;
    if (!player || !player.position) return;

    // Initialize otter physics if not present
    if (!player.otterPhysics) {
      initializeOtterPhysics(player);
    }

    switch (e.key) {
      case 'ArrowLeft':
      case 'a':
      case 'A':
        e.preventDefault();
        if (state.targetLane > -1) {
          state.targetLane = (state.targetLane - 1) as Lane;
          // Use momentum-based lane change
          setTargetLane(player, state.targetLane);
        }
        break;

      case 'ArrowRight':
      case 'd':
      case 'D':
        e.preventDefault();
        if (state.targetLane < 1) {
          state.targetLane = (state.targetLane + 1) as Lane;
          // Use momentum-based lane change
          setTargetLane(player, state.targetLane);
        }
        break;

      case 'ArrowUp':
      case 'w':
      case 'W':
      case ' ':
        e.preventDefault();
        // Use the new jump system
        attemptJump();
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
export function setupTouchInput(state: InputState, element: HTMLElement): () => void {
  const MIN_HORIZONTAL_SWIPE = 50; // Minimum horizontal swipe distance in pixels
  const MIN_VERTICAL_SWIPE = JUMP_PHYSICS.swipeThreshold; // Minimum vertical swipe for jump

  let pointerStartX: number | null = null;
  let pointerStartY: number | null = null;
  let isTracking = false;
  let swipeHandled = false; // Prevent multiple triggers per gesture

  const handlePointerDown = (e: PointerEvent) => {
    pointerStartX = e.clientX;
    pointerStartY = e.clientY;
    isTracking = true;
    swipeHandled = false;
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!isTracking || pointerStartX === null || pointerStartY === null || swipeHandled) return;

    const deltaX = e.clientX - pointerStartX;
    const deltaY = e.clientY - pointerStartY;
    const player = queries.player.entities[0];
    if (!player || !player.position) return;

    ensureOtterPhysics(player);

    if (tryHandleVerticalSwipe(deltaX, deltaY)) {
      swipeHandled = true;
      return;
    }

    if (tryHandleHorizontalSwipe(deltaX, deltaY, player)) {
      pointerStartX = e.clientX;
      pointerStartY = e.clientY;
    }
  };

  const ensureOtterPhysics = (player: Entity) => {
    if (!player.otterPhysics) {
      initializeOtterPhysics(player);
    }
  };

  const tryHandleVerticalSwipe = (deltaX: number, deltaY: number): boolean => {
    const isVertical = deltaY < -MIN_VERTICAL_SWIPE && Math.abs(deltaY) > Math.abs(deltaX);
    if (!isVertical) return false;
    attemptJump();
    return true;
  };

  const tryHandleHorizontalSwipe = (deltaX: number, deltaY: number, player: Entity): boolean => {
    const isHorizontal =
      Math.abs(deltaX) >= MIN_HORIZONTAL_SWIPE && Math.abs(deltaX) > Math.abs(deltaY);
    if (!isHorizontal) return false;

    if (deltaX < 0 && state.targetLane > -1) {
      state.targetLane = (state.targetLane - 1) as Lane;
      setTargetLane(player, state.targetLane);
      return true;
    }

    if (deltaX > 0 && state.targetLane < 1) {
      state.targetLane = (state.targetLane + 1) as Lane;
      setTargetLane(player, state.targetLane);
      return true;
    }

    return false;
  };

  const handlePointerUp = () => {
    pointerStartX = null;
    pointerStartY = null;
    isTracking = false;
    swipeHandled = false;
  };

  const handlePointerCancel = () => {
    pointerStartX = null;
    pointerStartY = null;
    isTracking = false;
    swipeHandled = false;
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
 * Note: With the otter physics system, the actual position interpolation
 * is handled by updateOtterPhysics(). This function now only handles
 * fallback for entities without otter physics initialized.
 */
export function updatePlayerInput(state: InputState, deltaTime: number): void {
  const [player] = queries.player.entities;
  if (!player || !player.position) return;

  // If otter physics is initialized, it handles movement
  // This is a fallback for compatibility
  if (player.otterPhysics) {
    // Otter physics system handles this
    return;
  }

  // Fallback: Smoothly move to target lane (for entities without otter physics)
  const targetX = getLaneX(state.targetLane);
  const diff = targetX - player.position.x;
  const speed = 10; // Lane switch speed

  if (Math.abs(diff) > 0.01) {
    player.position.x += diff * speed * deltaTime;
  } else {
    player.position.x = targetX;
  }
}
