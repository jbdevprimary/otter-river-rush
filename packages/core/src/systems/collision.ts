/**
 * Collision System
 * Detects and handles collisions between entities
 */

import type { GameMode, GameStatus, Entity } from '@otter-river-rush/types';
import type { With } from 'miniplex';
import { world, queries, spawn } from '../world';
import { checkCollision } from '../utils/collision';
import { isTutorialActive } from '@otter-river-rush/state';
import { triggerHitAnimation, triggerCollectAnimation, triggerDeathAnimation } from './animation';

/**
 * Collision handlers interface
 * Allows external code to handle collision effects (audio, scoring, etc.)
 */
export interface CollisionHandlers {
  onObstacleHit?: (player: With<Entity, 'player'>, obstacle: With<Entity, 'obstacle'>) => void;
  onCollectCoin?: (value: number) => void;
  onCollectGem?: (value: number) => void;
  onGameOver?: () => void;
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

  // Check obstacle collisions - skip damage in zen mode
  // In zen mode, obstacles shouldn't spawn, but we still skip damage as a safety net
  if (gameMode !== 'zen') {
    for (const obstacle of queries.obstacles) {
      if (checkCollision(player as any, obstacle)) {
        handleObstacleHit(player, obstacle, handlers);
      }
    }
  }

  // Check collectible collisions
  for (const collectible of queries.collectibles) {
    if (collectible.collider && checkCollision(player as any, collectible as any)) {
      handleCollect(collectible, handlers);
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
  collectible: With<Entity, 'collectible'>,
  handlers: CollisionHandlers
): void {
  // Add to score
  if (collectible.collectible!.type === 'coin') {
    handlers.onCollectCoin?.(collectible.collectible!.value);
  } else {
    handlers.onCollectGem?.(collectible.collectible!.value);
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
