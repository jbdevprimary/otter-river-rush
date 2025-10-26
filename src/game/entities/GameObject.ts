/**
 * Base class for all game objects
 */

import type { Transform, Vector2D, Collider } from '@/types/Game.types';

export abstract class GameObject {
  public id: string;
  public active: boolean = true;
  public transform: Transform;
  public collider?: Collider;

  constructor(
    id: string,
    position: Vector2D = { x: 0, y: 0 },
    collider?: Collider
  ) {
    this.id = id;
    this.transform = {
      position,
      velocity: { x: 0, y: 0 },
      rotation: 0,
      scale: { x: 1, y: 1 },
    };
    this.collider = collider;
  }

  /**
   * Update game object logic
   */
  public abstract update(deltaTime: number): void;

  /**
   * Render game object
   */
  public abstract render(ctx: CanvasRenderingContext2D): void;

  /**
   * Handle collision with another object
   */
  public onCollision?(other: GameObject): void;

  /**
   * Cleanup resources
   */
  public destroy(): void {
    this.active = false;
  }

  /**
   * Get center position
   */
  public getCenter(): Vector2D {
    return {
      x: this.transform.position.x,
      y: this.transform.position.y,
    };
  }

  /**
   * Get bounds for collision detection
   */
  public getBounds(): { x: number; y: number; width: number; height: number } {
    if (this.collider?.type === 'circle') {
      const radius = this.collider.radius || 0;
      return {
        x: this.transform.position.x - radius,
        y: this.transform.position.y - radius,
        width: radius * 2,
        height: radius * 2,
      };
    }

    if (this.collider?.type === 'rectangle') {
      const width = this.collider.width || 0;
      const height = this.collider.height || 0;
      return {
        x: this.transform.position.x - width / 2,
        y: this.transform.position.y - height / 2,
        width,
        height,
      };
    }

    return { x: 0, y: 0, width: 0, height: 0 };
  }

  /**
   * Check if object is on screen
   */
  public isOnScreen(canvasWidth: number, canvasHeight: number): boolean {
    const bounds = this.getBounds();
    return (
      bounds.x + bounds.width >= 0 &&
      bounds.x <= canvasWidth &&
      bounds.y + bounds.height >= 0 &&
      bounds.y <= canvasHeight
    );
  }

  /**
   * Apply velocity to position
   */
  protected applyVelocity(deltaTime: number): void {
    this.transform.position.x += this.transform.velocity.x * deltaTime;
    this.transform.position.y += this.transform.velocity.y * deltaTime;
  }

  /**
   * Clamp position within bounds
   */
  protected clampPosition(
    minX: number,
    maxX: number,
    minY: number,
    maxY: number
  ): void {
    this.transform.position.x = Math.max(
      minX,
      Math.min(maxX, this.transform.position.x)
    );
    this.transform.position.y = Math.max(
      minY,
      Math.min(maxY, this.transform.position.y)
    );
  }
}
