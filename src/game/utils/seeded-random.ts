/**
 * Seeded Random Number Generator
 * Uses seedrandom for deterministic game generation
 * Supports 3-word seed phrases for shareable game seeds
 */

import seedrandom from 'seedrandom';

/**
 * Word pool for generating memorable seed phrases
 * 256 words for good entropy (8 bits per word, 24 bits total for 3 words)
 */
const WORD_POOL = [
  // Nature (64)
  'river', 'stream', 'rapids', 'waterfall', 'wave', 'tide', 'ocean', 'pond',
  'forest', 'jungle', 'meadow', 'valley', 'mountain', 'canyon', 'desert', 'tundra',
  'otter', 'beaver', 'salmon', 'trout', 'turtle', 'frog', 'heron', 'eagle',
  'oak', 'pine', 'willow', 'birch', 'maple', 'cedar', 'redwood', 'aspen',
  'stone', 'pebble', 'boulder', 'gravel', 'cliff', 'cave', 'ridge', 'peak',
  'cloud', 'mist', 'fog', 'rain', 'snow', 'frost', 'ice', 'storm',
  'dawn', 'dusk', 'noon', 'night', 'spring', 'summer', 'autumn', 'winter',
  'north', 'south', 'east', 'west', 'wind', 'breeze', 'gust', 'calm',

  // Colors (32)
  'amber', 'azure', 'bronze', 'cobalt', 'coral', 'crimson', 'emerald', 'golden',
  'indigo', 'ivory', 'jade', 'lavender', 'magenta', 'navy', 'olive', 'pearl',
  'ruby', 'rusty', 'silver', 'slate', 'sunset', 'teal', 'violet', 'white',
  'copper', 'chrome', 'onyx', 'sapphire', 'topaz', 'turquoise', 'scarlet', 'maroon',

  // Actions (32)
  'swift', 'quick', 'rapid', 'speedy', 'nimble', 'agile', 'dashing', 'rushing',
  'gliding', 'diving', 'splashing', 'swimming', 'floating', 'drifting', 'soaring', 'leaping',
  'brave', 'bold', 'fierce', 'wild', 'gentle', 'calm', 'serene', 'peaceful',
  'lucky', 'mighty', 'clever', 'cunning', 'playful', 'curious', 'eager', 'spirited',

  // Objects (32)
  'coin', 'gem', 'crystal', 'pearl', 'shell', 'acorn', 'pinecone', 'feather',
  'log', 'branch', 'twig', 'leaf', 'flower', 'lily', 'reed', 'moss',
  'star', 'moon', 'sun', 'comet', 'spark', 'flame', 'ember', 'glow',
  'crown', 'shield', 'charm', 'token', 'relic', 'treasure', 'prize', 'trophy',

  // Places (32)
  'haven', 'harbor', 'lagoon', 'cove', 'bay', 'inlet', 'delta', 'estuary',
  'grove', 'glade', 'hollow', 'dell', 'glen', 'thicket', 'copse', 'orchard',
  'summit', 'plateau', 'bluff', 'mesa', 'butte', 'gorge', 'ravine', 'chasm',
  'isle', 'atoll', 'reef', 'shoal', 'bank', 'shore', 'beach', 'dune',

  // Descriptors (32)
  'ancient', 'eternal', 'mystic', 'hidden', 'secret', 'sacred', 'primal', 'wild',
  'frozen', 'blazing', 'misty', 'stormy', 'sunny', 'starry', 'moonlit', 'shadowy',
  'crystal', 'marble', 'golden', 'silver', 'emerald', 'diamond', 'sapphire', 'ruby',
  'endless', 'infinite', 'timeless', 'boundless', 'vast', 'grand', 'noble', 'royal',

  // Misc (32)
  'alpha', 'omega', 'zenith', 'apex', 'nexus', 'core', 'heart', 'soul',
  'echo', 'whisper', 'roar', 'thunder', 'silence', 'harmony', 'rhythm', 'melody',
  'quest', 'voyage', 'journey', 'odyssey', 'trek', 'expedition', 'venture', 'mission',
  'legend', 'myth', 'saga', 'tale', 'fable', 'story', 'dream', 'vision',
];

/**
 * Seeded random number generator instance
 */
export interface SeededRNG {
  /** Get next random number [0, 1) */
  random: () => number;
  /** Get random integer [min, max] inclusive */
  int: (min: number, max: number) => number;
  /** Get random float [min, max) */
  float: (min: number, max: number) => number;
  /** Pick random element from array */
  pick: <T>(arr: T[]) => T;
  /** Shuffle array (returns new array) */
  shuffle: <T>(arr: T[]) => T[];
  /** Get a boolean with given probability (default 0.5) */
  chance: (probability?: number) => boolean;
  /** The seed string used */
  seed: string;
  /** The seed phrase (3 words) */
  phrase: string;
}

/**
 * Convert seed phrase to hash string
 */
function phraseToSeed(phrase: string): string {
  return phrase.toLowerCase().trim().replace(/\s+/g, '-');
}

/**
 * Generate a random 3-word seed phrase
 */
export function generateSeedPhrase(): string {
  const words: string[] = [];
  for (let i = 0; i < 3; i++) {
    const index = Math.floor(Math.random() * WORD_POOL.length);
    words.push(WORD_POOL[index]);
  }
  return words.join(' ');
}

/**
 * Validate a seed phrase (3 words from the pool)
 */
export function isValidSeedPhrase(phrase: string): boolean {
  const words = phrase.toLowerCase().trim().split(/\s+/);
  if (words.length !== 3) return false;
  return words.every(word => WORD_POOL.includes(word));
}

/**
 * Create a seeded random number generator from a seed phrase
 */
export function createSeededRNG(seedPhrase?: string): SeededRNG {
  const phrase = seedPhrase ?? generateSeedPhrase();
  const seed = phraseToSeed(phrase);
  const rng = seedrandom(seed);

  return {
    random: () => rng(),

    int: (min: number, max: number) => {
      return Math.floor(rng() * (max - min + 1)) + min;
    },

    float: (min: number, max: number) => {
      return rng() * (max - min) + min;
    },

    pick: <T>(arr: T[]): T => {
      return arr[Math.floor(rng() * arr.length)];
    },

    shuffle: <T>(arr: T[]): T[] => {
      const result = [...arr];
      for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
      }
      return result;
    },

    chance: (probability = 0.5) => {
      return rng() < probability;
    },

    seed,
    phrase,
  };
}

/**
 * Global game RNG instance (set when starting a game)
 */
let gameRNG: SeededRNG | null = null;

/**
 * Initialize the game RNG with a seed phrase
 */
export function initGameRNG(seedPhrase?: string): SeededRNG {
  gameRNG = createSeededRNG(seedPhrase);
  return gameRNG;
}

/**
 * Get the current game RNG (creates one if not initialized)
 */
export function getGameRNG(): SeededRNG {
  if (!gameRNG) {
    gameRNG = createSeededRNG();
  }
  return gameRNG;
}

/**
 * Reset the game RNG (call when ending a game)
 */
export function resetGameRNG(): void {
  gameRNG = null;
}

/**
 * Get the current seed phrase (for sharing/display)
 */
export function getCurrentSeedPhrase(): string | null {
  return gameRNG?.phrase ?? null;
}

/**
 * Export word pool for UI autocomplete
 */
export { WORD_POOL };
