import { AABB } from '../utils/math';

export enum GemType {
  BLUE = 'blue',
  RED = 'red',
  RAINBOW = 'rainbow',
}

export class Gem {
  x: number;
  y: number;
  width: number = 35;
  height: number = 35;
  lane: number;
  active: boolean = false;
  type: GemType;
  value: number;

  // Animation
  private sparklePhase: number = 0;
  private pulsePhase: number = 0;
  private rotation: number = 0;

  constructor() {
    this.x = 0;
    this.y = 0;
    this.lane = 0;
    this.type = GemType.BLUE;
    this.value = 5;
  }

  init(lane: number, y: number, x: number, type: GemType = GemType.BLUE): void {
    this.lane = lane;
    this.y = y;
    this.x = x;
    this.active = true;
    this.type = type;

    // Set value based on type
    switch (type) {
      case GemType.BLUE:
        this.value = 5;
        this.width = 35;
        this.height = 35;
        break;
      case GemType.RED:
        this.value = 10;
        this.width = 40;
        this.height = 40;
        break;
      case GemType.RAINBOW:
        this.value = 25;
        this.width = 45;
        this.height = 45;
        break;
    }

    this.sparklePhase = Math.random() * Math.PI * 2;
    this.pulsePhase = Math.random() * Math.PI * 2;
    this.rotation = Math.random() * Math.PI * 2;
  }

  update(deltaTime: number, scrollSpeed: number): void {
    if (!this.active) return;

    // Move down with scroll
    this.y += scrollSpeed * deltaTime;

    // Animate sparkle and pulse
    this.sparklePhase += 3 * deltaTime;
    this.pulsePhase += 2 * deltaTime;
    this.rotation += 1.5 * deltaTime;
  }

  getAABB(): AABB {
    const scale = 1 + Math.sin(this.pulsePhase) * 0.1;
    return {
      x: this.x - (this.width * scale - this.width) / 2,
      y: this.y - (this.height * scale - this.height) / 2,
      width: this.width * scale,
      height: this.height * scale,
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
    this.sparklePhase = 0;
    this.pulsePhase = 0;
    this.rotation = 0;
  }

  getColor(): string {
    switch (this.type) {
      case GemType.BLUE:
        return '#3b82f6';
      case GemType.RED:
        return '#ef4444';
      case GemType.RAINBOW: {
        // Animated rainbow
        const hue = (Date.now() / 10) % 360;
        return `hsl(${hue}, 100%, 60%)`;
      }
      default:
        return '#3b82f6';
    }
  }

  getSparkleIntensity(): number {
    return (Math.sin(this.sparklePhase) + 1) / 2;
  }
}
