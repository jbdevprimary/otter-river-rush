/**
 * GameCanvas - React Three Fiber Canvas for mobile rendering
 *
 * Renders the 3D game scene using React Three Fiber with expo-gl.
 * Syncs with the shared ECS world from @otter-river-rush/game-core.
 */

import { queries, world } from '@otter-river-rush/game-core/ecs';
import { useGameStore } from '@otter-river-rush/game-core/store';
import { Canvas, useFrame } from '@react-three/fiber/native';
import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import type { Group, Mesh } from 'three';

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
 * Player otter entity renderer
 */
function PlayerOtter() {
  const groupRef = useRef<Group>(null);

  useFrame(() => {
    // Find player entity from ECS
    const players = queries.players.entities;
    if (players.length > 0 && groupRef.current) {
      const player = players[0];
      if (player.position) {
        groupRef.current.position.x = player.position.x;
        groupRef.current.position.y = player.position.z;
        groupRef.current.position.z = player.position.y;
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* Simple otter placeholder - replace with GLB model later */}
      <mesh>
        <capsuleGeometry args={[0.3, 0.8, 8, 16]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Otter head */}
      <mesh position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Eyes */}
      <mesh position={[0.1, 0.7, 0.2]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[-0.1, 0.7, 0.2]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
    </group>
  );
}

/**
 * Renders obstacles from ECS
 */
function Obstacles() {
  const groupRef = useRef<Group>(null);
  const meshRefs = useRef<Map<string, Mesh>>(new Map());

  useFrame(() => {
    const obstacles = queries.obstacles.entities;

    obstacles.forEach((obstacle) => {
      if (!obstacle.id || !obstacle.position) return;

      let mesh = meshRefs.current.get(obstacle.id);
      if (!mesh && groupRef.current) {
        // Create new mesh for this obstacle
        // In a real implementation, this would be handled differently
      }

      if (mesh) {
        mesh.position.set(
          obstacle.position.x,
          obstacle.position.z,
          obstacle.position.y
        );
      }
    });
  });

  // Simple obstacle representation
  return (
    <group ref={groupRef}>
      {queries.obstacles.entities.map((obstacle) =>
        obstacle.position ? (
          <mesh
            key={obstacle.id}
            position={[
              obstacle.position.x,
              obstacle.position.z,
              obstacle.position.y,
            ]}
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
  return (
    <group>
      {queries.collectibles.entities.map((collectible) =>
        collectible.position ? (
          <mesh
            key={collectible.id}
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
