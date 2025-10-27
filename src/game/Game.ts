import { Otter } from './Otter';
import { Particle } from './Particle';
import { PowerUp } from './PowerUp';
import { Coin, CoinType } from './Coin';
import { Gem, GemType } from './Gem';
import { ProceduralGenerator } from './ProceduralGenerator';
import { InputHandler } from './InputHandler';
import { Renderer } from '../rendering/Renderer';
import { UIRenderer, type PowerUpStatus } from '../rendering/UIRenderer';
import { BackgroundGenerator } from '../rendering/BackgroundGenerator';
import { ResponsiveCanvas } from '../rendering/ResponsiveCanvas';
import { ObjectPool } from '../utils/ObjectPool';
import {
  checkAABBCollision,
  randomRange,
  distance as calcDistance,
} from '../utils/math';
import { StorageManager, SaveData } from '../utils/StorageManager';
import { AchievementSystem } from './AchievementSystem';
import type { GameStats } from '@/types/Game.types';
import { AudioManager } from './AudioManager';
import { LeaderboardManager } from './managers/LeaderboardManager';
import { DailyChallenge } from './DailyChallenge';
import { SettingsManager } from './SettingsManager';
import { StatsTracker } from './StatsTracker';
import {
  GameState,
  GameMode,
  GAME_CONFIG,
  PARTICLE_CONFIG,
  PowerUpType,
  POWERUP_CONFIG,
  MAGNET_CONFIG,
  GHOST_CONFIG,
  SLOW_MOTION_CONFIG,
} from './constants';

export class Game {
  private renderer: Renderer;
  private uiRenderer: UIRenderer;
  private backgroundGenerator: BackgroundGenerator;
  private responsiveCanvas: ResponsiveCanvas;
  private otter: Otter;
  private generator: ProceduralGenerator;
  private inputHandler: InputHandler;
  private particlePool: ObjectPool<Particle>;
  private audioManager: AudioManager;
  private achievementSystem: AchievementSystem;

  private state: GameState = GameState.MENU;
  private gameMode: GameMode = GameMode.CLASSIC;
  private score: number = 0;
  private distance: number = 0;
  private coins: number = 0;
  private gems: number = 0;
  private combo: number = 0;
  private comboTimer: number = 0;
  private readonly COMBO_TIMEOUT = 2000; // 2 seconds per ARCHITECTURE.md line 643
  private scrollSpeed: number = GAME_CONFIG.SCROLL_SPEED;
  private baseScrollSpeed: number = GAME_CONFIG.SCROLL_SPEED;
  private difficulty: number = 0;
  private lastTime: number = 0;
  private difficultyTimer: number = 0;

  // Fixed timestep game loop (ARCHITECTURE.md specification)
  private accumulatedTime: number = 0;
  private readonly FIXED_TIMESTEP = 1000 / 60; // 16.67ms for 60 FPS

  // Power-up states
  private scoreMultiplier: number = 1;
  private scoreMultiplierEndTime: number = 0;
  private speedBoostEndTime: number = 0;
  private magnetEndTime: number = 0;
  private ghostEndTime: number = 0;
  private slowMotionEndTime: number = 0;

  // Stats
  private rocksAvoided: number = 0;
  private powerUpsCollected: number = 0;
  private nearMisses: number = 0;

  // Time Trial mode
  private timeTrialDuration: number = 60000; // 60 seconds
  private timeTrialStartTime: number = 0;
  private timeTrialTimeLeft: number = 60000;

  // Achievement popup queue
  private achievementQueue: Array<{ id: string; name: string }> = [];
  private showingAchievement: boolean = false;

  private saveData: SaveData;

  private scoreElement: HTMLElement;
  private startScreen: HTMLElement;
  private gameOverScreen: HTMLElement;
  private pauseScreen: HTMLElement;
  private classicButton: HTMLElement;
  private timeTrialButton: HTMLElement;
  private zenButton: HTMLElement;
  private dailyButton: HTMLElement;
  private restartButton: HTMLElement;
  private resumeButton: HTMLElement;
  private menuButton: HTMLElement;
  private quitButton: HTMLElement;
  private finalScoreElement: HTMLElement;
  private finalDistanceElement: HTMLElement;
  private finalCoinsElement: HTMLElement;
  private finalGemsElement: HTMLElement;
  private highScoreElement: HTMLElement;
  private achievementPopup: HTMLElement;
  private achievementName: HTMLElement;

  // New UI elements
  private leaderboardButton: HTMLElement;
  private statsButton: HTMLElement;
  private settingsButton: HTMLElement;
  private leaderboardScreen: HTMLElement;
  private statsScreen: HTMLElement;
  private settingsScreen: HTMLElement;
  private closeLeaderboard: HTMLElement;
  private closeStats: HTMLElement;
  private closeSettings: HTMLElement;
  private rankElement: HTMLElement;
  private dailyObjectiveElement: HTMLElement;

  // Game start time for tracking
  private gameStartTime: number = 0;
  
  // Tutorial zone invincibility (DESIGN.md line 511: first 30s cannot die)
  private readonly TUTORIAL_DURATION = 30000; // 30 seconds

  constructor(canvas: HTMLCanvasElement) {
    // Initialize ResponsiveCanvas first
    this.responsiveCanvas = new ResponsiveCanvas(canvas, {
      targetWidth: GAME_CONFIG.CANVAS_WIDTH,
      targetHeight: GAME_CONFIG.CANVAS_HEIGHT,
      scaleMode: 'fit',
    });

    this.renderer = new Renderer(canvas);
    this.uiRenderer = new UIRenderer(canvas, {
      showFPS: false,
      showDebug: false,
    });
    this.backgroundGenerator = new BackgroundGenerator(canvas);
    this.otter = new Otter();
    this.generator = new ProceduralGenerator();
    this.inputHandler = new InputHandler(canvas);
    this.audioManager = new AudioManager();

    this.particlePool = new ObjectPool(
      () => new Particle(),
      (particle) => particle.reset(),
      50
    );

    this.saveData = StorageManager.load() || StorageManager.getDefaultData();
    this.achievementSystem = new AchievementSystem(this.saveData.achievements);

    this.audioManager.setSoundEnabled(this.saveData.settings.soundEnabled);
    this.audioManager.setMusicEnabled(this.saveData.settings.musicEnabled);

    this.scoreElement = document.getElementById('score')!;
    this.startScreen = document.getElementById('startScreen')!;
    this.gameOverScreen = document.getElementById('gameOverScreen')!;
    this.pauseScreen = document.getElementById('pauseScreen')!;
    this.classicButton = document.getElementById('classicButton')!;
    this.timeTrialButton = document.getElementById('timeTrialButton')!;
    this.zenButton = document.getElementById('zenButton')!;
    this.dailyButton = document.getElementById('dailyButton')!;
    this.restartButton = document.getElementById('restartButton')!;
    this.resumeButton = document.getElementById('resumeButton')!;
    this.menuButton = document.getElementById('menuButton')!;
    this.quitButton = document.getElementById('quitButton')!;
    this.finalScoreElement = document.getElementById('finalScore')!;
    this.finalDistanceElement = document.getElementById('finalDistance')!;
    this.finalCoinsElement = document.getElementById('finalCoins')!;
    this.finalGemsElement = document.getElementById('finalGems')!;
    this.highScoreElement = document.getElementById('highScore')!;
    this.achievementPopup = document.getElementById('achievementPopup')!;
    this.achievementName = document.getElementById('achievementName')!;

    this.leaderboardButton = document.getElementById('leaderboardButton')!;
    this.statsButton = document.getElementById('statsButton')!;
    this.settingsButton = document.getElementById('settingsButton')!;
    this.leaderboardScreen = document.getElementById('leaderboardScreen')!;
    this.statsScreen = document.getElementById('statsScreen')!;
    this.settingsScreen = document.getElementById('settingsScreen')!;
    this.closeLeaderboard = document.getElementById('closeLeaderboard')!;
    this.closeStats = document.getElementById('closeStats')!;
    this.closeSettings = document.getElementById('closeSettings')!;
    this.rankElement = document.getElementById('rank')!;
    this.dailyObjectiveElement = document.getElementById('dailyObjective')!;

    this.setupInputHandlers();
    this.setupUIHandlers();
    this.setupSettingsHandlers();
    this.updateUI();
    this.updateDailyChallenge();
  }

  private setupInputHandlers(): void {
    this.inputHandler.onLeft(() => {
      if (this.state === GameState.PLAYING) {
        this.otter.moveLeft();
        this.audioManager.playSound('move');
      }
    });

    this.inputHandler.onRight(() => {
      if (this.state === GameState.PLAYING) {
        this.otter.moveRight();
        this.audioManager.playSound('move');
      }
    });

    this.inputHandler.onPause(() => {
      if (this.state === GameState.PLAYING) {
        this.pause();
      }
    });
  }

  private setupUIHandlers(): void {
    this.classicButton.addEventListener('click', () =>
      this.start(GameMode.CLASSIC)
    );
    this.timeTrialButton.addEventListener('click', () =>
      this.start(GameMode.TIME_TRIAL)
    );
    this.zenButton.addEventListener('click', () => this.start(GameMode.ZEN));
    this.dailyButton.addEventListener('click', () => {
      this.start(GameMode.DAILY_CHALLENGE);
    });
    this.restartButton.addEventListener('click', () => this.restart());
    this.resumeButton.addEventListener('click', () => this.resume());
    this.menuButton.addEventListener('click', () => this.returnToMenu());
    this.quitButton.addEventListener('click', () => this.returnToMenu());

    // New UI handlers
    this.leaderboardButton.addEventListener('click', () =>
      this.showLeaderboard()
    );
    this.statsButton.addEventListener('click', () => this.showStats());
    this.settingsButton.addEventListener('click', () => this.showSettings());
    this.closeLeaderboard.addEventListener('click', () =>
      this.hideLeaderboard()
    );
    this.closeStats.addEventListener('click', () => this.hideStats());
    this.closeSettings.addEventListener('click', () => this.hideSettings());

    // Leaderboard tabs
    document.querySelectorAll('.tab-button').forEach((button) => {
      button.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        document
          .querySelectorAll('.tab-button')
          .forEach((b) => b.classList.remove('active'));
        target.classList.add('active');
        const mode = target.getAttribute('data-mode');
        this.updateLeaderboardDisplay(mode || 'all');
      });
    });
  }

  private setupSettingsHandlers(): void {
    const settings = SettingsManager.load();

    // Sound toggle
    const soundToggle = document.getElementById(
      'soundToggle'
    ) as HTMLInputElement;
    soundToggle.checked = settings.soundEnabled;
    soundToggle.addEventListener('change', (e) => {
      const checked = (e.target as HTMLInputElement).checked;
      SettingsManager.updateSetting('soundEnabled', checked);
      this.audioManager.setSoundEnabled(checked);
    });

    // Music toggle
    const musicToggle = document.getElementById(
      'musicToggle'
    ) as HTMLInputElement;
    musicToggle.checked = settings.musicEnabled;
    musicToggle.addEventListener('change', (e) => {
      const checked = (e.target as HTMLInputElement).checked;
      SettingsManager.updateSetting('musicEnabled', checked);
      this.audioManager.setMusicEnabled(checked);
    });

    // Volume slider
    const volumeSlider = document.getElementById(
      'volumeSlider'
    ) as HTMLInputElement;
    volumeSlider.value = String(settings.volume * 100);
    volumeSlider.addEventListener('input', (e) => {
      const value = parseInt((e.target as HTMLInputElement).value) / 100;
      SettingsManager.updateSetting('volume', value);
      this.audioManager.setVolume(value);
    });

    // Difficulty select
    const difficultySelect = document.getElementById(
      'difficultySelect'
    ) as HTMLSelectElement;
    difficultySelect.value = settings.difficulty;
    difficultySelect.addEventListener('change', (e) => {
      const value = (e.target as HTMLSelectElement).value as
        | 'easy'
        | 'normal'
        | 'hard';
      SettingsManager.updateSetting('difficulty', value);
    });

    // Particles select
    const particlesSelect = document.getElementById(
      'particlesSelect'
    ) as HTMLSelectElement;
    particlesSelect.value = settings.particles;
    particlesSelect.addEventListener('change', (e) => {
      const value = (e.target as HTMLSelectElement).value as
        | 'low'
        | 'normal'
        | 'high';
      SettingsManager.updateSetting('particles', value);
    });

    // Screen shake toggle
    const shakeToggle = document.getElementById(
      'screenShakeToggle'
    ) as HTMLInputElement;
    shakeToggle.checked = settings.screenShake;
    shakeToggle.addEventListener('change', (e) => {
      const checked = (e.target as HTMLInputElement).checked;
      SettingsManager.updateSetting('screenShake', checked);
    });

    // Reduced motion toggle
    const motionToggle = document.getElementById(
      'reducedMotionToggle'
    ) as HTMLInputElement;
    motionToggle.checked = settings.reducedMotion;
    motionToggle.addEventListener('change', (e) => {
      const checked = (e.target as HTMLInputElement).checked;
      SettingsManager.updateSetting('reducedMotion', checked);
    });

    // Color blind select
    const colorBlindSelect = document.getElementById(
      'colorBlindSelect'
    ) as HTMLSelectElement;
    colorBlindSelect.value = settings.colorBlindMode;
    colorBlindSelect.addEventListener('change', (e) => {
      const value = (e.target as HTMLSelectElement).value as
        | 'none'
        | 'protanopia'
        | 'deuteranopia'
        | 'tritanopia';
      SettingsManager.updateSetting('colorBlindMode', value);
    });
  }

  private updateDailyChallenge(): void {
    const objective = DailyChallenge.getDailyObjective();
    const modifier = DailyChallenge.getDailyModifier();
    this.dailyObjectiveElement.textContent = `${objective} - ${modifier}`;
  }

  private showLeaderboard(): void {
    this.leaderboardScreen.classList.remove('hidden');
    this.startScreen.classList.add('hidden');
    this.updateLeaderboardDisplay('all');
  }

  private hideLeaderboard(): void {
    this.leaderboardScreen.classList.add('hidden');
    this.startScreen.classList.remove('hidden');
  }

  private updateLeaderboardDisplay(mode: string): void {
    const leaderboard =
      mode === 'all'
        ? LeaderboardManager.getLeaderboard()
        : LeaderboardManager.getLeaderboard().filter((e) => e.mode === mode);

    const content = document.getElementById('leaderboardContent')!;
    if (leaderboard.length === 0) {
      content.innerHTML =
        '<p style="color: #94a3b8; text-align: center; padding: 40px;">No entries yet. Play to set a record!</p>';
      return;
    }

    content.innerHTML = leaderboard
      .map((entry, index) => {
        const rank = index + 1;
        const rankClass =
          rank === 1
            ? 'top-1'
            : rank === 2
              ? 'top-2'
              : rank === 3
                ? 'top-3'
                : '';
        const medal =
          rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank;
        return `
        <div class="leaderboard-entry ${rankClass}">
          <div class="leaderboard-rank">${medal}</div>
          <div class="leaderboard-info">
            <div class="leaderboard-name">${entry.mode.replace('_', ' ').toUpperCase()}</div>
            <div class="leaderboard-details">
              ${Math.floor(entry.distance)}m | ${entry.coins} coins | ${entry.gems} gems
            </div>
          </div>
          <div class="leaderboard-score">${entry.score}</div>
        </div>
      `;
      })
      .join('');
  }

  private showStats(): void {
    this.statsScreen.classList.remove('hidden');
    this.startScreen.classList.add('hidden');
    this.updateStatsDisplay();
  }

  private hideStats(): void {
    this.statsScreen.classList.add('hidden');
    this.startScreen.classList.remove('hidden');
  }

  private updateStatsDisplay(): void {
    const stats = StatsTracker.load();
    const averages = StatsTracker.getAverages();
    const content = document.getElementById('statsContent')!;

    const formatTime = (seconds: number): string => {
      const hours = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${mins}m`;
    };

    content.innerHTML = `
      <div class="stat-category">
        <h3>🎮 Overall Stats</h3>
        <div class="stat-row">
          <span class="stat-label">Total Games Played</span>
          <span class="stat-value">${stats.totalGamesPlayed}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Total Play Time</span>
          <span class="stat-value">${formatTime(stats.totalPlayTime)}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Highest Score</span>
          <span class="stat-value">${stats.highestScore.toLocaleString()}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Longest Run</span>
          <span class="stat-value">${Math.floor(stats.longestRun)}m</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Highest Combo</span>
          <span class="stat-value">${stats.highestCombo}x</span>
        </div>
      </div>

      <div class="stat-category">
        <h3>💰 Collectibles</h3>
        <div class="stat-row">
          <span class="stat-label">Bronze Coins</span>
          <span class="stat-value">${stats.bronzeCoins}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Silver Coins</span>
          <span class="stat-value">${stats.silverCoins}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Gold Coins</span>
          <span class="stat-value">${stats.goldCoins}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Blue Gems</span>
          <span class="stat-value">${stats.blueGems}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Red Gems</span>
          <span class="stat-value">${stats.redGems}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Rainbow Gems</span>
          <span class="stat-value">${stats.rainbowGems}</span>
        </div>
      </div>

      <div class="stat-category">
        <h3>⚡ Power-Ups</h3>
        <div class="stat-row">
          <span class="stat-label">Shield Used</span>
          <span class="stat-value">${stats.shieldUsed}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Magnet Used</span>
          <span class="stat-value">${stats.magnetUsed}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Ghost Used</span>
          <span class="stat-value">${stats.ghostUsed}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Slow Motion Used</span>
          <span class="stat-value">${stats.slowMotionUsed}</span>
        </div>
      </div>

      <div class="stat-category">
        <h3>📊 Averages</h3>
        <div class="stat-row">
          <span class="stat-label">Avg Score</span>
          <span class="stat-value">${averages.avgScore.toLocaleString()}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Avg Distance</span>
          <span class="stat-value">${averages.avgDistance}m</span>
        </div>
      </div>
    `;
  }

  private showSettings(): void {
    this.settingsScreen.classList.remove('hidden');
    this.startScreen.classList.add('hidden');
  }

  private hideSettings(): void {
    this.settingsScreen.classList.add('hidden');
    this.startScreen.classList.remove('hidden');
  }

  private returnToMenu(): void {
    this.state = GameState.MENU;
    this.startScreen.classList.remove('hidden');
    this.gameOverScreen.classList.add('hidden');
    this.pauseScreen.classList.add('hidden');
  }

  start(mode: GameMode = GameMode.CLASSIC): void {
    this.state = GameState.PLAYING;
    this.gameMode = mode;
    this.score = 0;
    this.distance = 0;
    this.coins = 0;
    this.gems = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.scrollSpeed = GAME_CONFIG.SCROLL_SPEED;
    this.baseScrollSpeed = GAME_CONFIG.SCROLL_SPEED;
    this.difficulty = 0;
    this.difficultyTimer = 0;
    this.scoreMultiplier = 1;
    this.scoreMultiplierEndTime = 0;
    this.speedBoostEndTime = 0;
    this.magnetEndTime = 0;
    this.ghostEndTime = 0;
    this.slowMotionEndTime = 0;
    this.rocksAvoided = 0;
    this.powerUpsCollected = 0;
    this.nearMisses = 0;
    this.gameStartTime = performance.now();
    this.accumulatedTime = 0; // Reset accumulator for clean game start

    // Apply difficulty setting
    const settings = SettingsManager.load();
    const diffMultiplier = SettingsManager.getDifficultyMultiplier(
      settings.difficulty
    );
    this.scrollSpeed *= diffMultiplier;
    this.baseScrollSpeed *= diffMultiplier;

    // Set up mode-specific settings
    if (mode === GameMode.TIME_TRIAL) {
      this.timeTrialStartTime = performance.now();
      this.timeTrialTimeLeft = this.timeTrialDuration;
    } else if (mode === GameMode.ZEN) {
      // Zen mode: slower, more relaxing
      this.scrollSpeed = GAME_CONFIG.SCROLL_SPEED * 0.6;
      this.baseScrollSpeed = this.scrollSpeed;
    }

    this.generator.setGameMode(mode);
    this.otter.reset();
    this.generator.reset();
    this.particlePool.releaseAll();

    this.startScreen.classList.add('hidden');
    this.gameOverScreen.classList.add('hidden');
    this.pauseScreen.classList.add('hidden');

    this.lastTime = performance.now();
    this.updateUI();
  }

  restart(): void {
    this.start(this.gameMode); // Restart with same mode
  }

  pause(): void {
    if (this.state === GameState.PLAYING) {
      this.state = GameState.PAUSED;
      this.pauseScreen.classList.remove('hidden');
    }
  }

  resume(): void {
    if (this.state === GameState.PAUSED) {
      this.state = GameState.PLAYING;
      this.pauseScreen.classList.add('hidden');
      this.lastTime = performance.now();
    }
  }

  gameOver(): void {
    this.state = GameState.GAME_OVER;
    this.gameOverScreen.classList.remove('hidden');

    // Calculate play time
    const playTime = Math.floor(
      (performance.now() - this.gameStartTime) / 1000
    );

    if (this.score > this.saveData.highScore) {
      this.saveData.highScore = this.score;
    }
    this.saveData.totalGamesPlayed++;

    const stats: GameStats = {
      score: this.score,
      distance: this.distance,
      coins: this.coins,
      gems: this.gems,
      combo: this.combo,
      multiplier: this.scoreMultiplier,
      powerUpsCollected: this.powerUpsCollected,
      obstaclesAvoided: this.rocksAvoided,
      gamesPlayed: this.saveData.totalGamesPlayed,
      closeCallsCount: 0,
    };

    const newAchievements = this.achievementSystem.check(stats);
    if (newAchievements.length > 0) {
      this.audioManager.playSound('achievement');
      // Queue achievements for display
      newAchievements.forEach((ach) => {
        this.achievementQueue.push({
          id: ach.id,
          name: ach.name,
        });
      });
      this.showNextAchievement();
    }

    this.saveData.achievements = this.achievementSystem.getUnlockedIds();
    StorageManager.save(this.saveData);

    // Add to leaderboard
    LeaderboardManager.addEntry({
      name: 'Player',
      score: this.score,
      distance: this.distance,
      coins: this.coins,
      gems: this.gems,
      mode: this.gameMode,
    });

    // Track lifetime stats
    const modeMap = {
      [GameMode.CLASSIC]: 'classic' as const,
      [GameMode.TIME_TRIAL]: 'time_trial' as const,
      [GameMode.ZEN]: 'zen' as const,
      [GameMode.DAILY_CHALLENGE]: 'daily' as const,
    };

    StatsTracker.recordGame(
      modeMap[this.gameMode],
      this.score,
      this.distance,
      this.coins,
      this.gems,
      this.powerUpsCollected,
      this.rocksAvoided,
      this.combo,
      playTime
    );

    // Daily challenge save
    if (this.gameMode === GameMode.DAILY_CHALLENGE) {
      DailyChallenge.saveTodayScore(this.score, this.distance);
    }

    // Update UI
    this.finalScoreElement.textContent = `Score: ${this.score}`;
    this.finalDistanceElement.textContent = `Distance: ${Math.floor(this.distance)}m`;
    this.finalCoinsElement.textContent = `Coins: ${this.coins}`;
    this.finalGemsElement.textContent = `Gems: ${this.gems}`;
    this.highScoreElement.textContent = `High Score: ${this.saveData.highScore}`;

    const rank = LeaderboardManager.getRank(this.score);
    this.rankElement.textContent = `Rank: #${rank}`;
  }

  private showNextAchievement(): void {
    if (this.showingAchievement || this.achievementQueue.length === 0) {
      return;
    }

    this.showingAchievement = true;
    const achievement = this.achievementQueue.shift()!;

    this.achievementName.textContent = achievement.name;
    this.achievementPopup.classList.remove('hidden');

    // Hide after 4 seconds
    window.setTimeout(() => {
      this.achievementPopup.classList.add('hidden');
      this.showingAchievement = false;

      // Show next achievement if any
      if (this.achievementQueue.length > 0) {
        window.setTimeout(() => this.showNextAchievement(), 500);
      }
    }, 4000);
  }

  /**
   * Fixed timestep update loop
   * Implements ARCHITECTURE.md specification (lines 114-148)
   * Ensures deterministic physics across all devices
   */
  update(currentTime: number): void {
    if (this.state !== GameState.PLAYING) return;

    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Accumulate time for fixed timestep updates
    this.accumulatedTime += deltaTime;

    // Fixed timestep physics updates
    while (this.accumulatedTime >= this.FIXED_TIMESTEP) {
      this.fixedUpdate(this.FIXED_TIMESTEP / 1000); // Convert to seconds
      this.accumulatedTime -= this.FIXED_TIMESTEP;
    }
  }

  /**
   * Fixed timestep update - called consistently at 60 FPS
   * Physics, collision, gameplay logic
   */
  private fixedUpdate(deltaTime: number): void {

    // Time Trial: check if time is up
    if (this.gameMode === GameMode.TIME_TRIAL) {
      const currentTime = performance.now();
      this.timeTrialTimeLeft =
        this.timeTrialDuration - (currentTime - this.timeTrialStartTime);
      if (this.timeTrialTimeLeft <= 0) {
        this.gameOver();
        return;
      }
    }

    this.updateDifficulty(deltaTime);
    this.updatePowerUps(performance.now());
    this.updateCombo(deltaTime);

    this.otter.update(deltaTime);
    this.generator.update(this.scrollSpeed, this.difficulty, deltaTime);
    this.renderer.update(deltaTime);

    // Update background generator with biome system
    this.backgroundGenerator.update(deltaTime, this.scrollSpeed, this.distance);

    this.updateRocks(deltaTime);
    this.updatePowerUpItems(deltaTime);
    this.updateCoins(deltaTime);
    this.updateGems(deltaTime);
    this.updateParticles(deltaTime);

    this.checkCollisions();

    this.distance += this.scrollSpeed * deltaTime;
    this.score += Math.floor(
      this.scrollSpeed *
        deltaTime *
        this.scoreMultiplier *
        (1 + this.combo * 0.1)
    );

    this.updateUI();
  }

  private updateCombo(deltaTime: number): void {
    if (this.combo > 0) {
      this.comboTimer -= deltaTime * 1000;
      if (this.comboTimer <= 0) {
        this.combo = 0;
      }
    }
  }

  private updateDifficulty(deltaTime: number): void {
    this.difficultyTimer += deltaTime * 1000;

    if (this.difficultyTimer >= GAME_CONFIG.DIFFICULTY_INCREASE_INTERVAL) {
      this.difficultyTimer = 0;
      this.difficulty += GAME_CONFIG.DIFFICULTY_INCREASE_RATE;

      const speedIncrease =
        (GAME_CONFIG.MAX_SCROLL_SPEED - GAME_CONFIG.MIN_SCROLL_SPEED) *
        GAME_CONFIG.DIFFICULTY_INCREASE_RATE;
      this.scrollSpeed = Math.min(
        this.scrollSpeed + speedIncrease,
        GAME_CONFIG.MAX_SCROLL_SPEED
      );
    }
  }

  private updatePowerUps(currentTime: number): void {
    const now = currentTime;

    // Score Multiplier
    if (this.scoreMultiplierEndTime > 0 && now >= this.scoreMultiplierEndTime) {
      this.scoreMultiplier = 1;
      this.scoreMultiplierEndTime = 0;
    }

    // Speed Boost (makes game slower - easier to control)
    if (this.speedBoostEndTime > 0 && now >= this.speedBoostEndTime) {
      this.scrollSpeed = Math.min(
        this.baseScrollSpeed + this.difficulty * 20,
        GAME_CONFIG.MAX_SCROLL_SPEED
      );
      this.speedBoostEndTime = 0;
    }

    // Magnet (auto-collect nearby coins/gems)
    if (this.magnetEndTime > 0 && now >= this.magnetEndTime) {
      this.magnetEndTime = 0;
    }

    // Ghost (pass through obstacles)
    if (this.ghostEndTime > 0 && now >= this.ghostEndTime) {
      this.ghostEndTime = 0;
      this.otter.isGhost = false;
    }

    // Slow Motion
    if (this.slowMotionEndTime > 0 && now >= this.slowMotionEndTime) {
      this.scrollSpeed = this.baseScrollSpeed;
      this.slowMotionEndTime = 0;
    }
  }

  private updateRocks(deltaTime: number): void {
    const rocks = this.generator.getActiveRocks();
    rocks.forEach((rock) => {
      rock.update(deltaTime, this.scrollSpeed);

      if (rock.isOffScreen(GAME_CONFIG.CANVAS_HEIGHT)) {
        this.generator.releaseRock(rock);
        this.rocksAvoided++;
        // Increment combo for dodging rocks
        this.combo++;
        this.comboTimer = this.COMBO_TIMEOUT;
      }
    });
  }

  private updatePowerUpItems(deltaTime: number): void {
    const powerUps = this.generator.getActivePowerUps();
    powerUps.forEach((powerUp) => {
      powerUp.update(deltaTime, this.scrollSpeed);

      if (powerUp.isOffScreen(GAME_CONFIG.CANVAS_HEIGHT)) {
        this.generator.releasePowerUp(powerUp);
      }
    });
  }

  private updateCoins(deltaTime: number): void {
    const coins = this.generator.getActiveCoins();
    const otterAABB = this.otter.getAABB();
    const otterCenterX = otterAABB.x + otterAABB.width / 2;
    const otterCenterY = otterAABB.y + otterAABB.height / 2;
    const magnetActive = this.magnetEndTime > performance.now();

    coins.forEach((coin) => {
      coin.update(deltaTime, this.scrollSpeed);

      // Magnet effect - pull coins towards otter
      if (magnetActive) {
        const coinAABB = coin.getAABB();
        const coinCenterX = coinAABB.x + coinAABB.width / 2;
        const coinCenterY = coinAABB.y + coinAABB.height / 2;
        const dist = calcDistance(
          { x: otterCenterX, y: otterCenterY },
          { x: coinCenterX, y: coinCenterY }
        );

        if (dist < MAGNET_CONFIG.RADIUS) {
          // Pull coin towards otter
          const pullSpeed = 400;
          const dx = otterCenterX - coinCenterX;
          const dy = otterCenterY - coinCenterY;
          const mag = Math.sqrt(dx * dx + dy * dy);
          if (mag > 0) {
            coin.x += (dx / mag) * pullSpeed * deltaTime;
            coin.y += (dy / mag) * pullSpeed * deltaTime;
          }
        }
      }

      if (coin.isOffScreen(GAME_CONFIG.CANVAS_HEIGHT)) {
        this.generator.releaseCoin(coin);
      }
    });
  }

  private updateGems(deltaTime: number): void {
    const gems = this.generator.getActiveGems();
    const otterAABB = this.otter.getAABB();
    const otterCenterX = otterAABB.x + otterAABB.width / 2;
    const otterCenterY = otterAABB.y + otterAABB.height / 2;
    const magnetActive = this.magnetEndTime > performance.now();

    gems.forEach((gem) => {
      gem.update(deltaTime, this.scrollSpeed);

      // Magnet effect
      if (magnetActive) {
        const gemAABB = gem.getAABB();
        const gemCenterX = gemAABB.x + gemAABB.width / 2;
        const gemCenterY = gemAABB.y + gemAABB.height / 2;
        const dist = calcDistance(
          { x: otterCenterX, y: otterCenterY },
          { x: gemCenterX, y: gemCenterY }
        );

        if (dist < MAGNET_CONFIG.RADIUS) {
          const pullSpeed = 450;
          const dx = otterCenterX - gemCenterX;
          const dy = otterCenterY - gemCenterY;
          const mag = Math.sqrt(dx * dx + dy * dy);
          if (mag > 0) {
            gem.x += (dx / mag) * pullSpeed * deltaTime;
            gem.y += (dy / mag) * pullSpeed * deltaTime;
          }
        }
      }

      if (gem.isOffScreen(GAME_CONFIG.CANVAS_HEIGHT)) {
        this.generator.releaseGem(gem);
      }
    });
  }

  private updateParticles(deltaTime: number): void {
    const particles = this.particlePool.getActive();
    particles.forEach((particle) => {
      particle.update(deltaTime);
      if (!particle.active) {
        this.particlePool.release(particle);
      }
    });
  }

  private checkCollisions(): void {
    const otterAABB = this.otter.getAABB();
    const isGhost = this.ghostEndTime > performance.now();
    const inTutorial = (performance.now() - this.gameStartTime) < this.TUTORIAL_DURATION;

    // Check rock collisions (skip if ghost mode OR tutorial zone)
    if (!isGhost && !inTutorial) {
      const rocks = this.generator.getActiveRocks();
      const NEAR_MISS_DISTANCE = 50; // pixels for near-miss detection
      
      for (const rock of rocks) {
        if (rock.active) {
          // Check actual collision
          if (checkAABBCollision(otterAABB, rock.getAABB())) {
            if (this.otter.hasShield) {
              this.otter.hasShield = false;
              this.generator.releaseRock(rock);
              this.audioManager.playSound('shield');
              this.createParticles(
                rock.x + rock.width / 2,
                rock.y + rock.height / 2,
                '#60a5fa'
              );
            } else {
              this.audioManager.playSound('collision');
              this.createParticles(
                this.otter.x + this.otter.width / 2,
                this.otter.y + this.otter.height / 2,
                '#d2691e'
              );
              // Reset combo on collision/death
              this.combo = 0;
              this.comboTimer = 0;
              this.gameOver();
              return;
            }
          } else {
            // Check for near-miss (ARCHITECTURE.md lines 628-639)
            const otterCenterX = otterAABB.x + otterAABB.width / 2;
            const otterCenterY = otterAABB.y + otterAABB.height / 2;
            const rockCenterX = rock.x + rock.width / 2;
            const rockCenterY = rock.y + rock.height / 2;
            const distance = Math.sqrt(
              Math.pow(otterCenterX - rockCenterX, 2) +
              Math.pow(otterCenterY - rockCenterY, 2)
            );
            
            if (distance < NEAR_MISS_DISTANCE && !rock.nearMissRecorded) {
              rock.nearMissRecorded = true; // Mark to avoid duplicate near-misses
              this.nearMisses++;
              this.score += 5 * this.scoreMultiplier; // Near-miss bonus
              this.combo++;
              this.comboTimer = this.COMBO_TIMEOUT;
              this.audioManager.playSound('near_miss');
            }
          }
        }
      }
    }

    // Check power-up collisions
    const powerUps = this.generator.getActivePowerUps();
    for (const powerUp of powerUps) {
      if (powerUp.active && checkAABBCollision(otterAABB, powerUp.getAABB())) {
        this.collectPowerUp(powerUp);
        this.generator.releasePowerUp(powerUp);
      }
    }

    // Check coin collisions
    const coins = this.generator.getActiveCoins();
    for (const coin of coins) {
      if (coin.active && checkAABBCollision(otterAABB, coin.getAABB())) {
        this.collectCoin(coin);
        this.generator.releaseCoin(coin);
      }
    }

    // Check gem collisions
    const gems = this.generator.getActiveGems();
    for (const gem of gems) {
      if (gem.active && checkAABBCollision(otterAABB, gem.getAABB())) {
        this.collectGem(gem);
        this.generator.releaseGem(gem);
      }
    }
  }

  private collectPowerUp(powerUp: PowerUp): void {
    this.audioManager.playSound('powerup');
    this.powerUpsCollected++;

    const currentTime = performance.now();

    // Track stats
    const typeMap = {
      [PowerUpType.SHIELD]: 'shield' as const,
      [PowerUpType.CONTROL_BOOST]: 'speed_boost' as const,
      [PowerUpType.SCORE_MULTIPLIER]: 'multiplier' as const,
      [PowerUpType.MAGNET]: 'magnet' as const,
      [PowerUpType.GHOST]: 'ghost' as const,
      [PowerUpType.SLOW_MOTION]: 'slow_motion' as const,
    };
    StatsTracker.recordPowerUp(typeMap[powerUp.type]);

    switch (powerUp.type) {
      case PowerUpType.SHIELD:
        this.otter.hasShield = true;
        break;
      case PowerUpType.CONTROL_BOOST:
        this.scrollSpeed *= 0.7;
        this.speedBoostEndTime = currentTime + POWERUP_CONFIG.DURATION;
        break;
      case PowerUpType.SCORE_MULTIPLIER:
        this.scoreMultiplier = 2;
        this.scoreMultiplierEndTime = currentTime + POWERUP_CONFIG.DURATION;
        break;
      case PowerUpType.MAGNET:
        this.magnetEndTime = currentTime + MAGNET_CONFIG.DURATION;
        break;
      case PowerUpType.GHOST:
        this.otter.isGhost = true;
        this.ghostEndTime = currentTime + GHOST_CONFIG.DURATION;
        break;
      case PowerUpType.SLOW_MOTION:
        this.scrollSpeed *= SLOW_MOTION_CONFIG.SPEED_MULTIPLIER;
        this.slowMotionEndTime = currentTime + SLOW_MOTION_CONFIG.DURATION;
        break;
    }

    this.createParticles(
      powerUp.x + powerUp.width / 2,
      powerUp.y + powerUp.height / 2,
      '#fbbf24'
    );
  }

  private collectCoin(coin: Coin): void {
    this.coins += coin.value;
    this.score += coin.value * 10; // Coins also add to score
    this.combo++;
    this.comboTimer = this.COMBO_TIMEOUT;

    // Track stats
    const typeMap = {
      [CoinType.BRONZE]: 'bronze' as const,
      [CoinType.SILVER]: 'silver' as const,
      [CoinType.GOLD]: 'gold' as const,
    };
    StatsTracker.recordCoin(typeMap[coin.type]);

    this.audioManager.playSound('coin');
    this.createParticles(
      coin.x + coin.width / 2,
      coin.y + coin.height / 2,
      coin.getColor()
    );
  }

  private collectGem(gem: Gem): void {
    this.gems += gem.value;
    this.score += gem.value * 50; // Gems worth more!
    this.combo += 2; // Gems give bigger combo boost
    this.comboTimer = this.COMBO_TIMEOUT;

    // Track stats
    const typeMap = {
      [GemType.BLUE]: 'blue' as const,
      [GemType.RED]: 'red' as const,
      [GemType.RAINBOW]: 'rainbow' as const,
    };
    StatsTracker.recordGem(typeMap[gem.type]);

    this.audioManager.playSound('gem');
    this.createParticles(
      gem.x + gem.width / 2,
      gem.y + gem.height / 2,
      gem.getColor()
    );
  }

  private createParticles(x: number, y: number, color: string): void {
    for (let i = 0; i < PARTICLE_CONFIG.COUNT; i++) {
      const particle = this.particlePool.acquire();
      const angle = (Math.PI * 2 * i) / PARTICLE_CONFIG.COUNT;
      const speed = PARTICLE_CONFIG.SPEED;
      particle.init(
        { x, y },
        { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
        PARTICLE_CONFIG.LIFETIME,
        color,
        randomRange(3, 6)
      );
    }
  }

  render(): void {
    this.renderer.clear();

    // Show loading screen if sprites aren't loaded yet
    if (!this.renderer.areSpritesLoaded() && this.state === GameState.MENU) {
      this.renderer.renderLoadingScreen();
      return;
    }

    // Render new dynamic background with biomes
    this.backgroundGenerator.render();

    this.renderer.renderLanes();

    const rocks = this.generator.getActiveRocks();
    this.renderer.renderRocks(rocks);

    const coins = this.generator.getActiveCoins();
    this.renderer.renderCoins(coins);

    const gems = this.generator.getActiveGems();
    this.renderer.renderGems(gems);

    const powerUps = this.generator.getActivePowerUps();
    this.renderer.renderPowerUps(powerUps);

    // Render otter with ghost effect (handled internally by renderer)
    this.renderer.renderOtter(this.otter);

    const particles = this.particlePool.getActive();
    this.renderer.renderParticles(particles);

    // Render HUD if playing
    if (this.state === GameState.PLAYING) {
      const gameStats: GameStats = {
        score: this.score,
        distance: this.distance,
        coins: this.coins,
        gems: this.gems,
        combo: this.combo,
        multiplier: this.scoreMultiplier,
        obstaclesAvoided: this.rocksAvoided,
        powerUpsCollected: this.powerUpsCollected,
        gamesPlayed: this.saveData.totalGamesPlayed,
        closeCallsCount: 0,
      };

      const powerUpStatuses: PowerUpStatus[] = this.getActivePowerUpStatuses();
      this.uiRenderer.renderHUD(gameStats, powerUpStatuses);

      // Show time remaining for Time Trial
      if (this.gameMode === GameMode.TIME_TRIAL) {
        this.uiRenderer.renderTimeTrialTimer(this.timeTrialTimeLeft);
      }

      // Show biome transition notification
      if (this.backgroundGenerator.isNewBiome()) {
        this.uiRenderer.renderBiomeTransition(
          this.backgroundGenerator.getBiomeName()
        );
      }
    }
  }

  private getActivePowerUpStatuses(): PowerUpStatus[] {
    const now = performance.now();
    const statuses: PowerUpStatus[] = [];

    if (this.otter.hasShield) {
      statuses.push({
        type: 'SHIELD',
        active: true,
        duration: 0,
        timeLeft: 0,
      });
    }

    if (this.scoreMultiplierEndTime > now) {
      statuses.push({
        type: 'SCORE_MULTIPLIER',
        active: true,
        duration: POWERUP_CONFIG.DURATION,
        timeLeft: this.scoreMultiplierEndTime - now,
      });
    }

    if (this.speedBoostEndTime > now) {
      statuses.push({
        type: 'CONTROL_BOOST',
        active: true,
        duration: POWERUP_CONFIG.DURATION,
        timeLeft: this.speedBoostEndTime - now,
      });
    }

    if (this.magnetEndTime > now) {
      statuses.push({
        type: 'MAGNET',
        active: true,
        duration: MAGNET_CONFIG.DURATION,
        timeLeft: this.magnetEndTime - now,
      });
    }

    if (this.ghostEndTime > now) {
      statuses.push({
        type: 'GHOST',
        active: true,
        duration: GHOST_CONFIG.DURATION,
        timeLeft: this.ghostEndTime - now,
      });
    }

    if (this.slowMotionEndTime > now) {
      statuses.push({
        type: 'SLOW_MOTION',
        active: true,
        duration: SLOW_MOTION_CONFIG.DURATION,
        timeLeft: this.slowMotionEndTime - now,
      });
    }

    return statuses;
  }

  private updateUI(): void {
    this.scoreElement.textContent = `Score: ${this.score}`;
  }

  loop = (currentTime: number): void => {
    this.update(currentTime);
    this.render();
    requestAnimationFrame(this.loop);
  };

  run(): void {
    this.lastTime = performance.now();
    requestAnimationFrame(this.loop);
  }

  cleanup(): void {
    this.inputHandler.cleanup();
    this.audioManager.cleanup();
    this.responsiveCanvas.destroy();
  }
}
