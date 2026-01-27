/**
 * Input System
 * Handles player input for keyboard and touch controls
 *
 * Supports:
 * - Keyboard: WASD/Arrow keys for movement, Space/W/Up for jump
 * - Touch: Swipe left/right for lanes, swipe up for jump
 */

import type { Lane } from '../../types';
import { queries } from '../world';
import { getLaneX, JUMP_PHYSICS } from '../../config';
import { triggerJump, initializeJumpComponent } from './jump';
import { triggerJumpAnimation } from './animation';
import { useGameStore, useRiverPathStore } from '../../store';
import { calculateTotalWhirlpoolForce } from '../../river/whirlpool-physics';

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
export function setupTouchInput(
  state: InputState,
  element: HTMLElement
): () => void {
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
    if (!isTracking || pointerStartX === null || pointerStartY === null) return;
    if (swipeHandled) return; // Already handled this gesture

    const deltaX = e.clientX - pointerStartX;
    const deltaY = e.clientY - pointerStartY;

    const [player] = queries.player.entities;
    if (!player || !player.position) return;

    // Check for vertical swipe (upward = negative deltaY)
    // Prioritize vertical swipe if it's more dominant and large enough
    if (deltaY < -MIN_VERTICAL_SWIPE && Math.abs(deltaY) > Math.abs(deltaX)) {
      // Swipe up - trigger jump
      attemptJump();
      swipeHandled = true;
      return;
    }

    // Check if horizontal swipe exceeds threshold
    // Also ensure horizontal movement is greater than vertical (intentional horizontal swipe)
    if (Math.abs(deltaX) >= MIN_HORIZONTAL_SWIPE && Math.abs(deltaX) > Math.abs(deltaY)) {
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
 * Also applies whirlpool pull forces
 */
export function updatePlayerInput(state: InputState, deltaTime: number): void {
  const [player] = queries.player.entities;
  if (!player || !player.position) return;

  // Get game state for whirlpool calculations
  const gameState = useGameStore.getState();
  const riverPathStore = useRiverPathStore.getState();

  // Get current river width
  const pathResult = riverPathStore.getPointAtDistance(gameState.distance);
  const riverWidth = pathResult?.point.width ?? 8;

  // Calculate whirlpool pull forces
  const whirlpoolForce = calculateTotalWhirlpoolForce(
    player.position.x,
    gameState.distance,
    riverPathStore.whirlpools,
    riverWidth
  );

  // Apply whirlpool pull (resists player movement toward target lane)
  if (whirlpoolForce.pullStrength > 0 && !whirlpoolForce.inSafeChannel) {
    player.position.x += whirlpoolForce.forceX * deltaTime;

    // Check for whirlpool damage
    if (whirlpoolForce.inDamageZone) {
      // Apply damage over time (accumulated, triggers life loss at threshold)
      // For now, just log - damage system integration TBD
      // TODO: Integrate with loseLife when accumulated damage exceeds threshold
    }
  }

  // Smoothly move to target lane
  const targetX = getLaneX(state.targetLane);
  const diff = targetX - player.position.x;
  const speed = 10; // Lane switch speed

  // Reduce lane change speed when being pulled by whirlpool
  const effectiveSpeed = speed * (1 - whirlpoolForce.pullStrength * 0.5);

  if (Math.abs(diff) > 0.01) {
    player.position.x += diff * effectiveSpeed * deltaTime;
  } else {
    player.position.x = targetX;
  }

  // Clamp to river bounds
  const halfWidth = riverWidth / 2;
  player.position.x = Math.max(-halfWidth + 0.5, Math.min(halfWidth - 0.5, player.position.x));

  // Sync player X to game store for fork detection
  gameState.updatePlayerX(player.position.x);
}
