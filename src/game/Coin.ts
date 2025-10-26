import { AABB } from '../utils/math';

export enum CoinType {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
}

export class Coin {
  x: number;
  y: number;
  width: number = 30;
  height: number = 30;
  lane: number;
  active: boolean = false;
  type: CoinType;
  value: number;

  // Animation
  private floatOffset: number = 0;
  private floatSpeed: number = 2;
  private rotation: number = 0;
  private rotationSpeed: number = 3;

  constructor() {
    this.x = 0;
    this.y = 0;
    this.lane = 0;
    this.type = CoinType.BRONZE;
    this.value = 1;
  }

  init(
    lane: number,
    y: number,
    x: number,
    type: CoinType = CoinType.BRONZE
  ): void {
    this.lane = lane;
    this.y = y;
    this.x = x;
    this.active = true;
    this.type = type;

    // Set value based on type
    switch (type) {
      case CoinType.BRONZE:
        this.value = 1;
        this.width = 30;
        this.height = 30;
        break;
      case CoinType.SILVER:
        this.value = 5;
        this.width = 35;
        this.height = 35;
        break;
      case CoinType.GOLD:
        this.value = 10;
        this.width = 40;
        this.height = 40;
        break;
    }

    this.floatOffset = 0;
    this.rotation = 0;
  }

  update(deltaTime: number, scrollSpeed: number): void {
    if (!this.active) return;

    // Move down with scroll
    this.y += scrollSpeed * deltaTime;

    // Animate floating
    this.floatOffset += this.floatSpeed * deltaTime;
    this.rotation += this.rotationSpeed * deltaTime;
  }

  getAABB(): AABB {
    return {
      x: this.x,
      y: this.y + Math.sin(this.floatOffset) * 3, // Float animation
      width: this.width,
      height: this.height,
    };
  }

  isOffScreen(canvasHeight: number): boolean {
    return this.y > canvasHeight + 50;
  }

  reset(): void {
    this.active = false;
    this.x = 0;
    this.y = 0;
    this.lane = 0;
    this.floatOffset = 0;
    this.rotation = 0;
  }

  getColor(): string {
    switch (this.type) {
      case CoinType.BRONZE:
        return '#cd7f32';
      case CoinType.SILVER:
        return '#c0c0c0';
      case CoinType.GOLD:
        return '#ffd700';
      default:
        return '#ffd700';
    }
  }
}
