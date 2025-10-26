import { describe, it, expect } from 'vitest';
import {
  checkAABBCollision,
  clamp,
  lerp,
  randomRange,
  randomInt,
} from '../utils/math';

describe('Math utilities', () => {
  describe('checkAABBCollision', () => {
    it('should detect collision between overlapping boxes', () => {
      const a = { x: 0, y: 0, width: 10, height: 10 };
      const b = { x: 5, y: 5, width: 10, height: 10 };
      expect(checkAABBCollision(a, b)).toBe(true);
    });

    it('should not detect collision between non-overlapping boxes', () => {
      const a = { x: 0, y: 0, width: 10, height: 10 };
      const b = { x: 20, y: 20, width: 10, height: 10 };
      expect(checkAABBCollision(a, b)).toBe(false);
    });

    it('should not detect collision when boxes only touch at edges', () => {
      const a = { x: 0, y: 0, width: 10, height: 10 };
      const b = { x: 10, y: 0, width: 10, height: 10 };
      expect(checkAABBCollision(a, b)).toBe(false);
    });
  });

  describe('clamp', () => {
    it('should clamp value within range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });
  });

  describe('lerp', () => {
    it('should interpolate between values', () => {
      expect(lerp(0, 10, 0)).toBe(0);
      expect(lerp(0, 10, 1)).toBe(10);
      expect(lerp(0, 10, 0.5)).toBe(5);
    });
  });

  describe('randomRange', () => {
    it('should return value within range', () => {
      for (let i = 0; i < 100; i++) {
        const value = randomRange(0, 10);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(10);
      }
    });
  });

  describe('randomInt', () => {
    it('should return integer within range', () => {
      for (let i = 0; i < 100; i++) {
        const value = randomInt(0, 10);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(10);
        expect(Number.isInteger(value)).toBe(true);
      }
    });
  });
});
