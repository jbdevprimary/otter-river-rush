import { world, queries, type Entity } from '../ecs/world';

export const debugTools = {
  // Entity inspection
  logAllEntities() {
    console.group('🔍 All Entities');
    for (const entity of world) {
      console.log(entity);
    }
    console.groupEnd();
  },
  
  logEntityCounts() {
    console.group('📊 Entity Counts');
    console.log('Total:', world.entities.length);
    console.log('Player:', queries.player.entities.length);
    console.log('Obstacles:', queries.obstacles.entities.length);
    console.log('Collectibles:', queries.collectibles.entities.length);
    console.log('Particles:', queries.particles.entities.length);
    console.log('Moving:', queries.moving.entities.length);
    console.groupEnd();
  },
  
  logPlayer() {
    const [player] = queries.player.entities;
    console.log('🦦 Player:', player);
  },
  
  clearAllEntities() {
    world.clear();
    console.log('🧹 Cleared all entities');
  },
  
  spawnTestEntities() {
    const { spawn } = require('../ecs/world');
    spawn.otter(0);
    spawn.rock(-2, 5, 0);
    spawn.rock(0, 8, 1);
    spawn.rock(2, 11, 2);
    spawn.coin(-2, 6);
    spawn.gem(2, 9);
    console.log('✨ Spawned test entities');
  },
  
  freezeGame() {
    for (const entity of queries.moving) {
      if (entity.velocity) {
        entity.velocity.x = 0;
        entity.velocity.y = 0;
        entity.velocity.z = 0;
      }
    }
    console.log('⏸️ Game frozen');
  },
  
  teleportPlayer(x: number, y: number) {
    const [player] = queries.player.entities;
    if (player) {
      player.position.x = x;
      player.position.y = y;
      console.log(`📍 Player teleported to (${x}, ${y})`);
    }
  },
  
  godMode(enable: boolean = true) {
    const [player] = queries.player.entities;
    if (player) {
      if (enable) {
        world.addComponent(player, 'invincible', true);
        world.addComponent(player, 'ghost', true);
        console.log('🛡️ God mode ENABLED');
      } else {
        world.removeComponent(player, 'invincible');
        world.removeComponent(player, 'ghost');
        console.log('⚔️ God mode DISABLED');
      }
    }
  },
  
  setHealth(health: number) {
    const [player] = queries.player.entities;
    if (player && player.health !== undefined) {
      player.health = health;
      console.log(`❤️ Health set to ${health}`);
    }
  },
  
  triggerAnimation(animationName: string) {
    const [player] = queries.player.entities;
    if (player && player.animation) {
      player.animation.current = animationName;
      console.log(`🎬 Playing animation: ${animationName}`);
    }
  },
  
  getPerformanceStats() {
    return {
      totalEntities: world.entities.length,
      obstacles: queries.obstacles.entities.length,
      collectibles: queries.collectibles.entities.length,
      particles: queries.particles.entities.length,
      movingEntities: queries.moving.entities.length,
      renderableEntities: queries.renderable.entities.length,
    };
  },
  
  exportGameState() {
    const state = {
      entities: world.entities.map(e => ({
        position: e.position,
        velocity: e.velocity,
        health: e.health,
        type: e.player ? 'player' : e.obstacle ? 'obstacle' : e.collectible ? 'collectible' : 'unknown',
      })),
      queries: {
        player: queries.player.entities.length,
        obstacles: queries.obstacles.entities.length,
        collectibles: queries.collectibles.entities.length,
      },
    };
    console.log('📤 Game State:', state);
    return state;
  },
};

// Expose to window for console access
if (typeof window !== 'undefined') {
  (window as any).debug = debugTools;
  console.log('🔧 Debug tools available at window.debug');
}
