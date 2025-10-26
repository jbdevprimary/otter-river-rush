/**
 * BackgroundGenerator - Creates dynamic backgrounds with biome transitions
 */

export enum Biome {
  FOREST = 'FOREST',
  MOUNTAIN = 'MOUNTAIN',
  CANYON = 'CANYON',
  RAPIDS = 'RAPIDS',
}

interface BiomeConfig {
  name: string;
  waterColors: {
    top: string;
    middle: string;
    bottom: string;
  };
  skyColors: {
    top: string;
    bottom: string;
  };
  accentColor: string;
  particleColor: string;
  fogDensity: number;
}

export class BackgroundGenerator {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private currentBiome: Biome = Biome.FOREST;
  private biomeTransitionProgress: number = 0;
  private distance: number = 0;
  private parallaxOffset: number = 0;
  private waveOffset: number = 0;

  private readonly BIOME_DISTANCE = 1000; // Change biome every 1000 distance
  private readonly biomeOrder: Biome[] = [
    Biome.FOREST,
    Biome.MOUNTAIN,
    Biome.CANYON,
    Biome.RAPIDS,
  ];

  private readonly biomeConfigs: Record<Biome, BiomeConfig> = {
    [Biome.FOREST]: {
      name: 'Peaceful Forest',
      waterColors: {
        top: '#2563eb',
        middle: '#3b82f6',
        bottom: '#60a5fa',
      },
      skyColors: {
        top: '#1e3a8a',
        bottom: '#3b82f6',
      },
      accentColor: '#22c55e',
      particleColor: '#86efac',
      fogDensity: 0.1,
    },
    [Biome.MOUNTAIN]: {
      name: 'Mountain Rapids',
      waterColors: {
        top: '#1e40af',
        middle: '#2563eb',
        bottom: '#3b82f6',
      },
      skyColors: {
        top: '#0c4a6e',
        bottom: '#0369a1',
      },
      accentColor: '#cbd5e1',
      particleColor: '#f1f5f9',
      fogDensity: 0.2,
    },
    [Biome.CANYON]: {
      name: 'Desert Canyon',
      waterColors: {
        top: '#0369a1',
        middle: '#0891b2',
        bottom: '#06b6d4',
      },
      skyColors: {
        top: '#ea580c',
        bottom: '#f97316',
      },
      accentColor: '#f97316',
      particleColor: '#fed7aa',
      fogDensity: 0.15,
    },
    [Biome.RAPIDS]: {
      name: 'Raging Rapids',
      waterColors: {
        top: '#0e7490',
        middle: '#06b6d4',
        bottom: '#22d3ee',
      },
      skyColors: {
        top: '#334155',
        bottom: '#475569',
      },
      accentColor: '#f0f9ff',
      particleColor: '#f0f9ff',
      fogDensity: 0.25,
    },
  };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
  }

  /**
   * Update background state
   */
  public update(
    deltaTime: number,
    scrollSpeed: number,
    currentDistance: number
  ): void {
    this.distance = currentDistance;
    this.parallaxOffset += scrollSpeed * deltaTime;
    this.waveOffset += deltaTime * 2;

    // Update biome based on distance
    const biomeIndex =
      Math.floor(this.distance / this.BIOME_DISTANCE) % this.biomeOrder.length;
    const nextBiome = this.biomeOrder[biomeIndex];

    if (nextBiome !== this.currentBiome) {
      this.currentBiome = nextBiome;
      this.biomeTransitionProgress = 0;
    }

    // Smooth transition progress
    if (this.biomeTransitionProgress < 1) {
      this.biomeTransitionProgress += deltaTime * 0.5;
    }
  }

  /**
   * Render complete background
   */
  public render(): void {
    this.renderSky();
    this.renderWater();
    this.renderRiverBanks();
    this.renderFoliage();
    this.renderWaves();
    this.renderFog();
  }

  /**
   * Render sky gradient
   */
  private renderSky(): void {
    const config = this.biomeConfigs[this.currentBiome];

    // Safety check - fallback to FOREST if config is undefined
    if (!config) {
      console.warn(
        `Invalid biome: ${this.currentBiome}, falling back to FOREST`
      );
      this.currentBiome = Biome.FOREST;
      return this.renderSky();
    }

    const gradient = this.ctx.createLinearGradient(
      0,
      0,
      0,
      this.canvas.height * 0.4
    );
    gradient.addColorStop(0, config.skyColors.top);
    gradient.addColorStop(1, config.skyColors.bottom);

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height * 0.4);
  }

  /**
   * Render water with current and reflections
   */
  private renderWater(): void {
    const config = this.biomeConfigs[this.currentBiome];

    const gradient = this.ctx.createLinearGradient(
      0,
      this.canvas.height * 0.4,
      0,
      this.canvas.height
    );
    gradient.addColorStop(0, config.waterColors.top);
    gradient.addColorStop(0.5, config.waterColors.middle);
    gradient.addColorStop(1, config.waterColors.bottom);

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(
      0,
      this.canvas.height * 0.4,
      this.canvas.width,
      this.canvas.height * 0.6
    );

    // Water texture (flowing lines)
    this.ctx.strokeStyle = `${config.waterColors.top}40`;
    this.ctx.lineWidth = 2;

    for (let i = 0; i < 5; i++) {
      const y = this.canvas.height * 0.5 + i * 50;
      const offset =
        (this.parallaxOffset * (1 + i * 0.2)) % (this.canvas.width + 100);

      this.ctx.beginPath();
      this.ctx.moveTo(-100 + offset, y);
      for (let x = 0; x < this.canvas.width + 100; x += 20) {
        const waveY = y + Math.sin((x + this.waveOffset * 50) * 0.05) * 3;
        this.ctx.lineTo(x - 100 + offset, waveY);
      }
      this.ctx.stroke();
    }
  }

  /**
   * Render river banks/shores
   */
  private renderRiverBanks(): void {
    const config = this.biomeConfigs[this.currentBiome];

    // Left bank
    this.ctx.fillStyle = config.accentColor + '40';
    this.ctx.fillRect(0, 0, 50, this.canvas.height);

    // Right bank
    this.ctx.fillRect(this.canvas.width - 50, 0, 50, this.canvas.height);

    // Bank details (rocks/vegetation)
    this.ctx.fillStyle = config.accentColor + '60';
    const bankOffset = (this.parallaxOffset * 0.6) % 80;

    for (let y = -bankOffset; y < this.canvas.height; y += 80) {
      // Left bank details
      this.ctx.beginPath();
      this.ctx.arc(20, y, 8, 0, Math.PI * 2);
      this.ctx.fill();

      // Right bank details
      this.ctx.beginPath();
      this.ctx.arc(this.canvas.width - 20, y + 40, 8, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  /**
   * Render foliage/scenery based on biome
   */
  private renderFoliage(): void {
    const config = this.biomeConfigs[this.currentBiome];
    const foliageOffset = (this.parallaxOffset * 0.3) % 120;

    this.ctx.fillStyle = config.accentColor;

    switch (this.currentBiome) {
      case Biome.FOREST:
        // Trees
        for (let y = -foliageOffset; y < this.canvas.height; y += 120) {
          this.drawTree(10, y, config.accentColor);
          this.drawTree(this.canvas.width - 10, y + 60, config.accentColor);
        }
        break;

      case Biome.MOUNTAIN:
        // Mountain peaks in background
        this.ctx.fillStyle = config.accentColor + '40';
        for (let x = 0; x < this.canvas.width; x += 100) {
          const offset = Math.sin(x * 0.02) * 50;
          this.ctx.beginPath();
          this.ctx.moveTo(x, this.canvas.height * 0.4);
          this.ctx.lineTo(x + 50, this.canvas.height * 0.2 + offset);
          this.ctx.lineTo(x + 100, this.canvas.height * 0.4);
          this.ctx.fill();
        }
        break;

      case Biome.CANYON:
        // Canyon walls
        this.ctx.fillStyle = config.accentColor + '30';
        for (let y = 0; y < this.canvas.height; y += 60) {
          const layerOffset = (y + foliageOffset) % 60;
          this.ctx.fillRect(0, layerOffset, 60, 40);
          this.ctx.fillRect(this.canvas.width - 60, layerOffset + 30, 60, 40);
        }
        break;

      case Biome.RAPIDS:
        // Rocks in water
        this.ctx.fillStyle = '#64748b';
        for (let y = -foliageOffset; y < this.canvas.height; y += 150) {
          this.ctx.beginPath();
          this.ctx.arc(80, y, 12, 0, Math.PI * 2);
          this.ctx.arc(this.canvas.width - 80, y + 75, 12, 0, Math.PI * 2);
          this.ctx.fill();
        }
        break;
    }
  }

  /**
   * Render water waves/ripples
   */
  private renderWaves(): void {
    const config = this.biomeConfigs[this.currentBiome];
    const intensity = this.currentBiome === Biome.RAPIDS ? 2 : 1;

    this.ctx.strokeStyle = `${config.particleColor}30`;
    this.ctx.lineWidth = 2;

    for (let i = 0; i < 3 * intensity; i++) {
      const y = this.canvas.height * 0.5 + i * 80;
      const offset =
        (this.waveOffset * 30 + i * 20) % (this.canvas.width + 200);

      this.ctx.beginPath();
      for (let x = -100; x < this.canvas.width + 100; x += 10) {
        const wave =
          Math.sin((x + offset) * 0.03 + this.waveOffset) * 5 * intensity;
        if (x === -100) {
          this.ctx.moveTo(x, y + wave);
        } else {
          this.ctx.lineTo(x, y + wave);
        }
      }
      this.ctx.stroke();
    }
  }

  /**
   * Render atmospheric fog
   */
  private renderFog(): void {
    const config = this.biomeConfigs[this.currentBiome];

    if (config.fogDensity > 0) {
      this.ctx.fillStyle = `rgba(255, 255, 255, ${config.fogDensity * 0.3})`;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  /**
   * Helper: Draw a simple tree
   */
  private drawTree(x: number, y: number, color: string): void {
    // Trunk
    this.ctx.fillStyle = '#78350f';
    this.ctx.fillRect(x - 3, y - 10, 6, 20);

    // Foliage (triangle)
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y - 30);
    this.ctx.lineTo(x - 15, y - 10);
    this.ctx.lineTo(x + 15, y - 10);
    this.ctx.closePath();
    this.ctx.fill();
  }

  /**
   * Get current biome
   */
  public getCurrentBiome(): Biome {
    return this.currentBiome;
  }

  /**
   * Get biome name
   */
  public getBiomeName(): string {
    return this.biomeConfigs[this.currentBiome].name;
  }

  /**
   * Get biome progress (0-1)
   */
  public getBiomeProgress(): number {
    return (this.distance % this.BIOME_DISTANCE) / this.BIOME_DISTANCE;
  }

  /**
   * Check if biome just changed
   */
  public isNewBiome(): boolean {
    return this.biomeTransitionProgress < 0.1;
  }
}
