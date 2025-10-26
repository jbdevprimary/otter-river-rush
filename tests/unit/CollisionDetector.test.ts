/**
 * Test suite for CollisionDetector
 */

import { describe, it, expect } from 'vitest';
import {
  checkAABB,
  checkCircle,
  checkCircleAABB,
  pointInCircle,
  pointInAABB,
  checkColliders,
  SpatialGrid,
} from '@/utils/CollisionDetector';
import type { Bounds, Collider } from '@/types/Game.types';

describe('CollisionDetector', () => {
  describe('checkAABB', () => {
    it('should detect overlapping rectangles', () => {
      const a: Bounds = { x: 0, y: 0, width: 50, height: 50 };
      const b: Bounds = { x: 25, y: 25, width: 50, height: 50 };

      expect(checkAABB(a, b)).toBe(true);
    });

    it('should not detect separated rectangles', () => {
      const a: Bounds = { x: 0, y: 0, width: 50, height: 50 };
      const b: Bounds = { x: 100, y: 100, width: 50, height: 50 };

      expect(checkAABB(a, b)).toBe(false);
    });

    it('should detect touching rectangles', () => {
      const a: Bounds = { x: 0, y: 0, width: 50, height: 50 };
      const b: Bounds = { x: 50, y: 0, width: 50, height: 50 };

      expect(checkAABB(a, b)).toBe(false);
    });
  });

  describe('checkCircle', () => {
    it('should detect overlapping circles', () => {
      const a = { x: 0, y: 0 };
      const b = { x: 10, y: 0 };

      expect(checkCircle(a, 10, b, 10)).toBe(true);
    });

    it('should not detect separated circles', () => {
      const a = { x: 0, y: 0 };
      const b = { x: 50, y: 0 };

      expect(checkCircle(a, 10, b, 10)).toBe(false);
    });

    it('should detect touching circles', () => {
      const a = { x: 0, y: 0 };
      const b = { x: 20, y: 0 };

      expect(checkCircle(a, 10, b, 10)).toBe(false);
    });
  });

  describe('checkCircleAABB', () => {
    it('should detect circle overlapping rectangle', () => {
      const circle = { x: 25, y: 25 };
      const box: Bounds = { x: 0, y: 0, width: 50, height: 50 };

      expect(checkCircleAABB(circle, 10, box)).toBe(true);
    });

    it('should not detect separated circle and rectangle', () => {
      const circle = { x: 100, y: 100 };
      const box: Bounds = { x: 0, y: 0, width: 50, height: 50 };

      expect(checkCircleAABB(circle, 10, box)).toBe(false);
    });

    it('should detect circle touching rectangle edge', () => {
      const circle = { x: 60, y: 25 };
      const box: Bounds = { x: 0, y: 0, width: 50, height: 50 };

      expect(checkCircleAABB(circle, 10, box)).toBe(false);
    });
  });

  describe('pointInCircle', () => {
    it('should detect point inside circle', () => {
      const point = { x: 5, y: 0 };
      const circle = { x: 0, y: 0 };

      expect(pointInCircle(point, circle, 10)).toBe(true);
    });

    it('should not detect point outside circle', () => {
      const point = { x: 15, y: 0 };
      const circle = { x: 0, y: 0 };

      expect(pointInCircle(point, circle, 10)).toBe(false);
    });

    it('should detect point on circle edge', () => {
      const point = { x: 10, y: 0 };
      const circle = { x: 0, y: 0 };

      expect(pointInCircle(point, circle, 10)).toBe(true);
    });
  });

  describe('pointInAABB', () => {
    it('should detect point inside rectangle', () => {
      const point = { x: 25, y: 25 };
      const box: Bounds = { x: 0, y: 0, width: 50, height: 50 };

      expect(pointInAABB(point, box)).toBe(true);
    });

    it('should not detect point outside rectangle', () => {
      const point = { x: 75, y: 75 };
      const box: Bounds = { x: 0, y: 0, width: 50, height: 50 };

      expect(pointInAABB(point, box)).toBe(false);
    });

    it('should detect point on rectangle edge', () => {
      const point = { x: 50, y: 25 };
      const box: Bounds = { x: 0, y: 0, width: 50, height: 50 };

      expect(pointInAABB(point, box)).toBe(true);
    });
  });

  describe('checkColliders', () => {
    it('should detect collision between circle colliders', () => {
      const posA = { x: 0, y: 0 };
      const colliderA: Collider = {
        type: 'circle',
        radius: 10,
        offset: { x: 0, y: 0 },
      };

      const posB = { x: 15, y: 0 };
      const colliderB: Collider = {
        type: 'circle',
        radius: 10,
        offset: { x: 0, y: 0 },
      };

      expect(checkColliders(posA, colliderA, posB, colliderB)).toBe(true);
    });

    it('should detect collision between rectangle colliders', () => {
      const posA = { x: 25, y: 25 };
      const colliderA: Collider = {
        type: 'rectangle',
        width: 50,
        height: 50,
        offset: { x: 0, y: 0 },
      };

      const posB = { x: 50, y: 50 };
      const colliderB: Collider = {
        type: 'rectangle',
        width: 50,
        height: 50,
        offset: { x: 0, y: 0 },
      };

      expect(checkColliders(posA, colliderA, posB, colliderB)).toBe(true);
    });

    it('should detect collision between mixed colliders', () => {
      const posA = { x: 25, y: 25 };
      const colliderA: Collider = {
        type: 'circle',
        radius: 15,
        offset: { x: 0, y: 0 },
      };

      const posB = { x: 25, y: 25 };
      const colliderB: Collider = {
        type: 'rectangle',
        width: 50,
        height: 50,
        offset: { x: 0, y: 0 },
      };

      expect(checkColliders(posA, colliderA, posB, colliderB)).toBe(true);
    });
  });

  describe('SpatialGrid', () => {
    it('should insert and query items', () => {
      const grid = new SpatialGrid<string>(50);

      grid.insert('item1', { x: 0, y: 0, width: 10, height: 10 });
      grid.insert('item2', { x: 100, y: 100, width: 10, height: 10 });

      const results = grid.query({ x: 0, y: 0, width: 20, height: 20 });

      expect(results).toContain('item1');
      expect(results).not.toContain('item2');
    });

    it('should find items in adjacent cells', () => {
      const grid = new SpatialGrid<string>(50);

      grid.insert('item1', { x: 40, y: 40, width: 20, height: 20 });

      const results = grid.query({ x: 50, y: 50, width: 10, height: 10 });

      expect(results).toContain('item1');
    });

    it('should clear all items', () => {
      const grid = new SpatialGrid<string>(50);

      grid.insert('item1', { x: 0, y: 0, width: 10, height: 10 });
      grid.clear();

      const results = grid.query({ x: 0, y: 0, width: 20, height: 20 });

      expect(results).toHaveLength(0);
    });
  });
});
