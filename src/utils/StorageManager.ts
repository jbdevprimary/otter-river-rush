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
  static save(data: SaveData): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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
