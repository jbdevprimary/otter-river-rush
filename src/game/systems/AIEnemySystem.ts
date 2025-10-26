/**
 * AI Enemy System using Yuka.js for pathfinding and behaviors
 */

import * as YUKA from 'yuka';

export enum EnemyType {
  CHASER = 'CHASER', // Follows player
  PATROL = 'PATROL', // Patrols lanes
  ZIGZAG = 'ZIGZAG', // Zigzag pattern
  AMBUSH = 'AMBUSH', // Waits and strikes
}

export interface EnemyConfig {
  type: EnemyType;
  speed: number;
  health: number;
  scoreValue: number;
  aiUpdateInterval: number; // How often to recalculate path (ms)
}

export class AIEnemy {
  public vehicle: YUKA.Vehicle;
  public type: EnemyType;
  public health: number;
  public scoreValue: number;
  public active: boolean = true;

  private aiUpdateInterval: number;
  private lastAIUpdate: number = 0;
  private targetPosition: YUKA.Vector3;
  private patrolPoints: YUKA.Vector3[] = [];
  private currentPatrolIndex: number = 0;

  constructor(position: YUKA.Vector3, config: EnemyConfig) {
    this.vehicle = new YUKA.Vehicle();
    this.vehicle.position.copy(position);
    this.vehicle.maxSpeed = config.speed;
    this.vehicle.maxForce = config.speed * 2;

    this.type = config.type;
    this.health = config.health;
    this.scoreValue = config.scoreValue;
    this.aiUpdateInterval = config.aiUpdateInterval;
    this.targetPosition = new YUKA.Vector3();

    this.setupBehavior();
  }

  /**
   * Setup AI behavior based on enemy type
   */
  private setupBehavior(): void {
    // Clear any existing behaviors
    this.vehicle.steering.clear();

    switch (this.type) {
      case EnemyType.CHASER:
        // Seek behavior will be set dynamically in update
        break;

      case EnemyType.PATROL:
        // Setup patrol points (will be set externally)
        break;

      case EnemyType.ZIGZAG: {
        // Wander behavior for zigzag movement
        const wanderBehavior = new YUKA.WanderBehavior();
        wanderBehavior.weight = 1;
        this.vehicle.steering.add(wanderBehavior);
        break;
      }

      case EnemyType.AMBUSH:
        // Starts stationary, will activate when player is close
        this.vehicle.maxSpeed = 0;
        break;
    }
  }

  /**
   * Update AI enemy
   */
  public update(
    deltaTime: number,
    playerPosition: { x: number; y: number },
    lanes: number[],
    currentTime: number
  ): void {
    if (!this.active) return;

    // AI decision making (not every frame for performance)
    if (currentTime - this.lastAIUpdate > this.aiUpdateInterval) {
      this.updateAI(playerPosition, lanes);
      this.lastAIUpdate = currentTime;
    }

    // Update vehicle physics
    this.vehicle.update(deltaTime);
  }

  /**
   * Update AI decision making
   */
  private updateAI(
    playerPosition: { x: number; y: number },
    lanes: number[]
  ): void {
    const playerPos = new YUKA.Vector3(playerPosition.x, playerPosition.y, 0);

    switch (this.type) {
      case EnemyType.CHASER:
        this.updateChaser(playerPos);
        break;

      case EnemyType.PATROL:
        this.updatePatrol(lanes);
        break;

      case EnemyType.ZIGZAG:
        // Zigzag behavior is handled by wander behavior
        break;

      case EnemyType.AMBUSH:
        this.updateAmbush(playerPos);
        break;
    }
  }

  /**
   * Chaser AI: Seek player
   */
  private updateChaser(playerPos: YUKA.Vector3): void {
    this.vehicle.steering.clear();

    const seekBehavior = new YUKA.SeekBehavior(playerPos);
    seekBehavior.weight = 1;
    this.vehicle.steering.add(seekBehavior);

    // Add obstacle avoidance
    const evadeBehavior = new YUKA.EvadeBehavior(this.vehicle);
    evadeBehavior.weight = 0.5;
    this.vehicle.steering.add(evadeBehavior);
  }

  /**
   * Patrol AI: Move between lanes
   */
  private updatePatrol(lanes: number[]): void {
    if (this.patrolPoints.length === 0) {
      // Initialize patrol points based on lanes
      this.patrolPoints = lanes.map(
        (laneX) => new YUKA.Vector3(laneX, this.vehicle.position.y, 0)
      );
    }

    // Check if reached current patrol point
    const currentPoint = this.patrolPoints[this.currentPatrolIndex];
    const distance = this.vehicle.position.distanceTo(currentPoint);

    if (distance < 20) {
      // Move to next patrol point
      this.currentPatrolIndex =
        (this.currentPatrolIndex + 1) % this.patrolPoints.length;
    }

    // Seek current patrol point
    this.vehicle.steering.clear();
    const seekBehavior = new YUKA.SeekBehavior(
      this.patrolPoints[this.currentPatrolIndex]
    );
    seekBehavior.weight = 1;
    this.vehicle.steering.add(seekBehavior);
  }

  /**
   * Ambush AI: Wait and strike when player is close
   */
  private updateAmbush(playerPos: YUKA.Vector3): void {
    const distanceToPlayer = this.vehicle.position.distanceTo(playerPos);

    // Activate when player is within range
    if (distanceToPlayer < 150 && this.vehicle.maxSpeed === 0) {
      // Activate!
      this.vehicle.maxSpeed = 200; // Fast strike
      this.vehicle.steering.clear();

      const pursueBehavior = new YUKA.PursuitBehavior(this.vehicle, playerPos);
      pursueBehavior.weight = 1;
      this.vehicle.steering.add(pursueBehavior);
    }
  }

  /**
   * Take damage
   */
  public takeDamage(amount: number): boolean {
    this.health -= amount;
    if (this.health <= 0) {
      this.active = false;
      return true; // Enemy destroyed
    }
    return false;
  }

  /**
   * Get position for rendering
   */
  public getPosition(): { x: number; y: number } {
    return {
      x: this.vehicle.position.x,
      y: this.vehicle.position.y,
    };
  }

  /**
   * Get rotation for rendering
   */
  public getRotation(): number {
    // Calculate angle from velocity
    const velocity = this.vehicle.velocity;
    return Math.atan2(velocity.y, velocity.x);
  }

  /**
   * Reset enemy
   */
  public reset(): void {
    this.active = false;
    this.health = 0;
    this.vehicle.steering.clear();
  }
}

/**
 * AI Enemy Manager
 */
export class AIEnemyManager {
  private enemies: AIEnemy[] = [];
  private entityManager: YUKA.EntityManager;
  private time: YUKA.Time;

  constructor() {
    this.entityManager = new YUKA.EntityManager();
    this.time = new YUKA.Time();
  }

  /**
   * Spawn an AI enemy
   */
  public spawn(position: { x: number; y: number }, type: EnemyType): AIEnemy {
    const configs: Record<EnemyType, EnemyConfig> = {
      [EnemyType.CHASER]: {
        type: EnemyType.CHASER,
        speed: 120,
        health: 1,
        scoreValue: 100,
        aiUpdateInterval: 100, // Update every 100ms
      },
      [EnemyType.PATROL]: {
        type: EnemyType.PATROL,
        speed: 80,
        health: 2,
        scoreValue: 150,
        aiUpdateInterval: 200,
      },
      [EnemyType.ZIGZAG]: {
        type: EnemyType.ZIGZAG,
        speed: 100,
        health: 1,
        scoreValue: 120,
        aiUpdateInterval: 150,
      },
      [EnemyType.AMBUSH]: {
        type: EnemyType.AMBUSH,
        speed: 0, // Starts stationary
        health: 3,
        scoreValue: 200,
        aiUpdateInterval: 50, // Check frequently for activation
      },
    };

    const config = configs[type];
    const yukaPos = new YUKA.Vector3(position.x, position.y, 0);
    const enemy = new AIEnemy(yukaPos, config);

    this.enemies.push(enemy);
    this.entityManager.add(enemy.vehicle);

    return enemy;
  }

  /**
   * Update all AI enemies
   */
  public update(
    deltaTime: number,
    playerPosition: { x: number; y: number },
    lanes: number[]
  ): void {
    const currentTime = performance.now();

    // Update Yuka's time
    this.time.update();
    const yukaDelta = this.time.getDelta();

    // Update entity manager
    this.entityManager.update(yukaDelta);

    // Update individual enemies
    this.enemies = this.enemies.filter((enemy) => {
      if (!enemy.active) {
        this.entityManager.remove(enemy.vehicle);
        return false;
      }

      enemy.update(deltaTime, playerPosition, lanes, currentTime);
      return true;
    });
  }

  /**
   * Get all active enemies
   */
  public getActive(): AIEnemy[] {
    return this.enemies.filter((e) => e.active);
  }

  /**
   * Clear all enemies
   */
  public clear(): void {
    this.enemies.forEach((enemy) => {
      this.entityManager.remove(enemy.vehicle);
    });
    this.enemies = [];
  }

  /**
   * Get enemy count
   */
  public getCount(): number {
    return this.enemies.length;
  }
}
