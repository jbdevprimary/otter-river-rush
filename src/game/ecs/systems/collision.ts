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

  const player = getActivePlayer();
  if (!player) return;

  if (shouldCheckObstacles(gameMode)) {
    handleObstacleInteractions(player, handlers);
  }

  if (isPowerUpActive('magnet')) {
    applyMagnetEffect(player);
  }

  handleCollectibleInteractions(player, handlers);
}

function getActivePlayer(): With<Entity, 'position' | 'collider' | 'player'> | null {
  const [player] = queries.player.entities;
  if (!player || !player.collider || !player.position) return null;
  return player;
}

function shouldCheckObstacles(gameMode: GameMode): boolean {
  return gameMode !== 'zen' && gameMode !== 'time_trial';
}

function handleObstacleInteractions(
  player: With<Entity, 'position' | 'collider' | 'player'>,
  handlers: CollisionHandlers
): void {
  for (const obstacle of queries.obstacles) {
    if (!isCollidable(obstacle)) continue;
    if (checkCollision(player, obstacle)) {
      handleObstacleHit(player, obstacle, handlers);
      continue;
    }
    if (!nearMissedObstacles.has(obstacle) && checkNearMiss(player, obstacle)) {
      nearMissedObstacles.add(obstacle);
      handleNearMiss(player, obstacle, handlers);
    }
  }
}

function handleCollectibleInteractions(
  player: With<Entity, 'position' | 'collider' | 'player'>,
  handlers: CollisionHandlers
): void {
  for (const collectible of queries.collectibles) {
    if (!isCollidable(collectible)) continue;
    if (checkCollision(player, collectible)) {
      handleCollect(player, collectible, handlers);
    }
  }
}

function isCollidable(entity: Entity): entity is With<Entity, 'position' | 'collider'> {
  return Boolean(entity.position && entity.collider);
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
  if (shouldIgnoreObstacleHit(player) || isPowerUpActive('ghost')) return;

  if (isPowerUpActive('shield')) {
    handleShieldHit(obstacle);
    return;
  }

  applyObstacleDamage(player, obstacle, handlers);
  handlers.onObstacleHit?.(player, obstacle);
  world.addComponent(obstacle, 'destroyed', true);
  spawnObstacleParticles(obstacle);
}

function shouldIgnoreObstacleHit(player: With<Entity, 'player'>): boolean {
  return Boolean(player.invincible || player.ghost || isTutorialActive());
}

function handleShieldHit(obstacle: With<Entity, 'obstacle'>): void {
  useGameStore.getState().deactivatePowerUp('shield');
  world.addComponent(obstacle, 'destroyed', true);

  if (obstacle.position) {
    for (let i = 0; i < 10; i++) {
      spawn.particle(obstacle.position.x, obstacle.position.y, '#3b82f6');
    }
  }
}

function applyObstacleDamage(
  player: With<Entity, 'player'>,
  obstacle: With<Entity, 'obstacle'>,
  handlers: CollisionHandlers
): void {
  if (!player.health) return;

  player.health -= 1;
  handlers.onAudioTrigger?.('hit_sfx');

  applyBounce(player, obstacle);

  if (player.health <= 0) {
    triggerDeathAnimation();
    handlers.onGameOver?.();
    return;
  }

  triggerHitAnimation();
}

function applyBounce(player: With<Entity, 'player'>, obstacle: With<Entity, 'obstacle'>): void {
  if (!player.position || !player.velocity || !obstacle.position) return;

  const LANE_WIDTH = 2; // Should import from config, but safe constant here
  const x = player.position.x;
  const atLeftBank = x <= -LANE_WIDTH;
  const atRightBank = x >= LANE_WIDTH;

  let bounceDir = 0;
  if (atLeftBank) {
    bounceDir = 1;
  } else if (atRightBank) {
    bounceDir = -1;
  } else {
    bounceDir = Math.random() > 0.5 ? 1 : -1;
  }

  player.velocity.x += bounceDir * 5;
}

function spawnObstacleParticles(obstacle: With<Entity, 'obstacle'>): void {
  if (!obstacle.position) return;
  for (let i = 0; i < 8; i++) {
    spawn.particle(obstacle.position.x, obstacle.position.y, '#ff6b6b');
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
  if (collectible.collectible?.type === 'coin') {
    handlers.onCollectCoin?.(collectible.collectible.value ?? 0);
  } else if (collectible.collectible?.type === 'gem') {
    handlers.onCollectGem?.(collectible.collectible.value ?? 0);
  }

  // Trigger collect animation (one-shot, returns to swim)
  triggerCollectAnimation();

  // Mark collected
  world.addComponent(collectible, 'collected', true);

  // Spawn particles
  if (collectible.position) {
    const color = collectible.collectible?.type === 'coin' ? '#ffd700' : '#ff1493';
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
