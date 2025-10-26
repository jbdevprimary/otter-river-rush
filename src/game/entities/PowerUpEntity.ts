/**
 * Enhanced PowerUp entity with multiple types and effects
 */

import { GameObject } from './GameObject';
import type { Vector2D } from '@/types/Game.types';
import { PowerUpType } from '@/types/Game.types';
import { CONFIG } from '@/utils/Config';

export class PowerUpEntity extends GameObject {
  public type: PowerUpType;
  public duration: number;
  public effect: number;
  private size: number = 40;
  private color: string;
  private pulseTime: number = 0;
  private rotationSpeed: number;
  private particles: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
  }[] = [];

  constructor(id: string, position: Vector2D, type: PowerUpType) {
    super(id, position, {
      type: 'circle',
      radius: 20,
      offset: { x: 0, y: 0 },
    });

    this.type = type;
    const config = CONFIG.powerUps.types[type];
    this.duration = config.duration;
    this.effect = config.effect;
    this.color = config.color;
    this.rotationSpeed = Math.random() * 3 + 2;

    // Initialize particles
    for (let i = 0; i < 8; i++) {
      this.particles.push(this.createParticle());
    }
  }

  /**
   * Create particle for effect
   */
  private createParticle(): {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
  } {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 2 + 1;
    return {
      x: 0,
      y: 0,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: Math.random(),
    };
  }

  /**
   * Update power-up
   */
  public update(deltaTime: number): void {
    if (!this.active) return;

    // Pulse animation
    this.pulseTime += deltaTime * 0.005;

    // Rotation
    this.transform.rotation += this.rotationSpeed * deltaTime * 0.001;

    // Update particles
    this.particles.forEach((particle) => {
      particle.x += particle.vx * deltaTime * 0.05;
      particle.y += particle.vy * deltaTime * 0.05;
      particle.life -= deltaTime * 0.001;

      if (particle.life <= 0) {
        Object.assign(particle, this.createParticle());
      }
    });

    // Apply velocity
    this.applyVelocity(deltaTime * 0.1);
  }

  /**
   * Render power-up
   */
  public render(ctx: CanvasRenderingContext2D): void {
    if (!this.active) return;

    ctx.save();

    // Render particles
    this.particles.forEach((particle) => {
      const alpha = particle.life * 0.5;
      ctx.fillStyle = `${this.color}${Math.floor(alpha * 255)
        .toString(16)
        .padStart(2, '0')}`;
      ctx.beginPath();
      ctx.arc(
        this.transform.position.x + particle.x,
        this.transform.position.y + particle.y,
        3,
        0,
        Math.PI * 2
      );
      ctx.fill();
    });

    // Translate to position
    ctx.translate(this.transform.position.x, this.transform.position.y);

    // Apply rotation
    ctx.rotate(this.transform.rotation);

    // Pulse effect
    const pulse = 1 + Math.sin(this.pulseTime) * 0.15;
    const renderSize = this.size * pulse;

    // Glow effect
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 20;

    // Draw power-up based on type
    switch (this.type) {
      case PowerUpType.SHIELD:
        this.renderShield(ctx, renderSize);
        break;
      case PowerUpType.MAGNET:
        this.renderMagnet(ctx, renderSize);
        break;
      case PowerUpType.SLOW_MOTION:
        this.renderSlowMotion(ctx, renderSize);
        break;
      case PowerUpType.GHOST:
        this.renderGhost(ctx, renderSize);
        break;
      case PowerUpType.MULTIPLIER:
        this.renderMultiplier(ctx, renderSize);
        break;
    }

    ctx.restore();
  }

  /**
   * Render shield power-up
   */
  private renderShield(ctx: CanvasRenderingContext2D, size: number): void {
    // Shield shape
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size / 2);
    gradient.addColorStop(0, '#bfdbfe');
    gradient.addColorStop(0.7, this.color);
    gradient.addColorStop(1, '#1e3a8a');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(0, -size / 2);
    ctx.quadraticCurveTo(size / 2, -size / 4, size / 2, size / 4);
    ctx.quadraticCurveTo(size / 2, size / 2, 0, size / 1.5);
    ctx.quadraticCurveTo(-size / 2, size / 2, -size / 2, size / 4);
    ctx.quadraticCurveTo(-size / 2, -size / 4, 0, -size / 2);
    ctx.closePath();
    ctx.fill();

    // Shield detail
    ctx.strokeStyle = '#dbeafe';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  /**
   * Render magnet power-up
   */
  private renderMagnet(ctx: CanvasRenderingContext2D, size: number): void {
    const gradient = ctx.createLinearGradient(-size / 2, 0, size / 2, 0);
    gradient.addColorStop(0, '#fee2e2');
    gradient.addColorStop(0.5, this.color);
    gradient.addColorStop(1, '#fee2e2');

    ctx.fillStyle = gradient;
    ctx.strokeStyle = '#7f1d1d';
    ctx.lineWidth = 3;

    // Draw U-shape magnet
    ctx.beginPath();
    ctx.moveTo(-size / 3, -size / 2);
    ctx.lineTo(-size / 3, size / 4);
    ctx.quadraticCurveTo(-size / 3, size / 2, 0, size / 2);
    ctx.quadraticCurveTo(size / 3, size / 2, size / 3, size / 4);
    ctx.lineTo(size / 3, -size / 2);
    ctx.stroke();

    // End caps
    ctx.fillRect(-size / 2, -size / 2, size / 3, size / 6);
    ctx.fillRect(size / 6, -size / 2, size / 3, size / 6);
  }

  /**
   * Render slow motion power-up
   */
  private renderSlowMotion(ctx: CanvasRenderingContext2D, size: number): void {
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size / 2);
    gradient.addColorStop(0, '#f3e8ff');
    gradient.addColorStop(0.7, this.color);
    gradient.addColorStop(1, '#581c87');

    // Clock circle
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
    ctx.fill();

    // Clock hands
    ctx.strokeStyle = '#f3e8ff';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    // Hour hand
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -size / 4);
    ctx.stroke();

    // Minute hand
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(size / 4, 0);
    ctx.stroke();

    // Center dot
    ctx.fillStyle = '#f3e8ff';
    ctx.beginPath();
    ctx.arc(0, 0, size / 10, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Render ghost power-up
   */
  private renderGhost(ctx: CanvasRenderingContext2D, size: number): void {
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size / 2);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.7, this.color);
    gradient.addColorStop(1, 'rgba(6, 182, 212, 0.3)');

    ctx.fillStyle = gradient;

    // Ghost shape
    ctx.beginPath();
    ctx.arc(0, -size / 6, size / 3, Math.PI, 0);
    ctx.lineTo(size / 3, size / 3);
    ctx.lineTo(size / 6, size / 6);
    ctx.lineTo(0, size / 3);
    ctx.lineTo(-size / 6, size / 6);
    ctx.lineTo(-size / 3, size / 3);
    ctx.closePath();
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#0e7490';
    ctx.beginPath();
    ctx.arc(-size / 6, -size / 8, size / 12, 0, Math.PI * 2);
    ctx.arc(size / 6, -size / 8, size / 12, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Render multiplier power-up
   */
  private renderMultiplier(ctx: CanvasRenderingContext2D, size: number): void {
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size / 2);
    gradient.addColorStop(0, '#fef3c7');
    gradient.addColorStop(0.7, this.color);
    gradient.addColorStop(1, '#78350f');

    // Star burst
    const spikes = 8;
    ctx.fillStyle = gradient;
    ctx.beginPath();

    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? size / 2 : size / 4;
      const angle = (Math.PI * i) / spikes - Math.PI / 2;
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

    // 2x text
    ctx.fillStyle = '#78350f';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('2x', 0, 0);
  }

  /**
   * Get power-up info string
   */
  public getInfo(): string {
    return `${this.type} (${this.duration}ms)`;
  }

  /**
   * Factory method to create power-ups
   */
  public static create(
    id: string,
    position: Vector2D,
    type: PowerUpType
  ): PowerUpEntity {
    return new PowerUpEntity(id, position, type);
  }
}
