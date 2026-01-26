/**
 * Collision System
 * Detects and handles collisions between entities
 */

import type { GameMode, GameStatus, Entity } from '../../types';
import type { With } from 'miniplex';
import { world, queries, spawn } from '../world';
import { checkCollision, checkNearMiss, NEAR_MISS_BONUS } from '../utils/collision';
import { isTutorialActive } from '../../store/game-store';

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
  onGameOver?: () => void;
  onNearMiss?: (event: NearMissEvent) => void;
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

  // Check obstacle collisions and near-misses - skip damage in zen mode
  // In zen mode, obstacles shouldn't spawn, but we still skip damage as a safety net
  if (gameMode !== 'zen') {
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

  // Check collectible collisions
  for (const collectible of queries.collectibles) {
    if (collectible.collider && checkCollision(player as any, collectible as any)) {
      handleCollect(player, collectible, handlers);
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
  // Skip if player is invincible, ghost, or in tutorial period
  if (player.invincible || player.ghost || isTutorialActive()) return;

  // Reduce health
  if (player.health) {
    player.health -= 1;

    // Update animation
    if (player.animation) {
      player.animation.current = 'hit';
      setTimeout(() => {
        if (player.animation) player.animation.current = 'walk';
      }, 500);
    }

    // Game over if no health
    if (player.health <= 0) {
      handlers.onGameOver?.();
      if (player.animation) {
        player.animation.current = 'death';
      }
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
  player: With<Entity, 'player'>,
  collectible: With<Entity, 'collectible'>,
  handlers: CollisionHandlers
): void {
  // Add to score
  if (collectible.collectible!.type === 'coin') {
    handlers.onCollectCoin?.(collectible.collectible!.value);
  } else {
    handlers.onCollectGem?.(collectible.collectible!.value);
  }

  // Play collect animation briefly
  if (player.animation) {
    player.animation.current = 'collect';
    setTimeout(() => {
      if (player.animation) player.animation.current = 'walk';
    }, 300);
  }

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
