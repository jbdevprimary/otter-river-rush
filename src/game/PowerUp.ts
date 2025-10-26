import { AABB } from '../utils/math';
import { POWERUP_CONFIG, PowerUpType } from './constants';

export class PowerUp {
  x: number;
  y: number;
  width: number;
  height: number;
  lane: number;
  type: PowerUpType;
  active: boolean;

  constructor() {
    this.width = POWERUP_CONFIG.WIDTH;
    this.height = POWERUP_CONFIG.HEIGHT;
    this.x = 0;
    this.y = 0;
    this.lane = 0;
    this.type = PowerUpType.SHIELD;
    this.active = false;
  }

  init(lane: number, y: number, laneX: number, type: PowerUpType): void {
    this.lane = lane;
    this.y = y;
    this.x = laneX;
    this.type = type;
    this.active = true;
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
    this.x = 0;
    this.y = 0;
    this.lane = 0;
  }
}
