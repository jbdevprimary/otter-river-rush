/**
 * Animation System
 * Controls player animations based on game state and entity state
 *
 * Animation States:
 * - idle: Standing still (menu, paused)
 * - swim: Default moving animation (playing state)
 * - hit: Taking damage from obstacle (one-shot, 500ms)
 * - collect: Picking up a collectible (one-shot, 300ms)
 * - dodge: Lane change animation (one-shot, 200ms)
 * - jump: Jumping over obstacle (continuous while airborne)
 * - death: Game over animation (final state)
 */

import type { With } from 'miniplex';
import type { AnimationState, Entity, GameStatus } from '../../types';
import { queries } from '../world';

/** Duration of one-shot animations in milliseconds */
const ANIMATION_DURATIONS: Partial<Record<AnimationState, number>> = {
  hit: 500,
  collect: 300,
  dodge: 200,
  // Note: jump is NOT a one-shot - it's managed by the jump system
};

/** Default animation to return to after one-shot completes */
const DEFAULT_PLAYING_ANIMATION: AnimationState = 'swim';

/** Track the previous lane for dodge detection */
let previousLane: number | undefined;

/**
 * Trigger a one-shot animation that returns to default after duration
 * @param animation Animation state to play
 * @param returnTo Animation to return to after (defaults to swim)
 */
export function triggerAnimation(
  animation: AnimationState,
  returnTo: AnimationState = DEFAULT_PLAYING_ANIMATION
): void {
  const [player] = queries.player.entities;
  if (!player || !player.animation) return;

  const duration = ANIMATION_DURATIONS[animation];

  player.animation.previous = player.animation.current;
  player.animation.current = animation;
  player.animation.startTime = Date.now();
  player.animation.duration = duration;
  player.animation.isOneShot = duration !== undefined;
  player.animation.returnTo = returnTo;
  player.animation.fadeDuration = 0.15; // 150ms crossfade
}

/**
 * Set animation directly without one-shot behavior
 * @param animation Animation state to set
 */
export function setAnimation(animation: AnimationState): void {
  const [player] = queries.player.entities;
  if (!player || !player.animation) return;

  if (player.animation.current !== animation) {
    player.animation.previous = player.animation.current;
    player.animation.current = animation;
    player.animation.startTime = Date.now();
    player.animation.isOneShot = false;
    player.animation.fadeDuration = 0.15;
  }
}

/**
 * Update player animation based on game status and entity state
 * @param status Current game status
 */
export function updateAnimation(status: GameStatus): void {
  const [player] = queries.player.entities;
  if (!player || !player.animation) return;

  const animatedPlayer = player as AnimatedPlayer;
  const now = Date.now();

  // Check if one-shot animation has completed
  resolveOneShotAnimation(animatedPlayer, now);

  // Don't change animation if we're in a one-shot
  if (animatedPlayer.animation.isOneShot) return;

  if (status === 'playing') {
    handlePlayingAnimation(animatedPlayer);
    return;
  }

  handleNonPlayingAnimation(status, animatedPlayer);
}

type AnimatedPlayer = With<Entity, 'player' | 'animation'>;

function resolveOneShotAnimation(player: AnimatedPlayer, now: number): void {
  if (!player.animation?.isOneShot || !player.animation.startTime || !player.animation.duration) {
    return;
  }

  const elapsed = now - player.animation.startTime;
  if (elapsed < player.animation.duration) return;

  const returnAnimation = player.animation.returnTo ?? DEFAULT_PLAYING_ANIMATION;
  player.animation.previous = player.animation.current;
  player.animation.current = returnAnimation;
  player.animation.isOneShot = false;
  player.animation.startTime = now;
}

function handlePlayingAnimation(player: AnimatedPlayer): void {
  if (player.jump?.isJumping) {
    if (player.animation.current !== 'jump') {
      setAnimation('jump');
    }
    return;
  }

  if (player.animation.current === 'jump' && !player.jump?.isJumping) {
    setAnimation('swim');
    return;
  }

  if (player.lane !== undefined && previousLane !== undefined && player.lane !== previousLane) {
    triggerAnimation('dodge', DEFAULT_PLAYING_ANIMATION);
    previousLane = player.lane;
    return;
  }

  previousLane = player.lane;

  if (player.animation.current !== 'swim') {
    setAnimation('swim');
  }
}

function handleNonPlayingAnimation(status: GameStatus, player: AnimatedPlayer): void {
  if (status === 'game_over') {
    if (player.animation?.current !== 'death') {
      setAnimation('death');
    }
    return;
  }

  if (player.animation?.current !== 'idle') {
    setAnimation('idle');
  }
}

/**
 * Trigger hit animation (called from collision system)
 */
export function triggerHitAnimation(): void {
  triggerAnimation('hit', DEFAULT_PLAYING_ANIMATION);
}

/**
 * Trigger collect animation (called from collision system)
 */
export function triggerCollectAnimation(): void {
  triggerAnimation('collect', DEFAULT_PLAYING_ANIMATION);
}

/**
 * Trigger death animation (called from collision system)
 */
export function triggerDeathAnimation(): void {
  setAnimation('death');
}

/**
 * Trigger jump animation (called from input system)
 * Note: Unlike other animations, jump is not a one-shot.
 * It's managed by the jump system and returns to swim when landing.
 */
export function triggerJumpAnimation(): void {
  setAnimation('jump');
}

/**
 * Reset animation state (called when game restarts)
 */
export function resetAnimationState(): void {
  previousLane = undefined;
}
