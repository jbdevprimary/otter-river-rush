/**
 * Save management using localStorage
 */

import type {
  PlayerProfile,
  LeaderboardEntry,
  GameSettings,
  Achievement,
  DailyChallenge,
  GameMode,
} from '@/types/Game.types';

const STORAGE_KEYS = {
  PROFILE: 'otter_rush_profile',
  LEADERBOARD: 'otter_rush_leaderboard',
  SETTINGS: 'otter_rush_settings',
  ACHIEVEMENTS: 'otter_rush_achievements',
  DAILY_CHALLENGE: 'otter_rush_daily_challenge',
} as const;

export class SaveManager {
  /**
   * Save player profile
   */
  public saveProfile(profile: PlayerProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  }

  /**
   * Load player profile
   */
  public loadProfile(): PlayerProfile | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load profile:', error);
      return null;
    }
  }

  /**
   * Create default profile
   */
  public createDefaultProfile(): PlayerProfile {
    return {
      name: 'Player',
      level: 1,
      experience: 0,
      experienceToNextLevel: 100,
      totalCoins: 0,
      totalGems: 0,
      gamesPlayed: 0,
      bestScore: 0,
      bestDistance: 0,
      totalPlayTime: 0,
      unlockedSkins: ['default'],
      currentSkin: 'default',
      achievements: [],
      settings: this.getDefaultSettings(),
    };
  }

  /**
   * Save leaderboard
   */
  public saveLeaderboard(entries: LeaderboardEntry[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(entries));
    } catch (error) {
      console.error('Failed to save leaderboard:', error);
    }
  }

  /**
   * Load leaderboard
   */
  public loadLeaderboard(): LeaderboardEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      return [];
    }
  }

  /**
   * Add leaderboard entry
   */
  public addLeaderboardEntry(
    playerName: string,
    score: number,
    distance: number,
    mode: GameMode
  ): void {
    const entries = this.loadLeaderboard();

    entries.push({
      rank: 0,
      playerName,
      score,
      distance,
      date: Date.now(),
      mode,
    });

    // Sort by score descending
    entries.sort((a, b) => b.score - a.score);

    // Update ranks and keep top 100
    const rankedEntries = entries.slice(0, 100).map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    this.saveLeaderboard(rankedEntries);
  }

  /**
   * Get leaderboard for specific mode
   */
  public getLeaderboardByMode(mode: GameMode): LeaderboardEntry[] {
    return this.loadLeaderboard().filter((entry) => entry.mode === mode);
  }

  /**
   * Save settings
   */
  public saveSettings(settings: GameSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  /**
   * Load settings
   */
  public loadSettings(): GameSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : this.getDefaultSettings();
    } catch (error) {
      console.error('Failed to load settings:', error);
      return this.getDefaultSettings();
    }
  }

  /**
   * Get default settings
   */
  private getDefaultSettings(): GameSettings {
    return {
      volume: {
        master: 0.7,
        music: 0.6,
        sfx: 0.8,
      },
      accessibility: {
        reducedMotion: false,
        highContrast: false,
        colorblindMode: 'none',
        gameSpeed: 1.0,
      },
      controls: {
        touchEnabled: true,
        mouseEnabled: true,
        keyboardEnabled: true,
      },
      graphics: {
        particleQuality: 'medium',
        showFPS: false,
        maxDevicePixelRatio: 2,
      },
      gameplay: {
        hapticFeedback: true,
        showTutorial: true,
        autoSave: true,
      },
    };
  }

  /**
   * Save achievements
   */
  public saveAchievements(achievements: Achievement[]): void {
    try {
      localStorage.setItem(
        STORAGE_KEYS.ACHIEVEMENTS,
        JSON.stringify(achievements)
      );
    } catch (error) {
      console.error('Failed to save achievements:', error);
    }
  }

  /**
   * Load achievements
   */
  public loadAchievements(): Achievement[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load achievements:', error);
      return [];
    }
  }

  /**
   * Save daily challenge
   */
  public saveDailyChallenge(challenge: DailyChallenge): void {
    try {
      localStorage.setItem(
        STORAGE_KEYS.DAILY_CHALLENGE,
        JSON.stringify(challenge)
      );
    } catch (error) {
      console.error('Failed to save daily challenge:', error);
    }
  }

  /**
   * Load daily challenge
   */
  public loadDailyChallenge(): DailyChallenge | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DAILY_CHALLENGE);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load daily challenge:', error);
      return null;
    }
  }

  /**
   * Clear all save data
   */
  public clearAll(): void {
    try {
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Failed to clear save data:', error);
    }
  }

  /**
   * Export all data as JSON
   */
  public exportData(): string {
    const data = {
      profile: this.loadProfile(),
      leaderboard: this.loadLeaderboard(),
      settings: this.loadSettings(),
      achievements: this.loadAchievements(),
      dailyChallenge: this.loadDailyChallenge(),
    };
    return JSON.stringify(data, null, 2);
  }

  /**
   * Import data from JSON
   */
  public importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);

      if (data.profile) this.saveProfile(data.profile);
      if (data.leaderboard) this.saveLeaderboard(data.leaderboard);
      if (data.settings) this.saveSettings(data.settings);
      if (data.achievements) this.saveAchievements(data.achievements);
      if (data.dailyChallenge) this.saveDailyChallenge(data.dailyChallenge);

      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  /**
   * Check storage availability
   */
  public isAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get storage usage info
   */
  public getStorageInfo(): { used: number; available: boolean } {
    if (!this.isAvailable()) {
      return { used: 0, available: false };
    }

    let used = 0;
    Object.values(STORAGE_KEYS).forEach((key) => {
      const item = localStorage.getItem(key);
      if (item) {
        used += item.length + key.length;
      }
    });

    return { used, available: true };
  }
}
