/**
 * Particle System
 * Manages particle lifetime and decay
 */

import { queries, world } from '../world';

/**
 * Update particle lifetimes
 * @param deltaMs Delta time in milliseconds
 */
export function updateParticles(deltaMs: number): void {
  for (const particle of queries.particles) {
    const particleState = particle.particle;
    if (!particleState) continue;
    particleState.lifetime -= deltaMs;
    if (particleState.lifetime <= 0) {
      world.addComponent(particle, 'destroyed', true);
    }
  }
}
