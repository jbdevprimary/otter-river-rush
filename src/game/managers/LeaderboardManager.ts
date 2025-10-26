/**
 * Leaderboard System - Local and Daily Challenge tracking
 */

export interface LeaderboardEntry {
  name: string;
  score: number;
  distance: number;
  coins: number;
  gems: number;
  mode: string;
  date: string;
  id: string;
}

export class LeaderboardManager {
  private static readonly STORAGE_KEY = 'otter_leaderboard';
  private static readonly MAX_ENTRIES = 10;
  private static readonly DAILY_KEY = 'otter_daily_leaderboard';

  static getLeaderboard(): LeaderboardEntry[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) return [];

    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static addEntry(entry: Omit<LeaderboardEntry, 'id' | 'date'>): void {
    const leaderboard = this.getLeaderboard();

    const newEntry: LeaderboardEntry = {
      ...entry,
      id: Date.now().toString() + Math.random(),
      date: new Date().toISOString(),
    };

    leaderboard.push(newEntry);
    leaderboard.sort((a, b) => b.score - a.score);

    // Keep only top entries
    const trimmed = leaderboard.slice(0, this.MAX_ENTRIES);

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmed));
  }

  static getTopScore(): number {
    const leaderboard = this.getLeaderboard();
    return leaderboard.length > 0 ? leaderboard[0].score : 0;
  }

  static getTopScoreByMode(mode: string): number {
    const leaderboard = this.getLeaderboard().filter((e) => e.mode === mode);
    return leaderboard.length > 0 ? leaderboard[0].score : 0;
  }

  static getRank(score: number): number {
    const leaderboard = this.getLeaderboard();
    const rank = leaderboard.filter((e) => e.score > score).length + 1;
    return rank;
  }

  static getDailyLeaderboard(date: string): LeaderboardEntry[] {
    const key = `${this.DAILY_KEY}_${date}`;
    const data = localStorage.getItem(key);
    if (!data) return [];

    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static addDailyEntry(
    entry: Omit<LeaderboardEntry, 'id' | 'date'>,
    dailyDate: string
  ): void {
    const key = `${this.DAILY_KEY}_${dailyDate}`;
    const leaderboard = this.getDailyLeaderboard(dailyDate);

    const newEntry: LeaderboardEntry = {
      ...entry,
      id: Date.now().toString() + Math.random(),
      date: new Date().toISOString(),
    };

    leaderboard.push(newEntry);
    leaderboard.sort((a, b) => b.score - a.score);

    localStorage.setItem(key, JSON.stringify(leaderboard));
  }

  static clearLeaderboard(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
