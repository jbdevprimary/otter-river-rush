/**
 * GameCanvas - React Three Fiber Canvas for mobile rendering
 *
 * Renders the 3D game scene using React Three Fiber with expo-gl.
 * Syncs with the shared ECS world from @otter-river-rush/game-core.
 * Includes realistic otter physics with smooth rotation and bobbing.
 */

import { Canvas, useFrame } from '@react-three/fiber/native';
import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import type { Group, Mesh } from 'three';
import { queries } from '../../game/ecs';
import { getOtterRotation, updateOtterPhysics } from '../../game/ecs/systems';
import { useGameStore } from '../../game/store';
import type { Entity } from '../../game/types';

/**
 * Custom hook for generating stable React keys for ECS entities
 * Uses WeakMap to allow entities to be garbage collected when removed from ECS
 * @param prefix - Prefix for the generated keys (e.g., 'obstacle', 'collectible')
 * @returns Function to get a stable key for an entity
 */
function useEntityKeys(prefix: string): (entity: Entity) => string {
  const keyMap = useRef(new WeakMap<Entity, string>());
  const keyCounter = useRef(0);

  const getKey = (entity: Entity): string => {
    const existing = keyMap.current.get(entity);
    if (existing) return existing;
    const nextKey = `${prefix}-${keyCounter.current++}`;
    keyMap.current.set(entity, nextKey);
    return nextKey;
  };

  return getKey;
}

/**
 * Water plane that scrolls to simulate river flow
 */
function Water() {
  const meshRef = useRef<Mesh>(null);
  const status = useGameStore((state) => state.status);

  useFrame((_, delta) => {
    if (meshRef.current && status === 'playing') {
      // Scroll water texture to simulate flow
      meshRef.current.position.z += delta * 5;
      if (meshRef.current.position.z > 10) {
        meshRef.current.position.z = 0;
      }
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
      <planeGeometry args={[20, 100]} />
      <meshStandardMaterial color="#2196F3" transparent opacity={0.8} />
    </mesh>
  );
}

/**
 * Player otter entity renderer with realistic physics
 * - Applies smooth rotation from otter physics system
 * - Shows tilt during lane changes
 * - Shows bobbing animation for water floating effect
 * - Shows idle animations when stationary
 */
function PlayerOtter() {
  const groupRef = useRef<Group>(null);
  const bodyRef = useRef<Group>(null);
  const status = useGameStore((state) => state.status);

  useFrame((_, delta) => {
    // Find player entity from ECS
    const playerEntities = queries.player.entities;
    if (playerEntities.length === 0 || !groupRef.current) return;

    const playerEntity = playerEntities[0];
    if (!playerEntity.position) return;

    // Update otter physics (handles momentum, bobbing, rotation calculations)
    if (status === 'playing') {
      updateOtterPhysics(delta);
    }

    // Apply position from ECS (including bobbing offset from physics)
    groupRef.current.position.x = playerEntity.position.x;
    groupRef.current.position.y = playerEntity.position.z; // Z in ECS maps to Y in Three.js (vertical)
    groupRef.current.position.z = playerEntity.position.y; // Y in ECS maps to Z in Three.js (depth)

    // Apply rotation from otter physics
    if (playerEntity.rotation && bodyRef.current) {
      const rot = getOtterRotation(playerEntity);

      // Apply rotations to the body group
      // X rotation = pitch (forward/backward tilt)
      // Y rotation = yaw (turn left/right)
      // Z rotation = roll (lean left/right)
      bodyRef.current.rotation.x = rot.x;
      bodyRef.current.rotation.y = rot.y;
      bodyRef.current.rotation.z = rot.z;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Body group for applying rotations separately from position */}
      <group ref={bodyRef}>
        {/* Main body - capsule shape */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <capsuleGeometry args={[0.3, 0.8, 8, 16]} />
          <meshStandardMaterial color="#8B4513" roughness={0.6} metalness={0.1} />
        </mesh>

        {/* Otter head */}
        <mesh position={[0, 0, 0.6]}>
          <sphereGeometry args={[0.28, 16, 16]} />
          <meshStandardMaterial color="#9B5523" roughness={0.5} metalness={0.1} />
        </mesh>

        {/* Snout */}
        <mesh position={[0, -0.1, 0.8]}>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshStandardMaterial color="#C4A484" roughness={0.4} metalness={0.05} />
        </mesh>

        {/* Nose */}
        <mesh position={[0, -0.05, 0.9]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.2} />
        </mesh>

        {/* Eyes */}
        <mesh position={[0.12, 0.08, 0.75]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#000000" roughness={0.2} metalness={0.3} />
        </mesh>
        <mesh position={[-0.12, 0.08, 0.75]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#000000" roughness={0.2} metalness={0.3} />
        </mesh>

        {/* Eye highlights */}
        <mesh position={[0.14, 0.1, 0.78]}>
          <sphereGeometry args={[0.02, 6, 6]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[-0.1, 0.1, 0.78]}>
          <sphereGeometry args={[0.02, 6, 6]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
        </mesh>

        {/* Ears */}
        <mesh position={[0.18, 0.2, 0.45]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#8B4513" roughness={0.6} metalness={0.1} />
        </mesh>
        <mesh position={[-0.18, 0.2, 0.45]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#8B4513" roughness={0.6} metalness={0.1} />
        </mesh>

        {/* Tail */}
        <mesh position={[0, 0, -0.7]} rotation={[0.3, 0, 0]}>
          <capsuleGeometry args={[0.08, 0.5, 6, 12]} />
          <meshStandardMaterial color="#7B3F13" roughness={0.6} metalness={0.1} />
        </mesh>

        {/* Front paws (visible when floating) */}
        <mesh position={[0.25, -0.15, 0.1]} rotation={[0.5, 0.3, 0]}>
          <capsuleGeometry args={[0.06, 0.15, 4, 8]} />
          <meshStandardMaterial color="#8B4513" roughness={0.6} metalness={0.1} />
        </mesh>
        <mesh position={[-0.25, -0.15, 0.1]} rotation={[0.5, -0.3, 0]}>
          <capsuleGeometry args={[0.06, 0.15, 4, 8]} />
          <meshStandardMaterial color="#8B4513" roughness={0.6} metalness={0.1} />
        </mesh>

        {/* Back paws / flippers */}
        <mesh position={[0.2, -0.1, -0.5]} rotation={[0.8, 0.2, 0]}>
          <boxGeometry args={[0.12, 0.02, 0.2]} />
          <meshStandardMaterial color="#7B3F13" roughness={0.5} metalness={0.1} />
        </mesh>
        <mesh position={[-0.2, -0.1, -0.5]} rotation={[0.8, -0.2, 0]}>
          <boxGeometry args={[0.12, 0.02, 0.2]} />
          <meshStandardMaterial color="#7B3F13" roughness={0.5} metalness={0.1} />
        </mesh>

        {/* Belly (lighter colored underside) */}
        <mesh position={[0, -0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <capsuleGeometry args={[0.22, 0.6, 8, 16]} />
          <meshStandardMaterial color="#C4A484" roughness={0.5} metalness={0.05} />
        </mesh>

        {/* Whiskers (using thin cylinders) */}
        <mesh position={[0.15, -0.08, 0.82]} rotation={[0, 0, 0.3]}>
          <cylinderGeometry args={[0.003, 0.003, 0.15, 4]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.15, -0.12, 0.82]} rotation={[0, 0, 0.1]}>
          <cylinderGeometry args={[0.003, 0.003, 0.15, 4]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[-0.15, -0.08, 0.82]} rotation={[0, 0, -0.3]}>
          <cylinderGeometry args={[0.003, 0.003, 0.15, 4]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[-0.15, -0.12, 0.82]} rotation={[0, 0, -0.1]}>
          <cylinderGeometry args={[0.003, 0.003, 0.15, 4]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Renders obstacles from ECS
 */
function Obstacles() {
  const groupRef = useRef<Group>(null);
  const getKey = useEntityKeys('obstacle');

  // Simple obstacle representation
  return (
    <group ref={groupRef}>
      {queries.obstacles.entities.map((obstacle) =>
        obstacle.position ? (
          <mesh
            key={getKey(obstacle)}
            position={[obstacle.position.x, obstacle.position.z, obstacle.position.y]}
          >
            <boxGeometry args={[0.8, 0.8, 0.8]} />
            <meshStandardMaterial color="#666666" />
          </mesh>
        ) : null
      )}
    </group>
  );
}

/**
 * Renders collectibles from ECS
 */
function Collectibles() {
  const getKey = useEntityKeys('collectible');

  return (
    <group>
      {queries.collectibles.entities.map((collectible) =>
        collectible.position ? (
          <mesh
            key={getKey(collectible)}
            position={[
              collectible.position.x,
              collectible.position.z + 0.3,
              collectible.position.y,
            ]}
          >
            <cylinderGeometry args={[0.2, 0.2, 0.05, 32]} />
            <meshStandardMaterial
              color={collectible.collectible?.type === 'gem' ? '#9C27B0' : '#FFD700'}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
        ) : null
      )}
    </group>
  );
}

/**
 * Scene lighting
 */
function Lighting() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 20, 10]} intensity={1} castShadow />
      <pointLight position={[0, 10, 0]} intensity={0.5} />
    </>
  );
}

/**
 * Main game scene
 */
function GameScene() {
  return (
    <>
      <Lighting />
      <Water />
      <PlayerOtter />
      <Obstacles />
      <Collectibles />
    </>
  );
}

/**
 * GameCanvas component - wraps the R3F Canvas for mobile
 */
export function GameCanvas() {
  return (
    <View style={styles.container}>
      <Canvas
        camera={{
          position: [0, 10, 8],
          fov: 60,
          near: 0.1,
          far: 1000,
        }}
        gl={{
          antialias: true,
        }}
      >
        <color attach="background" args={['#1e3a5f']} />
        <GameScene />
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
