/**
 * Entity Renderer Component
 * Renders all entities from the ECS world as 3D models with animation support
 */

import { VISUAL } from '@otter-river-rush/config';
import { queries } from '@otter-river-rush/core';
import type { Entity } from '@otter-river-rush/types';
import { useEffect, useRef } from 'react';
import { useScene } from 'reactylon';
import { type GLBResult, loadGLB } from '../loaders/glb-loader';

// Track loaded models with their animation state
interface LoadedModel {
  glbResult: GLBResult;
  currentAnimation: string | null;
  entity: Entity;
}

// Default otter model (fallback) - uses Vite's base URL for GitHub Pages
// Handle potential double slash if BASE_URL has trailing slash
const rawBase = import.meta.env.BASE_URL ?? '/';
const normalizedBase = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;
const BASE_URL = `${normalizedBase}assets`;
const DEFAULT_OTTER_MODEL = `${BASE_URL}/models/player/otter-player/model.glb`;

export function EntityRenderer() {
  const scene = useScene();
  const loadedModelsRef = useRef<Map<Entity, LoadedModel>>(new Map());
  const loadingRef = useRef<Set<Entity>>(new Set());
  const frameHandleRef = useRef<number>(0);
  const otterAnimRef = useRef<{ current: string; model: LoadedModel | null }>({
    current: 'run',
    model: null,
  });

  useEffect(() => {
    if (!scene) return;

    const loadedModels = loadedModelsRef.current;
    const loading = loadingRef.current;

    const frameLoop = () => {
      // Get all entities that need rendering
      const movingEntities = [...queries.moving.entities];
      const obstacleEntities = [...queries.obstacles.entities];
      const collectibleEntities = [...queries.collectibles.entities];

      // DEBUG: Log entity counts every second
      const now = Date.now();
      const win = window as typeof window & { __lastEntityLog?: number };
      if (!win.__lastEntityLog || now - win.__lastEntityLog > 1000) {
        win.__lastEntityLog = now;
        console.log(
          `[EntityRenderer] moving=${movingEntities.length} obstacles=${obstacleEntities.length} collectibles=${collectibleEntities.length} loaded=${loadedModels.size} loading=${loading.size}`
        );
      }

      const allEntities = [...movingEntities, ...obstacleEntities, ...collectibleEntities];

      // Load models for new entities
      for (const entity of allEntities) {
        // Skip if already loaded or currently loading
        if (loadedModels.has(entity) || loading.has(entity)) continue;

        // Skip destroyed/collected
        if (entity.destroyed || entity.collected) continue;

        // Determine model URL and scale
        let modelUrl: string | undefined;
        let scale = 1;

        if (entity.model?.url) {
          modelUrl = entity.model.url;
          scale = entity.model.scale ?? 1;
        }

        // Special handling for player (otter) - use entity's model or default
        if (entity.player) {
          // Use the model URL set when the otter was spawned (based on selected character)
          modelUrl = entity.model?.url ?? DEFAULT_OTTER_MODEL;
          scale = VISUAL.scales.otter;
        }

        // DEBUG: Log why entity might not load
        if (!modelUrl) {
          console.log('[EntityRenderer] Entity has no modelUrl:', {
            player: entity.player,
            obstacle: entity.obstacle,
            collectible: entity.collectible,
            model: entity.model,
          });
          continue;
        }

        console.log(
          '[EntityRenderer] Loading model:',
          modelUrl,
          'for entity:',
          entity.player ? 'player' : entity.obstacle ? 'obstacle' : 'collectible'
        );

        // Mark as loading
        loading.add(entity);

        loadGLB({
          url: modelUrl,
          scene,
          scaling: scale,
        })
          .then((result) => {
            loading.delete(entity);

            // Check if entity was destroyed while loading
            if (entity.destroyed || entity.collected) {
              result.dispose();
              return;
            }

            const loadedModel: LoadedModel = {
              glbResult: result,
              currentAnimation: null,
              entity,
            };

            loadedModels.set(entity, loadedModel);

            // Store reference in entity for collision detection
            entity.three = result.rootMesh;

            // Set initial position
            // Game coords: X=lanes, Y=forward/back (river flow), Z=height
            // Babylon coords: X=lateral, Y=height, Z=depth
            // Transform: Game (x, y, z) → Babylon (x, z, y)
            if (entity.position) {
              result.rootMesh.position.set(
                entity.position.x, // X stays X (lanes/lateral)
                entity.position.z, // Game Z → Babylon Y (height)
                entity.position.y // Game Y → Babylon Z (depth/forward)
              );
            }

            // Start animations
            if (entity.player) {
              // Store otter model reference
              otterAnimRef.current.model = loadedModel;
              // Play run animation for otter
              result.playAnimation(0, true, 1.2);
              loadedModel.currentAnimation = 'run';
            } else if (result.animationGroups.length > 0) {
              // Play first animation for other entities
              result.playAnimation(0, true, 1.0);
            }
          })
          .catch((err) => {
            console.error('Failed to load model:', modelUrl, err);
            loading.delete(entity);
          });
      }

      // Update positions and handle cleanup
      for (const [entity, loadedModel] of loadedModels.entries()) {
        const { glbResult } = loadedModel;

        // Update position - transform game coords to Babylon coords
        // Game (x, y, z) → Babylon (x, z, y)
        if (entity.position) {
          glbResult.rootMesh.position.set(
            entity.position.x, // X stays X (lanes/lateral)
            entity.position.z, // Game Z → Babylon Y (height)
            entity.position.y // Game Y → Babylon Z (depth/forward)
          );
        }

        // Handle animation state changes for player
        if (entity.player && entity.animation) {
          const targetAnim = entity.animation.current || 'run';
          if (loadedModel.currentAnimation !== targetAnim) {
            // For now, just update the animation speed based on state
            // Full animation switching would require loading different GLB files
            if (targetAnim === 'hit' || targetAnim === 'collect') {
              glbResult.playAnimation(0, false, 2.0);
            } else {
              glbResult.playAnimation(0, true, 1.2);
            }
            loadedModel.currentAnimation = targetAnim;
          }
        }

        // Clean up destroyed entities
        if (entity.destroyed || entity.collected) {
          glbResult.dispose();
          loadedModels.delete(entity);
        }
      }

      frameHandleRef.current = requestAnimationFrame(frameLoop);
    };

    frameHandleRef.current = requestAnimationFrame(frameLoop);

    return () => {
      cancelAnimationFrame(frameHandleRef.current);
      // Clean up all models
      for (const loadedModel of loadedModels.values()) {
        loadedModel.glbResult.dispose();
      }
      loadedModels.clear();
      loading.clear();
    };
  }, [scene]);

  return null;
}
