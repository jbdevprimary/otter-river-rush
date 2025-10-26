import { describe, it, expect, beforeEach } from 'vitest';
import { Otter } from '../game/Otter';
import { OTTER_CONFIG, GAME_CONFIG } from '../game/constants';

describe('Otter', () => {
  let otter: Otter;

  beforeEach(() => {
    otter = new Otter();
  });

  it('should initialize with correct defaults', () => {
    expect(otter.currentLane).toBe(OTTER_CONFIG.START_LANE);
    expect(otter.targetLane).toBe(OTTER_CONFIG.START_LANE);
    expect(otter.width).toBe(OTTER_CONFIG.WIDTH);
    expect(otter.height).toBe(OTTER_CONFIG.HEIGHT);
    expect(otter.isMoving).toBe(false);
    expect(otter.hasShield).toBe(false);
  });

  it('should move left when in valid lane', () => {
    otter.currentLane = 1;
    otter.moveLeft();
    expect(otter.targetLane).toBe(0);
    expect(otter.isMoving).toBe(true);
  });

  it('should not move left from leftmost lane', () => {
    otter.currentLane = 0;
    otter.targetLane = 0;
    otter.moveLeft();
    expect(otter.targetLane).toBe(0);
    expect(otter.isMoving).toBe(false);
  });

  it('should move right when in valid lane', () => {
    otter.currentLane = 1;
    otter.targetLane = 1;
    otter.moveRight();
    expect(otter.targetLane).toBe(2);
    expect(otter.isMoving).toBe(true);
  });

  it('should not move right from rightmost lane', () => {
    otter.currentLane = GAME_CONFIG.LANE_COUNT - 1;
    otter.targetLane = GAME_CONFIG.LANE_COUNT - 1;
    otter.moveRight();
    expect(otter.targetLane).toBe(GAME_CONFIG.LANE_COUNT - 1);
    expect(otter.isMoving).toBe(false);
  });

  it('should update position when moving', () => {
    otter.currentLane = 1;
    otter.targetLane = 0;
    otter.isMoving = true;
    const initialX = otter.x;

    otter.update(0.016);

    expect(otter.x).not.toBe(initialX);
  });

  it('should return correct AABB', () => {
    const aabb = otter.getAABB();
    expect(aabb.x).toBe(otter.x);
    expect(aabb.y).toBe(otter.y);
    expect(aabb.width).toBe(otter.width);
    expect(aabb.height).toBe(otter.height);
  });

  it('should reset correctly', () => {
    otter.currentLane = 2;
    otter.hasShield = true;
    otter.isMoving = true;

    otter.reset();

    expect(otter.currentLane).toBe(OTTER_CONFIG.START_LANE);
    expect(otter.hasShield).toBe(false);
    expect(otter.isMoving).toBe(false);
  });
});
