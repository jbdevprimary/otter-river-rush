import { Otter } from '../game/Otter';
import { Rock } from '../game/Rock';
import { PowerUp } from '../game/PowerUp';
import { Coin } from '../game/Coin';
import { Gem } from '../game/Gem';
import { Particle } from '../game/Particle';
import { GAME_CONFIG, PowerUpType, GHOST_CONFIG } from '../game/constants';
import { spriteLoader } from './SpriteLoader';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private parallaxOffset: number = 0;
  private parallaxSpeed: number = 50;
  private spritesLoaded: boolean = false;
  private loadingProgress: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.canvas.width = GAME_CONFIG.CANVAS_WIDTH;
    this.canvas.height = GAME_CONFIG.CANVAS_HEIGHT;

    // Start loading sprites
    this.loadSprites();
  }

  private async loadSprites(): Promise<void> {
    try {
      // Loading game sprites...
      await spriteLoader.preloadAll();
      this.spritesLoaded = true;
      // All sprites loaded!
    } catch (error) {
      console.warn(
        '⚠️ Sprites failed to load, using fallback rectangles:',
        error
      );
      this.spritesLoaded = false;
    }
  }

  public areSpritesLoaded(): boolean {
    return this.spritesLoaded;
  }

  public getSpriteLoadingProgress(): number {
    return spriteLoader.getProgress();
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  update(deltaTime: number): void {
    this.parallaxOffset += this.parallaxSpeed * deltaTime;
    if (this.parallaxOffset > this.canvas.height) {
      this.parallaxOffset = 0;
    }
  }

  renderBackground(): void {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#1e3a8a');
    gradient.addColorStop(0.5, '#2563eb');
    gradient.addColorStop(1, '#3b82f6');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.renderParallaxLayer('#1e40af', 0.3, 20);
    this.renderParallaxLayer('#1d4ed8', 0.6, 40);
  }

  private renderParallaxLayer(
    color: string,
    speed: number,
    size: number
  ): void {
    this.ctx.fillStyle = color;
    const offset = (this.parallaxOffset * speed) % (size * 2);

    for (let y = -size * 2; y < this.canvas.height + size; y += size * 2) {
      for (let x = 0; x < this.canvas.width; x += size * 2) {
        this.ctx.globalAlpha = 0.3;
        this.ctx.fillRect(x, y + offset, size, size);
      }
    }
    this.ctx.globalAlpha = 1;
  }

  renderLanes(): void {
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([10, 10]);

    for (let i = 1; i < GAME_CONFIG.LANE_COUNT; i++) {
      const x = GAME_CONFIG.LANE_OFFSET + i * GAME_CONFIG.LANE_WIDTH;
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }
    this.ctx.setLineDash([]);
  }

  renderOtter(otter: Otter): void {
    const spriteWidth = otter.width;
    const spriteHeight = otter.height;

    // Apply ghost effect transparency if active
    if (otter.isGhost) {
      this.ctx.save();
      this.ctx.globalAlpha = GHOST_CONFIG.ALPHA;
    }

    // Use sprite if loaded, otherwise fallback to rectangle
    if (this.spritesLoaded) {
      const spriteName = otter.hasShield ? 'otter-shield.png' : 'otter.png';

      // Check if sprite exists, fallback to otter.png if shield sprite not found
      const sprite =
        spriteLoader.get(spriteName) || spriteLoader.get('otter.png');

      if (sprite) {
        spriteLoader.draw(
          this.ctx,
          spriteName,
          otter.x + spriteWidth / 2,
          otter.y + spriteHeight / 2,
          spriteWidth,
          spriteHeight
        );

        // Restore context if ghost effect was applied
        if (otter.isGhost) {
          this.ctx.restore();
        }
        return;
      }
    }

    // Fallback: Draw rectangle otter
    this.ctx.fillStyle = '#8b4513';
    this.ctx.fillRect(otter.x, otter.y, otter.width, otter.height);

    this.ctx.fillStyle = '#d2691e';
    this.ctx.fillRect(
      otter.x + 10,
      otter.y + 10,
      otter.width - 20,
      otter.height - 20
    );

    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(otter.x + 15, otter.y + 15, 8, 8);
    this.ctx.fillRect(otter.x + otter.width - 23, otter.y + 15, 8, 8);

    if (otter.hasShield) {
      this.ctx.strokeStyle = '#60a5fa';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(
        otter.x + otter.width / 2,
        otter.y + otter.height / 2,
        otter.width / 2 + 5,
        0,
        Math.PI * 2
      );
      this.ctx.stroke();
    }

    // Restore context if ghost effect was applied
    if (otter.isGhost) {
      this.ctx.restore();
    }
  }

  renderRock(rock: Rock): void {
    // Use sprite if loaded
    if (this.spritesLoaded) {
      // Randomly pick rock variation based on lane (deterministic)
      const rockVariant = (rock.lane % 3) + 1;
      const spriteName = `rock-${rockVariant}.png`;
      const sprite = spriteLoader.get(spriteName);

      if (sprite) {
        spriteLoader.draw(
          this.ctx,
          spriteName,
          rock.x + rock.width / 2,
          rock.y + rock.height / 2,
          rock.width,
          rock.height,
          {
            // Add slight rotation for variety
            rotation: rock.lane * 0.5,
          }
        );
        return;
      }
    }

    // Fallback: Draw rectangle rock
    this.ctx.fillStyle = '#64748b';
    this.ctx.fillRect(rock.x, rock.y, rock.width, rock.height);

    this.ctx.fillStyle = '#475569';
    this.ctx.fillRect(
      rock.x + 5,
      rock.y + 5,
      rock.width - 10,
      rock.height - 10
    );
  }

  renderPowerUp(powerUp: PowerUp): void {
    const centerX = powerUp.x + powerUp.width / 2;
    const centerY = powerUp.y + powerUp.height / 2;

    // Use sprite if loaded
    if (this.spritesLoaded) {
      let spriteName = '';
      switch (powerUp.type) {
        case PowerUpType.SHIELD:
          spriteName = 'powerup-shield.png';
          break;
        case PowerUpType.CONTROL_BOOST:
          spriteName = 'powerup-speed.png';
          break;
        case PowerUpType.SCORE_MULTIPLIER:
          spriteName = 'powerup-multiplier.png';
          break;
        case PowerUpType.MAGNET:
          spriteName = 'powerup-magnet.png';
          break;
        case PowerUpType.GHOST:
          spriteName = 'powerup-shield.png'; // Reuse shield for now
          break;
        case PowerUpType.SLOW_MOTION:
          spriteName = 'powerup-speed.png'; // Reuse speed for now
          break;
      }

      const sprite = spriteLoader.get(spriteName);
      if (sprite) {
        spriteLoader.draw(
          this.ctx,
          spriteName,
          centerX,
          centerY,
          powerUp.width,
          powerUp.height,
          {
            rotation: (Date.now() / 1000) * Math.PI,
          }
        );
        return;
      }
    }

    // Fallback: Draw rectangle with rotation
    this.ctx.save();
    this.ctx.translate(centerX, centerY);
    this.ctx.rotate((Date.now() / 1000) * Math.PI);
    this.ctx.translate(-centerX, -centerY);

    switch (powerUp.type) {
      case PowerUpType.SHIELD:
        this.ctx.fillStyle = '#60a5fa';
        break;
      case PowerUpType.CONTROL_BOOST:
        this.ctx.fillStyle = '#fbbf24';
        break;
      case PowerUpType.SCORE_MULTIPLIER:
        this.ctx.fillStyle = '#34d399';
        break;
      case PowerUpType.MAGNET:
        this.ctx.fillStyle = '#a855f7';
        break;
      case PowerUpType.GHOST:
        this.ctx.fillStyle = '#94a3b8';
        break;
      case PowerUpType.SLOW_MOTION:
        this.ctx.fillStyle = '#06b6d4';
        break;
    }

    this.ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);

    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    this.ctx.fillRect(
      powerUp.x + 5,
      powerUp.y + 5,
      powerUp.width - 10,
      powerUp.height - 10
    );

    this.ctx.restore();
  }

  renderCoin(coin: Coin): void {
    const centerX = coin.x + coin.width / 2;
    const centerY = coin.y + coin.height / 2;
    const floatY = centerY + Math.sin(coin['floatOffset'] || 0) * 3;

    // Use sprite if loaded
    if (this.spritesLoaded) {
      const sprite = spriteLoader.get('coin.png');
      if (sprite) {
        spriteLoader.draw(
          this.ctx,
          'coin.png',
          centerX,
          floatY,
          coin.width,
          coin.height,
          {
            rotation: (coin['rotation'] || 0) * 0.1,
          }
        );
        return;
      }
    }

    // Fallback: Draw circle with color
    this.ctx.save();
    this.ctx.fillStyle = coin.getColor();
    this.ctx.strokeStyle = '#fbbf24';
    this.ctx.lineWidth = 3;

    this.ctx.beginPath();
    this.ctx.arc(centerX, floatY, coin.width / 2, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();

    // Inner shine
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    this.ctx.beginPath();
    this.ctx.arc(centerX - 5, floatY - 5, coin.width / 4, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  renderGem(gem: Gem): void {
    const centerX = gem.x + gem.width / 2;
    const centerY = gem.y + gem.height / 2;
    const scale = 1 + Math.sin(gem['pulsePhase'] || 0) * 0.1;

    // Use sprite if loaded
    if (this.spritesLoaded) {
      let spriteName = 'gem-blue.png';
      if (gem.type === 'red') spriteName = 'gem-red.png';

      const sprite = spriteLoader.get(spriteName);
      if (sprite) {
        spriteLoader.draw(
          this.ctx,
          spriteName,
          centerX,
          centerY,
          gem.width * scale,
          gem.height * scale,
          {
            rotation: gem['rotation'] || 0,
          }
        );
        return;
      }
    }

    // Fallback: Draw diamond shape
    this.ctx.save();
    this.ctx.translate(centerX, centerY);
    this.ctx.rotate(gem['rotation'] || 0);
    this.ctx.scale(scale, scale);

    this.ctx.fillStyle = gem.getColor();
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 2;

    this.ctx.beginPath();
    this.ctx.moveTo(0, -gem.height / 2);
    this.ctx.lineTo(gem.width / 2, 0);
    this.ctx.lineTo(0, gem.height / 2);
    this.ctx.lineTo(-gem.width / 2, 0);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();

    // Sparkle effect
    const sparkleIntensity = gem.getSparkleIntensity();
    this.ctx.fillStyle = `rgba(255, 255, 255, ${sparkleIntensity * 0.6})`;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, gem.width / 4, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  renderCoins(coins: Coin[]): void {
    coins.forEach((coin) => {
      if (coin.active) {
        this.renderCoin(coin);
      }
    });
  }

  renderGems(gems: Gem[]): void {
    gems.forEach((gem) => {
      if (gem.active) {
        this.renderGem(gem);
      }
    });
  }

  renderParticle(particle: Particle): void {
    this.ctx.globalAlpha = particle.getAlpha();
    this.ctx.fillStyle = particle.color;
    this.ctx.fillRect(
      particle.x - particle.size / 2,
      particle.y - particle.size / 2,
      particle.size,
      particle.size
    );
    this.ctx.globalAlpha = 1;
  }

  renderRocks(rocks: Rock[]): void {
    rocks.forEach((rock) => {
      if (rock.active) {
        this.renderRock(rock);
      }
    });
  }

  renderPowerUps(powerUps: PowerUp[]): void {
    powerUps.forEach((powerUp) => {
      if (powerUp.active) {
        this.renderPowerUp(powerUp);
      }
    });
  }

  renderParticles(particles: Particle[]): void {
    particles.forEach((particle) => {
      if (particle.active) {
        this.renderParticle(particle);
      }
    });
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * Render loading screen while sprites are loading
   */
  renderLoadingScreen(): void {
    this.clear();

    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;

    // Background
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#1e3a8a');
    gradient.addColorStop(1, '#3b82f6');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Title
    this.ctx.font = 'bold 48px Arial';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('Otter River Rush', centerX, centerY - 80);

    // Loading text
    this.ctx.font = '24px Arial';
    this.ctx.fillStyle = '#a0aec0';
    this.ctx.fillText('Loading sprites...', centerX, centerY);

    // Progress bar
    const progress = this.getSpriteLoadingProgress();
    const barWidth = 300;
    const barHeight = 20;
    const barX = centerX - barWidth / 2;
    const barY = centerY + 40;

    // Bar background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    this.ctx.fillRect(barX, barY, barWidth, barHeight);

    // Bar progress
    this.ctx.fillStyle = '#34d399';
    this.ctx.fillRect(barX, barY, barWidth * progress, barHeight);

    // Bar border
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(barX, barY, barWidth, barHeight);

    // Percentage
    this.ctx.font = '16px Arial';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText(
      `${Math.round(progress * 100)}%`,
      centerX,
      barY + barHeight + 25
    );
  }
}
