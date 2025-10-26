export const ENEMY_DEFINITIONS = [
  {
    id: 'lazy_log',
    name: 'Lazy Log',
    description:
      'A slow-moving fallen log that drifts predictably downstream. Perfect for beginners to learn timing.',

    // Yuka.js behaviors
    behaviors: ['Wander'],
    behaviorWeights: {
      wander: 1.0,
    },

    // Stats
    speed: 0.5,
    health: 1,
    aggressionLevel: 0,

    // Spawn conditions
    spawnDistance: { min: 50, max: 200 },
    difficultyRange: { min: 0, max: 3 },
    spawnWeight: 1.0,

    // Rewards
    scoreValue: 10,

    // Special properties
    specialAbilities: [],
    movementPattern: 'drift',
    collisionDamage: 1,
    size: { width: 60, height: 20 },

    // AI parameters
    wanderRadius: 20,
    wanderDistance: 30,
    wanderJitter: 2,
    maxForce: 0.1,

    spawnProbability: 0.7,
  },

  {
    id: 'snapping_turtle',
    name: 'Snapping Turtle',
    description:
      'Aggressive turtle that actively chases the player when nearby. Moves slowly but persistently.',

    // Yuka.js behaviors
    behaviors: ['Seek', 'Wander'],
    behaviorWeights: {
      seek: 0.8,
      wander: 0.2,
    },

    // Stats
    speed: 1.2,
    health: 2,
    aggressionLevel: 3,

    // Spawn conditions
    spawnDistance: { min: 80, max: 300 },
    difficultyRange: { min: 1, max: 5 },
    spawnWeight: 0.8,

    // Rewards
    scoreValue: 25,

    // Special properties
    specialAbilities: ['snap_attack'],
    movementPattern: 'aggressive_seek',
    collisionDamage: 2,
    size: { width: 40, height: 35 },

    // AI parameters
    seekRadius: 100,
    wanderRadius: 15,
    wanderDistance: 25,
    wanderJitter: 5,
    maxForce: 0.3,

    // Special ability configs
    snapAttackRange: 45,
    snapCooldown: 2000, // ms

    spawnProbability: 0.6,
  },

  {
    id: 'erratic_fish',
    name: 'Erratic Fish',
    description:
      'Unpredictable fish that changes direction randomly. Sometimes flees, sometimes approaches.',

    // Yuka.js behaviors
    behaviors: ['Wander', 'Seek', 'Flee'],
    behaviorWeights: {
      wander: 0.6,
      seek: 0.2,
      flee: 0.2,
    },

    // Stats
    speed: 2.0,
    health: 1,
    aggressionLevel: 2,

    // Spawn conditions
    spawnDistance: { min: 60, max: 250 },
    difficultyRange: { min: 2, max: 6 },
    spawnWeight: 0.7,

    // Rewards
    scoreValue: 35,

    // Special properties
    specialAbilities: ['behavior_switch'],
    movementPattern: 'erratic_multi',
    collisionDamage: 1,
    size: { width: 25, height: 15 },

    // AI parameters
    wanderRadius: 30,
    wanderDistance: 40,
    wanderJitter: 10,
    maxForce: 0.5,
    detectionRadius: 80,
    fleeRadius: 60,

    // Special ability configs
    behaviorSwitchInterval: 1500, // ms
    behaviorSwitchChance: 0.3,

    spawnProbability: 0.5,
  },

  {
    id: 'pike_predator',
    name: 'Pike Predator',
    description:
      'Cunning pike that pursues the player intelligently, predicting movement patterns.',

    // Yuka.js behaviors
    behaviors: ['Pursue', 'Interpose'],
    behaviorWeights: {
      pursue: 0.9,
      interpose: 0.1,
    },

    // Stats
    speed: 2.5,
    health: 3,
    aggressionLevel: 4,

    // Spawn conditions
    spawnDistance: { min: 100, max: 400 },
    difficultyRange: { min: 3, max: 8 },
    spawnWeight: 0.6,

    // Rewards
    scoreValue: 50,

    // Special properties
    specialAbilities: ['lunge_attack', 'prediction'],
    movementPattern: 'intelligent_pursuit',
    collisionDamage: 2,
    size: { width: 55, height: 12 },

    // AI parameters
    pursuitRadius: 150,
    maxPredictionTime: 1.0,
    maxForce: 0.6,

    // Special ability configs
    lungeSpeed: 4.0,
    lungeCooldown: 3000, // ms
    lungeRange: 80,
    predictionAccuracy: 0.7,

    spawnProbability: 0.4,
  },

  {
    id: 'whirlpool_spirit',
    name: 'Whirlpool Spirit',
    description:
      'Mystical entity that creates whirlpools and uses complex evasion patterns. Alternates between offense and defense.',

    // Yuka.js behaviors
    behaviors: ['Evade', 'Seek', 'OffsetPursuit', 'Hide'],
    behaviorWeights: {
      evade: 0.4,
      seek: 0.3,
      offsetPursuit: 0.2,
      hide: 0.1,
    },

    // Stats
    speed: 1.8,
    health: 4,
    aggressionLevel: 3,

    // Spawn conditions
    spawnDistance: { min: 150, max: 500 },
    difficultyRange: { min: 4, max: 9 },
    spawnWeight: 0.4,

    // Rewards
    scoreValue: 75,

    // Special properties
    specialAbilities: ['whirlpool_creation', 'phase_shift', 'tactical_retreat'],
    movementPattern: 'tactical_evasive',
    collisionDamage: 2,
    size: { width: 45, height: 45 },

    // AI parameters
    evadeRadius: 120,
    hideRadius: 100,
    offsetDistance: 60,
    maxForce: 0.4,

    // Special ability configs
    whirlpoolDuration: 4000, // ms
    whirlpoolCooldown: 6000, // ms
    phaseShiftDuration: 1000, // ms - becomes intangible
    phaseShiftCooldown: 8000, // ms
    retreatHealthThreshold: 0.5,

    spawnProbability: 0.3,
  },

  {
    id: 'river_kraken',
    name: 'River Kraken',
    description:
      'Boss-level tentacled monster with multiple AI phases. Uses flocking behaviors with multiple tentacles and advanced tactical planning.',

    // Yuka.js behaviors (for main body)
    behaviors: ['Seek', 'Evade', 'Interpose', 'Hide'],
    behaviorWeights: {
      seek: 0.4,
      evade: 0.3,
      interpose: 0.2,
      hide: 0.1,
    },

    // Stats
    speed: 1.0, // Slow but powerful
    health: 10,
    aggressionLevel: 5,

    // Spawn conditions
    spawnDistance: { min: 300, max: 800 },
    difficultyRange: { min: 6, max: 10 },
    spawnWeight: 0.1,

    // Rewards
    scoreValue: 200,

    // Special properties
    specialAbilities: [
      'tentacle_swarm',
      'tidal_wave',
      'adaptive_ai',
      'multi_phase',
    ],
    movementPattern: 'boss_tactical',
    collisionDamage: 3,
    size: { width: 80, height: 80 },

    // AI parameters
    maxForce: 0.3,
    detectionRadius: 200,
    hideRadius: 150,

    // Tentacle AI (uses Flocking behaviors)
    tentacleCount: 4,
    tentacleBehaviors: ['Separation', 'Alignment', 'Cohesion', 'Seek'],
    tentacleWeights: {
      separation: 0.3,
      alignment: 0.2,
      cohesion: 0.2,
      seek: 0.3,
    },

    // Special ability configs
    phases: [
      {
        name: 'aggressive',
        healthRange: { min: 0.7, max: 1.0 },
        behaviorWeights: { seek: 0.8, evade: 0.1, interpose: 0.1, hide: 0.0 },
        abilities: ['tentacle_swarm'],
      },
      {
        name: 'tactical',
        healthRange: { min: 0.4, max: 0.7 },
        behaviorWeights: { seek: 0.3, evade: 0.4, interpose: 0.3, hide: 0.0 },
        abilities: ['tentacle_swarm', 'tidal_wave'],
      },
      {
        name: 'desperate',
        healthRange: { min: 0.0, max: 0.4 },
        behaviorWeights: { seek: 0.2, evade: 0.5, interpose: 0.1, hide: 0.2 },
        abilities: ['tentacle_swarm', 'tidal_wave', 'berserker_mode'],
      },
    ],

    tidalWaveCooldown: 8000, // ms
    tentacleSwarmDuration: 5000, // ms
    adaptiveAiUpdateInterval: 2000, // ms - changes strategy based on player behavior

    spawnProbability: 0.05, // Very rare boss encounter
  },
];

// Type definitions for better TypeScript support
export interface EnemyDefinition {
  id: string;
  name: string;
  description: string;
  behaviors: string[];
  behaviorWeights: Record<string, number>;
  speed: number;
  health: number;
  aggressionLevel: number;
  spawnDistance: { min: number; max: number };
  difficultyRange: { min: number; max: number };
  spawnWeight: number;
  scoreValue: number;
  specialAbilities: string[];
  movementPattern: string;
  collisionDamage: number;
  size: { width: number; height: number };
  maxForce: number;
  spawnProbability: number;

  // Optional AI parameters
  wanderRadius?: number;
  wanderDistance?: number;
  wanderJitter?: number;
  seekRadius?: number;
  detectionRadius?: number;
  fleeRadius?: number;
  evadeRadius?: number;
  hideRadius?: number;
  pursuitRadius?: number;
  maxPredictionTime?: number;
  offsetDistance?: number;

  // Optional special ability parameters (using unknown for flexibility)
  [key: string]: unknown;
}

// Utility function to get enemies for current difficulty
export function getAvailableEnemies(difficulty: number): EnemyDefinition[] {
  return ENEMY_DEFINITIONS.filter(
    (enemy) =>
      difficulty >= enemy.difficultyRange.min &&
      difficulty <= enemy.difficultyRange.max
  );
}

// Utility function for weighted enemy selection
export function selectRandomEnemy(
  availableEnemies: EnemyDefinition[]
): EnemyDefinition {
  const totalWeight = availableEnemies.reduce(
    (sum, enemy) => sum + enemy.spawnWeight * enemy.spawnProbability,
    0
  );
  let random = Math.random() * totalWeight;

  for (const enemy of availableEnemies) {
    random -= enemy.spawnWeight * enemy.spawnProbability;
    if (random <= 0) {
      return enemy;
    }
  }

  return availableEnemies[availableEnemies.length - 1];
}
