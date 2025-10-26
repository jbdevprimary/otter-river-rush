/**
 * Enhanced Procedural Generation System with patterns and biomes
 */

import type { BiomeType, DifficultyLevel } from '@/types/Game.types';
import { CONFIG } from '@/utils/Config';
import { Random } from '@/utils/Random';
import { DifficultyScaler } from '@/utils/DifficultyScaler';

interface ObstaclePattern {
  name: string;
  difficulty: number;
  generate: (lane: number, distance: number, random: Random) => ObstacleSpawn[];
}

interface ObstacleSpawn {
  lane: number;
  distance: number;
  type: string;
}

export class EnhancedProceduralGenerator {
  private random: Random;
  private difficultyScaler: DifficultyScaler;
  private currentDistance: number = 0;
  private currentBiome: BiomeType;
  private currentPattern: ObstaclePattern;
  private patternChangeTime: number = 0;
  private patterns: Map<string, ObstaclePattern>;

  constructor(seed?: number) {
    this.random = new Random(seed);
    this.difficultyScaler = new DifficultyScaler();
    this.currentBiome = 'FOREST' as BiomeType;
    this.patterns = this.initializePatterns();
    this.currentPattern = this.patterns.get('wave')!;
  }

  /**
   * Initialize obstacle patterns
   */
  private initializePatterns(): Map<string, ObstaclePattern> {
    const patterns = new Map<string, ObstaclePattern>();

    // Wave pattern - alternating lanes
    patterns.set('wave', {
      name: 'Wave',
      difficulty: 1,
      generate: (_lane, distance, random) => {
        const obstacles: ObstacleSpawn[] = [];
        const amplitude = 1;
        const frequency = 0.002;

        for (let i = 0; i < 5; i++) {
          const d = distance + i * 150;
          const offset = Math.floor(
            Math.sin(d * frequency) * amplitude + amplitude
          );
          const targetLane = offset % CONFIG.game.lanes;

          obstacles.push({
            lane: targetLane,
            distance: d,
            type: random.choice(CONFIG.obstacles.types).id,
          });
        }

        return obstacles;
      },
    });

    // Zigzag pattern - forces lane changes
    patterns.set('zigzag', {
      name: 'Zigzag',
      difficulty: 2,
      generate: (lane, distance, random) => {
        const obstacles: ObstacleSpawn[] = [];
        let currentLane = lane;

        for (let i = 0; i < 4; i++) {
          const d = distance + i * 200;

          // Block all but one lane
          for (let l = 0; l < CONFIG.game.lanes; l++) {
            if (l !== currentLane) {
              obstacles.push({
                lane: l,
                distance: d,
                type: random.choice(CONFIG.obstacles.types).id,
              });
            }
          }

          // Switch lane for next iteration
          currentLane = (currentLane + 1) % CONFIG.game.lanes;
        }

        return obstacles;
      },
    });

    // Gauntlet pattern - tight spacing, high difficulty
    patterns.set('gauntlet', {
      name: 'Gauntlet',
      difficulty: 3,
      generate: (_lane, distance, random) => {
        const obstacles: ObstacleSpawn[] = [];

        for (let i = 0; i < 8; i++) {
          const d = distance + i * 100;
          const blockedLanes = random.int(1, 2);

          for (let j = 0; j < blockedLanes; j++) {
            const targetLane = random.int(0, CONFIG.game.lanes - 1);
            obstacles.push({
              lane: targetLane,
              distance: d,
              type: random.choice(CONFIG.obstacles.types).id,
            });
          }
        }

        return obstacles;
      },
    });

    // Breather pattern - easy section
    patterns.set('breather', {
      name: 'Breather',
      difficulty: 0,
      generate: (lane, distance, random) => {
        const obstacles: ObstacleSpawn[] = [];

        // Sparse obstacles
        for (let i = 0; i < 2; i++) {
          const d = distance + i * 400;
          const targetLane = random.int(0, CONFIG.game.lanes - 1);

          if (targetLane !== lane) {
            obstacles.push({
              lane: targetLane,
              distance: d,
              type: CONFIG.obstacles.types[0].id,
            });
          }
        }

        return obstacles;
      },
    });

    return patterns;
  }

  /**
   * Update current biome based on distance
   */
  private updateBiome(): BiomeType {
    const distance = this.currentDistance;

    if (distance >= 3000) return 'RAPIDS' as BiomeType;
    if (distance >= 2000) return 'CANYON' as BiomeType;
    if (distance >= 1000) return 'MOUNTAIN' as BiomeType;
    return 'FOREST' as BiomeType;
  }

  /**
   * Select appropriate pattern based on difficulty
   */
  private selectPattern(): ObstaclePattern {
    const difficulty = this.difficultyScaler.getDifficultyLevel();
    const availablePatterns: ObstaclePattern[] = [];

    this.patterns.forEach((pattern) => {
      if (pattern.difficulty <= this.getNumericDifficulty(difficulty)) {
        availablePatterns.push(pattern);
      }
    });

    return this.random.choice(availablePatterns);
  }

  /**
   * Convert difficulty level to numeric value
   */
  private getNumericDifficulty(level: DifficultyLevel): number {
    switch (level) {
      case 'EASY' as DifficultyLevel:
        return 1;
      case 'NORMAL' as DifficultyLevel:
        return 2;
      case 'HARD' as DifficultyLevel:
        return 3;
      case 'EXPERT' as DifficultyLevel:
        return 4;
      default:
        return 2;
    }
  }

  /**
   * Generate obstacles for current state
   */
  public generateObstacles(
    currentLane: number,
    distance: number
  ): ObstacleSpawn[] {
    this.currentDistance = distance;

    // Update biome
    const newBiome = this.updateBiome();
    if (newBiome !== this.currentBiome) {
      this.currentBiome = newBiome;
    }

    // Check if should change pattern
    const now = Date.now();
    if (
      now - this.patternChangeTime >
      CONFIG.procedural.patternChangeInterval
    ) {
      this.currentPattern = this.selectPattern();
      this.patternChangeTime = now;
    }

    // Generate obstacles using current pattern
    // Note: currentLane is used by patterns internally
    const obstacles = this.currentPattern.generate(
      currentLane,
      distance,
      this.random
    );

    // Apply biome modifiers
    return this.applyBiomeModifiers(obstacles);
  }

  /**
   * Apply biome-specific modifiers to obstacles
   */
  private applyBiomeModifiers(obstacles: ObstacleSpawn[]): ObstacleSpawn[] {
    const biomeConfig = CONFIG.biomes.biomes[this.currentBiome];
    const densityMod = biomeConfig.obstacles.densityModifier;

    // Adjust density
    if (densityMod > 1 && obstacles.length > 0) {
      // Add more obstacles
      const additionalCount = Math.floor(obstacles.length * (densityMod - 1));

      for (let i = 0; i < additionalCount; i++) {
        const baseObstacle = this.random.choice(obstacles);
        obstacles.push({
          ...baseObstacle,
          distance: baseObstacle.distance + this.random.range(50, 150),
        });
      }
    }

    return obstacles;
  }

  /**
   * Get current biome
   */
  public getCurrentBiome(): BiomeType {
    return this.currentBiome;
  }

  /**
   * Get current pattern name
   */
  public getCurrentPattern(): string {
    return this.currentPattern.name;
  }

  /**
   * Get difficulty scaler
   */
  public getDifficultyScaler(): DifficultyScaler {
    return this.difficultyScaler;
  }

  /**
   * Get biome progress (0-1)
   */
  public getBiomeProgress(): number {
    const currentConfig = CONFIG.biomes.biomes[this.currentBiome];
    const nextBiome = this.getNextBiome();

    if (!nextBiome) return 1;

    const nextConfig = CONFIG.biomes.biomes[nextBiome];
    const progress =
      (this.currentDistance - currentConfig.minDistance) /
      (nextConfig.minDistance - currentConfig.minDistance);

    return Math.max(0, Math.min(1, progress));
  }

  /**
   * Get next biome
   */
  private getNextBiome(): BiomeType | null {
    const biomes: BiomeType[] = [
      'FOREST',
      'MOUNTAIN',
      'CANYON',
      'RAPIDS',
    ] as BiomeType[];
    const currentIndex = biomes.indexOf(this.currentBiome);

    if (currentIndex < biomes.length - 1) {
      return biomes[currentIndex + 1];
    }

    return null;
  }

  /**
   * Reset generator
   */
  public reset(seed?: number): void {
    if (seed !== undefined) {
      this.random.setSeed(seed);
    }
    this.currentDistance = 0;
    this.currentBiome = 'FOREST' as BiomeType;
    this.currentPattern = this.patterns.get('wave')!;
    this.patternChangeTime = 0;
    this.difficultyScaler.reset();
  }

  /**
   * Get seed for reproducible generation
   */
  public getSeed(): number {
    return this.random.getSeed();
  }
}
