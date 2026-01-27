/**
 * Entity Renderer Component
 * Renders all entities from the ECS world as 3D models with animation support
 * Uses React Three Fiber with @react-three/drei for GLB loading
 *
 * Game Coordinate Transform: Game (x, y, z) -> Three.js (x, z, y)
 * - Game X (lanes) -> Three.js X
 * - Game Y (forward/depth) -> Three.js Z
 * - Game Z (height) -> Three.js Y
 */

import { useAnimations, useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Suspense, useEffect, useRef, useState } from 'react';
import type * as THREE from 'three';
import { VISUAL } from '../../../game/config';
import { queries } from '../../../game/ecs';
import type { Entity } from '../../../game/types';

// Default otter model (fallback)
// For Metro web, assets are served from public/ at root
// For native, assets will use require() via AssetBridge
const BASE_URL = '';
const DEFAULT_OTTER_MODEL = `${BASE_URL}/models/player/otter-player/model.glb`;

/**
 * Main EntityRenderer component
 * Subscribes to ECS queries and renders all entities
 */
export function EntityRenderer() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const frameCount = useRef(0);

  // Sync ECS entities to React state at ~30fps
  useFrame(() => {
    frameCount.current++;
    // Update every 2 frames (~30fps sync rate)
    if (frameCount.current % 2 !== 0) return;

    const movingEntities = [...queries.moving.entities];
    const obstacleEntities = [...queries.obstacles.entities];
    const collectibleEntities = [...queries.collectibles.entities];

    // DEBUG: Log entity counts every second (~30 frames at 60fps)
    if (frameCount.current % 60 === 0) {
      console.log(
        `[EntityRenderer] moving=${movingEntities.length} obstacles=${obstacleEntities.length} collectibles=${collectibleEntities.length}`
      );
    }

    // Combine all entity lists, filtering out destroyed/collected
    const allEntities = [...movingEntities, ...obstacleEntities, ...collectibleEntities].filter(
      (entity) => !entity.destroyed && !entity.collected
    );

    setEntities(allEntities);
  });

  return (
    <>
      {entities.map((entity, index) => (
        <EntityMesh key={getEntityKey(entity, index)} entity={entity} />
      ))}
    </>
  );
}

/**
 * Generate a stable key for an entity
 */
function getEntityKey(entity: Entity, index: number): string {
  if (entity.player) return 'player';
  if (entity.characterId) return `player-${entity.characterId}`;
  // Use position + type as a pseudo-stable key
  const type = entity.obstacle ? 'obs' : entity.collectible ? 'col' : 'ent';
  const pos = entity.position;
  if (pos) {
    return `${type}-${pos.x.toFixed(1)}-${pos.y.toFixed(1)}-${index}`;
  }
  return `${type}-${index}`;
}

/**
 * Individual entity mesh component
 * Loads GLB model and syncs position with ECS entity
 */
interface EntityMeshProps {
  entity: Entity;
}

function EntityMesh({ entity }: EntityMeshProps) {
  // Determine model URL
  let modelUrl = entity.model?.url;

  // Special handling for player (otter)
  if (entity.player && !modelUrl) {
    modelUrl = DEFAULT_OTTER_MODEL;
  }

  // Skip if no model URL
  if (!modelUrl) {
    console.log('[EntityRenderer] Entity has no modelUrl:', {
      player: entity.player,
      obstacle: entity.obstacle,
      collectible: entity.collectible,
      model: entity.model,
    });
    return null;
  }

  return (
    <Suspense fallback={<EntityFallback entity={entity} />}>
      <GLBModel entity={entity} modelUrl={modelUrl} />
    </Suspense>
  );
}

/**
 * Fallback mesh shown while GLB is loading
 */
function EntityFallback({ entity }: { entity: Entity }) {
  const scale = entity.model?.scale ?? 1;
  const position = entity.position;

  if (!position) return null;

  // Transform: Game (x, y, z) -> Three.js (x, z, y)
  return (
    <mesh position={[position.x, position.z, position.y]}>
      <boxGeometry args={[0.5 * scale, 0.5 * scale, 0.5 * scale]} />
      <meshBasicMaterial color="#666666" wireframe />
    </mesh>
  );
}

/**
 * GLB Model component
 * Uses drei's useGLTF for efficient model loading and caching
 */
interface GLBModelProps {
  entity: Entity;
  modelUrl: string;
}

function playDefaultPlayerAnimation(
  actions: Record<string, THREE.AnimationAction | null> | undefined
): void {
  if (!actions) return;
  const animationNames = Object.keys(actions);
  if (animationNames.length === 0) return;

  const preferredAnims = ['swim', 'run', 'idle', 'walk'];
  const animToPlay = preferredAnims.find((name) =>
    animationNames.some((n) => n.toLowerCase().includes(name))
  );

  if (animToPlay) {
    const entry = Object.entries(actions).find(([name]) => name.toLowerCase().includes(animToPlay));
    const action = entry?.[1] ?? null;
    if (action) {
      action.reset().fadeIn(0.2).play();
    }
    return;
  }

  const fallback = actions[animationNames[0]] ?? null;
  fallback?.reset().fadeIn(0.2).play();
}

function GLBModel({ entity, modelUrl }: GLBModelProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Load GLB model (cached by drei)
  const { scene, animations } = useGLTF(modelUrl);

  // Clone the scene for this instance
  const clonedScene = useRef<THREE.Group>(undefined);
  if (!clonedScene.current) {
    clonedScene.current = scene.clone(true) as THREE.Group;
  }

  // Set up animations
  const { actions, mixer } = useAnimations(animations, groupRef);

  // Apply scale
  const scale = entity.player ? VISUAL.scales.otter : (entity.model?.scale ?? 1);

  useEffect(() => {
    if (groupRef.current) {
      entity.three = groupRef.current;
    }

    if (entity.player) {
      playDefaultPlayerAnimation(actions);
    }

    return () => {
      entity.three = undefined;
    };
  }, [entity, actions]);

  // Sync position and handle animation state changes
  useFrame((state, delta) => {
    if (!groupRef.current || !entity.position) return;

    // Transform: Game (x, y, z) -> Three.js (x, z, y)
    groupRef.current.position.set(
      entity.position.x, // X stays X (lanes/lateral)
      entity.position.z, // Game Z -> Three.js Y (height)
      entity.position.y // Game Y -> Three.js Z (depth/forward)
    );

    // Handle animation state changes for player
    if (entity.player && entity.animation && mixer) {
      const targetAnim = entity.animation.current || 'run';
      // Animation speed adjustment based on state
      if (targetAnim === 'hit' || targetAnim === 'collect') {
        mixer.timeScale = 2.0;
      } else {
        mixer.timeScale = 1.2;
      }
    }

    // Add subtle bobbing for collectibles
    if (entity.collectible && groupRef.current) {
      groupRef.current.position.y += Math.sin(state.clock.elapsedTime * 2) * 0.05;
      // Spin coins and gems
      groupRef.current.rotation.y += delta * 2;
    }
  });

  return (
    <group ref={groupRef} scale={[scale, scale, scale]}>
      <primitive object={clonedScene.current} />
      {/* Add point light for collectibles */}
      {entity.collectible && (
        <pointLight
          color={entity.collectible.type === 'coin' ? '#ffd700' : '#ff1493'}
          intensity={0.5}
          distance={2}
        />
      )}
    </group>
  );
}

// Preload common models (optional optimization)
// useGLTF.preload('/assets/models/player/otter-player/model.glb');
