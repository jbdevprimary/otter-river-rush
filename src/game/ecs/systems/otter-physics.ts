/**
 * Otter Physics System
 * Handles realistic otter movement including:
 * - Momentum-based lane changes (not instant snapping)
 * - Smooth rotation based on movement direction
 * - Water bobbing animation
 * - Idle animations when not moving
 * - Tilt/roll during lane changes
 * - Pitch during speed changes
 */

import { getLaneX, OTTER_PHYSICS } from '../../config';
import type { Entity, Lane, OtterPhysicsComponent, RotationComponent } from '../../types';
import { queries } from '../world';

/**
 * Linear interpolation helper
 */
function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Clamp a value between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Initialize otter physics component for a player entity
 */
export function initializeOtterPhysics(entity: Entity): void {
  if (!entity.position) return;

  entity.otterPhysics = {
    targetX: entity.position.x,
    velocityX: 0,
    bobTime: 0,
    idleTime: 0,
    isTransitioning: false,
    previousX: entity.position.x,
    bobVelocity: 0,
  };

  entity.rotation = {
    current: { x: 0, y: 0, z: 0 },
    target: { x: 0, y: 0, z: 0 },
    velocity: { x: 0, y: 0, z: 0 },
  };
}

/**
 * Set target lane for momentum-based movement
 * Call this instead of directly setting position
 */
export function setTargetLane(entity: Entity, lane: Lane): void {
  if (!entity.otterPhysics) return;

  const targetX = getLaneX(lane);
  entity.otterPhysics.targetX = targetX;
  entity.otterPhysics.isTransitioning = true;
  entity.lane = lane;
}

/**
 * Update horizontal movement with momentum/inertia
 */
function updateLaneMovement(
  entity: Entity,
  physics: OtterPhysicsComponent,
  deltaTime: number
): void {
  if (!entity.position) return;

  const { laneChange } = OTTER_PHYSICS;
  const diff = physics.targetX - entity.position.x;
  const absDiff = Math.abs(diff);

  // Store previous position for velocity calculation
  physics.previousX = entity.position.x;

  if (absDiff > laneChange.snapThreshold) {
    // Apply acceleration toward target
    const direction = Math.sign(diff);
    physics.velocityX += direction * laneChange.acceleration * deltaTime;

    // Clamp velocity
    physics.velocityX = clamp(physics.velocityX, -laneChange.maxVelocity, laneChange.maxVelocity);

    // Apply velocity
    entity.position.x += physics.velocityX * deltaTime;

    // Check for overshoot
    const newDiff = physics.targetX - entity.position.x;
    if (Math.sign(newDiff) !== Math.sign(diff)) {
      // Overshot target, snap to it
      entity.position.x = physics.targetX;
      physics.velocityX *= -0.3; // Bounce back slightly
    }
  } else {
    // Close enough, snap to target
    entity.position.x = physics.targetX;

    // Apply damping to velocity
    physics.velocityX *= laneChange.damping;

    // Check if fully stopped
    if (Math.abs(physics.velocityX) < laneChange.velocitySnapThreshold) {
      physics.velocityX = 0;
      physics.isTransitioning = false;
    }
  }
}

/**
 * Calculate target rotations based on movement state
 */
function calculateTargetRotations(
  physics: OtterPhysicsComponent,
  rotation: RotationComponent,
  deltaTime: number,
  isMoving: boolean
): void {
  const { rotation: rotConfig, idle } = OTTER_PHYSICS;

  // Calculate horizontal velocity (how fast moving left/right)
  const horizontalVelocity = physics.velocityX;
  const normalizedVelocity = clamp(
    horizontalVelocity / OTTER_PHYSICS.laneChange.maxVelocity,
    -1,
    1
  );

  if (isMoving || Math.abs(normalizedVelocity) > 0.1) {
    // Active movement rotations

    // Roll (Z-axis): Lean into the turn direction
    rotation.target.z = -normalizedVelocity * rotConfig.maxTilt;

    // Yaw (Y-axis): Turn toward movement direction
    rotation.target.y = -normalizedVelocity * rotConfig.maxYaw;

    // Pitch (X-axis): Slight forward lean when moving fast
    const speed = Math.abs(normalizedVelocity);
    rotation.target.x = -speed * rotConfig.maxPitch * 0.5;
  } else {
    // Idle animations - subtle movements to feel alive
    physics.idleTime += deltaTime;

    // Gentle side-to-side sway
    rotation.target.z =
      Math.sin(physics.idleTime * idle.swayFrequency * Math.PI * 2) * idle.swayAmplitude;

    // Occasional head bob (pitch)
    rotation.target.x =
      Math.sin(physics.idleTime * idle.headBobFrequency * Math.PI * 2) * idle.headBobAmplitude;

    // Very subtle yaw variation
    rotation.target.y =
      Math.sin(physics.idleTime * idle.swayFrequency * 0.7 * Math.PI * 2) *
      (idle.swayAmplitude * 0.3);
  }
}

/**
 * Smoothly interpolate current rotation toward target
 */
function updateRotationInterpolation(rotation: RotationComponent, deltaTime: number): void {
  const { rotation: rotConfig } = OTTER_PHYSICS;
  const t = 1 - (1 - deltaTime * rotConfig.lerpSpeed) ** (deltaTime * 60);

  // Lerp each axis independently with different damping
  rotation.current.x = lerp(rotation.current.x, rotation.target.x, t);
  rotation.current.y = lerp(rotation.current.y, rotation.target.y, t);
  rotation.current.z = lerp(rotation.current.z, rotation.target.z, t);
}

/**
 * Update water bobbing animation
 * Simulates floating on water surface
 */
function updateBobbing(entity: Entity, physics: OtterPhysicsComponent, deltaTime: number): void {
  if (!entity.position) return;

  const { bobbing, idle } = OTTER_PHYSICS;

  // Accumulate time for oscillation
  physics.bobTime += deltaTime;

  // Primary bobbing wave
  const primaryBob =
    Math.sin(physics.bobTime * bobbing.frequency * Math.PI * 2) * bobbing.amplitude;

  // Secondary smaller wave for more organic feel
  const secondaryBob =
    Math.sin(physics.bobTime * bobbing.frequency * 1.7 * Math.PI * 2 + 0.5) *
    (bobbing.amplitude * 0.3);

  // Idle breathing movement (very subtle)
  const breathingBob =
    Math.sin(physics.bobTime * idle.breathFrequency * Math.PI * 2) * idle.breathAmplitude;

  // Combine all vertical movements
  const totalBob = primaryBob + secondaryBob + breathingBob;

  // Apply to Z position (vertical in our coordinate system)
  // Assuming base Z is stored when entity is created
  const baseZ = entity.position.z;
  entity.position.z = baseZ + totalBob;

  // Store bob velocity for other effects
  physics.bobVelocity =
    Math.cos(physics.bobTime * bobbing.frequency * Math.PI * 2) *
    bobbing.amplitude *
    bobbing.frequency *
    Math.PI *
    2;
}

/**
 * Main otter physics update function
 * Call this in the game loop for each player entity
 */
export function updateOtterPhysics(deltaTime: number): void {
  for (const entity of queries.player.entities) {
    if (!entity.otterPhysics || !entity.rotation || !entity.position) {
      // Initialize if not present
      if (entity.player && !entity.otterPhysics) {
        initializeOtterPhysics(entity);
      }
      continue;
    }

    const physics = entity.otterPhysics;
    const rotation = entity.rotation;

    // Determine if actively moving
    const isMoving = physics.isTransitioning || Math.abs(physics.velocityX) > 0.5;

    // Update horizontal movement with momentum
    updateLaneMovement(entity, physics, deltaTime);

    // Calculate target rotations based on movement
    calculateTargetRotations(physics, rotation, deltaTime, isMoving);

    // Smoothly interpolate rotations
    updateRotationInterpolation(rotation, deltaTime);

    // Update water bobbing
    updateBobbing(entity, physics, deltaTime);
  }
}

/**
 * Get the current rotation values for rendering
 * Returns Euler angles in radians
 */
export function getOtterRotation(entity: Entity): {
  x: number;
  y: number;
  z: number;
} {
  if (!entity.rotation) {
    return { x: 0, y: 0, z: 0 };
  }
  return { ...entity.rotation.current };
}

/**
 * Apply an external force to the otter (e.g., from collision or water current)
 */
export function applyForceToOtter(entity: Entity, forceX: number, _forceZ: number): void {
  if (!entity.otterPhysics) return;

  entity.otterPhysics.velocityX += forceX;
  // Could add vertical force for jumping/bouncing
}

/**
 * Reset otter physics state (e.g., on game restart)
 */
export function resetOtterPhysics(entity: Entity, lane: Lane = 0): void {
  if (!entity.position) return;

  const targetX = getLaneX(lane);
  entity.position.x = targetX;

  entity.otterPhysics = {
    targetX,
    velocityX: 0,
    bobTime: 0,
    idleTime: 0,
    isTransitioning: false,
    previousX: targetX,
    bobVelocity: 0,
  };

  entity.rotation = {
    current: { x: 0, y: 0, z: 0 },
    target: { x: 0, y: 0, z: 0 },
    velocity: { x: 0, y: 0, z: 0 },
  };

  entity.lane = lane;
}
