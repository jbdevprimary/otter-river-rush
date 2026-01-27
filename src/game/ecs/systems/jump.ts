/**
 * Jump System
 * Handles jump physics including arc trajectory, gravity, and landing detection
 *
 * Jump Mechanics:
 * 1. Initial upward velocity applied on jump trigger
 * 2. Gravity constantly pulls player back down
 * 3. Smooth parabolic arc trajectory
 * 4. Landing detected when Z position returns to ground level
 * 5. Splash particles spawned on landing
 */

import { JUMP_PHYSICS } from '../../config';
import { VISUAL } from '../../config/visual-constants';
import type { GameStatus } from '../../types';
import { queries, spawn } from '../world';

/**
 * Initialize jump component for a player entity
 * Call this when spawning the player
 */
export function initializeJumpComponent(groundZ: number = VISUAL.layers.player): void {
  const [player] = queries.player.entities;
  if (!player) return;

  player.jump = {
    isJumping: false,
    verticalVelocity: 0,
    jumpStartTime: 0,
    groundZ,
    isLanding: false,
  };
}

/**
 * Check if a jump can be triggered (not currently jumping and cooldown elapsed)
 */
export function canJump(): boolean {
  const [player] = queries.player.entities;
  if (!player?.jump) return false;

  const now = Date.now();
  const cooldownElapsed = now - player.jump.jumpStartTime >= JUMP_PHYSICS.cooldownMs;

  return !player.jump.isJumping && cooldownElapsed;
}

/**
 * Trigger a jump for the player
 * @returns true if jump was triggered, false if player cannot jump
 */
export function triggerJump(): boolean {
  const [player] = queries.player.entities;
  if (!player?.jump || !player.position) return false;

  if (!canJump()) return false;

  // Initialize jump state
  player.jump.isJumping = true;
  player.jump.verticalVelocity = JUMP_PHYSICS.initialVelocity;
  player.jump.jumpStartTime = Date.now();
  player.jump.isLanding = false;

  // Store current Z as ground level if not set
  if (player.jump.groundZ === 0) {
    player.jump.groundZ = player.position.z;
  }

  return true;
}

/**
 * Update jump physics
 * @param status Current game status
 * @param deltaTime Time elapsed since last frame (in seconds)
 */
export function updateJump(status: GameStatus, deltaTime: number): void {
  if (status !== 'playing') return;

  const [player] = queries.player.entities;
  if (!player?.jump || !player.position) return;

  // Skip if not jumping
  if (!player.jump.isJumping) return;

  // Apply gravity to vertical velocity
  player.jump.verticalVelocity -= JUMP_PHYSICS.gravity * deltaTime;

  // Update Z position based on vertical velocity
  player.position.z += player.jump.verticalVelocity * deltaTime;

  // Check for landing (position at or below ground level)
  if (player.position.z <= player.jump.groundZ) {
    // Clamp to ground level
    player.position.z = player.jump.groundZ;

    // Handle landing
    handleLanding(player);
  }
}

/**
 * Handle landing when player returns to ground
 */
function handleLanding(player: NonNullable<(typeof queries.player.entities)[number]>): void {
  if (!player.jump || !player.position) return;

  // Check if this is the first frame of landing (to avoid multiple splash effects)
  if (!player.jump.isLanding) {
    player.jump.isLanding = true;

    // Spawn splash particles
    spawnSplashParticles(player.position.x, player.position.y);
  }

  // Reset jump state
  player.jump.isJumping = false;
  player.jump.verticalVelocity = 0;
  player.jump.isLanding = false;
}

/**
 * Spawn splash particles at the landing position
 */
function spawnSplashParticles(x: number, y: number): void {
  const particleCount = JUMP_PHYSICS.splashParticleCount;
  const color = JUMP_PHYSICS.splashColor;

  for (let i = 0; i < particleCount; i++) {
    // Spawn particles in a ring pattern around landing position
    const angle = (i / particleCount) * Math.PI * 2;
    const radius = 0.3 + Math.random() * 0.2;
    const offsetX = Math.cos(angle) * radius;
    const offsetY = Math.sin(angle) * radius;

    spawn.particle(x + offsetX, y + offsetY, color);
  }
}

/**
 * Check if player is currently airborne (in a jump)
 */
export function isPlayerJumping(): boolean {
  const [player] = queries.player.entities;
  return player?.jump?.isJumping ?? false;
}

/**
 * Get current jump height (distance above ground)
 */
export function getJumpHeight(): number {
  const [player] = queries.player.entities;
  if (!player?.jump || !player.position) return 0;

  return Math.max(0, player.position.z - player.jump.groundZ);
}

/**
 * Reset jump state (call when game restarts)
 */
export function resetJumpState(): void {
  const [player] = queries.player.entities;
  if (!player?.jump) return;

  player.jump.isJumping = false;
  player.jump.verticalVelocity = 0;
  player.jump.jumpStartTime = 0;
  player.jump.isLanding = false;
}
