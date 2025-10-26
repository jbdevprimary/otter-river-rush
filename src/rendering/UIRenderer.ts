/**
 * UIRenderer - Renders HUD, menus, and UI elements on canvas
 */

import type { GameStats } from '@/types/Game.types';
import { GAME_CONFIG } from '@/game/constants';

export interface UIConfig {
  showFPS: boolean;
  showDebug: boolean;
}

export class UIRenderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private config: UIConfig;
  private fps: number = 60;
  private fpsFrames: number[] = [];
  private lastFpsUpdate: number = 0;

  constructor(canvas: HTMLCanvasElement, config: Partial<UIConfig> = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.config = {
      showFPS: config.showFPS ?? false,
      showDebug: config.showDebug ?? false,
    };
  }

  /**
   * Render the main HUD during gameplay
   */
  public renderHUD(stats: GameStats, powerUps: PowerUpStatus[]): void {
    this.renderScorePanel(stats);
    this.renderStatsBar(stats);
    this.renderPowerUpIndicators(powerUps);
    this.renderComboDisplay(stats);

    if (this.config.showFPS) {
      this.renderFPS();
    }
  }

  /**
   * Render score and distance in top-left
   */
  private renderScorePanel(stats: GameStats): void {
    const padding = 20;
    const panelWidth = 200;
    const panelHeight = 100;

    // Semi-transparent background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(padding, padding, panelWidth, panelHeight);

    // Border
    this.ctx.strokeStyle = '#60a5fa';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(padding, padding, panelWidth, panelHeight);

    // Score
    this.ctx.font = 'bold 24px Arial';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(
      `Score: ${Math.floor(stats.score)}`,
      padding + 10,
      padding + 35
    );

    // Distance
    this.ctx.font = '16px Arial';
    this.ctx.fillStyle = '#a0aec0';
    this.ctx.fillText(
      `Distance: ${Math.floor(stats.distance)}m`,
      padding + 10,
      padding + 60
    );

    // Multiplier if active
    if (stats.multiplier > 1) {
      this.ctx.font = 'bold 18px Arial';
      this.ctx.fillStyle = '#fbbf24';
      this.ctx.fillText(`x${stats.multiplier}`, padding + 10, padding + 85);
    }
  }

  /**
   * Render coins, gems, and stats bar in top-right
   */
  private renderStatsBar(stats: GameStats): void {
    const padding = 20;
    const rightX = this.canvas.width - padding - 180;
    const panelWidth = 180;
    const panelHeight = 100;

    // Semi-transparent background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(rightX, padding, panelWidth, panelHeight);

    // Border
    this.ctx.strokeStyle = '#34d399';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(rightX, padding, panelWidth, panelHeight);

    // Coins icon (circle)
    this.ctx.fillStyle = '#fbbf24';
    this.ctx.beginPath();
    this.ctx.arc(rightX + 20, padding + 30, 10, 0, Math.PI * 2);
    this.ctx.fill();

    // Coins count
    this.ctx.font = '20px Arial';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`${stats.coins}`, rightX + 40, padding + 37);

    // Gems icon (diamond shape)
    this.ctx.fillStyle = '#60a5fa';
    this.ctx.beginPath();
    this.ctx.moveTo(rightX + 20, padding + 55);
    this.ctx.lineTo(rightX + 25, padding + 60);
    this.ctx.lineTo(rightX + 20, padding + 65);
    this.ctx.lineTo(rightX + 15, padding + 60);
    this.ctx.closePath();
    this.ctx.fill();

    // Gems count
    this.ctx.fillText(`${stats.gems}`, rightX + 40, padding + 65);

    // Obstacles avoided
    this.ctx.font = '14px Arial';
    this.ctx.fillStyle = '#a0aec0';
    this.ctx.fillText(
      `Dodged: ${stats.obstaclesAvoided}`,
      rightX + 10,
      padding + 90
    );
  }

  /**
   * Render combo display in center when active
   */
  private renderComboDisplay(stats: GameStats): void {
    if (stats.combo <= 1) return;

    const centerX = this.canvas.width / 2;
    const topY = 120;

    // Combo text with scale effect
    const scale = 1 + Math.sin(Date.now() / 100) * 0.1;
    this.ctx.save();
    this.ctx.translate(centerX, topY);
    this.ctx.scale(scale, scale);

    // Shadow for emphasis
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    this.ctx.shadowBlur = 10;

    this.ctx.font = 'bold 48px Arial';
    this.ctx.fillStyle = '#fbbf24';
    this.ctx.textAlign = 'center';
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 3;
    this.ctx.strokeText(`${stats.combo}x COMBO!`, 0, 0);
    this.ctx.fillText(`${stats.combo}x COMBO!`, 0, 0);

    this.ctx.restore();
  }

  /**
   * Render active power-up indicators at bottom
   */
  private renderPowerUpIndicators(powerUps: PowerUpStatus[]): void {
    const bottomY = this.canvas.height - 60;
    const centerX = this.canvas.width / 2;
    const iconSize = 50;
    const spacing = 70;

    powerUps.forEach((powerUp, index) => {
      if (!powerUp.active) return;

      const x = centerX - (powerUps.length * spacing) / 2 + index * spacing;

      // Background circle
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      this.ctx.beginPath();
      this.ctx.arc(x, bottomY, iconSize / 2, 0, Math.PI * 2);
      this.ctx.fill();

      // Power-up icon color
      this.ctx.fillStyle = this.getPowerUpColor(powerUp.type);
      this.ctx.beginPath();
      this.ctx.arc(x, bottomY, iconSize / 2 - 5, 0, Math.PI * 2);
      this.ctx.fill();

      // Power-up symbol
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 20px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(this.getPowerUpSymbol(powerUp.type), x, bottomY);

      // Timer arc
      if (powerUp.duration > 0) {
        const progress = powerUp.timeLeft / powerUp.duration;
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(
          x,
          bottomY,
          iconSize / 2 + 3,
          -Math.PI / 2,
          -Math.PI / 2 + progress * Math.PI * 2
        );
        this.ctx.stroke();
      }
    });
  }

  /**
   * Render FPS counter
   */
  private renderFPS(): void {
    const now = performance.now();
    this.fpsFrames.push(now);

    // Keep only last second of frames
    while (this.fpsFrames.length > 0 && this.fpsFrames[0] < now - 1000) {
      this.fpsFrames.shift();
    }

    // Update FPS display every 500ms
    if (now - this.lastFpsUpdate > 500) {
      this.fps = this.fpsFrames.length;
      this.lastFpsUpdate = now;
    }

    // Render FPS
    this.ctx.font = '16px monospace';
    this.ctx.fillStyle = this.fps < 30 ? '#ef4444' : '#34d399';
    this.ctx.textAlign = 'right';
    this.ctx.fillText(
      `FPS: ${this.fps}`,
      this.canvas.width - 10,
      this.canvas.height - 10
    );
  }

  /**
   * Render achievement unlock notification
   */
  public renderAchievementUnlock(
    name: string,
    description: string,
    icon: string
  ): void {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const width = 400;
    const height = 150;

    // Background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    this.ctx.fillRect(centerX - width / 2, centerY - height / 2, width, height);

    // Border with glow
    this.ctx.shadowColor = '#fbbf24';
    this.ctx.shadowBlur = 20;
    this.ctx.strokeStyle = '#fbbf24';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(
      centerX - width / 2,
      centerY - height / 2,
      width,
      height
    );
    this.ctx.shadowBlur = 0;

    // Achievement unlocked text
    this.ctx.font = 'bold 24px Arial';
    this.ctx.fillStyle = '#fbbf24';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Achievement Unlocked!', centerX, centerY - 40);

    // Icon
    this.ctx.font = '40px Arial';
    this.ctx.fillText(icon, centerX, centerY + 10);

    // Name
    this.ctx.font = 'bold 20px Arial';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText(name, centerX, centerY + 40);

    // Description
    this.ctx.font = '14px Arial';
    this.ctx.fillStyle = '#a0aec0';
    this.ctx.fillText(description, centerX, centerY + 60);
  }

  /**
   * Render biome transition notification
   */
  public renderBiomeTransition(biomeName: string): void {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 3;

    this.ctx.save();
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    this.ctx.shadowBlur = 20;

    this.ctx.font = 'bold 48px Arial';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.textAlign = 'center';
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 4;
    this.ctx.strokeText(`Entering ${biomeName}`, centerX, centerY);
    this.ctx.fillText(`Entering ${biomeName}`, centerX, centerY);

    this.ctx.restore();
  }

  /**
   * Render time trial countdown timer with color coding for urgency (red when ≤10 seconds)
   */
  public renderTimeTrialTimer(timeLeft: number): void {
    const secondsLeft = Math.ceil(timeLeft / 1000);

    this.ctx.save();
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = secondsLeft <= 10 ? '#ef4444' : '#fbbf24';
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 4;
    this.ctx.strokeText(`${secondsLeft}s`, GAME_CONFIG.CANVAS_WIDTH / 2, 80);
    this.ctx.fillText(`${secondsLeft}s`, GAME_CONFIG.CANVAS_WIDTH / 2, 80);
    this.ctx.restore();
  }

  /**
   * Render mini map (optional debug view)
   */
  public renderMiniMap(
    playerLane: number,
    obstacles: Array<{ lane: number; y: number }>
  ): void {
    if (!this.config.showDebug) return;

    const mapWidth = 100;
    const mapHeight = 150;
    const x = 10;
    const y = this.canvas.height - mapHeight - 10;
    const laneWidth = mapWidth / GAME_CONFIG.LANE_COUNT;

    // Background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(x, y, mapWidth, mapHeight);

    // Lanes
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i <= GAME_CONFIG.LANE_COUNT; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(x + i * laneWidth, y);
      this.ctx.lineTo(x + i * laneWidth, y + mapHeight);
      this.ctx.stroke();
    }

    // Player
    this.ctx.fillStyle = '#34d399';
    this.ctx.fillRect(
      x + playerLane * laneWidth,
      y + mapHeight - 10,
      laneWidth,
      10
    );

    // Obstacles
    this.ctx.fillStyle = '#ef4444';
    obstacles.forEach((obs) => {
      const normalizedY = (obs.y / this.canvas.height) * mapHeight;
      this.ctx.fillRect(
        x + obs.lane * laneWidth,
        y + normalizedY,
        laneWidth,
        5
      );
    });
  }

  /**
   * Helper: Get power-up color
   */
  private getPowerUpColor(type: string): string {
    switch (type) {
      case 'SHIELD':
        return '#60a5fa';
      case 'CONTROL_BOOST':
        return '#fbbf24';
      case 'SCORE_MULTIPLIER':
        return '#34d399';
      case 'MAGNET':
        return '#a855f7';
      case 'SLOW_MOTION':
        return '#ec4899';
      default:
        return '#ffffff';
    }
  }

  /**
   * Helper: Get power-up symbol
   */
  private getPowerUpSymbol(type: string): string {
    switch (type) {
      case 'SHIELD':
        return '🛡';
      case 'CONTROL_BOOST':
        return '⚡';
      case 'SCORE_MULTIPLIER':
        return '×2';
      case 'MAGNET':
        return '🧲';
      case 'SLOW_MOTION':
        return '⏱';
      default:
        return '?';
    }
  }

  /**
   * Toggle FPS display
   */
  public setShowFPS(show: boolean): void {
    this.config.showFPS = show;
  }

  /**
   * Toggle debug display
   */
  public setShowDebug(show: boolean): void {
    this.config.showDebug = show;
  }
}

export interface PowerUpStatus {
  type: string;
  active: boolean;
  duration: number;
  timeLeft: number;
}
