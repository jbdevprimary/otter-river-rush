# Otter River Rush - Comprehensive Architecture Document

**Document Type:** 🔒 Frozen Technical Specification  
**Version:** 1.0.0  
**Last Updated:** 2025-10-27  
**Status:** LOCKED - Technical Foundation Document

---

## 🎯 Architecture Vision

**This architecture exists to serve the DESIGN, not the other way around.**

### Core Architectural Principles
1. **Design-First:** Every technical decision supports gameplay and player experience
2. **Performance:** 60 FPS is non-negotiable across all target devices
3. **Simplicity:** Choose boring, proven solutions over clever ones
4. **Accessibility:** Technical choices must never compromise accessibility
5. **Maintainability:** Code should be readable and modifiable by future developers

---

## 📐 High-Level System Architecture

### The Big Picture
```
┌─────────────────────────────────────────────────────────────┐
│                        PLAYER                               │
│                          ↓                                  │
│              ┌──────────────────────┐                      │
│              │   Input System       │                       │
│              │  (Touch/Keys/Mouse)  │                       │
│              └──────────┬───────────┘                       │
│                         ↓                                   │
│              ┌──────────────────────┐                      │
│              │   Game State Machine │                       │
│              │  (MENU/PLAY/PAUSE)   │                       │
│              └──────────┬───────────┘                       │
│                         ↓                                   │
│    ┌────────────────────────────────────────┐              │
│    │          GAME LOOP (60 FPS)            │              │
│    │                                        │              │
│    │  │ Physics  │  │Procedural│  │ Score │              │
│    │  │ System   │  │Generator │  │Manager│              │
│    │  │ System   │  │Generator │  │Manager││              │
│    │  └────┬─────┘  └────┬─────┘  └───┬───┘│              │
│    │       └─────────────┬─────────────┘    │              │
│    │                     ↓                   │              │
│    │         ┌──────────────────┐           │              │
│    │         │   Entity World   │           │              │
│    │         │  (Rusty, Rocks,  │           │              │
│    │         │   Collectibles)  │           │              │
│    │         └─────────┬────────┘           │              │
│    └───────────────────┼────────────────────┘              │
│                        ↓                                    │
│              ┌──────────────────────┐                      │
│              │   Rendering Engine   │                       │
│              │  (Canvas 2D Layer)   │                       │
│              └──────────┬───────────┘                       │
│                         ↓                                   │
│              ┌──────────────────────┐                      │
│              │   Audio Engine       │                       │
│              │   (Howler.js)        │                       │
│              └──────────────────────┘                       │
│                         ↓                                   │
│                    [SCREEN + 🔊]                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Layer Architecture

### Layer 1: Platform Layer (Foundation)
**Responsibility:** Abstract platform differences, provide unified API

```typescript
// Platform abstraction
interface Platform {
  // Input
  getInputMethod(): 'touch' | 'mouse' | 'keyboard';
  supportsVibration(): boolean;
  
  // Display
  getScreenSize(): { width: number; height: number };
  getPixelRatio(): number;
  getOrientation(): 'portrait' | 'landscape';
  
  // Storage
  saveData(key: string, data: any): Promise<void>;
  loadData(key: string): Promise<any>;
  
  // Audio
  canPlayAudio(): boolean;
  getAudioContext(): AudioContext;
  
  // Performance
  requestAnimationFrame(callback: FrameRequestCallback): number;
  now(): number;
}
```

**Implementation:**
- Browser detection (mobile vs desktop)
- Feature detection (touch support, storage, audio)
- Polyfills for missing features
- Performance monitoring hooks

### Layer 2: Core Systems Layer
**Responsibility:** Game-agnostic systems that power gameplay

#### 2.1 Game Loop System
```typescript
class GameLoop {
  private lastFrameTime: number = 0;
  private accumulatedTime: number = 0;
  private readonly FIXED_TIMESTEP = 1000 / 60; // 60 FPS
  
  public start(): void {
    // Start main loop using requestAnimationFrame
  }
  
  private update(currentTime: number): void {
    const deltaTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;
    
    // Fixed timestep for physics
    this.accumulatedTime += deltaTime;
    
    while (this.accumulatedTime >= this.FIXED_TIMESTEP) {
      this.fixedUpdate(this.FIXED_TIMESTEP);
      this.accumulatedTime -= this.FIXED_TIMESTEP;
    }
    
    // Variable timestep for rendering
    this.render(deltaTime);
  }
  
  private fixedUpdate(dt: number): void {
    // Physics, collision, gameplay logic
    // Always called with consistent timestep
  }
  
  private render(dt: number): void {
    // Rendering, interpolation, visual effects
    // Can vary based on performance
  }
}
```

**Why Fixed Timestep:**
- Physics remains deterministic
- Consistent gameplay across devices
- Reproducible bugs (easier testing)
- Collision detection accuracy

#### 2.2 Entity Component System (ECS)
```typescript
// Component (data only)
interface Component {
  type: string;
}

interface TransformComponent extends Component {
  type: 'transform';
  position: Vector2D;
  rotation: number;
  scale: Vector2D;
}

interface RenderComponent extends Component {
  type: 'render';
  sprite: Sprite;
  layer: number;
  visible: boolean;
}

interface PhysicsComponent extends Component {
  type: 'physics';
  velocity: Vector2D;
  acceleration: Vector2D;
  mass: number;
}

interface ColliderComponent extends Component {
  type: 'collider';
  shape: 'circle' | 'rect' | 'polygon';
  radius?: number; // for circle
  width?: number;  // for rect
  height?: number; // for rect
  vertices?: Vector2D[]; // for polygon
}

// Entity (collection of components)
class Entity {
  public readonly id: string;
  private components: Map<string, Component> = new Map();
  
  public addComponent<T extends Component>(component: T): void {
    this.components.set(component.type, component);
  }
  
  public getComponent<T extends Component>(type: string): T | undefined {
    return this.components.get(type) as T;
  }
  
  public hasComponent(type: string): boolean {
    return this.components.has(type);
  }
}

// System (logic only, processes entities with specific components)
abstract class System {
  protected entities: Entity[] = [];
  
  // Which components this system requires
  protected abstract requiredComponents: string[];
  
  public addEntity(entity: Entity): void {
    if (this.matchesRequirements(entity)) {
      this.entities.push(entity);
    }
  }
  
  public removeEntity(entity: Entity): void {
    const index = this.entities.indexOf(entity);
public removeEntity(entity: Entity): void {
  const index = this.entities.indexOf(entity);
  if (index > -1) {
    // Swap with the last element and pop for O(1) removal
    this.entities[index] = this.entities[this.entities.length - 1];
    this.entities.pop();
  }
}
  }
  
  private matchesRequirements(entity: Entity): boolean {
    return this.requiredComponents.every(comp => 
      entity.hasComponent(comp)
    );
  }
  
  public abstract update(deltaTime: number): void;
}
```

**Why ECS:**
- Separation of data and logic
- Easy to add new behaviors
- Cache-friendly (data locality)
- Composition over inheritance
- Testable in isolation

#### 2.3 Spatial Partitioning System
```typescript
class SpatialGrid {
  private cellSize: number;
  private grid: Map<string, Entity[]> = new Map();
  
  constructor(cellSize: number = 100) {
    this.cellSize = cellSize;
  }
  
  public clear(): void {
    this.grid.clear();
  }
  
  public insert(entity: Entity): void {
    const transform = entity.getComponent<TransformComponent>('transform');
    const collider = entity.getComponent<ColliderComponent>('collider');
    
    if (!transform || !collider) return;
    
    const cellKey = this.getCellKey(
      transform.position.x,
      transform.position.y
    );
    
    if (!this.grid.has(cellKey)) {
      this.grid.set(cellKey, []);
    }
    
    this.grid.get(cellKey)!.push(entity);
  }
  
  public getNearby(entity: Entity): Entity[] {
    const transform = entity.getComponent<TransformComponent>('transform');
    if (!transform) return [];
    
    const nearby: Entity[] = [];
    const { x, y } = transform.position;
    
    // Check 3x3 grid around entity
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const cellX = Math.floor(x / this.cellSize) + dx;
        const cellY = Math.floor(y / this.cellSize) + dy;
        const key = `${cellX},${cellY}`;
        
        const cellEntities = this.grid.get(key);
        if (cellEntities) {
          nearby.push(...cellEntities);
        }
      }
    }
    
    return nearby;
  }
  
  private getCellKey(x: number, y: number): string {
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);
    return `${cellX},${cellY}`;
  }
}
```

**Why Spatial Partitioning:**
- O(n²) → O(n) collision checks
- Only check nearby entities
- Scales to hundreds of entities
- Critical for 60 FPS performance

### Layer 3: Game Systems Layer
**Responsibility:** Otter River Rush specific logic

#### 3.1 Physics System
```typescript
class PhysicsSystem extends System {
  protected requiredComponents = ['transform', 'physics'];
  private gravity: Vector2D = { x: 0, y: 0 }; // No gravity in this game
  
  public update(deltaTime: number): void {
    for (const entity of this.entities) {
      const transform = entity.getComponent<TransformComponent>('transform')!;
      const physics = entity.getComponent<PhysicsComponent>('physics')!;
      
      // Apply acceleration
      physics.velocity.x += physics.acceleration.x * deltaTime;
      physics.velocity.y += physics.acceleration.y * deltaTime;
      
      // Apply velocity
      transform.position.x += physics.velocity.x * deltaTime;
      transform.position.y += physics.velocity.y * deltaTime;
      
      // Friction (optional)
      physics.velocity.x *= 0.98;
      physics.velocity.y *= 0.98;
    }
  }
}
```

#### 3.2 Collision System
```typescript
class CollisionSystem extends System {
  protected requiredComponents = ['transform', 'collider'];
  private spatialGrid: SpatialGrid = new SpatialGrid(100);
  
  public update(deltaTime: number): void {
    // Rebuild spatial grid each frame
    this.spatialGrid.clear();
    for (const entity of this.entities) {
      this.spatialGrid.insert(entity);
    }
    
    // Check collisions
    const checked = new Set<string>();
    
    for (const entityA of this.entities) {
      const nearbyEntities = this.spatialGrid.getNearby(entityA);
      
      for (const entityB of nearbyEntities) {
        if (entityA === entityB) continue;
        
        // Avoid duplicate checks
        const pairKey = this.getPairKey(entityA.id, entityB.id);
        if (checked.has(pairKey)) continue;
        checked.add(pairKey);
        
        if (this.checkCollision(entityA, entityB)) {
          this.resolveCollision(entityA, entityB);
        }
      }
    }
  }
  
  private checkCollision(a: Entity, b: Entity): boolean {
    const transformA = a.getComponent<TransformComponent>('transform')!;
    const transformB = b.getComponent<TransformComponent>('transform')!;
    const colliderA = a.getComponent<ColliderComponent>('collider')!;
    const colliderB = b.getComponent<ColliderComponent>('collider')!;
    
    // Circle-circle collision (most common in game)
    if (colliderA.shape === 'circle' && colliderB.shape === 'circle') {
      const dx = transformA.position.x - transformB.position.x;
      const dy = transformA.position.y - transformB.position.y;
      const distanceSq = dx * dx + dy * dy;
      const radiusSum = colliderA.radius! + colliderB.radius!;
      
      return distanceSq < radiusSum * radiusSum;
    }
    
    // Add rect-rect, circle-rect as needed
    return false;
  }
  
  private resolveCollision(a: Entity, b: Entity): void {
    // Emit collision event
    EventBus.emit('collision', { entityA: a, entityB: b });
  }
  
  private getPairKey(idA: string, idB: string): string {
    return idA < idB ? `${idA}-${idB}` : `${idB}-${idA}`;
  }
}
```

#### 3.3 Procedural Generation System
```typescript
interface ObstaclePattern {
  name: string;
  lanes: number[]; // Which lanes have obstacles (0-2)
  spacing: number;  // Vertical spacing
  difficulty: number; // 1-10
}

class ProceduralGenerator {
  private seed: number;
  private rng: SeededRandom;
  private baseDistance: number = 0;
  private difficultyMultiplier: number = 1.0;
  private recentDeaths: number[] = []; // Timestamps of recent deaths
  private perfectRunStreak: number = 0;
  
  private patterns: ObstaclePattern[] = [
    { name: 'single', lanes: [1], spacing: 200, difficulty: 1 },
    { name: 'double', lanes: [0, 2], spacing: 200, difficulty: 2 },
    { name: 'zigzag', lanes: [0, 1, 2], spacing: 150, difficulty: 4 },
    { name: 'cluster', lanes: [0, 1, 2], spacing: 100, difficulty: 6 },
    // ... more patterns
  ];
  
  constructor(seed?: number) {
    this.seed = seed || Date.now();
    this.rng = new SeededRandom(this.seed);
  }
  
  public generateObstacles(
    distance: number,
    currentBiome: Biome
  ): Entity[] {
    const obstacles: Entity[] = [];
    
    // Select pattern based on distance (difficulty)
    const availablePatterns = this.patterns.filter(p => 
      p.difficulty <= this.getDifficulty(distance)
    );
    
    const pattern = this.rng.choose(availablePatterns);
    
    // Generate obstacles based on pattern
    for (let i = 0; i < pattern.lanes.length; i++) {
      const lane = pattern.lanes[i];
      const y = distance + (i * pattern.spacing);
      
      const obstacle = this.createObstacle(lane, y, currentBiome);
      obstacles.push(obstacle);
    }
    
    return obstacles;
  }
  
  private getDifficulty(distance: number): number {
    // Base difficulty scaling
    // 0-500m: diff 1-2
    // 500-1000m: diff 2-4
    // 1000-2000m: diff 4-6
    // 2000m+: diff 6-10
    const baseDifficulty = Math.min(10, Math.floor(distance / 200) + 1);
    
    // Apply Dynamic Difficulty Adjustment (DDA)
    return Math.max(1, Math.min(10, baseDifficulty * this.difficultyMultiplier));
  }
  
  /**
   * Dynamic Difficulty Adjustment (DDA)
   * Adjusts difficulty based on player performance
   */
  public recordDeath(): void {
    const now = Date.now();
    this.recentDeaths.push(now);
    
    // Keep only deaths from last 60 seconds
    this.recentDeaths = this.recentDeaths.filter(t => now - t < 60000);
    
    // If player died 3+ times in last minute, scale back difficulty
    if (this.recentDeaths.length >= 3) {
      this.difficultyMultiplier = Math.max(0.7, this.difficultyMultiplier - 0.1);
    }
    
    this.perfectRunStreak = 0;
  }
  
  public recordSuccessfulDodge(): void {
    this.perfectRunStreak++;
    
    // If player is doing well (50+ consecutive dodges), scale up slightly
    if (this.perfectRunStreak > 50) {
      this.difficultyMultiplier = Math.min(1.3, this.difficultyMultiplier + 0.05);
      this.perfectRunStreak = 0; // Reset to avoid runaway difficulty
    }
  }
  
  public increasePowerUpSpawnRate(): number {
    // When player is struggling, increase power-up spawn rate
    return this.recentDeaths.length >= 2 ? 1.5 : 1.0;
  }
  
  private createObstacle(
    lane: number,
    y: number,
    biome: Biome
  ): Entity {
    const entity = new Entity();
    
    // Transform component
    entity.addComponent<TransformComponent>({
      type: 'transform',
      position: { x: this.getLaneX(lane), y },
      rotation: 0,
      scale: { x: 1, y: 1 }
    });
    
    // Collider component
    entity.addComponent<ColliderComponent>({
      type: 'collider',
      shape: 'circle',
      radius: 30
    });
    
    // Render component
    entity.addComponent<RenderComponent>({
      type: 'render',
      sprite: biome.obstacleSprite,
      layer: 1,
      visible: true
    });
    
    return entity;
  }
  
  private getLaneX(lane: number): number {
    // Assuming 3 lanes, centered on screen
    const laneWidth = 100;
    const centerX = 150; // Half of 300px screen width
    return centerX + ((lane - 1) * laneWidth);
  }
}
```

**Why Pattern-Based Generation:**
- Learnable (players can recognize patterns)
- Fair (no impossible situations)
- Difficulty controlled
- Deterministic (same seed = same river)
- Testable (can replay exact runs)

#### 3.4 Score System
```typescript
interface ScoreEvent {
  type: 'coin' | 'gem' | 'distance' | 'combo' | 'nearMiss';
  value: number;
  timestamp: number;
}

class ScoreSystem {
  private score: number = 0;
  private coins: number = 0;
  private gems: number = 0;
  private distance: number = 0;
  private combo: number = 0;
  private comboTimer: number = 0;
  private multiplier: number = 1;
  private events: ScoreEvent[] = [];
  
  public update(deltaTime: number): void {
    // Update distance (continuous)
    this.distance += deltaTime * 0.1; // 10m per second base
    
    // Combo timer decay
    if (this.comboTimer > 0) {
      this.comboTimer -= deltaTime;
      if (this.comboTimer <= 0) {
        this.resetCombo();
      }
    }
  }
  
  public collectCoin(): void {
    this.coins++;
    this.score += 10 * this.multiplier;
    this.incrementCombo();
    
    this.events.push({
      type: 'coin',
      value: 10 * this.multiplier,
      timestamp: Date.now()
    });
    
    EventBus.emit('coinCollected', { coins: this.coins });
  }
  
  public collectGem(): void {
    this.gems++;
    this.score += 50 * this.multiplier;
    this.incrementCombo();
    
    this.events.push({
      type: 'gem',
      value: 50 * this.multiplier,
      timestamp: Date.now()
    });
    
    EventBus.emit('gemCollected', { gems: this.gems });
  }
  
  public recordNearMiss(): void {
    this.score += 5 * this.multiplier;
    this.incrementCombo();
    
    this.events.push({
      type: 'nearMiss',
      value: 5 * this.multiplier,
      timestamp: Date.now()
    });
    
    EventBus.emit('nearMiss', { combo: this.combo });
  }
  
  private incrementCombo(): void {
    this.combo++;
    this.comboTimer = 2000; // 2 seconds to maintain combo
    
    // Combo multiplier bonus
    if (this.combo >= 10) {
      this.multiplier = 2;
    } else {
      this.multiplier = 1;
    }
    
    EventBus.emit('comboChanged', { combo: this.combo });
  }
  
  private resetCombo(): void {
    this.combo = 0;
    this.multiplier = 1;
    EventBus.emit('comboReset', {});
  }
  
  public getStats(): ScoreStats {
    return {
      score: Math.floor(this.score),
      coins: this.coins,
      gems: this.gems,
      distance: Math.floor(this.distance),
      combo: this.combo,
      multiplier: this.multiplier
    };
  }
}
```

### Layer 4: Rendering Layer
**Responsibility:** Visual output, UI, animations

#### 4.1 Layered Rendering
```typescript
enum RenderLayer {
  BACKGROUND = 0,
  BACKGROUND_OBJECTS = 1,
  WATER = 2,
  GAME_ENTITIES = 3,
  PARTICLES = 4,
  UI = 5,
  OVERLAY = 6
}

class LayeredRenderer {
  private canvases: Map<RenderLayer, HTMLCanvasElement> = new Map();
  private contexts: Map<RenderLayer, CanvasRenderingContext2D> = new Map();
  
  constructor(private container: HTMLElement) {
    this.initializeLayers();
  }
  
  private initializeLayers(): void {
    for (const layer of Object.values(RenderLayer)) {
      if (typeof layer === 'number') {
        const canvas = document.createElement('canvas');
        canvas.width = 300; // Game width
        canvas.height = 600; // Game height
        canvas.style.position = 'absolute';
        canvas.style.zIndex = layer.toString();
        
        this.container.appendChild(canvas);
        this.canvases.set(layer, canvas);
        this.contexts.set(layer, canvas.getContext('2d')!);
      }
    }
  }
  
  public render(entities: Entity[]): void {
    // Clear dynamic layers
    this.clear(RenderLayer.GAME_ENTITIES);
    this.clear(RenderLayer.PARTICLES);
    
    // Sort entities by layer
    const sorted = entities.sort((a, b) => {
      const renderA = a.getComponent<RenderComponent>('render');
      const renderB = b.getComponent<RenderComponent>('render');
      return (renderA?.layer || 0) - (renderB?.layer || 0);
    });
    
    // Render each entity to appropriate layer
    for (const entity of sorted) {
      const render = entity.getComponent<RenderComponent>('render');
      const transform = entity.getComponent<TransformComponent>('transform');
      
      if (!render || !transform || !render.visible) continue;
      
      const ctx = this.contexts.get(render.layer)!;
      this.renderEntity(ctx, entity, transform, render);
    }
  }
  
  private renderEntity(
    ctx: CanvasRenderingContext2D,
    entity: Entity,
    transform: TransformComponent,
    render: RenderComponent
  ): void {
    ctx.save();
    
    // Apply transform
    ctx.translate(transform.position.x, transform.position.y);
    ctx.rotate(transform.rotation);
    ctx.scale(transform.scale.x, transform.scale.y);
    
    // Render sprite
    if (render.sprite) {
      ctx.drawImage(
        render.sprite.image,
        -render.sprite.width / 2,
        -render.sprite.height / 2,
        render.sprite.width,
        render.sprite.height
      );
    }
    
    ctx.restore();
  }
  
  private clear(layer: RenderLayer): void {
    const ctx = this.contexts.get(layer)!;
    const canvas = this.canvases.get(layer)!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  
  public renderBackground(biome: Biome): void {
    // Background only needs to render when biome changes
    const ctx = this.contexts.get(RenderLayer.BACKGROUND)!;
    const canvas = this.canvases.get(RenderLayer.BACKGROUND)!;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, biome.skyColorTop);
    gradient.addColorStop(1, biome.skyColorBottom);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Background objects (trees, mountains, etc.)
    // ... render biome-specific scenery
  }
}
```

**Why Layered Rendering:**
- Static layers don't need redraw every frame
- Separate UI from gameplay
- Easy to toggle layers (debug mode)
- Better performance (selective clearing)
- Canvas compositing handled by browser

### Layer 5: UI Layer
**Responsibility:** Menus, HUD, overlays

#### 5.1 State-Driven UI
```typescript
type GameState = 'LOADING' | 'MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

class UISystem {
  private currentState: GameState = 'LOADING';
  private elements: Map<string, HTMLElement> = new Map();
  
  constructor(private container: HTMLElement) {
    this.initializeUI();
    this.bindEvents();
  }
  
  public setState(newState: GameState): void {
    // Hide current state UI
    this.hideAllScreens();
    
    // Show new state UI
    this.currentState = newState;
    this.showScreen(newState);
    
    // State-specific logic
    switch (newState) {
      case 'MENU':
        this.showMainMenu();
        break;
      case 'PLAYING':
        this.showHUD();
        break;
      case 'PAUSED':
        this.showPauseMenu();
        break;
      case 'GAME_OVER':
        this.showGameOverScreen();
        break;
    }
  }
  
  private showHUD(): void {
    const hud = this.elements.get('hud')!;
    hud.style.display = 'flex';
    
    // Initialize HUD with current game state
    this.updateHUD();
  }
  
  public updateHUD(): void {
    const scoreSystem = Game.instance.getScoreSystem();
    const stats = scoreSystem.getStats();
    
    // Update score display
    const scoreEl = this.elements.get('score')!;
    scoreEl.textContent = stats.score.toString();
    
    // Update coin count
    const coinsEl = this.elements.get('coins')!;
    coinsEl.textContent = stats.coins.toString();
    
    // Update distance
    const distanceEl = this.elements.get('distance')!;
    distanceEl.textContent = `${stats.distance}m`;
    
    // Update combo (if active)
    if (stats.combo > 0) {
      const comboEl = this.elements.get('combo')!;
      comboEl.textContent = `COMBO x${stats.combo}`;
      comboEl.style.display = 'block';
    } else {
      this.elements.get('combo')!.style.display = 'none';
    }
  }
  
  private showGameOverScreen(): void {
    const gameOverScreen = this.elements.get('gameOverScreen')!;
    gameOverScreen.style.display = 'flex';
    
    const scoreSystem = Game.instance.getScoreSystem();
    const stats = scoreSystem.getStats();
    
    // Populate stats
    this.elements.get('finalScore')!.textContent = stats.score.toString();
    this.elements.get('finalCoins')!.textContent = stats.coins.toString();
    this.elements.get('finalDistance')!.textContent = `${stats.distance}m`;
    
    // Check for personal best
    const previousBest = SaveSystem.getHighScore();
    if (stats.score > previousBest) {
      this.elements.get('newRecord')!.style.display = 'block';
      SaveSystem.save({ highScore: stats.score });
    }
  }
  
  private bindEvents(): void {
    // Play button
    this.elements.get('playButton')!.addEventListener('click', () => {
      EventBus.emit('startGame', {});
    });
    
    // Pause button
    this.elements.get('pauseButton')!.addEventListener('click', () => {
      EventBus.emit('pauseGame', {});
    });
    
    // Restart button
    this.elements.get('restartButton')!.addEventListener('click', () => {
      EventBus.emit('restartGame', {});
    });
  }
}
```

---

## 🎮 Input Architecture

### Multi-Input Abstraction
```typescript
enum InputType {
  SWIPE_LEFT,
  SWIPE_RIGHT,
  TAP_LEFT,
  TAP_RIGHT,
  KEY_LEFT,
  KEY_RIGHT,
  MOUSE_LEFT,
  MOUSE_RIGHT
}

interface InputEvent {
  type: InputType;
  timestamp: number;
  position?: { x: number; y: number };
}

class InputSystem {
  private inputQueue: InputEvent[] = [];
  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private readonly SWIPE_THRESHOLD = 50; // pixels
  
  constructor(private canvas: HTMLCanvasElement) {
    this.bindTouchEvents();
    this.bindKeyboardEvents();
    this.bindMouseEvents();
  }
  
  private bindTouchEvents(): void {
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.touchStartX = touch.clientX;
      this.touchStartY = touch.clientY;
    });
    
    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - this.touchStartX;
      const deltaY = Math.abs(touch.clientY - this.touchStartY);
      
      // Swipe detection
      if (Math.abs(deltaX) > this.SWIPE_THRESHOLD && 
          deltaY < this.SWIPE_THRESHOLD) {
        if (deltaX > 0) {
          this.queueInput({ type: InputType.SWIPE_RIGHT, timestamp: Date.now() });
        } else {
          this.queueInput({ type: InputType.SWIPE_LEFT, timestamp: Date.now() });
        }
      }
      // Tap detection (screen divided in half)
      else if (Math.abs(deltaX) < 20 && deltaY < 20) {
        const screenCenter = this.canvas.width / 2;
        if (touch.clientX < screenCenter) {
          this.queueInput({ type: InputType.TAP_LEFT, timestamp: Date.now() });
        } else {
          this.queueInput({ type: InputType.TAP_RIGHT, timestamp: Date.now() });
        }
      }
    });
  }
  
  private bindKeyboardEvents(): void {
    document.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          this.queueInput({ type: InputType.KEY_LEFT, timestamp: Date.now() });
          e.preventDefault();
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          this.queueInput({ type: InputType.KEY_RIGHT, timestamp: Date.now() });
          e.preventDefault();
          break;
      }
    });
  }
  
  private bindMouseEvents(): void {
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const screenCenter = this.canvas.width / 2;
      
      if (x < screenCenter) {
        this.queueInput({ type: InputType.MOUSE_LEFT, timestamp: Date.now() });
      } else {
        this.queueInput({ type: InputType.MOUSE_RIGHT, timestamp: Date.now() });
      }
    });
  }
  
  private queueInput(event: InputEvent): void {
    this.inputQueue.push(event);
  }
  
  public pollInput(): InputEvent | null {
    return this.inputQueue.shift() || null;
  }
  
  public processInput(): void {
    let event = this.pollInput();
    while (event !== null) {
      this.handleInput(event);
      event = this.pollInput();
    }
  }
  
  private handleInput(event: InputEvent): void {
    switch (event.type) {
      case InputType.SWIPE_LEFT:
      case InputType.TAP_LEFT:
      case InputType.KEY_LEFT:
      case InputType.MOUSE_LEFT:
        EventBus.emit('moveLane', { direction: 'left' });
        break;
        
      case InputType.SWIPE_RIGHT:
      case InputType.TAP_RIGHT:
      case InputType.KEY_RIGHT:
      case InputType.MOUSE_RIGHT:
        EventBus.emit('moveLane', { direction: 'right' });
        break;
    }
  }
}
```

**Why Input Abstraction:**
- Single code path for all input methods
- Easy to add new input types (gamepad, tilt)
- Input buffering prevents missed inputs
- Testable (inject mock inputs)

---

## 💾 Data Persistence Architecture

### Save System
```typescript
interface SaveData {
  version: number;
  highScore: number;
  totalCoins: number;
  totalGems: number;
  totalDistance: number;
  gamesPlayed: number;
  achievements: string[]; // IDs of unlocked achievements
  unlockedSkins: string[];
  settings: {
    musicVolume: number;
    sfxVolume: number;
    reducedMotion: boolean;
    highContrast: boolean;
    colorblindMode: 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia';
  };
  statistics: {
    longestRun: number;
    highestCombo: number;
    totalNearMisses: number;
    powerUpsCollected: number;
  };
}

class SaveSystem {
  private static readonly SAVE_KEY = 'otter_river_rush_save';
  private static readonly CURRENT_VERSION = 1;
  
  /**
   * Deep merge utility to recursively merge nested objects
   */
  private static deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
    const result = { ...target };
    
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
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
  
  public static save(data: Partial<SaveData>): void {
    const existing = this.load();
    const merged = this.deepMerge(existing, data);
    
    try {
      localStorage.setItem(this.SAVE_KEY, JSON.stringify(merged));
    } catch (e) {
      console.error('Failed to save data:', e);
      // Fallback: In-memory only
    }
  }
  
  public static load(): SaveData {
    try {
      const saved = localStorage.getItem(this.SAVE_KEY);
      if (!saved) {
        return this.getDefaultSave();
      }
      
      const parsed = JSON.parse(saved) as SaveData;
      
      // Migration if version changed
      if (parsed.version !== this.CURRENT_VERSION) {
        return this.migrateSave(parsed);
      }
      
      return parsed;
    } catch (e) {
      console.error('Failed to load save data:', e);
      return this.getDefaultSave();
    }
  }
  
  private static getDefaultSave(): SaveData {
    return {
      version: this.CURRENT_VERSION,
      highScore: 0,
      totalCoins: 0,
      totalGems: 0,
      totalDistance: 0,
      gamesPlayed: 0,
      achievements: [],
      unlockedSkins: ['default'],
      settings: {
        musicVolume: 0.7,
        sfxVolume: 0.8,
        reducedMotion: false,
        highContrast: false,
        colorblindMode: 'none'
      },
      statistics: {
        longestRun: 0,
        highestCombo: 0,
        totalNearMisses: 0,
        powerUpsCollected: 0
      }
    };
  }
  
  private static migrateSave(oldSave: SaveData): SaveData {
    // Handle version migrations
    // Example: v0 -> v1 might add new fields
    return { ...this.getDefaultSave(), ...oldSave, version: this.CURRENT_VERSION };
  }
  
  public static clear(): void {
    localStorage.removeItem(this.SAVE_KEY);
  }
  
  /**
   * Usage examples demonstrating deep merge behavior:
   * 
   * // Example 1: Updating a single setting preserves other settings
   * SaveSystem.save({ settings: { musicVolume: 0.5 } });
   * // Result: Only musicVolume changes, sfxVolume, reducedMotion, etc. are preserved
   * 
   * // Example 2: Updating multiple nested properties
   * SaveSystem.save({ 
   *   settings: { musicVolume: 0.5, sfxVolume: 0.3 },
   *   highScore: 1000
   * });
   * // Result: Updates both volume settings and highScore, preserves all other data
   * 
   * // Example 3: Updating statistics
   * SaveSystem.save({ statistics: { longestRun: 500 } });
   * // Result: Only longestRun updates, highestCombo, totalNearMisses, etc. are preserved
   */
  public static getHighScore(): number {
    return this.load().highScore;
  }
}
```

---

## 🔊 Audio Architecture

### Spatial Audio System
```typescript
class AudioSystem {
  private musicTrack: Howl | null = null;
  private sfxMap: Map<string, Howl> = new Map();
  private masterVolume: number = 1.0;
  private musicVolume: number = 0.7;
  private sfxVolume: number = 0.8;
  
  constructor() {
    this.loadSounds();
  }
  
  private loadSounds(): void {
    // Music tracks
    this.musicTrack = new Howl({
      src: ['assets/audio/music/game-loop.mp3'],
      loop: true,
      volume: this.musicVolume,
      onload: () => console.log('Music loaded')
    });
    
    // SFX sprite sheet (all SFX in one file)
    const sfxSprite = new Howl({
      src: ['assets/audio/sfx/sprite.mp3'],
      sprite: {
        coin: [0, 200],          // Start at 0ms, duration 200ms
        gem: [200, 300],         // Start at 200ms, duration 300ms
        rock_hit: [500, 400],    // Start at 500ms, duration 400ms
        near_miss: [900, 250],   // ...
        lane_switch: [1150, 150],
        shield_activate: [1300, 500],
        magnet_activate: [1800, 400]
      },
      volume: this.sfxVolume
    });
    
    this.sfxMap.set('sfx', sfxSprite);
  }
  
  public playMusic(): void {
    if (this.musicTrack && !this.musicTrack.playing()) {
      this.musicTrack.play();
    }
  }
  
  public stopMusic(): void {
    if (this.musicTrack) {
      this.musicTrack.stop();
    }
  }
  
  public playSFX(name: string, options?: { 
    volume?: number;
    rate?: number;
    pos?: [number, number, number]; // 3D position
  }): void {
    const sprite = this.sfxMap.get('sfx');
    if (!sprite) return;
    
    const id = sprite.play(name);
    
    if (options) {
      if (options.volume !== undefined) {
        sprite.volume(options.volume, id);
      }
      if (options.rate !== undefined) {
        sprite.rate(options.rate, id);
      }
      if (options.pos) {
        sprite.pos(options.pos[0], options.pos[1], options.pos[2], id);
      }
    }
  }
  
  public setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.musicTrack) {
      this.musicTrack.volume(this.musicVolume);
    }
    // Deep merge ensures other settings properties are preserved
    SaveSystem.save({ settings: { musicVolume: this.musicVolume } });
  }
  
  public setSFXVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    this.sfxMap.forEach(howl => howl.volume(this.sfxVolume));
    // Deep merge ensures other settings properties are preserved
    SaveSystem.save({ settings: { sfxVolume: this.sfxVolume } });
  }
}
```

---

## 🏃 Player Controller (Rusty)

```typescript
class PlayerController {
  private entity: Entity;
  private currentLane: number = 1; // 0, 1, 2 (left, center, right)
  private readonly LANE_SWITCH_DURATION = 150; // ms
  private laneTransition: {
    active: boolean;
    startX: number;
    targetX: number;
    elapsed: number;
    animationElapsed: number;
    animationDuration: number;
    targetRotation: number;
  } = {
    active: false,
    startX: 0,
    targetX: 0,
    elapsed: 0,
    animationElapsed: 0,
    animationDuration: 0,
    targetRotation: 0
  };
  
  constructor(entity: Entity) {
    this.entity = entity;
    this.bindEvents();
  }
  
  private bindEvents(): void {
    EventBus.on('moveLane', (data: { direction: 'left' | 'right' }) => {
      this.switchLane(data.direction);
    });
  }
  
  private switchLane(direction: 'left' | 'right'): void {
    // Don't switch if already transitioning
    if (this.laneTransition.active) return;
    
    // Calculate new lane
    const newLane = direction === 'left' 
      ? Math.max(0, this.currentLane - 1)
      : Math.min(2, this.currentLane + 1);
    
    // No change needed
    if (newLane === this.currentLane) return;
    
    // Start transition
    const transform = this.entity.getComponent<TransformComponent>('transform')!;
    this.laneTransition = {
      active: true,
      startX: transform.position.x,
      targetX: this.getLaneX(newLane),
      elapsed: 0
    };
    
    this.currentLane = newLane;
    
    // Audio feedback
    AudioSystem.instance.playSFX('lane_switch', {
      pos: [transform.position.x, transform.position.y, 0]
    });
    
    // Visual feedback
    this.playLaneSwitchAnimation(direction);
  }
  
  public update(deltaTime: number): void {
    if (this.laneTransition.active) {
      this.updateLaneTransition(deltaTime);
    }
    
    // Update vertical position (constant scroll)
    const transform = this.entity.getComponent<TransformComponent>('transform')!;
    transform.position.y += deltaTime * 0.3; // Scroll speed
  }
  
  private updateLaneTransition(deltaTime: number): void {
    const transform = this.entity.getComponent<TransformComponent>('transform')!;
    
    this.laneTransition.elapsed += deltaTime;
    const progress = Math.min(1, this.laneTransition.elapsed / this.LANE_SWITCH_DURATION);
    
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    
    // Interpolate position
    transform.position.x = 
      this.laneTransition.startX + 
      (this.laneTransition.targetX - this.laneTransition.startX) * eased;
    
    // Complete transition
    if (progress >= 1) {
      transform.position.x = this.laneTransition.targetX;
      this.laneTransition.active = false;
    }
  }
  
  private getLaneX(lane: number): number {
    const laneWidth = 100;
    const centerX = 150; // Game width / 2
    return centerX + ((lane - 1) * laneWidth);
  }
  
  private playLaneSwitchAnimation(direction: 'left' | 'right'): void {
    // Tilt Rusty slightly in direction of movement
    const transform = this.entity.getComponent<TransformComponent>('transform')!;
    const targetRotation = direction === 'left' ? -0.2 : 0.2; // radians
    
    // Store animation state to be updated by the main game loop
    this.laneTransition.animationElapsed = 0;
    this.laneTransition.animationDuration = this.LANE_SWITCH_DURATION;
    this.laneTransition.targetRotation = targetRotation;
  }
  
  // Called by the main GameLoop's update method with deltaTime
  public updateAnimation(deltaTime: number): void {
    if (this.laneTransition.animationElapsed < this.laneTransition.animationDuration) {
      this.laneTransition.animationElapsed += deltaTime;
      const progress = Math.min(1, this.laneTransition.animationElapsed / this.laneTransition.animationDuration);
      
      const transform = this.entity.getComponent<TransformComponent>('transform')!;
      
      // Rotate there and back
      if (progress < 0.5) {
        transform.rotation = this.laneTransition.targetRotation * (progress * 2);
      } else {
        transform.rotation = this.laneTransition.targetRotation * (2 - progress * 2);
      }
      
      if (progress >= 1) {
        transform.rotation = 0;
      }
    }
  }
}
```

---

## 📊 Performance Optimization Strategies

### 1. Object Pooling
```typescript
class ObjectPool<T> {
  private available: T[] = [];
  private inUse: Set<T> = new Set();
  private factory: () => T;
  
  constructor(factory: () => T, initialSize: number = 10) {
    this.factory = factory;
    
    // Pre-allocate objects
    for (let i = 0; i < initialSize; i++) {
      this.available.push(factory());
    }
  }
  
  public acquire(): T {
    let obj: T;
    
    if (this.available.length > 0) {
      obj = this.available.pop()!;
    } else {
      // Pool exhausted, create new object
      obj = this.factory();
    }
    
    this.inUse.add(obj);
    return obj;
  }
  
  public release(obj: T): void {
    if (this.inUse.has(obj)) {
      this.inUse.delete(obj);
      this.available.push(obj);
      
      // Reset object state if it has a reset method
      if (typeof (obj as any).reset === 'function') {
        (obj as any).reset();
      }
    }
  }
  
  public getStats(): { available: number; inUse: number } {
    return {
      available: this.available.length,
      inUse: this.inUse.size
    };
  }
}

// Usage
const obstaclePool = new ObjectPool<Entity>(
  () => createObstacleEntity(),
  50 // Initial pool size
);
```

### 2. Render Culling
```typescript
class ViewportCuller {
  constructor(
    private viewportWidth: number,
    private viewportHeight: number,
    private buffer: number = 100 // Extra space around viewport
  ) {}
  
  public isVisible(entity: Entity): boolean {
    const transform = entity.getComponent<TransformComponent>('transform');
    if (!transform) return false;
    
    const { x, y } = transform.position;
    
    return (
      x >= -this.buffer &&
      x <= this.viewportWidth + this.buffer &&
      y >= -this.buffer &&
      y <= this.viewportHeight + this.buffer
    );
  }
  
  public filterVisible(entities: Entity[]): Entity[] {
    return entities.filter(e => this.isVisible(e));
  }
}
```

### 3. Frame Budget Management
```typescript
class FrameBudgetManager {
  private readonly TARGET_FPS = 60;
  private readonly FRAME_BUDGET_MS = 1000 / this.TARGET_FPS; // ~16.67ms
  private frameStartTime: number = 0;
  
  public startFrame(): void {
    this.frameStartTime = performance.now();
  }
  
  public getRemainingBudget(): number {
    const elapsed = performance.now() - this.frameStartTime;
    return this.FRAME_BUDGET_MS - elapsed;
  }
  
  public hasTimeFor(estimatedMs: number): boolean {
    return this.getRemainingBudget() >= estimatedMs;
  }
  
  public endFrame(): { fps: number; budgetUsed: number } {
    const elapsed = performance.now() - this.frameStartTime;
    const fps = 1000 / elapsed;
    const budgetUsed = (elapsed / this.FRAME_BUDGET_MS) * 100;
    
    return { fps, budgetUsed };
  }
}
```

---

## 🧪 Testing Architecture

### Unit Testing Strategy
```typescript
// Example: Testing Score System
describe('ScoreSystem', () => {
  let scoreSystem: ScoreSystem;
  
  beforeEach(() => {
    scoreSystem = new ScoreSystem();
  });
  
  describe('coin collection', () => {
    it('should increment coin count', () => {
      scoreSystem.collectCoin();
      expect(scoreSystem.getStats().coins).toBe(1);
    });
    
    it('should add 10 points to score', () => {
      scoreSystem.collectCoin();
      expect(scoreSystem.getStats().score).toBe(10);
    });
    
    it('should increment combo', () => {
      scoreSystem.collectCoin();
      expect(scoreSystem.getStats().combo).toBe(1);
    });
    
    it('should apply multiplier when combo >= 10', () => {
      // Collect 10 coins to build combo
      for (let i = 0; i < 10; i++) {
        scoreSystem.collectCoin();
      }
      
      const scoreBefore = scoreSystem.getStats().score;
      scoreSystem.collectCoin(); // 11th coin with 2x multiplier
      const scoreAfter = scoreSystem.getStats().score;
      
      expect(scoreAfter - scoreBefore).toBe(20); // 10 * 2
    });
  });
  
  describe('combo system', () => {
    it('should reset combo after timeout', async () => {
      scoreSystem.collectCoin();
      expect(scoreSystem.getStats().combo).toBe(1);
      
      // Wait for combo timeout (2 seconds)
      await new Promise(resolve => setTimeout(resolve, 2100));
      scoreSystem.update(2100); // Simulate time passing
      
      expect(scoreSystem.getStats().combo).toBe(0);
    });
    
    it('should maintain combo if collection within timeout', () => {
      scoreSystem.collectCoin();
      scoreSystem.update(1000); // 1 second passed
      scoreSystem.collectCoin(); // Within 2 second window
      
      expect(scoreSystem.getStats().combo).toBe(2);
    });
  });
});
```

### Integration Testing Strategy
```typescript
// Example: Testing Game Flow
describe('Game Integration', () => {
  let game: Game;
  
  beforeEach(() => {
    game = new Game();
    game.initialize();
  });
  
  afterEach(() => {
    game.destroy();
  });
  
  it('should transition from MENU to PLAYING when starting game', () => {
    expect(game.getState()).toBe('MENU');
    
    game.startGame();
    
    expect(game.getState()).toBe('PLAYING');
  });
  
  it('should generate obstacles during gameplay', () => {
    game.startGame();
    
    // Simulate 5 seconds of gameplay
    for (let i = 0; i < 300; i++) { // 300 frames at 60fps = 5s
      game.update(16.67); // ~60fps
    }
    
    const entities = game.getEntities();
    const obstacles = entities.filter(e => e.hasComponent('obstacle'));
    
    expect(obstacles.length).toBeGreaterThan(0);
  });
  
  it('should end game when player collides with obstacle', () => {
    game.startGame();
    
    const player = game.getPlayer();
    const obstacle = game.createObstacle(player.getCurrentLane(), 100);
    
    // Move obstacle to player position
    const obstacleTransform = obstacle.getComponent<TransformComponent>('transform')!;
    const playerTransform = player.entity.getComponent<TransformComponent>('transform')!;
    obstacleTransform.position = { ...playerTransform.position };
    
    // Update collision detection
    game.update(16.67);
    
    expect(game.getState()).toBe('GAME_OVER');
  });
});
```

---

## 🔐 Security & Privacy Architecture

### Data Privacy Principles
1. **Local-First:** All data stored on device only
2. **No Tracking:** Zero analytics, no third-party requests
3. **No Accounts:** No user identification
4. **User Control:** Players can delete all data anytime

### Implementation
```typescript
class PrivacyManager {
  public static isTrackingEnabled(): boolean {
    // Always false for this game
    return false;
  }
  
  public static exportData(): SaveData {
    // Allow players to export their save data
    return SaveSystem.load();
  }
  
  public static deleteAllData(): void {
    // GDPR-compliant data deletion
    SaveSystem.clear();
    
    // Clear any other local storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear IndexedDB if used
    indexedDB.databases().then(dbs => {
      dbs.forEach(db => {
        if (db.name) {
          indexedDB.deleteDatabase(db.name);
        }
      });
    });
  }
}
```

---

## 📋 Architecture Decision Records (ADRs)

### ADR-001: Canvas 2D vs WebGL
**Status:** Accepted  
**Decision:** Use Canvas 2D API  
**Rationale:**
- Sufficient for 2D endless runner
- Better browser compatibility
- Lower complexity
- Easier debugging
- Better battery life on mobile

**Alternatives Considered:**
- WebGL: Rejected (overkill, more complex)
- SVG: Rejected (poor animation performance)

### ADR-002: ECS vs Traditional OOP
**Status:** Accepted  
**Decision:** Use Entity Component System  
**Rationale:**
- Better data locality (performance)
- Composition over inheritance
- Easy to add new behaviors
- Testable in isolation
- Industry standard for games

### ADR-003: Fixed vs Variable Timestep
**Status:** Accepted  
**Decision:** Fixed timestep for physics, variable for rendering  
**Rationale:**
- Deterministic physics
- Consistent across devices
- Easier to reproduce bugs
- Standard game development practice

### ADR-004: Local vs Online Leaderboards
**Status:** Accepted  
**Decision:** Local-only leaderboards  
**Rationale:**
- Privacy-first (no user data collection)
- Zero backend costs
- No cheating concerns
- Immediate availability
- Offline-first approach

### ADR-005: Procedural vs Handcrafted Levels
**Status:** Accepted  
**Decision:** Procedural pattern-based generation  
**Rationale:**
- Infinite content
- Controlled difficulty scaling
- Repeatable (seeded)
- Less content creation work
- Patterns ensure fairness

---

## 🚀 Deployment Architecture

### Build Pipeline
```
┌─────────────────────────────────────┐
│     Source Code (TypeScript)       │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│       TypeScript Compiler           │
│       (type checking)               │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│         Vite Build                  │
│  - Bundling                         │
│  - Tree shaking                     │
│  - Minification                     │
│  - Code splitting                   │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│     Asset Optimization              │
│  - Image compression (TinyPNG)      │
│  - Audio compression (MP3/OGG)      │
│  - Sprite packing                   │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│      PWA Generation                 │
│  - Service worker                   │
│  - Manifest.json                    │
│  - Offline cache                    │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│      dist/ (Static Files)           │
│  - index.html                       │
│  - app-[hash].js                    │
│  - assets/*                         │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│    GitHub Pages Deployment          │
│    (Static Hosting)                 │
└─────────────────────────────────────┘
```

---

## ✅ Architecture Checklist

Before implementation begins:

- [x] All layers defined and responsibilities clear
- [x] Core systems designed (Game Loop, ECS, Physics)
- [x] Input abstraction supports all control methods
- [x] Rendering architecture supports layered compositing
- [x] Audio system designed with spatial support
- [x] Persistence system designed with privacy-first approach
- [x] Performance optimizations identified (pooling, culling, budgeting)
- [x] Testing strategy covers unit and integration
- [x] Privacy and security considerations addressed
- [x] ADRs document key architectural decisions
- [x] Build and deployment pipeline defined

---

## 🔒 Document Status

**This architecture is FROZEN as of version 1.0.0**

Changes require:
1. Design impact assessment
2. Performance impact analysis
3. Testing strategy update
4. Version increment
5. Team review

**Last Review:** 2025-10-27  
**Next Review:** After V1 implementation feedback

---

**Core Principle:** This architecture serves the game design. If a technical decision conflicts with player fun or accessibility, the technical decision must change.
