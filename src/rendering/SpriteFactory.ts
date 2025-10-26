/**
 * SpriteFactory - Generates and caches sprite graphics programmatically
 * Creates visual sprites without external assets
 */

export class SpriteFactory {
  private cache: Map<string, HTMLCanvasElement> = new Map();
  private spriteSize: number = 64;

  constructor(spriteSize: number = 64) {
    this.spriteSize = spriteSize;
  }

  /**
   * Get or create otter sprite
   */
  public getOtterSprite(hasShield: boolean = false): HTMLCanvasElement {
    const key = `otter_${hasShield}`;
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    const canvas = document.createElement('canvas');
    canvas.width = this.spriteSize;
    canvas.height = this.spriteSize;
    const ctx = canvas.getContext('2d')!;

    // Body (brown oval)
    ctx.fillStyle = '#8b4513';
    ctx.beginPath();
    ctx.ellipse(32, 32, 24, 28, 0, 0, Math.PI * 2);
    ctx.fill();

    // Belly (lighter brown)
    ctx.fillStyle = '#d2691e';
    ctx.beginPath();
    ctx.ellipse(32, 36, 16, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#8b4513';
    ctx.beginPath();
    ctx.arc(32, 20, 14, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    ctx.beginPath();
    ctx.arc(24, 14, 6, 0, Math.PI * 2);
    ctx.arc(40, 14, 6, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(28, 18, 3, 0, Math.PI * 2);
    ctx.arc(36, 18, 3, 0, Math.PI * 2);
    ctx.fill();

    // Eye shine
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(29, 17, 1.5, 0, Math.PI * 2);
    ctx.arc(37, 17, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.fillStyle = '#654321';
    ctx.beginPath();
    ctx.arc(32, 22, 2, 0, Math.PI * 2);
    ctx.fill();

    // Whiskers
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    // Left whiskers
    ctx.beginPath();
    ctx.moveTo(20, 20);
    ctx.lineTo(12, 18);
    ctx.moveTo(20, 22);
    ctx.lineTo(10, 22);
    ctx.moveTo(20, 24);
    ctx.lineTo(12, 26);
    // Right whiskers
    ctx.moveTo(44, 20);
    ctx.lineTo(52, 18);
    ctx.moveTo(44, 22);
    ctx.lineTo(54, 22);
    ctx.moveTo(44, 24);
    ctx.lineTo(52, 26);
    ctx.stroke();

    // Paws
    ctx.fillStyle = '#654321';
    ctx.beginPath();
    ctx.ellipse(20, 50, 6, 8, 0.2, 0, Math.PI * 2);
    ctx.ellipse(44, 50, 6, 8, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Tail
    ctx.strokeStyle = '#8b4513';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(32, 56);
    ctx.quadraticCurveTo(28, 60, 32, 62);
    ctx.stroke();

    // Shield if active
    if (hasShield) {
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 3;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(32, 32, 30, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    this.cache.set(key, canvas);
    return canvas;
  }

  /**
   * Get or create rock sprite with variation
   */
  public getRockSprite(variant: number = 0): HTMLCanvasElement {
    const key = `rock_${variant}`;
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    const canvas = document.createElement('canvas');
    canvas.width = this.spriteSize * 0.7;
    canvas.height = this.spriteSize * 0.7;
    const ctx = canvas.getContext('2d')!;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const baseRadius = canvas.width / 2 - 5;

    // Create irregular rock shape
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    const points = 8;
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const radius = baseRadius * (0.8 + Math.random() * 0.4);
      const x = centerX + Math.cos(angle + variant) * radius;
      const y = centerY + Math.sin(angle + variant) * radius;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.fill();

    // Add texture/cracks
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(
        centerX + (Math.random() - 0.5) * baseRadius,
        centerY + (Math.random() - 0.5) * baseRadius
      );
      ctx.lineTo(
        centerX + (Math.random() - 0.5) * baseRadius,
        centerY + (Math.random() - 0.5) * baseRadius
      );
      ctx.stroke();
    }

    // Highlight
    const gradient = ctx.createRadialGradient(
      centerX - 5,
      centerY - 5,
      0,
      centerX,
      centerY,
      baseRadius
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
    ctx.fillStyle = gradient;
    ctx.fill();

    this.cache.set(key, canvas);
    return canvas;
  }

  /**
   * Get or create coin sprite
   */
  public getCoinSprite(animated: boolean = false): HTMLCanvasElement {
    const key = `coin_${animated ? 'anim' : 'static'}`;
    if (!animated && this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    const canvas = document.createElement('canvas');
    const size = this.spriteSize * 0.5;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 4;

    // Outer ring (gold)
    const gradient = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      radius
    );
    gradient.addColorStop(0, '#ffd700');
    gradient.addColorStop(0.7, '#fbbf24');
    gradient.addColorStop(1, '#d97706');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    // Inner circle (shine)
    ctx.fillStyle = '#fffacd';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.6, 0, Math.PI * 2);
    ctx.fill();

    // Symbol (dollar sign or star)
    ctx.fillStyle = '#d97706';
    ctx.font = `bold ${size * 0.5}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', centerX, centerY);

    // Sparkle effect
    if (animated) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(
        centerX - radius * 0.5,
        centerY - radius * 0.5,
        2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    if (!animated) {
      this.cache.set(key, canvas);
    }
    return canvas;
  }

  /**
   * Get or create gem sprite
   */
  public getGemSprite(color: string = 'blue'): HTMLCanvasElement {
    const key = `gem_${color}`;
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    const canvas = document.createElement('canvas');
    const size = this.spriteSize * 0.5;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    const centerX = size / 2;
    const centerY = size / 2;

    // Gem colors
    const colors: Record<string, string> = {
      blue: '#60a5fa',
      red: '#ef4444',
      green: '#34d399',
      purple: '#a855f7',
    };
    const gemColor = colors[color] || colors.blue;

    // Diamond shape
    ctx.fillStyle = gemColor;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - size * 0.4); // Top
    ctx.lineTo(centerX + size * 0.3, centerY); // Right
    ctx.lineTo(centerX, centerY + size * 0.4); // Bottom
    ctx.lineTo(centerX - size * 0.3, centerY); // Left
    ctx.closePath();
    ctx.fill();

    // Facets (lighter)
    ctx.fillStyle = `${gemColor}aa`;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - size * 0.4);
    ctx.lineTo(centerX, centerY);
    ctx.lineTo(centerX - size * 0.3, centerY);
    ctx.closePath();
    ctx.fill();

    // Highlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(centerX - size * 0.1, centerY - size * 0.3);
    ctx.lineTo(centerX, centerY - size * 0.35);
    ctx.lineTo(centerX + size * 0.05, centerY - size * 0.25);
    ctx.closePath();
    ctx.fill();

    this.cache.set(key, canvas);
    return canvas;
  }

  /**
   * Get or create power-up sprite
   */
  public getPowerUpSprite(type: string): HTMLCanvasElement {
    const key = `powerup_${type}`;
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    const canvas = document.createElement('canvas');
    const size = this.spriteSize * 0.6;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    const centerX = size / 2;
    const centerY = size / 2;

    // Background glow
    const gradient = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      size / 2
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.5, this.getPowerUpColor(type));
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Icon based on type
    ctx.fillStyle = this.getPowerUpColor(type);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;

    switch (type.toUpperCase()) {
      case 'SHIELD':
        // Shield icon
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - size * 0.3);
        ctx.quadraticCurveTo(
          centerX + size * 0.3,
          centerY - size * 0.3,
          centerX + size * 0.3,
          centerY
        );
        ctx.quadraticCurveTo(
          centerX + size * 0.3,
          centerY + size * 0.3,
          centerX,
          centerY + size * 0.4
        );
        ctx.quadraticCurveTo(
          centerX - size * 0.3,
          centerY + size * 0.3,
          centerX - size * 0.3,
          centerY
        );
        ctx.quadraticCurveTo(
          centerX - size * 0.3,
          centerY - size * 0.3,
          centerX,
          centerY - size * 0.3
        );
        ctx.fill();
        ctx.stroke();
        break;

      case 'CONTROL_BOOST':
      case 'SLOW_MOTION':
        // Lightning bolt
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - size * 0.3);
        ctx.lineTo(centerX - size * 0.1, centerY);
        ctx.lineTo(centerX + size * 0.1, centerY);
        ctx.lineTo(centerX, centerY + size * 0.3);
        ctx.lineTo(centerX + size * 0.2, centerY - size * 0.1);
        ctx.lineTo(centerX - size * 0.1, centerY - size * 0.1);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;

      case 'SCORE_MULTIPLIER':
        // Star
        this.drawStar(ctx, centerX, centerY, 5, size * 0.3, size * 0.15);
        ctx.fill();
        ctx.stroke();
        break;

      case 'MAGNET':
        // Horseshoe magnet
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(centerX, centerY, size * 0.25, 0, Math.PI, true);
        ctx.stroke();
        // Magnet ends
        ctx.fillRect(
          centerX - size * 0.3,
          centerY - size * 0.05,
          size * 0.1,
          size * 0.15
        );
        ctx.fillRect(
          centerX + size * 0.2,
          centerY - size * 0.05,
          size * 0.1,
          size * 0.15
        );
        break;
    }

    this.cache.set(key, canvas);
    return canvas;
  }

  /**
   * Helper: Draw star shape
   */
  private drawStar(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    spikes: number,
    outerRadius: number,
    innerRadius: number
  ): void {
    let rot = (Math.PI / 2) * 3;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);

    for (let i = 0; i < spikes; i++) {
      ctx.lineTo(
        cx + Math.cos(rot) * outerRadius,
        cy + Math.sin(rot) * outerRadius
      );
      rot += step;

      ctx.lineTo(
        cx + Math.cos(rot) * innerRadius,
        cy + Math.sin(rot) * innerRadius
      );
      rot += step;
    }

    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
  }

  /**
   * Helper: Get power-up color
   */
  private getPowerUpColor(type: string): string {
    switch (type.toUpperCase()) {
      case 'SHIELD':
        return '#60a5fa';
      case 'CONTROL_BOOST':
        return '#fbbf24';
      case 'SLOW_MOTION':
        return '#ec4899';
      case 'SCORE_MULTIPLIER':
        return '#34d399';
      case 'MAGNET':
        return '#a855f7';
      default:
        return '#ffffff';
    }
  }

  /**
   * Clear cache
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  public getCacheSize(): number {
    return this.cache.size;
  }
}
