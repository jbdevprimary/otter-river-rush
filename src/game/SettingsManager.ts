/**
 * Settings Manager - Game configuration and preferences
 */

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  volume: number;
  reducedMotion: boolean;
  showFPS: boolean;
  difficulty: 'easy' | 'normal' | 'hard';
  screenShake: boolean;
  particles: 'low' | 'normal' | 'high';
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
}

export class SettingsManager {
  private static readonly STORAGE_KEY = 'otter_settings';

  static getDefaultSettings(): GameSettings {
    return {
      soundEnabled: true,
      musicEnabled: true,
      volume: 0.7,
      reducedMotion: false,
      showFPS: false,
      difficulty: 'normal',
      screenShake: true,
      particles: 'normal',
      colorBlindMode: 'none',
    };
  }

  static load(): GameSettings {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) return this.getDefaultSettings();

    try {
      const saved = JSON.parse(data);
      return { ...this.getDefaultSettings(), ...saved };
    } catch {
      return this.getDefaultSettings();
    }
  }

  static save(settings: GameSettings): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
  }

  static updateSetting<K extends keyof GameSettings>(
    key: K,
    value: GameSettings[K]
  ): void {
    const settings = this.load();
    settings[key] = value;
    this.save(settings);
  }

  static getSetting<K extends keyof GameSettings>(key: K): GameSettings[K] {
    return this.load()[key];
  }

  static reset(): void {
    this.save(this.getDefaultSettings());
  }

  static getDifficultyMultiplier(
    difficulty: GameSettings['difficulty']
  ): number {
    switch (difficulty) {
      case 'easy':
        return 0.7;
      case 'normal':
        return 1.0;
      case 'hard':
        return 1.5;
      default:
        return 1.0;
    }
  }

  static getParticleCount(setting: GameSettings['particles']): number {
    switch (setting) {
      case 'low':
        return 5;
      case 'normal':
        return 10;
      case 'high':
        return 20;
      default:
        return 10;
    }
  }
}
