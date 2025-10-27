import { AABB } from '../utils/math';
import { ROCK_CONFIG } from './constants';

export class Rock {
  x: number;
  y: number;
  width: number;
  height: number;
  lane: number;
  active: boolean;
  nearMissRecorded: boolean; // Track if near-miss already counted for this rock

  constructor() {
    this.width = ROCK_CONFIG.WIDTH;
    this.height = ROCK_CONFIG.HEIGHT;
    this.x = 0;
    this.y = 0;
    this.lane = 0;
    this.active = false;
    this.nearMissRecorded = false;
  }

  init(lane: number, y: number, laneX: number): void {
    this.lane = lane;
    this.y = y;
    this.x = laneX;
    this.active = true;
    this.nearMissRecorded = false; // Reset on init
  }

  update(deltaTime: number, scrollSpeed: number): void {
    if (this.active) {
      this.y += scrollSpeed * deltaTime;
    }
  }

  getAABB(): AABB {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  isOffScreen(canvasHeight: number): boolean {
    return this.y > canvasHeight;
  }

  reset(): void {
    this.active = false;
    this.nearMissRecorded = false;
    this.x = 0;
    this.y = 0;
    this.lane = 0;
  }
}
