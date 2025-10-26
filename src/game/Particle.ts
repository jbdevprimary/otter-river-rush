import { Vector2 } from '../utils/math';

export class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  lifetime: number;
  maxLifetime: number;
  color: string;
  size: number;
  active: boolean;

  constructor() {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.lifetime = 0;
    this.maxLifetime = 1000;
    this.color = '#ffffff';
    this.size = 4;
    this.active = false;
  }

  init(
    pos: Vector2,
    velocity: Vector2,
    lifetime: number,
    color: string,
    size: number
  ): void {
    this.x = pos.x;
    this.y = pos.y;
    this.vx = velocity.x;
    this.vy = velocity.y;
    this.lifetime = 0;
    this.maxLifetime = lifetime;
    this.color = color;
    this.size = size;
    this.active = true;
  }

  update(deltaTime: number): void {
    if (this.active) {
      this.x += this.vx * deltaTime;
      this.y += this.vy * deltaTime;
      this.lifetime += deltaTime * 1000;

      if (this.lifetime >= this.maxLifetime) {
        this.active = false;
      }
    }
  }

  getAlpha(): number {
    return 1 - this.lifetime / this.maxLifetime;
  }

  reset(): void {
    this.active = false;
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.lifetime = 0;
  }
}
