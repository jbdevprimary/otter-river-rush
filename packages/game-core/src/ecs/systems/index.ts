/**
 * Game Systems
 * Core game logic systems for Otter River Rush
 */

export { updateMovement, getPlayerPathPosition } from './movement';
export type { PlayerPathData } from './movement';
export { updateCleanup } from './cleanup';
export { updateSpawner, createSpawnerState } from './spawner';
export type { SpawnerState } from './spawner';
export { updateParticles } from './particles';
export {
  updateAnimation,
  triggerAnimation,
  triggerHitAnimation,
  triggerCollectAnimation,
  triggerDeathAnimation,
  triggerJumpAnimation,
  setAnimation,
  resetAnimationState,
} from './animation';
export { updateCollision, resetNearMissTracking } from './collision';
export type { CollisionHandlers, NearMissEvent } from './collision';
export { setupKeyboardInput, setupTouchInput, updatePlayerInput, createInputState } from './input';
export type { InputState } from './input';
export {
  updateJump,
  triggerJump,
  canJump,
  isPlayerJumping,
  getJumpHeight,
  initializeJumpComponent,
  resetJumpState,
} from './jump';
