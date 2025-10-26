/**
 * Score management system
 */

import type { GameStats } from '@/types/Game.types';
import { CONFIG } from '@/utils/Config';

export class ScoreManager {
  private stats: GameStats;
  private multiplierEndTime: number = 0;
  private comboEndTime: number = 0;

  constructor() {
    this.stats = this.createInitialStats();
  }

  /**
   * Create initial stats object
   */
  private createInitialStats(): GameStats {
    return {
      distance: 0,
      score: 0,
      coins: 0,
      gems: 0,
      multiplier: 1,
      combo: 0,
      powerUpsCollected: 0,
      obstaclesAvoided: 0,
      closeCallsCount: 0,
      gamesPlayed: 0,
      sessionTime: 0,
    };
  }

  /**
   * Update distance and score
   */
  public updateDistance(delta: number): void {
    this.stats.distance += delta;
    this.addScore(delta * CONFIG.scoring.distancePoints);
  }

  /**
   * Add score with multiplier
   */
  public addScore(points: number): void {
    this.stats.score += Math.floor(points * this.stats.multiplier);
  }

  /**
   * Collect coin
   */
  public collectCoin(): void {
    this.stats.coins++;
    this.addScore(CONFIG.scoring.coinValue);
    this.incrementCombo();
  }

  /**
   * Collect gem
   */
  public collectGem(): void {
    this.stats.gems++;
    this.addScore(CONFIG.scoring.gemValue);
    this.incrementCombo();
  }

  /**
   * Collect power-up
   */
  public collectPowerUp(): void {
    this.stats.powerUpsCollected++;
    this.addScore(CONFIG.scoring.powerUpBonus);
  }

  /**
   * Record obstacle avoided
   */
  public avoidObstacle(): void {
    this.stats.obstaclesAvoided++;
  }

  /**
   * Record close call
   */
  public recordCloseCall(): void {
    this.stats.closeCallsCount++;
    this.addScore(CONFIG.scoring.closeCallBonus);
    this.incrementCombo();
  }

  /**
   * Increment combo counter
   */
  private incrementCombo(): void {
    this.stats.combo++;
    this.comboEndTime = Date.now() + CONFIG.game.comboTimeout;

    // Add combo bonus
    const comboBonus = Math.floor(
      this.stats.combo * CONFIG.scoring.comboBonus * this.stats.multiplier
    );
    this.stats.score += comboBonus;
  }

  /**
   * Break combo
   */
  public breakCombo(): void {
    this.stats.combo = 0;
  }

  /**
   * Set score multiplier
   */
  public setMultiplier(value: number, duration: number): void {
    this.stats.multiplier = value;
    this.multiplierEndTime = Date.now() + duration;
  }

  /**
   * Update timers
   */
  public update(deltaTime: number): void {
    if (this.stats.sessionTime !== undefined) {
      this.stats.sessionTime += deltaTime;
    }

    const now = Date.now();

    // Check multiplier expiry
    if (this.multiplierEndTime > 0 && now >= this.multiplierEndTime) {
      this.stats.multiplier = 1;
      this.multiplierEndTime = 0;
    }

    // Check combo expiry
    if (this.comboEndTime > 0 && now >= this.comboEndTime) {
      this.breakCombo();
      this.comboEndTime = 0;
    }
  }

  /**
   * Get current stats
   */
  public getStats(): Readonly<GameStats> {
    return { ...this.stats };
  }

  /**
   * Get formatted distance
   */
  public getFormattedDistance(): string {
    return `${Math.floor(this.stats.distance)}m`;
  }

  /**
   * Get formatted score
   */
  public getFormattedScore(): string {
    return this.stats.score.toLocaleString();
  }

  /**
   * Get multiplier info
   */
  public getMultiplierInfo(): {
    value: number;
    active: boolean;
    timeLeft: number;
  } {
    const now = Date.now();
    const timeLeft = Math.max(0, this.multiplierEndTime - now);

    return {
      value: this.stats.multiplier,
      active: this.stats.multiplier > 1,
      timeLeft,
    };
  }

  /**
   * Get combo info
   */
  public getComboInfo(): { value: number; active: boolean; timeLeft: number } {
    const now = Date.now();
    const timeLeft = Math.max(0, this.comboEndTime - now);

    return {
      value: this.stats.combo,
      active: this.stats.combo > 0,
      timeLeft,
    };
  }

  /**
   * Calculate final score with bonuses
   */
  public calculateFinalScore(): number {
    let finalScore = this.stats.score;

    // Distance bonus
    finalScore += Math.floor(this.stats.distance / 10);

    // Collection bonus
    finalScore += this.stats.coins * 2;
    finalScore += this.stats.gems * 10;

    // Performance bonus
    if (this.stats.obstaclesAvoided > 100) {
      finalScore += 1000;
    }
    if (this.stats.closeCallsCount > 50) {
      finalScore += 500;
    }

    return finalScore;
  }

  /**
   * Reset score manager
   */
  public reset(): void {
    this.stats = this.createInitialStats();
    this.multiplierEndTime = 0;
    this.comboEndTime = 0;
  }

  /**
   * Export stats for saving
   */
  public exportStats(): GameStats {
    return { ...this.stats };
  }

  /**
   * Import stats from save
   */
  public importStats(stats: Partial<GameStats>): void {
    this.stats = { ...this.stats, ...stats };
  }
}
