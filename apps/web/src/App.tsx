/**
 * Main App Component
 * Otter River Rush Web Application - React Three Fiber
 *
 * Uses a fixed timestep game loop for deterministic physics:
 * - Fixed timestep of 16.67ms (60 FPS target)
 * - Accumulator pattern for consistent physics updates
 * - Interpolation for smooth rendering between physics steps
 * - Handles variable frame rates gracefully
 */

import { ensureAudioContext, initAudio, playMusic } from '@otter-river-rush/audio';
import { BIOME_COLORS, getCharacter, VISUAL } from '@otter-river-rush/config';
import {
  createInputState,
  createSpawnerState,
  queries,
  setupKeyboardInput,
  setupTouchInput,
  spawn,
} from '@otter-river-rush/core';
import { AnimatedWaterMaterial, BiomeWeather } from '@otter-river-rush/rendering';
import { useGameStore } from '@otter-river-rush/state';
import type { BiomeType, Entity } from '@otter-river-rush/types';
import {
  AccessibilityProvider,
  AchievementNotification,
  CharacterSelect,
  FloatingText,
  type FloatingTextItem,
  HUD,
  Menu,
  MilestoneNotification,
  PauseMenu,
} from '@otter-river-rush/ui';
import { PerspectiveCamera, useGLTF } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  CollectionBurst,
  type CollectionBurstRef,
  ImpactFlash,
  type ImpactFlashRef,
  PlayerTrail,
  SpeedLines,
} from './effects';

import {
  type CollectionCallback,
  createInterpolationState,
  type DamageCallback,
  FixedTimestepGameLoop,
  type InterpolationState,
  lerpNumber,
  type NearMissCallback,
} from './game-loop';

// Default otter model (fallback) - uses Vite's base URL for GitHub Pages
const BASE_URL = `${import.meta.env.BASE_URL ?? '/'}assets`;
const DEFAULT_OTTER_MODEL = `${BASE_URL}/models/player/otter-player/model.glb`;

// ============================================================================
// Animation name mapping - maps our animation states to potential GLB clip names
// ============================================================================
const ANIMATION_NAME_MAPPINGS: Record<string, string[]> = {
  idle: ['idle', 'Idle', 'IDLE', 'stand', 'Stand', 'rest', 'Rest'],
  swim: ['swim', 'Swim', 'SWIM', 'swimming', 'Swimming', 'run', 'Run', 'walk', 'Walk', 'move', 'Move'],
  hit: ['hit', 'Hit', 'HIT', 'damage', 'Damage', 'hurt', 'Hurt', 'pain', 'Pain'],
  collect: ['collect', 'Collect', 'pickup', 'Pickup', 'grab', 'Grab', 'happy', 'Happy', 'celebrate'],
  dodge: ['dodge', 'Dodge', 'lean', 'Lean', 'tilt', 'Tilt', 'turn', 'Turn', 'swerve'],
  death: ['death', 'Death', 'DEATH', 'die', 'Die', 'dead', 'Dead', 'fall', 'Fall'],
};

/**
 * Find an animation clip by name, trying various common naming conventions
 */
function findAnimationClip(
  animations: THREE.AnimationClip[],
  stateName: string
): THREE.AnimationClip | null {
  if (animations.length === 0) return null;

  const possibleNames = ANIMATION_NAME_MAPPINGS[stateName] || [stateName];

  // Try to find exact or partial match
  for (const name of possibleNames) {
    // Exact match
    const exact = animations.find((clip) => clip.name === name);
    if (exact) return exact;

    // Partial match (contains)
    const partial = animations.find(
      (clip) => clip.name.toLowerCase().includes(name.toLowerCase())
    );
    if (partial) return partial;
  }

  // Fallback: return first animation as default
  return animations[0];
}

// ============================================================================
// Entity Model Component - renders a single GLB model for an entity
// Supports interpolation for smooth rendering between physics steps
// Handles animation state changes with crossfade transitions
// ============================================================================
interface EntityModelProps {
  entity: Entity;
  modelUrl: string;
  scale: number;
  interpolationStateRef?: React.RefObject<InterpolationState>;
  entityKey?: string;
}

function EntityModel({
  entity,
  modelUrl,
  scale,
  interpolationStateRef,
  entityKey,
}: EntityModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(modelUrl);

  // Clone the scene for this instance
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  // Animation state tracking
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionsRef = useRef<Map<string, THREE.AnimationAction>>(new Map());
  const currentAnimationRef = useRef<string>('idle');

  // Initialize animation mixer and prepare all animation actions
  useEffect(() => {
    if (animations.length === 0) {
      mixerRef.current = null;
      return;
    }

    const mixer = new THREE.AnimationMixer(clonedScene);
    mixerRef.current = mixer;

    // Create actions for all available animations
    actionsRef.current.clear();
    for (const clip of animations) {
      const action = mixer.clipAction(clip);
      actionsRef.current.set(clip.name, action);
    }

    // Start with idle or first animation
    const initialClip = findAnimationClip(animations, 'idle') || animations[0];
    if (initialClip) {
      const initialAction = mixer.clipAction(initialClip);
      initialAction.play();
      currentAnimationRef.current = 'idle';
    }

    return () => {
      mixer.stopAllAction();
      actionsRef.current.clear();
    };
  }, [clonedScene, animations]);

  // Update animation mixer and handle animation state changes
  useFrame((_, delta) => {
    const mixer = mixerRef.current;
    if (!mixer) return;

    // Update mixer
    mixer.update(delta);

    // Check if entity animation state changed
    if (entity.animation && entity.animation.current !== currentAnimationRef.current) {
      const targetState = entity.animation.current;
      const fadeDuration = entity.animation.fadeDuration ?? 0.15;

      // Find the target animation clip
      const targetClip = findAnimationClip(animations, targetState);
      if (!targetClip) return;

      // Get or create the target action
      let targetAction = actionsRef.current.get(targetClip.name);
      if (!targetAction) {
        targetAction = mixer.clipAction(targetClip);
        actionsRef.current.set(targetClip.name, targetAction);
      }

      // Find current playing action
      const currentClip = findAnimationClip(animations, currentAnimationRef.current);
      const currentAction = currentClip ? actionsRef.current.get(currentClip.name) : null;

      // Configure target action based on animation type
      const isOneShot = entity.animation.isOneShot ?? false;
      if (isOneShot) {
        // One-shot animations: play once then stop
        targetAction.setLoop(THREE.LoopOnce, 1);
        targetAction.clampWhenFinished = true;
      } else {
        // Looping animations
        targetAction.setLoop(THREE.LoopRepeat, Infinity);
        targetAction.clampWhenFinished = false;
      }

      // Crossfade from current to target
      if (currentAction && currentAction !== targetAction) {
        // Reset target action to start
        targetAction.reset();
        targetAction.setEffectiveTimeScale(1);
        targetAction.setEffectiveWeight(1);

        // Crossfade
        targetAction.crossFadeFrom(currentAction, fadeDuration, true);
        targetAction.play();
      } else {
        // No current action, just play
        targetAction.reset();
        targetAction.play();
      }

      currentAnimationRef.current = targetState;
    }
  });

  // Update position each frame with interpolation for smooth rendering
  // Game coords: X=lanes, Y=forward/back (river flow), Z=height
  // Three.js coords: X=lateral, Y=height, Z=depth
  // Transform: Game (x, y, z) -> Three.js (x, z, y)
  useFrame(() => {
    if (groupRef.current && entity.position) {
      let x = entity.position.x;
      let y = entity.position.y;
      let z = entity.position.z;

      // Apply interpolation if available for smooth rendering between physics steps
      if (interpolationStateRef?.current && entityKey) {
        const prevPos = interpolationStateRef.current.previousPositions.get(entityKey);
        const alpha = interpolationStateRef.current.alpha;

        if (prevPos && alpha > 0 && alpha < 1) {
          // Interpolate between previous and current position
          x = lerpNumber(prevPos.x, entity.position.x, alpha);
          y = lerpNumber(prevPos.y, entity.position.y, alpha);
          z = lerpNumber(prevPos.z, entity.position.z, alpha);
        }
      }

      groupRef.current.position.set(
        x, // X stays X (lanes/lateral)
        z, // Game Z -> Three.js Y (height)
        y // Game Y -> Three.js Z (depth/forward)
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
// Entity Renderer Component - renders all ECS entities with interpolation
// ============================================================================
interface EntityRendererProps {
  interpolationStateRef: React.RefObject<InterpolationState>;
}

function EntityRenderer({ interpolationStateRef }: EntityRendererProps) {
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
        const entityKey = entity.player ? 'player' : undefined;
        return (
          <Suspense key={entity.player ? 'player' : `entity-${Math.random()}`} fallback={null}>
            <EntityModel
              entity={entity}
              modelUrl={modelUrl}
              scale={scale}
              interpolationStateRef={interpolationStateRef}
              entityKey={entityKey}
            />
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
            <EntityModel
              entity={entity}
              modelUrl={modelUrl}
              scale={scale}
              interpolationStateRef={interpolationStateRef}
              entityKey={`obstacle-${idx}`}
            />
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
            <EntityModel
              entity={entity}
              modelUrl={modelUrl}
              scale={scale}
              interpolationStateRef={interpolationStateRef}
              entityKey={`collectible-${idx}`}
            />
          </Suspense>
        );
      })}
    </>
  );
}

// ============================================================================
// Helper: Lerp between two hex colors
// ============================================================================
function lerpColor(color1: string, color2: string, t: number): string {
  // Parse hex colors
  const c1 = parseInt(color1.replace('#', ''), 16);
  const c2 = parseInt(color2.replace('#', ''), 16);

  const r1 = (c1 >> 16) & 0xff;
  const g1 = (c1 >> 8) & 0xff;
  const b1 = c1 & 0xff;

  const r2 = (c2 >> 16) & 0xff;
  const g2 = (c2 >> 8) & 0xff;
  const b2 = c2 & 0xff;

  // Linear interpolation
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);

  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

// ============================================================================
// Helper: Get the next biome in progression
// ============================================================================
function getNextBiome(biome: BiomeType): BiomeType | null {
  const biomeOrder: BiomeType[] = ['forest', 'mountain', 'canyon', 'rapids'];
  const currentIndex = biomeOrder.indexOf(biome);
  if (currentIndex < biomeOrder.length - 1) {
    return biomeOrder[currentIndex + 1];
  }
  return null;
}

// ============================================================================
// River Environment Component - creates the water/river visual
// ============================================================================
interface RiverEnvironmentProps {
  biome?: BiomeType;
  biomeProgress?: number; // 0-1 progress through transition to next biome
}

function RiverEnvironment({ biome = 'forest', biomeProgress = 0 }: RiverEnvironmentProps) {
  // Get colors for current biome and interpolate if transitioning
  const currentColors = BIOME_COLORS[biome];
  const nextBiome = getNextBiome(biome);
  const nextColors = nextBiome ? BIOME_COLORS[nextBiome] : currentColors;

  // Interpolate colors during transition
  const colors = useMemo(() => {
    if (biomeProgress <= 0 || !nextBiome) {
      return currentColors;
    }
    return {
      water: lerpColor(currentColors.water, nextColors.water, biomeProgress),
      terrain: lerpColor(currentColors.terrain, nextColors.terrain, biomeProgress),
      fog: lerpColor(currentColors.fog, nextColors.fog, biomeProgress),
      sky: lerpColor(currentColors.sky, nextColors.sky, biomeProgress),
    };
  }, [biome, biomeProgress, currentColors, nextColors, nextBiome]);
  const waterRef = useRef<THREE.Mesh>(null);

  // River dimensions
  const riverWidth = 8;
  const riverLength = 50;
  const bankWidth = 6;

  // Compute foam color from water color (lighter version)
  const foamColor = useMemo(() => {
    const color = new THREE.Color(colors.water);
    color.lerp(new THREE.Color('#ffffff'), 0.7);
    return `#${color.getHexString()}`;
  }, [colors.water]);

  // Tree positions along banks
  const treePositions = useMemo(
    () => [
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
    ],
    []
  );

  // Mountain positions
  const mountainPositions = useMemo(
    () => [
      { x: -15, y: 40, height: 12, width: 16 },
      { x: -8, y: 45, height: 8, width: 12 },
      { x: 0, y: 50, height: 15, width: 20 },
      { x: 10, y: 42, height: 10, width: 14 },
      { x: 18, y: 48, height: 13, width: 18 },
    ],
    []
  );

  return (
    <group>
      {/* River/Water Surface - Animated shader with waves and flow */}
      <mesh
        ref={waterRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.1, riverLength / 2 - 10]}
      >
        <planeGeometry args={[riverWidth, riverLength, 64, 64]} />
        <AnimatedWaterMaterial
          waterColor={colors.water}
          foamColor={foamColor}
          waveHeight={0.06}
          waveFrequency={0.4}
          waveSpeed={1.2}
          flowSpeed={0.12}
          fresnelPower={2.0}
          opacity={0.88}
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
      <PerspectiveCamera makeDefault position={[0, 4, -10]} fov={50} near={0.1} far={1000} />

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
    const handleInteraction = async () => {
      if (!initialized.current) {
        // Initialize Tone.js audio context (must happen on user interaction)
        await ensureAudioContext();
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
// Hook: Detect reduced motion preference
// ============================================================================
function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return reducedMotion;
}

// ============================================================================
// Main App Component
// ============================================================================
export function App() {
  const status = useGameStore((state) => state.status);
  const currentBiome = useGameStore((state) => state.currentBiome);
  const biomeProgress = useGameStore((state) => state.biomeProgress);
  const accessibilityReducedMotion = useGameStore(
    (state) => state.accessibility?.reducedMotion ?? false
  );
  const spawnerStateRef = useRef(createSpawnerState());
  const inputStateRef = useRef(createInputState());
  const interpolationStateRef = useRef(createInterpolationState());
  const containerRef = useRef<HTMLDivElement>(null);

  // Accessibility: detect reduced motion preference (system OR user setting)
  const systemReducedMotion = useReducedMotion();
  const reducedMotion = systemReducedMotion || accessibilityReducedMotion;

  // Floating text state for near-miss indicators
  const [floatingTexts, setFloatingTexts] = useState<FloatingTextItem[]>([]);
  const floatingTextIdRef = useRef(0);

  // Near-miss callback ref - passed to GameLoop to trigger floating text
  const onNearMissRef = useRef<NearMissCallback | null>(null);

  // Collection callback ref - triggers burst effect
  const onCollectionRef = useRef<CollectionCallback | null>(null);

  // Damage callback ref - triggers impact flash
  const onDamageRef = useRef<DamageCallback | null>(null);

  // Effect refs for imperative control
  const collectionBurstRef = useRef<CollectionBurstRef>(null);
  const impactFlashRef = useRef<ImpactFlashRef>(null);

  // Get distance for speed effects
  const distance = useGameStore((state) => state.distance);

  // Calculate speed multiplier based on distance (same logic as game-store)
  const speedMultiplier = useMemo(() => {
    const intervals = Math.floor(distance / 500); // DIFFICULTY.speedIncreaseDistanceInterval
    const multiplier = 1 + intervals * 0.1; // DIFFICULTY.speedIncreasePerInterval
    return Math.min(multiplier, 2.0); // DIFFICULTY.maxSpeedMultiplier
  }, [distance]);

  // Set up collection callback
  useEffect(() => {
    onCollectionRef.current = (position, type) => {
      if (collectionBurstRef.current) {
        collectionBurstRef.current.burst(position.x, position.y, position.z, type);
      }
    };

    return () => {
      onCollectionRef.current = null;
    };
  }, []);

  // Set up damage callback
  useEffect(() => {
    onDamageRef.current = () => {
      if (impactFlashRef.current) {
        impactFlashRef.current.flash();
      }
    };

    return () => {
      onDamageRef.current = null;
    };
  }, []);

  // Set up near-miss callback
  useEffect(() => {
    onNearMissRef.current = (position, bonus) => {
      // Convert 3D world position to approximate screen percentage
      // The player is typically at Y position around 0-5, and X between -2 and 2
      // Map X from [-3, 3] to [20%, 80%] of screen
      // Map Y from [-5, 20] to [80%, 20%] of screen (inverted because screen Y is top-down)
      const screenX = Math.max(20, Math.min(80, 50 + (position.x / 3) * 30));
      const screenY = Math.max(20, Math.min(80, 60 - (position.y / 15) * 30));

      const newFloatingText: FloatingTextItem = {
        id: `nearmiss-${floatingTextIdRef.current++}`,
        text: `CLOSE! +${bonus}`,
        x: screenX,
        y: screenY,
        color: '#ffeb3b', // Yellow for near-miss
      };

      setFloatingTexts((prev) => [...prev, newFloatingText]);
    };

    return () => {
      onNearMissRef.current = null;
    };
  }, []);

  // Remove completed floating text
  const handleFloatingTextComplete = useCallback((id: string) => {
    setFloatingTexts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Setup keyboard input on mount
  useEffect(() => {
    const cleanup = setupKeyboardInput(inputStateRef.current);
    return () => {
      cleanup();
    };
  }, []);

  // Setup touch/swipe input on mount
  useEffect(() => {
    if (!containerRef.current) return;
    const cleanup = setupTouchInput(inputStateRef.current, containerRef.current);
    return () => {
      cleanup();
    };
  }, []);

  // Handle ESC key for pause/resume during gameplay
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      const currentStatus = useGameStore.getState().status;
      if (currentStatus === 'playing') {
        useGameStore.getState().pauseGame();
      } else if (currentStatus === 'paused') {
        useGameStore.getState().resumeGame();
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

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
    <AccessibilityProvider>
      <div
        ref={containerRef}
        style={{
          width: '100vw',
          height: '100vh',
          position: 'relative',
          overflow: 'hidden',
          touchAction: 'none', // Prevent browser gestures (pull-to-refresh, etc.)
        }}
      >
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

          {/* Fixed timestep game loop (runs ECS systems with deterministic physics) */}
          <FixedTimestepGameLoop
            spawnerStateRef={spawnerStateRef}
            inputStateRef={inputStateRef}
            onNearMissRef={onNearMissRef}
            onCollectionRef={onCollectionRef}
            onDamageRef={onDamageRef}
            interpolationStateRef={interpolationStateRef}
          />

          {/* 3D Environment - dynamic biome based on distance */}
          <RiverEnvironment biome={currentBiome} biomeProgress={biomeProgress} />

          {/* Weather effects - biome-specific particles (rain/snow/dust/spray) */}
          <BiomeWeather
            biome={currentBiome}
            biomeProgress={biomeProgress}
            reducedMotion={reducedMotion}
            particleQuality="medium"
          />

          {/* Entity renderer for player, obstacles, collectibles with interpolation */}
          <EntityRenderer interpolationStateRef={interpolationStateRef} />

          {/* Visual Effects - player trail and speed lines */}
          <PlayerTrail
            isPlaying={status === 'playing'}
            reducedMotion={reducedMotion}
          />
          <SpeedLines
            speedMultiplier={speedMultiplier}
            threshold={1.5}
            isPlaying={status === 'playing'}
            reducedMotion={reducedMotion}
          />
          <CollectionBurst
            ref={collectionBurstRef}
            reducedMotion={reducedMotion}
          />

          {/* Post-processing effects */}
          <EffectComposer>
            <Bloom intensity={0.5} luminanceThreshold={0.9} luminanceSmoothing={0.9} />
          </EffectComposer>
        </Suspense>
      </Canvas>

      {/* Audio initializer */}
      <AudioInitializer />

      {/* UI Overlay - rendered outside Canvas */}
      {(status === 'playing' || status === 'paused') && <HUD />}
      {status === 'paused' && <PauseMenu />}
      {status === 'menu' && <Menu type="menu" />}
      {status === 'character_select' && <CharacterSelect />}
      {status === 'game_over' && <Menu type="game_over" />}

      {/* Achievement notifications - always visible */}
      <AchievementNotification />

      {/* Milestone notifications - shown during gameplay */}
      <MilestoneNotification />

        {/* Floating text for near-miss indicators */}
        {floatingTexts.length > 0 && (
          <FloatingText items={floatingTexts} onComplete={handleFloatingTextComplete} />
        )}

        {/* Impact flash overlay - outside Canvas for 2D effect */}
        <ImpactFlash
          ref={impactFlashRef}
          reducedMotion={reducedMotion}
        />
      </div>
    </AccessibilityProvider>
  );
}
