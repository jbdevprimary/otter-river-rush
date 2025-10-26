/**
 * Daily Challenge System - Seeded procedural generation
 */

export class DailyChallenge {
  private static readonly STORAGE_KEY = 'otter_daily_progress';

  static getTodayDate(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  static getTodaySeed(): number {
    const date = this.getTodayDate();
    // Convert date to seed
    let hash = 0;
    for (let i = 0; i < date.length; i++) {
      const char = date.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  static hasPlayedToday(): boolean {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) return false;

    try {
      const progress = JSON.parse(data);
      return progress.date === this.getTodayDate();
    } catch {
      return false;
    }
  }

  static getTodayBestScore(): number {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) return 0;

    try {
      const progress = JSON.parse(data);
      if (progress.date === this.getTodayDate()) {
        return progress.score || 0;
      }
      return 0;
    } catch {
      return 0;
    }
  }

  static saveTodayScore(score: number, distance: number): void {
    const current = this.getTodayBestScore();
    if (score > current) {
      const data = {
        date: this.getTodayDate(),
        score,
        distance,
        timestamp: Date.now(),
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    }
  }

  static getDailyObjective(): string {
    const seed = this.getTodaySeed();
    const objectives = [
      'Collect 100 coins',
      'Reach 5000m distance',
      'Get a 20x combo',
      'Collect 50 gems',
      'Use 10 power-ups',
      'Avoid 100 obstacles',
      'Score 50,000 points',
      'Survive for 3 minutes',
      'Collect all gem types',
      'Use all power-up types',
    ];
    return objectives[seed % objectives.length];
  }

  static getDailyModifier(): string {
    const seed = this.getTodaySeed();
    const modifiers = [
      'Double Speed',
      'Extra Coins',
      'Rare Gems Only',
      'Power-Up Frenzy',
      'Magnet Mode',
      'Ghost River',
      'Slow Motion',
      'Score Multiplier',
      'Obstacle Course',
      'Gem Rush',
    ];
    return modifiers[seed % modifiers.length];
  }
}
