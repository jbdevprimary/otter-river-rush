/**
 * Collision System
 * Detects and handles collisions between entities
 */

import type { With } from 'miniplex';
import { GAME_CONFIG } from '../../config';
import { isPowerUpActive, isTutorialActive, useGameStore } from '../../store/game-store';
import type { Entity, GameMode, GameStatus, PowerUpType } from '../../types';
import { checkCollision, checkNearMiss, NEAR_MISS_BONUS } from '../utils/collision';
import { queries, spawn, world } from '../world';
import { triggerCollectAnimation, triggerDeathAnimation, triggerHitAnimation } from './animation';
import { haptics } from '../../utils';

// Track obstacles that have already triggered a near-miss to avoid duplicates
const nearMissedObstacles = new WeakSet<object>();

/**
 * Reset near-miss tracking (call when game restarts)
 */
export function resetNearMissTracking(): void {
  // WeakSet doesn't have a clear method, but entities get garbage collected
  // so we just need a fresh instance for new games
}

/**
 * Near-miss event data
 */
export interface NearMissEvent {
  position: { x: number; y: number; z: number };
  bonus: number;
}

/**
 * Collision handlers interface
 * Allows external code to handle collision effects (audio, scoring, etc.)
 */
export interface CollisionHandlers {
  onObstacleHit?: (player: With<Entity, 'player'>, obstacle: With<Entity, 'obstacle'>) => void;
  onCollectCoin?: (value: number) => void;
  onCollectGem?: (value: number) => void;
  onCollectPowerUp?: (type: PowerUpType) => void;
  onGameOver?: () => void;
  onNearMiss?: (event: NearMissEvent) => void;
  onAudioTrigger?: (soundId: string) => void;
}

/**
 * Update collision detection
 * @param status Current game status
 * @param handlers Collision event handlers
 * @param gameMode Current game mode (defaults to 'classic')
 */
export function updateCollision(
  status: GameStatus,
  handlers: CollisionHandlers = {},
  gameMode: GameMode = 'classic'
): void {
  if (status !== 'playing') return;

  const [player] = queries.player.entities;
  if (!player || !player.collider) return;

  // Check obstacle collisions and near-misses - skip damage in zen mode and time_trial mode
  // In zen mode, obstacles shouldn't spawn, but we still skip damage as a safety net
  // In time_trial mode, there are no lives - game ends when timer runs out
  if (gameMode !== 'zen' && gameMode !== 'time_trial') {
    for (const obstacle of queries.obstacles) {
      if (checkCollision(player as any, obstacle)) {
        handleObstacleHit(player, obstacle, handlers);
      } else if (
        !nearMissedObstacles.has(obstacle) &&
        checkNearMiss(player as any, obstacle)
      ) {
        // Mark this obstacle as already triggered near-miss
        nearMissedObstacles.add(obstacle);
        handleNearMiss(player, obstacle, handlers);
      }
    }
  }

  // Apply magnet effect if active - attract nearby collectibles
  if (isPowerUpActive('magnet') && player.position) {
    applyMagnetEffect(player);
  }

  // Check collectible collisions
  for (const collectible of queries.collectibles) {
    if (collectible.collider && checkCollision(player as any, collectible as any)) {
      handleCollect(player, collectible, handlers);
    }
  }
}

/**
 * Apply magnet effect - attract nearby collectibles toward player
 */
function applyMagnetEffect(player: With<Entity, 'player'>): void {
  if (!player.position) return;

  const magnetRadius = GAME_CONFIG.MAGNET_RADIUS;
  const magnetSpeed = 0.15; // How fast collectibles move toward player

  for (const collectible of queries.collectibles) {
    if (!collectible.position || !collectible.velocity) continue;

    // Calculate distance to player
    const dx = player.position.x - collectible.position.x;
    const dy = player.position.y - collectible.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // If within magnet radius, attract toward player
    if (distance < magnetRadius && distance > 0.1) {
      // Normalize direction and apply attraction
      const nx = dx / distance;
      const ny = dy / distance;

      // Move collectible toward player (stronger when closer)
      const attractionStrength = magnetSpeed * (1 - distance / magnetRadius);
      collectible.position.x += nx * attractionStrength;
      collectible.position.y += ny * attractionStrength;
    }
  }
}

/**
 * Handle obstacle collision
 */
function handleObstacleHit(
  player: With<Entity, 'player'>,
  obstacle: With<Entity, 'obstacle'>,
  handlers: CollisionHandlers
): void {
  // Skip if player is invincible, has ghost power-up, or in tutorial period
  if (player.invincible || player.ghost || isTutorialActive()) return;

  // Check for ghost power-up (pass through obstacles)
  if (isPowerUpActive('ghost')) {
    // Ghost mode - pass through without damage
    return;
  }

  // Check for shield power-up (blocks one hit)
  if (isPowerUpActive('shield')) {
    // Shield absorbs the hit
    useGameStore.getState().deactivatePowerUp('shield');

    // Remove obstacle
    world.addComponent(obstacle, 'destroyed', true);

    // Spawn blue particles for shield break
    if (obstacle.position) {
      for (let i = 0; i < 10; i++) {
        spawn.particle(obstacle.position.x, obstacle.position.y, '#3b82f6');
      }
    }
    return;
  }

  // Reduce health
  if (player.health) {
    player.health -= 1;

    // Trigger haptic feedback for damage
    haptics.error();

    // Trigger hit sound ("Ooph")
    handlers.onAudioTrigger?.('hit_sfx');

    // Bounce Logic
    if (player.position && player.velocity && obstacle.position) {
      const LANE_WIDTH = 2; // Should import from config, but safe constant here
      const x = player.position.x;
      const atLeftBank = x <= -LANE_WIDTH;
      const atRightBank = x >= LANE_WIDTH;

      let bounceDir = 0;
      if (atLeftBank) {
        bounceDir = 1; // Bounce right
      } else if (atRightBank) {
        bounceDir = -1; // Bounce left
      } else {
        // 50/50 chance if not at bank
        bounceDir = Math.random() > 0.5 ? 1 : -1;
      }

      // Apply bounce velocity
      player.velocity.x += bounceDir * 5; // Strong lateral push
      // Also slight backward push or slow down? 
      // User just asked for left/right bounce.
    }

    // Game over if no health
    if (player.health <= 0) {
      // Trigger death animation (permanent state)
      triggerDeathAnimation();
      handlers.onGameOver?.();
    } else {
      // Trigger hit animation (one-shot, returns to swim)
      triggerHitAnimation();
    }
  }

  // Notify handler
  handlers.onObstacleHit?.(player, obstacle);

  // Remove obstacle
  world.addComponent(obstacle, 'destroyed', true);

  // Spawn particles
  if (obstacle.position) {
    for (let i = 0; i < 8; i++) {
      spawn.particle(obstacle.position.x, obstacle.position.y, '#ff6b6b');
    }
  }
}

/**
 * Handle collectible collection
 */
function handleCollect(
  _player: With<Entity, 'player'>,
  collectible: With<Entity, 'collectible'>,
  handlers: CollisionHandlers
): void {
  // Check if this is a power-up
  const powerUp = (collectible as Entity).powerUp;
  if (powerUp) {
    // Activate the power-up
    useGameStore.getState().activatePowerUp(powerUp.type, powerUp.duration);

    // Trigger haptic feedback for power-up
    haptics.medium();

    // Notify handler
    handlers.onCollectPowerUp?.(powerUp.type);

    // Trigger collect animation (one-shot, returns to swim)
    triggerCollectAnimation();

    // Mark collected
    world.addComponent(collectible, 'collected', true);

    // Spawn power-up specific particles
    if (collectible.position) {
      const powerUpColors: Record<PowerUpType, string> = {
        shield: '#3b82f6',
        magnet: '#f59e0b',
        ghost: '#8b5cf6',
        multiplier: '#ef4444',
        slowMotion: '#06b6d4',
      };
      const color = powerUpColors[powerUp.type] || '#ffffff';
      for (let i = 0; i < 16; i++) {
        spawn.particle(collectible.position.x, collectible.position.y, color);
      }
    }
    return;
  }

  // Regular collectible (coin or gem)
  if (collectible.collectible!.type === 'coin') {
    handlers.onCollectCoin?.(collectible.collectible!.value);
    haptics.selection(); // Light feedback for coins
  } else if (collectible.collectible!.type === 'gem') {
    handlers.onCollectGem?.(collectible.collectible!.value);
    haptics.light(); // Slightly stronger for gems
  }

  // Trigger collect animation (one-shot, returns to swim)
  triggerCollectAnimation();

  // Mark collected
  world.addComponent(collectible, 'collected', true);

  // Spawn particles
  if (collectible.position) {
    const color = collectible.collectible!.type === 'coin' ? '#ffd700' : '#ff1493';
    for (let i = 0; i < 12; i++) {
      spawn.particle(collectible.position.x, collectible.position.y, color);
    }
  }
}

/**
 * Handle near-miss event
 * Player passed close to obstacle without collision
 */
function handleNearMiss(
  _player: With<Entity, 'player'>,
  obstacle: With<Entity, 'obstacle'>,
  handlers: CollisionHandlers
): void {
  if (!obstacle.position) return;

  // Trigger haptic feedback for near-miss
  haptics.light();

  // Spawn celebratory particles (yellow/gold for bonus)
  for (let i = 0; i < 6; i++) {
    spawn.particle(obstacle.position.x, obstacle.position.y, '#ffeb3b');
  }

  // Notify handler with position and bonus amount
  handlers.onNearMiss?.({
    position: { ...obstacle.position },
    bonus: NEAR_MISS_BONUS,
  });
}
