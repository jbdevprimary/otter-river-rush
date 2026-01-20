/**
 * Miniplex ECS World for Otter River Rush
 * Entity Component System for managing game entities
 */

import { World } from 'miniplex';
import type { Entity } from '../types';
import { VISUAL, PHYSICS, getLaneX, getModelScale, getDefaultCharacter, type OtterCharacter } from '../config';
import {
  getObstacleUrlVariants,
  getCoinUrlVariants,
  getGemUrlVariants,
  getDecorationUrlVariants,
  ModelUrls,
} from '../assets';

/**
 * Create the Miniplex world
 */
export const world = new World<Entity>();

/**
 * Predefined queries for common entity sets
 * Reuse these instead of creating new queries
 */
export const queries = {
  // Player
  player: world.with('player', 'position', 'model'),

  // Obstacles
  obstacles: world.with('obstacle', 'position', 'collider'),

  // Collectibles
  collectibles: world.with('collectible', 'position'),
  coins: world
    .with('collectible', 'position')
    .where((e) => e.collectible?.type === 'coin'),
  gems: world
    .with('collectible', 'position')
    .where((e) => e.collectible?.type === 'gem'),

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
 * Reset the world - clear all entities
 */
export function resetWorld(): void {
  for (const entity of world.entities) {
    world.remove(entity);
  }
}

/**
 * Helper functions for spawning entities
 */
export const spawn = {
  /**
   * Spawn player otter with selected character model
   * @param lane Starting lane (-1, 0, or 1)
   * @param character Optional character to use (defaults to Rusty)
   */
  otter: (lane: -1 | 0 | 1 = 0, character?: OtterCharacter) => {
    const char = character ?? getDefaultCharacter();
    return world.add({
      player: true,
      position: {
        x: getLaneX(lane),
        y: VISUAL.positions.player,
        z: VISUAL.layers.player,
      },
      velocity: { x: 0, y: 0, z: 0 },
      lane,
      model: {
        url: char.modelPath,
        scale: getModelScale('otter'),
      },
      animation: {
        current: 'idle',
        urls: {
          idle: char.modelPath,
        },
      },
      collider: { width: 0.8, height: 1.2, depth: 0.8 },
      health: char.traits.startingHealth,
      characterId: char.id,
    });
  },

  rock: (x: number, y: number, variant: number = 0) => {
    // Use AssetRegistry for obstacle variants - single source of truth
    const obstacles = getObstacleUrlVariants();
    const selected = obstacles[variant % obstacles.length];
    return world.add({
      obstacle: true,
      position: { x, y, z: VISUAL.layers.obstacles },
      velocity: { x: 0, y: -PHYSICS.scrollSpeed, z: 0 },
      model: {
        url: selected.url,
        scale: selected.scale ?? getModelScale('rock'),
      },
      collider: { width: 1.2, height: 1.2, depth: 1.2 },
      variant,
    });
  },

  coin: (x: number, y: number, variant: number = 0) => {
    // Use AssetRegistry for coin variants - single source of truth
    const coins = getCoinUrlVariants();
    const selected = coins[variant % coins.length];
    return world.add({
      collectible: { type: 'coin', value: selected.value ?? 10 },
      position: { x, y, z: VISUAL.layers.collectibles },
      velocity: { x: 0, y: -PHYSICS.scrollSpeed, z: 0 },
      model: {
        url: selected.url,
        scale: selected.scale ?? getModelScale('coin'),
      },
      collider: { width: 0.6, height: 0.6, depth: 0.6 },
    });
  },

  gem: (x: number, y: number, variant: number = 0) => {
    // Use AssetRegistry for gem variants - single source of truth
    const gems = getGemUrlVariants();
    const selected = gems[variant % gems.length];
    return world.add({
      collectible: { type: 'gem', value: selected.value ?? 50 },
      position: { x, y, z: VISUAL.layers.collectibles },
      velocity: { x: 0, y: -PHYSICS.scrollSpeed, z: 0 },
      model: {
        url: selected.url,
        scale: selected.scale ?? getModelScale('gem'),
      },
      collider: { width: 0.8, height: 0.8, depth: 0.8 },
      variant,
    });
  },

  powerUp: (x: number, y: number) =>
    world.add({
      collectible: { type: 'gem', value: 100 },
      powerUp: { type: 'shield', duration: 5000 },
      position: { x, y, z: VISUAL.layers.collectibles },
      velocity: { x: 0, y: -PHYSICS.scrollSpeed, z: 0 },
      model: {
        url: ModelUrls.collectibles.heart,
        scale: getModelScale('gem') * 1.5,
      },
      collider: { width: 0.8, height: 0.8, depth: 0.8 },
    }),

  decoration: (x: number, y: number, variant: number = 0) => {
    // Use AssetRegistry for decoration variants - single source of truth
    const decorations = getDecorationUrlVariants();
    const selected = decorations[variant % decorations.length];
    return world.add({
      decoration: true,
      position: { x, y, z: VISUAL.layers.decorations },
      velocity: { x: 0, y: -PHYSICS.scrollSpeed, z: 0 },
      model: {
        url: selected.url,
        scale: selected.scale ?? getModelScale('decoration'),
      },
      variant,
    });
  },

  particle: (x: number, y: number, color: string) =>
    world.add({
      particle: {
        color,
        lifetime: 1000,
        size: getModelScale('particle') * 100,
      },
      position: { x, y, z: VISUAL.layers.particles },
      velocity: {
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2,
        z: 0,
      },
    }),
};
