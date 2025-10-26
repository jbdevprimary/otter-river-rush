# System Patterns - Otter River Rush

> **Note**: This file serves as a Table of Contents linking to detailed architecture documentation. See [Architecture README](../architecture/README.md) for the comprehensive system design.

## Overview

This document provides quick reference to the system architecture and design patterns used in Otter River Rush. For detailed information, follow the links to the full architecture documentation.

## System Architecture

See [Architecture README](../architecture/README.md) for complete details.

### High-Level Architecture
```
Game Loop (60 FPS)
    ↓
Input Handler → Game State Machine
    ↓
Game Systems (Physics, Procedural, Score)
    ↓
Entities (ECS Pattern)
    ↓
Rendering Engine
    ↓
Canvas Output
```

## Key Design Patterns

### Entity-Component System (ECS)
- **Base Class**: `GameObject` ([docs](../architecture/README.md#entity-component-system))
- **Components**: Transform, Collider, Renderer
- **Entities**: Otter, Rock, Collectible, PowerUp
- **Pattern**: Composition over inheritance

### State Machine
- **Implementation**: `GameStateManager` ([docs](../architecture/README.md#state-management))
- **States**: LOADING, MENU, PLAYING, PAUSED, GAME_OVER
- **Pattern**: State pattern with listeners
- **Benefits**: Clear state transitions, easy to debug

### Object Pooling
- **Implementation**: `ObjectPool<T>` utility ([docs](../architecture/README.md#object-pooling))
- **Usage**: Obstacles, collectibles, particles
- **Pattern**: Object pool pattern
- **Benefits**: Reduces GC pressure, improves performance

### Manager Pattern
- **Score Management**: `ScoreManager` ([docs](../architecture/README.md#manager-pattern))
- **Save/Load**: `SaveManager`
- **Achievements**: `AchievementManager`
- **Audio**: `AudioManager`
- **Pattern**: Singleton managers for global concerns

### Procedural Generation
- **System**: `EnhancedProceduralGenerator` ([docs](../architecture/README.md#procedural-generation))
- **Approach**: Pattern-based with biome variations
- **Pattern**: Strategy pattern with difficulty scaling
- **Benefits**: Infinite content, consistent difficulty

## Core Systems

For detailed implementation, see [Architecture README](../architecture/README.md).

### Physics System
- Gravity and velocity
- Collision detection with spatial grid
- Resolution and response
- **Location**: `src/game/systems/PhysicsSystem.ts`

### Rendering System
- Canvas 2D rendering
- Layered rendering
- Sprite management
- Particle effects
- **Location**: `src/rendering/`

### Input System
- Keyboard support (WASD, Arrows)
- Touch/swipe gestures
- Mouse clicking
- **Location**: `src/game/InputHandler.ts`

### Audio System
- Howler.js integration
- Sound effects
- Background music
- Spatial audio
- **Location**: `src/game/AudioManager.ts`

## Data Flow

```
User Input
    ↓
InputHandler
    ↓
GameState Update
    ↓
System Updates (Physics, AI, etc.)
    ↓
Entity Updates
    ↓
Collision Detection
    ↓
Score/Achievement Updates
    ↓
Rendering
    ↓
Canvas Output
```

See [Architecture README](../architecture/README.md#data-flow) for detailed flow documentation.

## Component Relationships

### Game Entities
- **Otter** (player) → Transform, Collider, Input-driven
- **Rock** (obstacle) → Transform, Collider, Auto-scroll
- **Coin** (collectible) → Transform, Collider, Score value
- **PowerUp** → Transform, Collider, Timed effect

### Managers
- **ScoreManager** ← Game events
- **SaveManager** ← ScoreManager, AchievementManager
- **AchievementManager** ← Game events
- **AudioManager** ← Game events

### Systems
- **PhysicsSystem** → Entities (Transform updates)
- **ProceduralGenerator** → Entity spawning
- **CollisionDetector** → Entity interaction

## Performance Optimizations

See [Architecture README](../architecture/README.md#performance) for implementation details.

### Techniques Used
1. **Object Pooling** - Reuse entities to reduce GC
2. **Spatial Partitioning** - Grid-based collision detection
3. **Request Animation Frame** - Proper game loop timing
4. **Canvas Optimization** - Layer caching, dirty rectangles
5. **Bundle Splitting** - Code splitting with Vite

### Performance Targets
- 60 FPS on all devices
- < 2MB bundle size
- < 50MB memory usage
- < 2s first contentful paint

## Testing Strategy

See [Architecture README](../architecture/README.md#testing) for comprehensive testing documentation.

### Unit Tests
- Core systems (ScoreManager, Physics, etc.)
- Utilities (MathUtils, Random, ObjectPool)
- 80%+ coverage target

### E2E Tests
- User flows (start, play, game over)
- Input methods (keyboard, touch, mouse)
- Performance benchmarks

### Visual Tests
- Screenshot comparisons
- UI regression testing
- Accessibility checks

## Critical Implementation Paths

For detailed implementation guides, see:
- [Implementation Status](../implementation/README.md)
- [Sprite System](../implementation/sprites.md)
- [Visual Testing](../implementation/visual-testing.md)

### Game Loop Path
```typescript
// Simplified game loop
function gameLoop(deltaTime: number) {
  // 1. Handle input
  inputHandler.update();
  
  // 2. Update game state
  stateManager.update(deltaTime);
  
  // 3. Update systems
  physics.update(deltaTime);
  generator.update(distance);
  scoreManager.update(deltaTime);
  
  // 4. Update entities
  entities.forEach(e => e.update(deltaTime));
  
  // 5. Collision detection
  collisionDetector.checkCollisions(entities);
  
  // 6. Render
  renderer.render(entities);
}
```

### Collision Detection Path
```typescript
// Spatial grid optimization
spatialGrid.clear();
spatialGrid.insert(entities);

for (const entity of entities) {
  const nearby = spatialGrid.getNearby(entity);
  for (const other of nearby) {
    if (checkCollision(entity, other)) {
      handleCollision(entity, other);
    }
  }
}
```

## Architecture Decisions

### Why Canvas 2D vs WebGL?
- **Decision**: Use Canvas 2D API
- **Rationale**: Simpler, sufficient for 2D, better compatibility
- **Trade-off**: Less performance ceiling, but easier to maintain

### Why TypeScript Strict Mode?
- **Decision**: Enable all strict options
- **Rationale**: Catch errors early, better DX, safer refactoring
- **Trade-off**: More verbose, but much more reliable

### Why Object Pooling?
- **Decision**: Pool frequently created objects
- **Rationale**: Reduce GC pauses, maintain 60 FPS
- **Trade-off**: More complex code, but necessary for performance

### Why Pattern-Based Generation?
- **Decision**: Use predefined patterns vs pure random
- **Rationale**: Better gameplay, consistent difficulty
- **Trade-off**: Less variety, but more fun and fair

## Further Reading

- **Comprehensive Architecture**: [docs/architecture/README.md](../architecture/README.md)
- **Implementation Status**: [docs/implementation/README.md](../implementation/README.md)
- **Tech Stack Details**: [techContext.md](./techContext.md)
- **Current Progress**: [progress.md](./progress.md)

---

**Last Updated**: 2025-10-25  
**Document Type**: TOC (links to detailed docs)  
**Update Frequency**: Rarely (only when fundamental patterns change)
