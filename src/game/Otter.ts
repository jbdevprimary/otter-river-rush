import { AABB } from '../utils/math';
import { OTTER_CONFIG, GAME_CONFIG } from './constants';

export class Otter {
  x: number;
  y: number;
  width: number;
  height: number;
  currentLane: number;
  targetLane: number;
  isMoving: boolean;
  hasShield: boolean;
  isGhost: boolean;

  constructor() {
    this.width = OTTER_CONFIG.WIDTH;
    this.height = OTTER_CONFIG.HEIGHT;
    this.currentLane = OTTER_CONFIG.START_LANE;
    this.targetLane = OTTER_CONFIG.START_LANE;
    this.x = this.getLaneX(this.currentLane);
    this.y = GAME_CONFIG.CANVAS_HEIGHT - 180; // Near bottom - racing towards player!
    this.isMoving = false;
    this.hasShield = false;
    this.isGhost = false;
  }

  getLaneX(lane: number): number {
    return (
      GAME_CONFIG.LANE_OFFSET +
      lane * GAME_CONFIG.LANE_WIDTH +
      GAME_CONFIG.LANE_WIDTH / 2 -
      this.width / 2
    );
  }

  moveLeft(): void {
    if (this.currentLane > 0 && !this.isMoving) {
      this.targetLane = this.currentLane - 1;
      this.isMoving = true;
    }
  }

  moveRight(): void {
    if (this.currentLane < GAME_CONFIG.LANE_COUNT - 1 && !this.isMoving) {
      this.targetLane = this.currentLane + 1;
      this.isMoving = true;
    }
  }

  update(deltaTime: number): void {
    if (this.isMoving) {
      const targetX = this.getLaneX(this.targetLane);
      const diff = targetX - this.x;
      const moveDistance = OTTER_CONFIG.MOVE_SPEED * deltaTime;

      if (Math.abs(diff) <= moveDistance) {
        this.x = targetX;
        this.currentLane = this.targetLane;
        this.isMoving = false;
      } else {
        this.x += Math.sign(diff) * moveDistance;
      }
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

  reset(): void {
    this.currentLane = OTTER_CONFIG.START_LANE;
    this.targetLane = OTTER_CONFIG.START_LANE;
    this.x = this.getLaneX(this.currentLane);
    this.y = GAME_CONFIG.CANVAS_HEIGHT - 180; // Near bottom - racing towards player!
    this.isMoving = false;
    this.hasShield = false;
    this.isGhost = false;
  }
}
