import { Rock } from './Rock';
import { PowerUp } from './PowerUp';
import { Coin, CoinType } from './Coin';
import { Gem, GemType } from './Gem';
import {
  GAME_CONFIG,
  ROCK_CONFIG,
  POWERUP_CONFIG,
  COIN_CONFIG,
  GEM_CONFIG,
  PowerUpType,
  GameMode,
} from './constants';
import { randomInt, randomRange } from '../utils/math';
import { ObjectPool } from '../utils/ObjectPool';

export class ProceduralGenerator {
  private rockPool: ObjectPool<Rock>;
  private powerUpPool: ObjectPool<PowerUp>;
  private coinPool: ObjectPool<Coin>;
  private gemPool: ObjectPool<Gem>;
  private lastSpawnY: number;
  private minSpawnDistance: number;
  private maxSpawnDistance: number;
  private gameMode: GameMode = GameMode.CLASSIC;

  constructor() {
    this.rockPool = new ObjectPool(
      () => new Rock(),
      (rock) => rock.reset(),
      30
    );
    this.powerUpPool = new ObjectPool(
      () => new PowerUp(),
      (powerUp) => powerUp.reset(),
      10
    );
    this.coinPool = new ObjectPool(
      () => new Coin(),
      (coin) => coin.reset(),
      50
    );
    this.gemPool = new ObjectPool(
      () => new Gem(),
      (gem) => gem.reset(),
      20
    );
    this.lastSpawnY = -ROCK_CONFIG.MIN_SPAWN_DISTANCE;
    this.minSpawnDistance = ROCK_CONFIG.MIN_SPAWN_DISTANCE;
    this.maxSpawnDistance = ROCK_CONFIG.MAX_SPAWN_DISTANCE;
  }

  setGameMode(mode: GameMode): void {
    this.gameMode = mode;
  }

  update(scrollSpeed: number, difficulty: number, deltaTime: number): void {
    this.adjustDifficulty(difficulty);

    if (this.lastSpawnY > 0) {
      const spawnDistance = randomRange(
        this.minSpawnDistance,
        this.maxSpawnDistance
      );
      if (this.lastSpawnY - spawnDistance > 0) {
        this.spawnWave();
      }
    } else {
      this.lastSpawnY += scrollSpeed * deltaTime;
    }
  }

  private adjustDifficulty(difficulty: number): void {
    const difficultyFactor = 1 + difficulty * 0.5;
    this.minSpawnDistance = ROCK_CONFIG.MIN_SPAWN_DISTANCE / difficultyFactor;
    this.maxSpawnDistance = ROCK_CONFIG.MAX_SPAWN_DISTANCE / difficultyFactor;
  }

  private spawnWave(): void {
    // Zen mode: only collectibles, no obstacles
    if (this.gameMode === GameMode.ZEN) {
      this.spawnCollectibles();
      this.lastSpawnY = -50;
      return;
    }

    const availableLanes = [0, 1, 2];
    const numObstacles = Math.min(randomInt(1, 2), availableLanes.length);

    for (let i = 0; i < numObstacles; i++) {
      const laneIndex = randomInt(0, availableLanes.length - 1);
      const lane = availableLanes[laneIndex];
      availableLanes.splice(laneIndex, 1);

      const laneX = this.getLaneX(lane);

      // Spawn either powerup, collectible, or rock
      const roll = Math.random();
      if (roll < POWERUP_CONFIG.SPAWN_CHANCE) {
        this.spawnPowerUp(lane, laneX);
      } else if (
        roll <
        POWERUP_CONFIG.SPAWN_CHANCE + COIN_CONFIG.SPAWN_CHANCE
      ) {
        this.spawnCoin(lane, laneX);
      } else if (
        roll <
        POWERUP_CONFIG.SPAWN_CHANCE +
          COIN_CONFIG.SPAWN_CHANCE +
          GEM_CONFIG.SPAWN_CHANCE
      ) {
        this.spawnGem(lane, laneX);
      } else {
        this.spawnRock(lane, laneX);
      }
    }

    // Also spawn collectibles in free lanes sometimes
    this.spawnCollectibles();

    this.lastSpawnY = -50;
  }

  private spawnCollectibles(): void {
    // Randomly spawn coins/gems in empty lanes
    if (Math.random() < 0.6) {
      const lane = randomInt(0, 2);
      const laneX = this.getLaneX(lane);
      if (Math.random() < 0.8) {
        this.spawnCoin(lane, laneX);
      } else {
        this.spawnGem(lane, laneX);
      }
    }
  }

  private spawnRock(lane: number, laneX: number): void {
    const rock = this.rockPool.acquire();
    rock.init(lane, this.lastSpawnY, laneX);
  }

  private spawnPowerUp(lane: number, laneX: number): void {
    const powerUp = this.powerUpPool.acquire();
    const types = [
      PowerUpType.SHIELD,
      PowerUpType.CONTROL_BOOST,
      PowerUpType.SCORE_MULTIPLIER,
      PowerUpType.MAGNET,
      PowerUpType.GHOST,
      PowerUpType.SLOW_MOTION,
    ];
    const type = types[randomInt(0, types.length - 1)];
    powerUp.init(lane, this.lastSpawnY, laneX, type);
  }

  private spawnCoin(lane: number, laneX: number): void {
    const coin = this.coinPool.acquire();
    const roll = Math.random();
    let type: CoinType;
    if (roll < COIN_CONFIG.BRONZE_CHANCE) {
      type = CoinType.BRONZE;
    } else if (roll < COIN_CONFIG.BRONZE_CHANCE + COIN_CONFIG.SILVER_CHANCE) {
      type = CoinType.SILVER;
    } else {
      type = CoinType.GOLD;
    }
    coin.init(lane, this.lastSpawnY, laneX + 15, type);
  }

  private spawnGem(lane: number, laneX: number): void {
    const gem = this.gemPool.acquire();
    const roll = Math.random();
    let type: GemType;
    if (roll < GEM_CONFIG.BLUE_CHANCE) {
      type = GemType.BLUE;
    } else if (roll < GEM_CONFIG.BLUE_CHANCE + GEM_CONFIG.RED_CHANCE) {
      type = GemType.RED;
    } else {
      type = GemType.RAINBOW;
    }
    gem.init(lane, this.lastSpawnY, laneX + 15, type);
  }

  private getLaneX(lane: number): number {
    return (
      GAME_CONFIG.LANE_OFFSET +
      lane * GAME_CONFIG.LANE_WIDTH +
      GAME_CONFIG.LANE_WIDTH / 2 -
      ROCK_CONFIG.WIDTH / 2
    );
  }

  getActiveRocks(): Rock[] {
    return this.rockPool.getActive();
  }

  getActivePowerUps(): PowerUp[] {
    return this.powerUpPool.getActive();
  }

  getActiveCoins(): Coin[] {
    return this.coinPool.getActive();
  }

  getActiveGems(): Gem[] {
    return this.gemPool.getActive();
  }

  releaseRock(rock: Rock): void {
    this.rockPool.release(rock);
  }

  releasePowerUp(powerUp: PowerUp): void {
    this.powerUpPool.release(powerUp);
  }

  releaseCoin(coin: Coin): void {
    this.coinPool.release(coin);
  }

  releaseGem(gem: Gem): void {
    this.gemPool.release(gem);
  }

  reset(): void {
    this.rockPool.releaseAll();
    this.powerUpPool.releaseAll();
    this.coinPool.releaseAll();
    this.gemPool.releaseAll();
    this.lastSpawnY = -ROCK_CONFIG.MIN_SPAWN_DISTANCE;
  }
}
