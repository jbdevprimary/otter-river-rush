export const ACHIEVEMENT_DEFINITIONS = [
  // Distance Milestones
  {
    id: 'first_swim',
    name: 'First Swim',
    description: 'Complete your first 100 meters downstream',
    icon: '🏊',
    requirement: 100,
    rarity: 'common',
    checkCondition: (stats: GameStats) => stats.totalDistanceTraveled >= 100,
  },
  {
    id: 'river_explorer',
    name: 'River Explorer',
    description: 'Travel a total of 10,000 meters',
    icon: '🗺️',
    requirement: 10000,
    rarity: 'common',
    checkCondition: (stats: GameStats) => stats.totalDistanceTraveled >= 10000,
  },
  {
    id: 'marathon_swimmer',
    name: 'Marathon Swimmer',
    description: 'Swim 42,195 meters in a single run',
    icon: '🏃',
    requirement: 42195,
    rarity: 'epic',
    checkCondition: (stats: GameStats) => stats.longestSingleRun >= 42195,
  },
  {
    id: 'ocean_bound',
    name: 'Ocean Bound',
    description: 'Travel over 100,000 meters total',
    icon: '🌊',
    requirement: 100000,
    rarity: 'legendary',
    checkCondition: (stats: GameStats) => stats.totalDistanceTraveled >= 100000,
  },
  {
    id: 'endless_current',
    name: 'Endless Current',
    description: 'Survive for 30 minutes in a single run',
    icon: '⏰',
    requirement: 1800,
    rarity: 'epic',
    checkCondition: (stats: GameStats) => stats.longestRunTime >= 1800,
  },

  // Skill-Based Achievements
  {
    id: 'perfect_glide',
    name: 'Perfect Glide',
    description: 'Complete 50 consecutive jumps without missing',
    icon: '✨',
    requirement: 50,
    rarity: 'rare',
    checkCondition: (stats: GameStats) => stats.maxConsecutiveJumps >= 50,
  },
  {
    id: 'combo_master',
    name: 'Combo Master',
    description: 'Achieve a 100x combo multiplier',
    icon: '🔥',
    requirement: 100,
    rarity: 'epic',
    checkCondition: (stats: GameStats) => stats.maxComboMultiplier >= 100,
  },
  {
    id: 'untouchable',
    name: 'Untouchable',
    description: 'Travel 5,000 meters without taking damage',
    icon: '🛡️',
    requirement: 5000,
    rarity: 'rare',
    checkCondition: (stats: GameStats) => stats.longestNoDamageRun >= 5000,
  },
  {
    id: 'precision_swimmer',
    name: 'Precision Swimmer',
    description: 'Hit 25 perfect timing bonuses in a single run',
    icon: '🎯',
    requirement: 25,
    rarity: 'rare',
    checkCondition: (stats: GameStats) => stats.maxPerfectTimingsInRun >= 25,
  },
  {
    id: 'reflex_master',
    name: 'Reflex Master',
    description: 'Dodge 200 obstacles in a single run',
    icon: '⚡',
    requirement: 200,
    rarity: 'epic',
    checkCondition: (stats: GameStats) => stats.maxObstaclesDodgedInRun >= 200,
  },

  // Collection Achievements
  {
    id: 'penny_pincher',
    name: 'Penny Pincher',
    description: 'Collect your first 1,000 coins',
    icon: '🪙',
    requirement: 1000,
    rarity: 'common',
    checkCondition: (stats: GameStats) => stats.totalCoinsCollected >= 1000,
  },
  {
    id: 'treasure_hunter',
    name: 'Treasure Hunter',
    description: 'Collect 50,000 coins total',
    icon: '💰',
    requirement: 50000,
    rarity: 'rare',
    checkCondition: (stats: GameStats) => stats.totalCoinsCollected >= 50000,
  },
  {
    id: 'gem_collector',
    name: 'Gem Collector',
    description: 'Find 100 rare gems',
    icon: '💎',
    requirement: 100,
    rarity: 'epic',
    checkCondition: (stats: GameStats) => stats.totalGemsCollected >= 100,
  },
  {
    id: 'hoarder',
    name: 'Digital Hoarder',
    description: 'Collect 500 coins in a single run',
    icon: '🏦',
    requirement: 500,
    rarity: 'rare',
    checkCondition: (stats: GameStats) => stats.maxCoinsInSingleRun >= 500,
  },
  {
    id: 'magnet_master',
    name: 'Magnet Master',
    description: 'Collect 1,000 coins using coin magnet power-ups',
    icon: '🧲',
    requirement: 1000,
    rarity: 'common',
    checkCondition: (stats: GameStats) => stats.coinsMagnetCollected >= 1000,
  },

  // Mastery Achievements
  {
    id: 'power_user',
    name: 'Power User',
    description: 'Use every type of power-up at least once',
    icon: '⚡',
    requirement: 8,
    rarity: 'common',
    checkCondition: (stats: GameStats) => stats.uniquePowerUpsUsed.size >= 8,
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Use speed boost power-ups 100 times',
    icon: '💨',
    requirement: 100,
    rarity: 'rare',
    checkCondition: (stats: GameStats) => stats.speedBoostsUsed >= 100,
  },
  {
    id: 'invincible_veteran',
    name: 'Invincible Veteran',
    description: 'Use invincibility power-ups 50 times',
    icon: '✨',
    requirement: 50,
    rarity: 'rare',
    checkCondition: (stats: GameStats) => stats.invincibilityUsed >= 50,
  },
  {
    id: 'enemy_encyclopedia',
    name: 'Enemy Encyclopedia',
    description: 'Encounter all 12 types of river obstacles',
    icon: '📚',
    requirement: 12,
    rarity: 'epic',
    checkCondition: (stats: GameStats) => stats.uniqueEnemyTypes.size >= 12,
  },
  {
    id: 'obstacle_course',
    name: 'Obstacle Course Champion',
    description: 'Successfully navigate past 1,000 obstacles',
    icon: '🏆',
    requirement: 1000,
    rarity: 'epic',
    checkCondition: (stats: GameStats) => stats.totalObstaclesAvoided >= 1000,
  },

  // Secret/Easter Egg Achievements
  {
    id: 'secret_cave',
    name: 'Cave Explorer',
    description: 'Discover the hidden underwater cave',
    icon: '🕳️',
    requirement: 1,
    rarity: 'legendary',
    checkCondition: (stats: GameStats) =>
      stats.secretAreasFound.includes('underwater_cave'),
  },
  {
    id: 'rainbow_fish',
    name: 'Rainbow Friend',
    description: 'Swim alongside the legendary rainbow fish',
    icon: '🌈',
    requirement: 1,
    rarity: 'legendary',
    checkCondition: (stats: GameStats) =>
      stats.secretAreasFound.includes('rainbow_fish_encounter'),
  },
  {
    id: 'midnight_swim',
    name: 'Midnight Swimmer',
    description: 'Play during the witching hour (12:00-12:59 AM)',
    icon: '🌙',
    requirement: 1,
    rarity: 'rare',
    checkCondition: (stats: GameStats) => stats.midnightPlaysCompleted >= 1,
  },
  {
    id: 'birthday_otter',
    name: 'Birthday Otter',
    description: 'Play on your birthday for extra celebration!',
    icon: '🎂',
    requirement: 1,
    rarity: 'epic',
    checkCondition: (stats: GameStats, _currentDate: Date) =>
      stats.birthdayPlays >= 1,
  },
  {
    id: 'konami_code',
    name: 'Old School',
    description: 'Enter the classic cheat sequence',
    icon: '🎮',
    requirement: 1,
    rarity: 'legendary',
    checkCondition: (stats: GameStats) => stats.konamiCodeEntered,
  },

  // Time-Based Challenges
  {
    id: 'daily_swimmer',
    name: 'Daily Swimmer',
    description: 'Play for 7 consecutive days',
    icon: '📅',
    requirement: 7,
    rarity: 'common',
    checkCondition: (stats: GameStats) => stats.consecutiveDaysPlayed >= 7,
  },
  {
    id: 'dedication',
    name: 'True Dedication',
    description: 'Play for 30 consecutive days',
    icon: '🔥',
    requirement: 30,
    rarity: 'epic',
    checkCondition: (stats: GameStats) => stats.consecutiveDaysPlayed >= 30,
  },
  {
    id: 'speed_runner',
    name: 'Speed Runner',
    description: 'Reach 1,000 meters in under 2 minutes',
    icon: '⏱️',
    requirement: 120,
    rarity: 'rare',
    checkCondition: (stats: GameStats) =>
      stats.fastestTo1000m <= 120 && stats.fastestTo1000m > 0,
  },
  {
    id: 'weekend_warrior',
    name: 'Weekend Warrior',
    description: 'Complete 10 runs on weekends',
    icon: '🏖️',
    requirement: 10,
    rarity: 'common',
    checkCondition: (stats: GameStats) => stats.weekendRuns >= 10,
  },
  {
    id: 'century_club',
    name: 'Century Club',
    description: 'Complete 100 total runs',
    icon: '💯',
    requirement: 100,
    rarity: 'rare',
    checkCondition: (stats: GameStats) => stats.totalRuns >= 100,
  },

  // Social & Sharing (NEW - 23 more achievements to reach 50+)
  {
    id: 'first_blood',
    name: 'First Blood',
    description: 'Complete your very first run',
    icon: '🎯',
    requirement: 1,
    rarity: 'common',
    checkCondition: (stats: GameStats) => stats.totalRuns >= 1,
  },
  {
    id: 'persistent',
    name: 'Persistent Otter',
    description: 'Play 3 runs without giving up',
    icon: '💪',
    requirement: 3,
    rarity: 'common',
    checkCondition: (stats: GameStats) => stats.consecutiveRunsWithoutQuit >= 3,
  },
  {
    id: 'comebackkid',
    name: 'Comeback Kid',
    description: 'Beat your personal best after 10 attempts',
    icon: '🔥',
    requirement: 1,
    rarity: 'rare',
    checkCondition: (stats: GameStats) => stats.personalBestComebacks >= 1,
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Play 5 runs between 10 PM and 4 AM',
    icon: '🦉',
    requirement: 5,
    rarity: 'common',
    checkCondition: (stats: GameStats) => stats.nighttimeRuns >= 5,
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Play 5 runs between 5 AM and 8 AM',
    icon: '🌅',
    requirement: 5,
    rarity: 'common',
    checkCondition: (stats: GameStats) => stats.morningRuns >= 5,
  },
  {
    id: 'bronze_medal',
    name: 'Bronze Medal',
    description: 'Reach 3rd place on the local leaderboard',
    icon: '🥉',
    requirement: 3,
    rarity: 'common',
    checkCondition: (stats: GameStats) => stats.bestLeaderboardRank <= 3,
  },
  {
    id: 'silver_medal',
    name: 'Silver Medal',
    description: 'Reach 2nd place on the local leaderboard',
    icon: '🥈',
    requirement: 2,
    rarity: 'rare',
    checkCondition: (stats: GameStats) => stats.bestLeaderboardRank <= 2,
  },
  {
    id: 'gold_medal',
    name: 'Gold Medal',
    description: 'Reach 1st place on the local leaderboard',
    icon: '🥇',
    requirement: 1,
    rarity: 'epic',
    checkCondition: (stats: GameStats) => stats.bestLeaderboardRank <= 1,
  },
  {
    id: 'double_trouble',
    name: 'Double Trouble',
    description: 'Collect 2 power-ups simultaneously',
    icon: '⚡⚡',
    requirement: 1,
    rarity: 'common',
    checkCondition: (stats: GameStats) => stats.maxSimultaneousPowerUps >= 2,
  },
  {
    id: 'power_trinity',
    name: 'Power Trinity',
    description: 'Have 3 power-ups active at once',
    icon: '✨✨✨',
    requirement: 1,
    rarity: 'rare',
    checkCondition: (stats: GameStats) => stats.maxSimultaneousPowerUps >= 3,
  },
  {
    id: 'close_shave',
    name: 'Close Shave',
    description: 'Have 50 near-miss moments',
    icon: '😰',
    requirement: 50,
    rarity: 'common',
    checkCondition: (stats: GameStats) => stats.totalNearMisses >= 50,
  },
  {
    id: 'adrenaline_junkie',
    name: 'Adrenaline Junkie',
    description: 'Have 200 near-miss moments',
    icon: '🎢',
    requirement: 200,
    rarity: 'rare',
    checkCondition: (stats: GameStats) => stats.totalNearMisses >= 200,
  },
  {
    id: 'biome_tourist',
    name: 'Biome Tourist',
    description: 'Visit all 4 biomes in a single run',
    icon: '🗺️',
    requirement: 4,
    rarity: 'rare',
    checkCondition: (stats: GameStats) => stats.biomesVisitedInSingleRun >= 4,
  },
  {
    id: 'forest_master',
    name: 'Forest Master',
    description: 'Spend 10 minutes total in Forest biome',
    icon: '🌲',
    requirement: 600,
    rarity: 'common',
    checkCondition: (stats: GameStats) => stats.timeInForestBiome >= 600,
  },
  {
    id: 'mountain_master',
    name: 'Mountain Master',
    description: 'Spend 10 minutes total in Mountain biome',
    icon: '⛰️',
    requirement: 600,
    rarity: 'rare',
    checkCondition: (stats: GameStats) => stats.timeInMountainBiome >= 600,
  },
  {
    id: 'canyon_master',
    name: 'Canyon Master',
    description: 'Spend 10 minutes total in Canyon biome',
    icon: '🏜️',
    requirement: 600,
    rarity: 'epic',
    checkCondition: (stats: GameStats) => stats.timeInCanyonBiome >= 600,
  },
  {
    id: 'rapids_master',
    name: 'Rapids Master',
    description: 'Spend 10 minutes total in Rapids biome',
    icon: '🌊',
    requirement: 600,
    rarity: 'legendary',
    checkCondition: (stats: GameStats) => stats.timeInRapidsBiome >= 600,
  },
  {
    id: 'pacifist',
    name: 'Pacifist Run',
    description: 'Complete a run without collecting any power-ups',
    icon: '☮️',
    requirement: 1,
    rarity: 'rare',
    checkCondition: (stats: GameStats) => stats.runsWithoutPowerUps >= 1,
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Reach 1000m without collecting any coins',
    icon: '🎨',
    requirement: 1,
    rarity: 'epic',
    checkCondition: (stats: GameStats) => stats.runsTo1000WithoutCoins >= 1,
  },
  {
    id: 'coin_collector',
    name: 'Coin Vacuum',
    description: 'Collect 100 coins in 30 seconds',
    icon: '💨',
    requirement: 1,
    rarity: 'rare',
    checkCondition: (stats: GameStats) => stats.coins100In30Seconds === true,
  },
  {
    id: 'gem_hunter',
    name: 'Gem Hunter',
    description: 'Collect 10 gems in a single run',
    icon: '💎',
    requirement: 10,
    rarity: 'rare',
    checkCondition: (stats: GameStats) => stats.maxGemsInSingleRun >= 10,
  },
  {
    id: 'millionaire',
    name: 'Millionaire',
    description: 'Accumulate 1,000,000 points total',
    icon: '💸',
    requirement: 1000000,
    rarity: 'legendary',
    checkCondition: (stats: GameStats) => stats.totalPointsEarned >= 1000000,
  },
  {
    id: 'zen_master',
    name: 'Zen Master',
    description: 'Complete 10 Zen mode runs',
    icon: '🧘',
    requirement: 10,
    rarity: 'common',
    checkCondition: (stats: GameStats) => stats.zenModeRuns >= 10,
  },
];

export interface GameStats {
  totalDistanceTraveled: number;
  longestSingleRun: number;
  longestRunTime: number;
  maxConsecutiveJumps: number;
  maxComboMultiplier: number;
  longestNoDamageRun: number;
  maxPerfectTimingsInRun: number;
  maxObstaclesDodgedInRun: number;
  totalCoinsCollected: number;
  totalGemsCollected: number;
  maxCoinsInSingleRun: number;
  coinsMagnetCollected: number;
  uniquePowerUpsUsed: Set<string>;
  speedBoostsUsed: number;
  invincibilityUsed: number;
  uniqueEnemyTypes: Set<string>;
  totalObstaclesAvoided: number;
  secretAreasFound: string[];
  midnightPlaysCompleted: number;
  birthdayPlays: number;
  konamiCodeEntered: boolean;
  consecutiveDaysPlayed: number;
  fastestTo1000m: number;
  weekendRuns: number;
  totalRuns: number;
  // NEW stats for new achievements (23 additions)
  consecutiveRunsWithoutQuit: number;
  personalBestComebacks: number;
  nighttimeRuns: number;
  morningRuns: number;
  bestLeaderboardRank: number;
  maxSimultaneousPowerUps: number;
  totalNearMisses: number;
  biomesVisitedInSingleRun: number;
  timeInForestBiome: number;
  timeInMountainBiome: number;
  timeInCanyonBiome: number;
  timeInRapidsBiome: number;
  runsWithoutPowerUps: number;
  runsTo1000WithoutCoins: number;
  coins100In30Seconds: boolean;
  maxGemsInSingleRun: number;
  totalPointsEarned: number;
  zenModeRuns: number;
}
