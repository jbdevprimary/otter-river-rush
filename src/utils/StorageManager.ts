export interface SaveData {
  highScore: number;
  totalGamesPlayed: number;
  achievements: string[];
  settings: {
    soundEnabled: boolean;
    musicEnabled: boolean;
  };
}

const STORAGE_KEY = 'otter-river-rush-save';

export class StorageManager {
  /**
   * Deep merge utility to recursively merge nested objects
   * Implements ARCHITECTURE.md specification (lines 1093-1119)
   */
  private static deepMerge<T extends Record<string, unknown>>(
    target: T,
    source: Partial<T>
  ): T {
    const result = { ...target };

    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        const sourceValue = source[key];
        const targetValue = result[key];

        // If both values are plain objects, merge recursively
        if (
          sourceValue !== null &&
          typeof sourceValue === 'object' &&
          !Array.isArray(sourceValue) &&
          targetValue !== null &&
          typeof targetValue === 'object' &&
          !Array.isArray(targetValue)
        ) {
          result[key] = this.deepMerge(targetValue, sourceValue);
        } else {
          // Otherwise, overwrite with source value
          result[key] = sourceValue as T[Extract<keyof T, string>];
        }
      }
    }

    return result;
  }

  /**
   * Save data with deep merge support
   * Partial updates preserve existing data
   */
  static save(data: Partial<SaveData>): void {
    try {
      const existing = this.load() || this.getDefaultData();
      const merged = this.deepMerge(existing, data);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  }

  static load(): SaveData | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load data:', error);
      return null;
    }
  }

  static getDefaultData(): SaveData {
    return {
      highScore: 0,
      totalGamesPlayed: 0,
      achievements: [],
      settings: {
        soundEnabled: true,
        musicEnabled: true,
      },
    };
  }

  static clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
