/**
 * Game Systems
 * Core game logic systems for Otter River Rush
 */

export { updateMovement } from './movement';
export { updateCleanup } from './cleanup';
export { updateSpawner, createSpawnerState } from './spawner';
export type { SpawnerState, LanePositionProvider } from './spawner';
export { updateParticles } from './particles';
export {
  updateAnimation,
  triggerAnimation,
  triggerHitAnimation,
  triggerCollectAnimation,
  triggerDeathAnimation,
  setAnimation,
  resetAnimationState,
} from './animation';
export { updateCollision } from './collision';
export type { CollisionHandlers } from './collision';
export { setupKeyboardInput, setupTouchInput, updatePlayerInput, updatePlayerInputDynamic, createInputState } from './input';
export type { InputState } from './input';
