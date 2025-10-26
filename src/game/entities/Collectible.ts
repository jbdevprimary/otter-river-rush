/**
 * Collectible entity (coins, gems, special items)
 */

import { GameObject } from './GameObject';
import type { Vector2D } from '@/types/Game.types';
import { CollectibleType } from '@/types/Game.types';
import { CONFIG } from '@/utils/Config';

export class Collectible extends GameObject {
  public type: CollectibleType;
  public value: number;
  public magnetized: boolean = false;
  private size: number;
  private color: string;
  private pulseTime: number = 0;
  private rotationSpeed: number;

  constructor(
    id: string,
    position: Vector2D,
    type: CollectibleType,
    _lane: number // Prefix with _ to indicate intentionally unused
  ) {
    const config =
      CONFIG.collectibles.types[
        type.toLowerCase() as keyof typeof CONFIG.collectibles.types
      ];

    super(id, position, {
      type: 'circle',
      radius: config.size / 2,
      offset: { x: 0, y: 0 },
    });

    this.type = type;
    this.value = config.value;
    this.size = config.size;
    this.color = config.color;
    this.rotationSpeed = Math.random() * 2 + 1;
  }

  /**
   * Update collectible
   */
  public update(deltaTime: number): void {
    if (!this.active) return;

    // Pulse animation
    this.pulseTime += deltaTime * 0.003;

    // Rotation
    this.transform.rotation += this.rotationSpeed * deltaTime * 0.001;

    // Apply velocity
    this.applyVelocity(deltaTime * 0.1);
  }

  /**
   * Render collectible
   */
  public render(ctx: CanvasRenderingContext2D): void {
    if (!this.active) return;

    ctx.save();

    // Translate to position
    ctx.translate(this.transform.position.x, this.transform.position.y);

    // Apply rotation
    ctx.rotate(this.transform.rotation);

    // Pulse effect
    const pulse = 1 + Math.sin(this.pulseTime) * 0.1;
    const renderSize = this.size * pulse;

    // Draw shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    // Draw collectible based on type
    switch (this.type) {
      case CollectibleType.COIN:
        this.renderCoin(ctx, renderSize);
        break;
      case CollectibleType.GEM:
        this.renderGem(ctx, renderSize);
        break;
      case CollectibleType.SPECIAL:
        this.renderSpecial(ctx, renderSize);
        break;
    }

    ctx.restore();

    // Debug: Draw collision circle (only in development builds)
    const isDev =
      typeof window !== 'undefined' && window.location.hostname === 'localhost';
    if (isDev) {
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
      ctx.beginPath();
      ctx.arc(
        this.transform.position.x,
        this.transform.position.y,
        this.collider?.radius || 0,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }
  }

  /**
   * Render coin
   */
  private renderCoin(ctx: CanvasRenderingContext2D, size: number): void {
    // Outer circle
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size / 2);
    gradient.addColorStop(0, '#fef3c7');
    gradient.addColorStop(0.7, this.color);
    gradient.addColorStop(1, '#ca8a04');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
    ctx.fill();

    // Inner circle
    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.arc(0, 0, size / 3, 0, Math.PI * 2);
    ctx.fill();

    // Shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(-size / 6, -size / 6, size / 6, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Render gem
   */
  private renderGem(ctx: CanvasRenderingContext2D, size: number): void {
    // Diamond shape
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size / 2);
    gradient.addColorStop(0, '#dbeafe');
    gradient.addColorStop(0.5, this.color);
    gradient.addColorStop(1, '#1e3a8a');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(0, -size / 2);
    ctx.lineTo(size / 3, 0);
    ctx.lineTo(0, size / 2);
    ctx.lineTo(-size / 3, 0);
    ctx.closePath();
    ctx.fill();

    // Facets
    ctx.strokeStyle = '#bfdbfe';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -size / 2);
    ctx.lineTo(0, size / 2);
    ctx.moveTo(-size / 3, 0);
    ctx.lineTo(size / 3, 0);
    ctx.stroke();

    // Sparkle
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(-size / 6, -size / 6, size / 8, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Render special item
   */
  private renderSpecial(ctx: CanvasRenderingContext2D, size: number): void {
    // Star shape
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size / 2);
    gradient.addColorStop(0, '#fae8ff');
    gradient.addColorStop(0.5, this.color);
    gradient.addColorStop(1, '#701a75');

    ctx.fillStyle = gradient;

    const spikes = 5;
    const outerRadius = size / 2;
    const innerRadius = size / 4;

    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (Math.PI * i) / spikes;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.fill();

    // Glow effect
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  /**
   * Move towards target (magnetized)
   */
  public moveTowards(
    target: Vector2D,
    speed: number,
    _deltaTime: number
  ): void {
    const dx = target.x - this.transform.position.x;
    const dy = target.y - this.transform.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      this.transform.velocity.x = (dx / distance) * speed;
      this.transform.velocity.y = (dy / distance) * speed;
    }
  }

  /**
   * Get collectible info string
   */
  public getInfo(): string {
    return `${this.type} (${this.value})`;
  }

  /**
   * Factory method to create collectibles
   */
  public static create(
    id: string,
    position: Vector2D,
    type: CollectibleType,
    lane: number
  ): Collectible {
    return new Collectible(id, position, type, lane);
  }
}
