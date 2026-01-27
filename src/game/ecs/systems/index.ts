/**
 * Game Systems
 * Core game logic systems for Otter River Rush
 */

export {
  resetAnimationState,
  setAnimation,
  triggerAnimation,
  triggerCollectAnimation,
  triggerDeathAnimation,
  triggerHitAnimation,
  triggerJumpAnimation,
  updateAnimation,
} from './animation';
export { updateCleanup } from './cleanup';
export type { CollisionHandlers, NearMissEvent } from './collision';
export { resetNearMissTracking, updateCollision } from './collision';
export type { InputState } from './input';
export { createInputState, setupKeyboardInput, setupTouchInput, updatePlayerInput } from './input';
export {
  canJump,
  getJumpHeight,
  initializeJumpComponent,
  isPlayerJumping,
  resetJumpState,
  triggerJump,
  updateJump,
} from './jump';
export { updateMovement } from './movement';
export {
  applyForceToOtter,
  getOtterRotation,
  initializeOtterPhysics,
  resetOtterPhysics,
  setTargetLane,
  updateOtterPhysics,
} from './otter-physics';
export { updateParticles } from './particles';
export type { SpawnerState } from './spawner';
export { createSpawnerState, updateSpawner } from './spawner';
