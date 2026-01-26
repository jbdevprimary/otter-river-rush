/**
 * Main App Component
 * Otter River Rush Web Application - React Three Fiber
 */

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, useGLTF } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Suspense, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';

import {
  initAudio,
  playCoinPickup,
  playGemPickup,
  playHit,
  playMusic,
  stopMusic,
} from '@otter-river-rush/audio';
import { getCharacter, VISUAL, BIOME_COLORS } from '@otter-river-rush/config';
import {
  type CollisionHandlers,
  createInputState,
  createSpawnerState,
  setupKeyboardInput,
  spawn,
  updateAnimation,
  updateCleanup,
  updateCollision,
  updateMovement,
  updateParticles,
  updatePlayerInput,
  updateSpawner,
  queries,
} from '@otter-river-rush/core';
import { useGameStore } from '@otter-river-rush/state';
import { CharacterSelect, HUD, Menu } from '@otter-river-rush/ui';
import type { Entity } from '@otter-river-rush/types';

// Default otter model (fallback) - uses Vite's base URL for GitHub Pages
const BASE_URL = `${import.meta.env.BASE_URL ?? '/'}assets`;
const DEFAULT_OTTER_MODEL = `${BASE_URL}/models/player/otter-player/model.glb`;

// ============================================================================
// Game Loop Component - runs game systems via useFrame
// ============================================================================
interface GameLoopProps {
  spawnerStateRef: React.RefObject<ReturnType<typeof createSpawnerState>>;
  inputStateRef: React.RefObject<ReturnType<typeof createInputState>>;
}

function GameLoop({ spawnerStateRef, inputStateRef }: GameLoopProps) {
  const lastTimeRef = useRef<number>(0);

  useFrame((state) => {
    const time = state.clock.elapsedTime * 1000; // Convert to ms

    if (!lastTimeRef.current) {
      lastTimeRef.current = time;
    }

    const deltaTime = (time - lastTimeRef.current) / 1000; // Convert to seconds
    lastTimeRef.current = time;

    const currentStatus = useGameStore.getState().status;

    // Run game systems only when playing
    if (currentStatus === 'playing') {
      if (inputStateRef.current) {
        updatePlayerInput(inputStateRef.current, deltaTime);
      }
      updateMovement(deltaTime);
      updateAnimation(currentStatus);
      if (spawnerStateRef.current) {
        updateSpawner(spawnerStateRef.current, time, true);
      }

      const handlers: CollisionHandlers = {
        onObstacleHit: () => {
          playHit();
        },
        onCollectCoin: (value) => {
          playCoinPickup();
          useGameStore.getState().collectCoin(value);
        },
        onCollectGem: (value) => {
          playGemPickup();
          useGameStore.getState().collectGem(value);
        },
        onGameOver: () => {
          stopMusic();
          useGameStore.getState().endGame();
        },
      };
      updateCollision(currentStatus, handlers);

      updateParticles(deltaTime * 1000);
      updateCleanup();

      // Update distance (score progression)
      useGameStore.getState().updateDistance(deltaTime * VISUAL.camera.zoom * 0.5);
    }
  });

  return null;
}

// ============================================================================
// Entity Model Component - renders a single GLB model for an entity
// ============================================================================
interface EntityModelProps {
  entity: Entity;
  modelUrl: string;
  scale: number;
}

function EntityModel({ entity, modelUrl, scale }: EntityModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(modelUrl);

  // Clone the scene for this instance
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  // Set up animation mixer
  const mixer = useMemo(() => {
    if (animations.length > 0) {
      const m = new THREE.AnimationMixer(clonedScene);
      const action = m.clipAction(animations[0]);
      action.play();
      return m;
    }
    return null;
  }, [clonedScene, animations]);

  // Update animation mixer each frame
  useFrame((_, delta) => {
    if (mixer) {
      mixer.update(delta);
    }
  });

  // Update position each frame
  // Game coords: X=lanes, Y=forward/back (river flow), Z=height
  // Three.js coords: X=lateral, Y=height, Z=depth
  // Transform: Game (x, y, z) -> Three.js (x, z, y)
  useFrame(() => {
    if (groupRef.current && entity.position) {
      groupRef.current.position.set(
        entity.position.x,  // X stays X (lanes/lateral)
        entity.position.z,  // Game Z -> Three.js Y (height)
        entity.position.y   // Game Y -> Three.js Z (depth/forward)
      );
    }

    // Store reference in entity for collision detection
    if (groupRef.current) {
      entity.three = groupRef.current;
    }
  });

  return (
    <group ref={groupRef} scale={scale}>
      <primitive object={clonedScene} />
    </group>
  );
}

// ============================================================================
// Entity Renderer Component - renders all ECS entities
// ============================================================================
function EntityRenderer() {
  const movingEntities = useRef<Entity[]>([]);
  const obstacleEntities = useRef<Entity[]>([]);
  const collectibleEntities = useRef<Entity[]>([]);

  // Update entity lists each frame
  useFrame(() => {
    movingEntities.current = [...queries.moving.entities];
    obstacleEntities.current = [...queries.obstacles.entities];
    collectibleEntities.current = [...queries.collectibles.entities];
  });

  return (
    <>
      {[...queries.moving.entities].map((entity) => {
        if (entity.destroyed || entity.collected) return null;
        const modelUrl = entity.model?.url ?? (entity.player ? DEFAULT_OTTER_MODEL : null);
        if (!modelUrl) return null;
        const scale = entity.player ? VISUAL.scales.otter : (entity.model?.scale ?? 1);
        return (
          <Suspense key={entity.player ? 'player' : `entity-${Math.random()}`} fallback={null}>
            <EntityModel entity={entity} modelUrl={modelUrl} scale={scale} />
          </Suspense>
        );
      })}
      {[...queries.obstacles.entities].map((entity, idx) => {
        if (entity.destroyed || entity.collected) return null;
        const modelUrl = entity.model?.url;
        if (!modelUrl) return null;
        const scale = entity.model?.scale ?? 1;
        return (
          <Suspense key={`obstacle-${idx}-${entity.position?.y ?? 0}`} fallback={null}>
            <EntityModel entity={entity} modelUrl={modelUrl} scale={scale} />
          </Suspense>
        );
      })}
      {[...queries.collectibles.entities].map((entity, idx) => {
        if (entity.destroyed || entity.collected) return null;
        const modelUrl = entity.model?.url;
        if (!modelUrl) return null;
        const scale = entity.model?.scale ?? 1;
        return (
          <Suspense key={`collectible-${idx}-${entity.position?.y ?? 0}`} fallback={null}>
            <EntityModel entity={entity} modelUrl={modelUrl} scale={scale} />
          </Suspense>
        );
      })}
    </>
  );
}

// ============================================================================
// River Environment Component - creates the water/river visual
// ============================================================================
interface RiverEnvironmentProps {
  biome?: keyof typeof BIOME_COLORS;
}

function RiverEnvironment({ biome = 'forest' }: RiverEnvironmentProps) {
  const colors = BIOME_COLORS[biome];
  const waterRef = useRef<THREE.Mesh>(null);

  // River dimensions
  const riverWidth = 8;
  const riverLength = 50;
  const bankWidth = 6;

  // Animate water texture offset for flow effect
  useFrame((_, delta) => {
    if (waterRef.current) {
      const material = waterRef.current.material as THREE.MeshStandardMaterial;
      if (material.map) {
        material.map.offset.y -= delta * 0.3;
      }
    }
  });

  // Tree positions along banks
  const treePositions = useMemo(() => [
    // Left side trees
    { x: -6, y: -5, scale: 1.2 },
    { x: -7, y: 0, scale: 1.0 },
    { x: -5.5, y: 5, scale: 1.4 },
    { x: -6.5, y: 10, scale: 0.9 },
    { x: -7, y: 15, scale: 1.1 },
    { x: -5.5, y: 20, scale: 1.3 },
    { x: -6, y: 25, scale: 1.0 },
    { x: -7, y: 30, scale: 1.2 },
    // Right side trees
    { x: 6, y: -3, scale: 1.1 },
    { x: 7, y: 2, scale: 0.9 },
    { x: 5.5, y: 7, scale: 1.3 },
    { x: 6.5, y: 12, scale: 1.0 },
    { x: 7, y: 17, scale: 1.2 },
    { x: 5.5, y: 22, scale: 1.1 },
    { x: 6, y: 27, scale: 1.4 },
    { x: 7, y: 32, scale: 0.9 },
  ], []);

  // Mountain positions
  const mountainPositions = useMemo(() => [
    { x: -15, y: 40, height: 12, width: 16 },
    { x: -8, y: 45, height: 8, width: 12 },
    { x: 0, y: 50, height: 15, width: 20 },
    { x: 10, y: 42, height: 10, width: 14 },
    { x: 18, y: 48, height: 13, width: 18 },
  ], []);

  return (
    <group>
      {/* River/Water Surface */}
      <mesh
        ref={waterRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.1, riverLength / 2 - 10]}
      >
        <planeGeometry args={[riverWidth, riverLength, 32, 32]} />
        <meshStandardMaterial
          color={colors.water}
          roughness={0.1}
          metalness={0.9}
          transparent
          opacity={0.9}
          emissive={colors.water}
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Left Riverbank */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[-(riverWidth / 2 + bankWidth / 2), 0, riverLength / 2 - 10]}
      >
        <planeGeometry args={[bankWidth, riverLength]} />
        <meshStandardMaterial color={colors.terrain} roughness={1} />
      </mesh>

      {/* Right Riverbank */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[riverWidth / 2 + bankWidth / 2, 0, riverLength / 2 - 10]}
      >
        <planeGeometry args={[bankWidth, riverLength]} />
        <meshStandardMaterial color={colors.terrain} roughness={1} />
      </mesh>

      {/* Trees */}
      {treePositions.map((pos, i) => (
        <group key={`tree-${i}`}>
          {/* Trunk */}
          <mesh position={[pos.x, pos.scale, pos.y]}>
            <cylinderGeometry args={[0.2 * pos.scale, 0.2 * pos.scale, 2 * pos.scale, 8]} />
            <meshStandardMaterial color="#5D4037" />
          </mesh>
          {/* Foliage */}
          <mesh position={[pos.x, 3.5 * pos.scale, pos.y]}>
            <coneGeometry args={[pos.scale, 3 * pos.scale, 8]} />
            <meshStandardMaterial color={colors.terrain} />
          </mesh>
        </group>
      ))}

      {/* Mountains */}
      {mountainPositions.map((m, i) => (
        <mesh key={`mountain-${i}`} position={[m.x, m.height / 2 - 2, m.y]}>
          <coneGeometry args={[m.width / 2, m.height, 8]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
      ))}

      {/* Sky Backdrop */}
      <mesh position={[0, 10, 55]} rotation={[Math.PI / 6, 0, 0]}>
        <planeGeometry args={[80, 40]} />
        <meshBasicMaterial color={colors.sky} side={THREE.DoubleSide} />
      </mesh>

      {/* Lane Markers */}
      {VISUAL.lanes.positions.map((laneX, i) => (
        <mesh key={`lane-${i}`} position={[laneX, 0.01, riverLength / 2 - 10]}>
          <boxGeometry args={[0.08, 0.02, riverLength]} />
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.2}
            emissive="#ffffff"
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}

// ============================================================================
// Scene Setup Component - initializes camera and lighting
// ============================================================================
function SceneSetup() {
  const { gl, camera } = useThree();

  useEffect(() => {
    // Set background color
    gl.setClearColor(VISUAL.colors.background);
  }, [gl]);

  // Make camera look forward down the river
  useEffect(() => {
    camera.lookAt(0, 0, 15);
  }, [camera]);

  return (
    <>
      {/* Camera - BEHIND the player, looking FORWARD down the river */}
      <PerspectiveCamera
        makeDefault
        position={[0, 4, -10]}
        fov={50}
        near={0.1}
        far={1000}
      />

      {/* Ambient Light */}
      <ambientLight
        color={VISUAL.lighting.ambient.color}
        intensity={VISUAL.lighting.ambient.intensity}
      />

      {/* Main Directional Light (Sun) */}
      <directionalLight
        color="#fff3e0"
        intensity={VISUAL.lighting.directional.main.intensity}
        position={[-1, 2, -1]}
        castShadow
      />

      {/* Fill Light */}
      <directionalLight
        color="#90caf9"
        intensity={VISUAL.lighting.directional.fill.intensity}
        position={[1, 1, 1]}
      />

      {/* Fog */}
      <fog attach="fog" args={[VISUAL.fog.color, VISUAL.fog.near, VISUAL.fog.far]} />
    </>
  );
}

// ============================================================================
// Audio Initializer Component - sets up audio on first interaction
// ============================================================================
function AudioInitializer() {
  const initialized = useRef(false);

  useEffect(() => {
    const handleInteraction = () => {
      if (!initialized.current) {
        initAudio();
        initialized.current = true;
        window.removeEventListener('click', handleInteraction);
        window.removeEventListener('keydown', handleInteraction);
      }
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  return null;
}

// ============================================================================
// Main App Component
// ============================================================================
export function App() {
  const status = useGameStore((state) => state.status);
  const spawnerStateRef = useRef(createSpawnerState());
  const inputStateRef = useRef(createInputState());

  // Setup input on mount
  useEffect(() => {
    const cleanup = setupKeyboardInput(inputStateRef.current);
    return () => {
      cleanup();
    };
  }, []);

  // Spawn player when game starts with selected character
  useEffect(() => {
    if (status === 'playing') {
      // Get selected character and spawn player
      const selectedCharId = useGameStore.getState().selectedCharacterId;
      const character = getCharacter(selectedCharId);
      spawn.otter(0, character);
    }
  }, [status]);

  // Handle music based on game status
  useEffect(() => {
    if (status === 'playing') {
      playMusic('gameplay');
    } else if (status === 'game_over') {
      playMusic('gameOver', false);
    } else if (status === 'menu') {
      playMusic('ambient');
    }
  }, [status]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Canvas
        shadows
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          {/* Scene setup (camera, lights, fog) */}
          <SceneSetup />

          {/* Game loop (runs ECS systems) */}
          <GameLoop
            spawnerStateRef={spawnerStateRef}
            inputStateRef={inputStateRef}
          />

          {/* 3D Environment */}
          <RiverEnvironment biome="forest" />

          {/* Entity renderer for player, obstacles, collectibles */}
          <EntityRenderer />

          {/* Post-processing effects */}
          <EffectComposer>
            <Bloom
              intensity={0.5}
              luminanceThreshold={0.9}
              luminanceSmoothing={0.9}
            />
          </EffectComposer>
        </Suspense>
      </Canvas>

      {/* Audio initializer */}
      <AudioInitializer />

      {/* UI Overlay - rendered outside Canvas */}
      {status === 'playing' && <HUD />}
      {status === 'menu' && <Menu type="menu" />}
      {status === 'character_select' && <CharacterSelect />}
      {status === 'game_over' && <Menu type="game_over" />}
    </div>
  );
}
