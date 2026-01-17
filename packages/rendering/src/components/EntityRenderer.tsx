/**
 * Entity Renderer Component
 * Renders all entities from the ECS world as 3D models
 */

import { useEffect, useRef } from 'react';
import { useScene } from 'reactylon';
import { queries } from '@otter-river-rush/core';
import { loadGLB } from '../loaders/glb-loader';
import type { AbstractMesh } from '@babylonjs/core';
import type { Entity } from '@otter-river-rush/types';

export function EntityRenderer() {
  const scene = useScene();
  const loadedModelsRef = useRef<Map<Entity, AbstractMesh>>(new Map());

  useEffect(() => {
    if (!scene) return;

    const frameLoop = () => {
      // Get all entities with models
      const entities = [...queries.moving.entities, ...queries.obstacles.entities, ...queries.collectibles.entities];
      const loadedModels = loadedModelsRef.current;

      // Load models for new entities
      for (const entity of entities) {
        if (!entity.model || !entity.model.url || loadedModels.has(entity)) continue;

        loadGLB({
          url: entity.model.url,
          scene,
          scaling: entity.model.scale,
        }).then((result) => {
          const mesh = result.rootMesh;
          loadedModels.set(entity, mesh);

          // Store reference in entity
          entity.three = mesh;

          // Set initial position
          if (entity.position) {
            mesh.position.set(entity.position.x, entity.position.y, entity.position.z);
          }
        });
      }

      // Update positions for all loaded entities
      for (const [entity, mesh] of loadedModels.entries()) {
        if (entity.position) {
          mesh.position.set(entity.position.x, entity.position.y, entity.position.z);
        }

        // Clean up destroyed entities
        if (entity.destroyed || entity.collected) {
          mesh.dispose();
          loadedModels.delete(entity);
        }
      }

      requestAnimationFrame(frameLoop);
    };

    const handle = requestAnimationFrame(frameLoop);

    return () => {
      cancelAnimationFrame(handle);
      // Clean up all models
      const loadedModels = loadedModelsRef.current;
      for (const mesh of loadedModels.values()) {
        mesh.dispose();
      }
      loadedModels.clear();
    };
  }, [scene]);

  return null;
}
