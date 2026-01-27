import type { With } from 'miniplex';
import type { Entity } from '../../types';
import { checkCollision, checkNearMiss, NEAR_MISS_ZONE } from './collision';

const makeEntity = (x: number, y: number, size = 1): With<Entity, 'position' | 'collider'> => ({
  position: { x, y, z: 0 },
  collider: { width: size, height: size, depth: size },
});

describe('collision utils', () => {
  it('detects overlapping AABB collisions', () => {
    const a = makeEntity(0, 0, 2);
    const b = makeEntity(0.5, 0.5, 2);

    expect(checkCollision(a, b)).toBe(true);
  });

  it('returns false when entities are separated', () => {
    const a = makeEntity(0, 0, 1);
    const b = makeEntity(5, 5, 1);

    expect(checkCollision(a, b)).toBe(false);
  });

  it('flags near misses inside the expanded zone', () => {
    const a = makeEntity(0, 0, 1);
    const b = makeEntity(0, 1 + NEAR_MISS_ZONE / 2, 1);

    expect(checkCollision(a, b)).toBe(false);
    expect(checkNearMiss(a, b)).toBe(true);
  });
});
