/**
 * Otter Character Definitions
 *
 * Each otter has unique personality and gameplay traits that affect:
 * - Movement speed
 * - Coin value multiplier
 * - Special abilities
 */

// For Metro web, assets are served from public/ at root
// On native, will be overridden by AssetBridge
const BASE_URL = '';

export interface OtterCharacter {
  id: string;
  name: string;
  title: string;
  description: string;
  personality: string;
  modelPath: string;
  thumbnailPath: string;

  // Visual theming
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    particleColor: string;
  };

  // Gameplay modifiers
  traits: {
    laneChangeSpeed: number; // Multiplier (1.0 = normal)
    scrollSpeedMod: number; // Multiplier (1.0 = normal, higher = harder)
    coinValueMod: number; // Multiplier (1.0 = normal)
    gemValueMod: number; // Multiplier (1.0 = normal)
    startingHealth: number; // Base health
    invincibilityDuration: number; // ms after hit
  };

  // Unlock requirements
  unlock: {
    type: 'default' | 'distance' | 'score' | 'coins' | 'secret';
    requirement?: number;
    hint?: string;
  };
}

/**
 * All playable otter characters
 */
export const OTTER_CHARACTERS: OtterCharacter[] = [
  {
    id: 'rusty',
    name: 'Rusty',
    title: 'The River Runner',
    description:
      'A cheerful brown otter who loves splashing through rivers. Reliable and steady, Rusty is perfect for beginners.',
    personality: 'Friendly, determined, always optimistic',
    modelPath: `${BASE_URL}/models/player/otter-player/model.glb`,
    thumbnailPath: `${BASE_URL}/models/player/otter-player/thumbnail.png`,

    theme: {
      primaryColor: '#8B4513', // Saddle brown
      secondaryColor: '#DEB887', // Burly wood
      accentColor: '#FFD700', // Gold accents
      particleColor: '#FFA500', // Orange splash
    },

    traits: {
      laneChangeSpeed: 1.0,
      scrollSpeedMod: 1.0,
      coinValueMod: 1.0,
      gemValueMod: 1.0,
      startingHealth: 3,
      invincibilityDuration: 1500,
    },

    unlock: {
      type: 'default',
    },
  },

  {
    id: 'sterling',
    name: 'Sterling',
    title: 'The Shadow Swimmer',
    description:
      'A sleek silver otter who moves like moonlight on water. Quick reflexes make dodging a breeze.',
    personality: 'Wise, calm, mysterious night owl',
    modelPath: `${BASE_URL}/models/player/otter-silver/model.glb`,
    thumbnailPath: `${BASE_URL}/models/player/otter-silver/thumbnail.png`,

    theme: {
      primaryColor: '#708090', // Slate gray
      secondaryColor: '#C0C0C0', // Silver
      accentColor: '#87CEEB', // Sky blue
      particleColor: '#B0C4DE', // Light steel blue
    },

    traits: {
      laneChangeSpeed: 1.4, // 40% faster lane changes!
      scrollSpeedMod: 1.0,
      coinValueMod: 0.85, // Slightly less coin value (trade-off)
      gemValueMod: 1.2, // But gems worth more!
      startingHealth: 3,
      invincibilityDuration: 1200,
    },

    unlock: {
      type: 'distance',
      requirement: 1000,
      hint: 'Swim 1000m total distance to unlock',
    },
  },

  {
    id: 'goldie',
    name: 'Goldie',
    title: 'The Fortune Finder',
    description:
      'A magnificent golden otter with a nose for treasure. Everything Goldie touches turns to riches!',
    personality: 'Regal, lucky, loves shiny things',
    modelPath: `${BASE_URL}/models/player/otter-golden/model.glb`,
    thumbnailPath: `${BASE_URL}/models/player/otter-golden/thumbnail.png`,

    theme: {
      primaryColor: '#DAA520', // Goldenrod
      secondaryColor: '#FFD700', // Gold
      accentColor: '#FFF8DC', // Cornsilk
      particleColor: '#FFE4B5', // Moccasin sparkle
    },

    traits: {
      laneChangeSpeed: 0.9, // Slightly slower (heavy with gold!)
      scrollSpeedMod: 0.95, // River flows a bit slower
      coinValueMod: 2.0, // DOUBLE coin value!
      gemValueMod: 1.5, // 50% more gem value!
      startingHealth: 2, // Glass cannon - less health
      invincibilityDuration: 2000,
    },

    unlock: {
      type: 'coins',
      requirement: 5000,
      hint: 'Collect 5000 coins total to unlock',
    },
  },

  {
    id: 'frost',
    name: 'Frost',
    title: 'The Arctic Ace',
    description:
      'A fluffy white otter from the frozen north. Frost thrives on speed and challenge!',
    personality: 'Playful, adventurous, loves a challenge',
    modelPath: `${BASE_URL}/models/player/otter-arctic/model.glb`,
    thumbnailPath: `${BASE_URL}/models/player/otter-arctic/thumbnail.png`,

    theme: {
      primaryColor: '#F0F8FF', // Alice blue
      secondaryColor: '#E0FFFF', // Light cyan
      accentColor: '#00CED1', // Dark turquoise
      particleColor: '#ADD8E6', // Light blue
    },

    traits: {
      laneChangeSpeed: 1.2, // Quick!
      scrollSpeedMod: 1.25, // 25% faster scrolling (harder!)
      coinValueMod: 1.0,
      gemValueMod: 1.0,
      startingHealth: 4, // Extra health for the challenge
      invincibilityDuration: 1000, // Less invincibility time
    },

    unlock: {
      type: 'score',
      requirement: 10000,
      hint: 'Score 10000 points in a single run to unlock',
    },
  },
];

/**
 * Get character by ID
 */
export function getCharacter(id: string): OtterCharacter | undefined {
  return OTTER_CHARACTERS.find((c) => c.id === id);
}

/**
 * Get default character (first unlocked)
 */
export function getDefaultCharacter(): OtterCharacter {
  return OTTER_CHARACTERS[0];
}

/**
 * Check if character is unlocked based on player progress
 */
export function isCharacterUnlocked(
  character: OtterCharacter,
  progress: {
    totalDistance: number;
    totalCoins: number;
    highScore: number;
  }
): boolean {
  const { unlock } = character;

  switch (unlock.type) {
    case 'default':
      return true;
    case 'distance':
      return progress.totalDistance >= (unlock.requirement ?? 0);
    case 'coins':
      return progress.totalCoins >= (unlock.requirement ?? 0);
    case 'score':
      return progress.highScore >= (unlock.requirement ?? 0);
    case 'secret':
      return false; // Handled specially
    default:
      return false;
  }
}
