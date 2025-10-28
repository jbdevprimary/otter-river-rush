/**
 * Miniplex ECS World for Otter River Rush
 * Entity Component System for managing game entities
 */

import { World } from 'miniplex';
import createReactAPI from 'miniplex-react';
import type { Object3D } from 'three';
import { VISUAL, PHYSICS, getLaneX, getModelScale } from '../config/visual-constants';

/**
 * Entity type definition
 * All game entities (Otter, Rocks, Coins, Gems) use this schema
 */
export type Entity = {
  // Core components
  position: { x: number; y: number; z: number };
  velocity?: { x: number; y: number; z: number };
  
  // Three.js rendering
  model?: {
    url: string;
    scale?: number;
  };
  three?: Object3D;
  
  // Animation
  animation?: {
    current: string;  // 'idle', 'walk', 'run', 'jump', 'collect', 'hit', 'death'
    urls: Record<string, string>;
  };
  
  // Physics
  collider?: {
    width: number;
    height: number;
    depth: number;
  };
  
  // Game behavior
  scrollSpeed?: number;
  lane?: -1 | 0 | 1;  // Left, Center, Right
  
  // Entity types (tags)
  player?: true;
  obstacle?: true;
  enemy?: true;
  ai?: {
    type: string;
    aggression: number;
    lastAction: number;
  };
  collectible?: {
    type: 'coin' | 'gem';
    value: number;
  };
  powerUp?: {
    type: 'shield' | 'magnet' | 'ghost' | 'multiplier' | 'slow_motion';
    duration?: number;
  };
  
  // State
  health?: number;
  invincible?: true;
  ghost?: true;
  collected?: true;
  destroyed?: true;
  
  // Visual effects
  particle?: {
    color: string;
    lifetime: number;
    size: number;
  };
  
  // Metadata
  id?: string;
  variant?: number;  // For multiple rock types
};

/**
 * Create the Miniplex world
 */
export const world = new World<Entity>();

/**
 * Create and export React bindings
 * Use ECS.Entity, ECS.Component, ECS.Entities in components
 */
export const ECS = createReactAPI(world);

/**
 * Predefined queries for common entity sets
 * Reuse these instead of creating new queries
 */
export const queries = {
  // Player
  player: world.with('player', 'position', 'model'),
  
  // Enemies
  enemies: world.with('enemy', 'position', 'collider'),
  
  // Obstacles
  obstacles: world.with('obstacle', 'position', 'collider'),
  
  // Collectibles
  collectibles: world.with('collectible', 'position'),
  coins: world.with('collectible', 'position').where(
    (e) => e.collectible?.type === 'coin'
  ),
  gems: world.with('collectible', 'position').where(
    (e) => e.collectible?.type === 'gem'
  ),
  
  // Power-ups
  powerUps: world.with('powerUp', 'position'),
  
  // Visual effects
  particles: world.with('particle', 'position', 'velocity'),
  
  // Physics
  moving: world.with('position', 'velocity'),
  collidable: world.with('position', 'collider'),
  
  // Lifecycle
  collected: world.with('collected'),
  destroyed: world.with('destroyed'),
  
  // Rendering
  renderable: world.with('position', 'three'),
};

/**
 * Helper functions for spawning entities
 */
export const spawn = {
  otter: (lane: -1 | 0 | 1 = 0) =>
    world.add({
      player: true,
      position: { x: getLaneX(lane), y: VISUAL.positions.player, z: VISUAL.layers.player },
      velocity: { x: 0, y: 0, z: 0 },
      lane,
      model: {
        url: '/otter-river-rush/models/otter-rusty.glb',
        scale: getModelScale('otter'),
      },
      animation: {
        current: 'idle',
        urls: {
          idle: '/otter-river-rush/models/otter-rusty.glb',
          walk: '/otter-river-rush/models/otter-rusty-walk.glb',
          run: '/otter-river-rush/models/otter-rusty-run.glb',
          jump: '/otter-river-rush/models/otter-rusty-jump.glb',
          collect: '/otter-river-rush/models/otter-rusty-collect.glb',
          hit: '/otter-river-rush/models/otter-rusty-hit.glb',
          death: '/otter-river-rush/models/otter-rusty-death.glb',
          victory: '/otter-river-rush/models/otter-rusty-victory.glb',
          happy: '/otter-river-rush/models/otter-rusty-happy.glb',
          dodgeLeft: '/otter-river-rush/models/otter-rusty-dodge-left.glb',
          dodgeRight: '/otter-river-rush/models/otter-rusty-dodge-right.glb',
        },
      },
      collider: { width: 0.8, height: 1.2, depth: 0.8 },
      health: 3,
    }),

  rock: (x: number, y: number, variant: number = 0) => {
    const variants = [
      '/otter-river-rush/models/rock-river.glb',
      '/otter-river-rush/models/rock-mossy.glb',
      '/otter-river-rush/models/rock-cracked.glb',
      '/otter-river-rush/models/rock-crystal.glb',
    ];
    
    return world.add({
      obstacle: true,
      position: { x, y, z: VISUAL.layers.obstacles },
      velocity: { x: 0, y: -PHYSICS.scrollSpeed, z: 0 },
      model: {
        url: variants[variant % variants.length],
        scale: getModelScale('rock'),
      },
      collider: { width: 1.2, height: 1.2, depth: 1.2 },
      variant,
    });
  },

  coin: (x: number, y: number) =>
    world.add({
      collectible: { type: 'coin', value: 10 },
      position: { x, y, z: VISUAL.layers.collectibles },
      velocity: { x: 0, y: -PHYSICS.scrollSpeed, z: 0 },
      model: {
        url: '/otter-river-rush/models/coin-gold.glb',
        scale: getModelScale('coin'),
      },
      collider: { width: 0.6, height: 0.6, depth: 0.6 },
    }),

  gem: (x: number, y: number, color: 'red' = 'red') =>
    world.add({
      collectible: { type: 'gem', value: 50 },
      position: { x, y, z: VISUAL.layers.collectibles },
      velocity: { x: 0, y: -PHYSICS.scrollSpeed, z: 0 },
      model: {
        url: '/otter-river-rush/models/gem-red.glb',
        scale: getModelScale('gem'),
      },
      collider: { width: 0.8, height: 0.8, depth: 0.8 },
    }),

  particle: (x: number, y: number, color: string) =>
    world.add({
      particle: { color, lifetime: 1000, size: getModelScale('particle') * 100 },
      position: { x, y, z: VISUAL.layers.particles },
      velocity: {
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2,
        z: 0,
      },
    }),
};
