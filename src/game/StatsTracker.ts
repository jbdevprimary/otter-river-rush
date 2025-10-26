/**
 * Stats Tracker - Lifetime player statistics
 */

export interface LifetimeStats {
  totalGamesPlayed: number;
  totalDistance: number;
  totalScore: number;
  totalCoins: number;
  totalGems: number;
  totalPowerUps: number;
  totalObstaclesAvoided: number;
  longestRun: number;
  highestScore: number;
  highestCombo: number;

  // Per mode stats
  classicGames: number;
  timeTrialGames: number;
  zenGames: number;
  dailyGames: number;

  // Collectible breakdown
  bronzeCoins: number;
  silverCoins: number;
  goldCoins: number;
  blueGems: number;
  redGems: number;
  rainbowGems: number;

  // Power-up usage
  shieldUsed: number;
  magnetUsed: number;
  ghostUsed: number;
  slowMotionUsed: number;
  speedBoostUsed: number;
  multiplierUsed: number;

  // Milestones
  firstGameDate: string;
  lastGameDate: string;
  totalPlayTime: number; // in seconds
}

export class StatsTracker {
  private static readonly STORAGE_KEY = 'otter_lifetime_stats';

  static getDefaultStats(): LifetimeStats {
    return {
      totalGamesPlayed: 0,
      totalDistance: 0,
      totalScore: 0,
      totalCoins: 0,
      totalGems: 0,
      totalPowerUps: 0,
      totalObstaclesAvoided: 0,
      longestRun: 0,
      highestScore: 0,
      highestCombo: 0,

      classicGames: 0,
      timeTrialGames: 0,
      zenGames: 0,
      dailyGames: 0,

      bronzeCoins: 0,
      silverCoins: 0,
      goldCoins: 0,
      blueGems: 0,
      redGems: 0,
      rainbowGems: 0,

      shieldUsed: 0,
      magnetUsed: 0,
      ghostUsed: 0,
      slowMotionUsed: 0,
      speedBoostUsed: 0,
      multiplierUsed: 0,

      firstGameDate: new Date().toISOString(),
      lastGameDate: new Date().toISOString(),
      totalPlayTime: 0,
    };
  }

  static load(): LifetimeStats {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) return this.getDefaultStats();

    try {
      const saved = JSON.parse(data);
      return { ...this.getDefaultStats(), ...saved };
    } catch {
      return this.getDefaultStats();
    }
  }

  static save(stats: LifetimeStats): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stats));
  }

  static recordGame(
    mode: 'classic' | 'time_trial' | 'zen' | 'daily',
    score: number,
    distance: number,
    coins: number,
    gems: number,
    powerUps: number,
    obstacles: number,
    combo: number,
    playTime: number
  ): void {
    const stats = this.load();

    // Update totals
    stats.totalGamesPlayed++;
    stats.totalDistance += distance;
    stats.totalScore += score;
    stats.totalCoins += coins;
    stats.totalGems += gems;
    stats.totalPowerUps += powerUps;
    stats.totalObstaclesAvoided += obstacles;
    stats.totalPlayTime += playTime;

    // Update bests
    if (distance > stats.longestRun) stats.longestRun = distance;
    if (score > stats.highestScore) stats.highestScore = score;
    if (combo > stats.highestCombo) stats.highestCombo = combo;

    // Update mode counts
    switch (mode) {
      case 'classic':
        stats.classicGames++;
        break;
      case 'time_trial':
        stats.timeTrialGames++;
        break;
      case 'zen':
        stats.zenGames++;
        break;
      case 'daily':
        stats.dailyGames++;
        break;
    }

    stats.lastGameDate = new Date().toISOString();

    this.save(stats);
  }

  static recordCoin(type: 'bronze' | 'silver' | 'gold'): void {
    const stats = this.load();
    switch (type) {
      case 'bronze':
        stats.bronzeCoins++;
        break;
      case 'silver':
        stats.silverCoins++;
        break;
      case 'gold':
        stats.goldCoins++;
        break;
    }
    this.save(stats);
  }

  static recordGem(type: 'blue' | 'red' | 'rainbow'): void {
    const stats = this.load();
    switch (type) {
      case 'blue':
        stats.blueGems++;
        break;
      case 'red':
        stats.redGems++;
        break;
      case 'rainbow':
        stats.rainbowGems++;
        break;
    }
    this.save(stats);
  }

  static recordPowerUp(
    type:
      | 'shield'
      | 'magnet'
      | 'ghost'
      | 'slow_motion'
      | 'speed_boost'
      | 'multiplier'
  ): void {
    const stats = this.load();
    switch (type) {
      case 'shield':
        stats.shieldUsed++;
        break;
      case 'magnet':
        stats.magnetUsed++;
        break;
      case 'ghost':
        stats.ghostUsed++;
        break;
      case 'slow_motion':
        stats.slowMotionUsed++;
        break;
      case 'speed_boost':
        stats.speedBoostUsed++;
        break;
      case 'multiplier':
        stats.multiplierUsed++;
        break;
    }
    this.save(stats);
  }

  static reset(): void {
    this.save(this.getDefaultStats());
  }

  static getAverages(): {
    avgScore: number;
    avgDistance: number;
    avgCoins: number;
    avgGems: number;
  } {
    const stats = this.load();
    const games = stats.totalGamesPlayed || 1;

    return {
      avgScore: Math.floor(stats.totalScore / games),
      avgDistance: Math.floor(stats.totalDistance / games),
      avgCoins: Math.floor(stats.totalCoins / games),
      avgGems: Math.floor(stats.totalGems / games),
    };
  }
}
