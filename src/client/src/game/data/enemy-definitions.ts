import { Vehicle, SeekBehavior, FleeBehavior, WanderBehavior, PursueBehavior, EvadeBehavior, ObstacleAvoidanceBehavior, Vector3 } from 'yuka';

export interface EnemyDefinition {
  id: string;
  name: string;
  description: string;
  behaviors: {
    primary: string;
    secondary?: string;
    defensive?: string;
  };
  stats: {
    speed: number;
    health: number;
    aggression: number; // 0-10 scale
  };
  spawn: {
    minDistance: number; // meters from player
    maxDistance: number;
    minDifficulty: number; // 0-10 scale
    weight: number; // spawn probability weight
  };
  scoring: {
    points: number;
    bonusMultiplier: number;
  };
  abilities: {
    specialAttack?: string;
    pattern?: string;
    cooldown?: number; // seconds
    range?: number; // meters
  };
  visual: {
    size: number;
    color: string;
    animationSpeed: number;
  };
}

export const ENEMY_DEFINITIONS: EnemyDefinition[] = [
  {
    id: 'driftwood',
    name: 'Lazy Driftwood',
    description: 'Slow-moving wooden debris that drifts predictably downstream. Perfect for beginners to practice dodging.',
    behaviors: {
      primary: 'Wander',
      secondary: 'ObstacleAvoidance'
    },
    stats: {
      speed: 1.2,
      health: 1,
      aggression: 0
    },
    spawn: {
      minDistance: 10,
      maxDistance: 50,
      minDifficulty: 0,
      weight: 10
    },
    scoring: {
      points: 10,
      bonusMultiplier: 1.0
    },
    abilities: {
      pattern: 'drift_downstream',
      cooldown: 0
    },
    visual: {
      size: 1.5,
      color: '#8B4513',
      animationSpeed: 0.5
    }
  },

  {
    id: 'territorial_fish',
    name: 'Territorial Bass',
    description: 'Aggressive fish that chases otters away from its territory. Will pursue for a short distance before giving up.',
    behaviors: {
      primary: 'Pursue',
      secondary: 'Wander',
      defensive: 'Flee'
    },
    stats: {
      speed: 2.5,
      health: 2,
      aggression: 4
    },
    spawn: {
      minDistance: 8,
      maxDistance: 30,
      minDifficulty: 1,
      weight: 8
    },
    scoring: {
      points: 25,
      bonusMultiplier: 1.2
    },
    abilities: {
      specialAttack: 'charge_bite',
      pattern: 'territorial_chase',
      cooldown: 3,
      range: 15
    },
    visual: {
      size: 1.0,
      color: '#228B22',
      animationSpeed: 2.0
    }
  },

  {
    id: 'whirlpool_crab',
    name: 'Whirlpool Crab',
    description: 'Cunning crab that creates circular current traps. Uses unpredictable spiral movements to confuse prey.',
    behaviors: {
      primary: 'Seek',
      secondary: 'Wander',
      defensive: 'Evade'
    },
    stats: {
      speed: 3.0,
      health: 3,
      aggression: 6
    },
    spawn: {
      minDistance: 12,
      maxDistance: 40,
      minDifficulty: 2,
      weight: 6
    },
    scoring: {
      points: 50,
      bonusMultiplier: 1.5
    },
    abilities: {
      specialAttack: 'whirlpool_trap',
      pattern: 'spiral_dance',
      cooldown: 8,
      range: 12
    },
    visual: {
      size: 0.8,
      color: '#FF6347',
      animationSpeed: 3.0
    }
  },

  {
    id: 'snapping_turtle',
    name: 'Ancient Snapper',
    description: 'Massive turtle that alternates between patient waiting and explosive strikes. Uses ambush tactics.',
    behaviors: {
      primary: 'Arrive',
      secondary: 'Pursue',
      defensive: 'ObstacleAvoidance'
    },
    stats: {
      speed: 1.8,
      health: 5,
      aggression: 7
    },
    spawn: {
      minDistance: 15,
      maxDistance: 35,
      minDifficulty: 3,
      weight: 5
    },
    scoring: {
      points: 100,
      bonusMultiplier: 2.0
    },
    abilities: {
      specialAttack: 'lightning_snap',
      pattern: 'ambush_strike',
      cooldown: 5,
      range: 8
    },
    visual: {
      size: 2.5,
      color: '#556B2F',
      animationSpeed: 1.0
    }
  },

  {
    id: 'electric_eel',
    name: 'Voltage Viper',
    description: 'Highly intelligent eel that predicts otter movement patterns. Creates electric barriers and uses advanced evasion.',
    behaviors: {
      primary: 'Evade',
      secondary: 'Pursue',
      defensive: 'Flee'
    },
    stats: {
      speed: 4.2,
      health: 4,
      aggression: 8
    },
    spawn: {
      minDistance: 20,
      maxDistance: 45,
      minDifficulty: 5,
      weight: 4
    },
    scoring: {
      points: 200,
      bonusMultiplier: 2.5
    },
    abilities: {
      specialAttack: 'electric_surge',
      pattern: 'predictive_intercept',
      cooldown: 6,
      range: 18
    },
    visual: {
      size: 3.0,
      color: '#4169E1',
      animationSpeed: 4.0
    }
  },

  {
    id: 'hydra_boss',
    name: 'River Hydra',
    description: 'Legendary multi-headed serpent with complex AI. Each head uses different behaviors simultaneously. Adapts strategy based on player actions.',
    behaviors: {
      primary: 'Seek',
      secondary: 'Pursue',
      defensive: 'Evade'
    },
    stats: {
      speed: 3.5,
      health: 12,
      aggression: 10
    },
    spawn: {
      minDistance: 25,
      maxDistance: 60,
      minDifficulty: 7,
      weight: 1
    },
    scoring: {
      points: 1000,
      bonusMultiplier: 5.0
    },
    abilities: {
      specialAttack: 'tri_head_assault',
      pattern: 'adaptive_formation',
      cooldown: 4,
      range: 25
    },
    visual: {
      size: 4.0,
      color: '#8A2BE2',
      animationSpeed: 2.5
    }
  }
];

export class EnemyAI extends Vehicle {
  private definition: EnemyDefinition;
  private behaviorCooldown: number = 0;
  private lastPlayerPosition: Vector3 = new Vector3();
  private adaptationLevel: number = 0;

  constructor(definition: EnemyDefinition) {
    super();
    this.definition = definition;
    this.maxSpeed = definition.stats.speed;
    this.setupBehaviors();
  }

  private setupBehaviors(): void {
    const behaviors = this.definition.behaviors;
    
    // Primary behavior setup
    switch (behaviors.primary) {
      case 'Seek':
        this.steering.add(new Seek(this, this.lastPlayerPosition));
        break;
      case 'Pursue':
        this.steering.add(new Pursue(this, this.lastPlayerPosition));
        break;
      case 'Wander':
        this.steering.add(new Wander(this));
        break;
      case 'Evade':
        this.steering.add(new Evade(this, this.lastPlayerPosition));
        break;
      case 'Arrive':
        this.steering.add(new Arrive(this, this.lastPlayerPosition));
        break;
    }

    // Always add obstacle avoidance for safety
    this.steering.add(new ObstacleAvoidance(this));
  }

  public update(delta: number, playerPosition: Vector3, gameState: any): void {
    this.lastPlayerPosition.copy(playerPosition);
    this.behaviorCooldown -= delta;

    // Update AI based on enemy type
    switch (this.definition.id) {
      case 'hydra_boss':
        this.updateHydraBehavior(delta, playerPosition, gameState);
        break;
      case 'electric_eel':
        this.updateElectricEelBehavior(delta, playerPosition, gameState);
        break;
      case 'territorial_fish':
        this.updateTerritorialBehavior(delta, playerPosition, gameState);
        break;
      default:
        this.updateBasicBehavior(delta, playerPosition, gameState);
    }

    super.update(delta);
  }

  private updateHydraBehavior(delta: number, playerPos: Vector3, gameState: any): void {
    // Multi-head logic with different behaviors per head
    this.adaptationLevel = Math.min(10, this.adaptationLevel + delta * 0.1);
    
    if (this.behaviorCooldown <= 0) {
      const distance = this.position.distanceTo(playerPos);
      if (distance < this.definition.abilities.range!) {
        this.executeSpecialAttack();
        this.behaviorCooldown = this.definition.abilities.cooldown!;
      }
    }
  }

  private updateElectricEelBehavior(delta: number, playerPos: Vector3, gameState: any): void {
    // Predictive movement based on player velocity
    const predictedPosition = playerPos.clone().add(
      gameState.playerVelocity?.clone().multiplyScalar(1.5) || new Vector3()
    );
    
    if (this.steering.behaviors[0] instanceof Seek) {
      (this.steering.behaviors[0] as Seek).target = predictedPosition;
    }
  }

  private updateTerritorialBehavior(delta: number, playerPos: Vector3, gameState: any): void {
    const distance = this.position.distanceTo(playerPos);
    const territoryRange = 20;

    if (distance > territoryRange && this.definition.stats.aggression > 0) {
      // Return to territory
      this.steering.clear();
      this.steering.add(new Wander(this));
    } else if (distance < territoryRange) {
      // Chase player
      this.steering.clear();
      this.steering.add(new Pursue(this, playerPos));
    }
  }

  private updateBasicBehavior(delta: number, playerPos: Vector3, gameState: any): void {
    // Standard behavior update
    if (this.behaviorCooldown <= 0 && this.definition.abilities.specialAttack) {
      const distance = this.position.distanceTo(playerPos);
      if (distance < (this.definition.abilities.range || 10)) {
        this.executeSpecialAttack();
        this.behaviorCooldown = this.definition.abilities.cooldown || 3;
      }
    }
  }

  private executeSpecialAttack(): void {
    // Emit event for game to handle special attack
    this.dispatchEvent({
      type: 'specialAttack',
      enemyId: this.definition.id,
      attackType: this.definition.abilities.specialAttack,
      position: this.position.clone()
    });
  }

  public getDefinition(): EnemyDefinition {
    return this.definition;
  }
}
