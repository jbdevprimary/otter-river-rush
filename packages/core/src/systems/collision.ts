/**
 * Collision System
 * Detects and handles collisions between entities
 */

import type { GameStatus, Entity } from '@otter-river-rush/types';
import type { With } from 'miniplex';
import { world, queries, spawn } from '../world';
import { checkCollision } from '../utils/collision';

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
 */
export function updateCollision(
  status: GameStatus,
  handlers: CollisionHandlers = {}
): void {
  if (status !== 'playing') return;

  const [player] = queries.player.entities;
  if (!player || !player.collider) return;

  // Check obstacle collisions
  for (const obstacle of queries.obstacles) {
    if (checkCollision(player as any, obstacle)) {
      handleObstacleHit(player, obstacle, handlers);
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
  // Skip if player is invincible or ghost
  if (player.invincible || player.ghost) return;

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
