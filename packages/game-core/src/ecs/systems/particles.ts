/**
 * Particle System
 * Manages particle lifetime and decay
 */

import { world, queries } from '../world';

/**
 * Update particle lifetimes
 * @param deltaMs Delta time in milliseconds
 */
export function updateParticles(deltaMs: number): void {
  for (const particle of queries.particles) {
    particle.particle!.lifetime -= deltaMs;
    if (particle.particle!.lifetime <= 0) {
      world.addComponent(particle, 'destroyed', true);
    }
  }
}
