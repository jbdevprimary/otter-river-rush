/**
 * River Environment Component
 * Creates the water/river visual with animated flow and parallax backgrounds
 * Optimized for ENDLESS RUNNER perspective (camera behind player, looking forward)
 *
 * Game Coordinate System:
 * - X: left/right (lanes at -2, 0, 2)
 * - Y: forward/back (river direction - player at -3, obstacles spawn at 8)
 * - Z: up/down (height - ground at 0)
 *
 * Three.js Coordinate System (Y-up):
 * - X: left/right (same as game)
 * - Y: up/down (height)
 * - Z: forward/back (depth)
 *
 * Transform: Game (x, y, z) -> Three.js (x, z, y)
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { BIOME_COLORS, VISUAL } from '@otter-river-rush/config';
import * as THREE from 'three';

interface RiverEnvironmentProps {
  biome?: keyof typeof BIOME_COLORS;
}

export function RiverEnvironment({ biome = 'forest' }: RiverEnvironmentProps) {
  const waterRef = useRef<THREE.Mesh>(null);
  const waterMaterialRef = useRef<THREE.MeshStandardMaterial>(null);

  const colors = BIOME_COLORS[biome];

  // River dimensions
  const riverWidth = 8;
  const riverLength = 50;
  const bankWidth = 6;

  // Tree positions (memoized for performance)
  const treePositions = useMemo(
    () => [
      // Left side trees (various Y positions along the river)
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

  // Mountain positions (memoized)
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

  // Animate water flow
  useFrame(() => {
    if (waterMaterialRef.current?.normalMap) {
      // Flow water texture toward player (negative Z in Three.js)
      waterMaterialRef.current.normalMap.offset.y -= 0.005;
    }
  });

  return (
    <>
      {/* Lighting */}
      <ambientLight color={VISUAL.lighting.ambient.color} intensity={VISUAL.lighting.ambient.intensity} />
      <directionalLight
        position={VISUAL.lighting.directional.main.position}
        intensity={VISUAL.lighting.directional.main.intensity}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight
        position={VISUAL.lighting.directional.fill.position}
        intensity={VISUAL.lighting.directional.fill.intensity}
      />

      {/* River/Water Surface */}
      {/* Game (0, riverLength/2-10, -0.1) -> Three.js (0, -0.1, riverLength/2-10) */}
      <mesh
        ref={waterRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.1, riverLength / 2 - 10]}
        receiveShadow
      >
        <planeGeometry args={[riverWidth, riverLength, 32, 32]} />
        <meshStandardMaterial
          ref={waterMaterialRef}
          color={colors.water}
          roughness={0.1}
          metalness={0.9}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Left Riverbank */}
      {/* Game (-riverWidth/2-bankWidth/2, riverLength/2-10, 0) -> Three.js (x, 0, z) */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[-(riverWidth / 2 + bankWidth / 2), 0, riverLength / 2 - 10]}
        receiveShadow
      >
        <planeGeometry args={[bankWidth, riverLength]} />
        <meshStandardMaterial color={colors.terrain} roughness={1} metalness={0} />
      </mesh>

      {/* Right Riverbank */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[riverWidth / 2 + bankWidth / 2, 0, riverLength / 2 - 10]}
        receiveShadow
      >
        <planeGeometry args={[bankWidth, riverLength]} />
        <meshStandardMaterial color={colors.terrain} roughness={1} metalness={0} />
      </mesh>

      {/* Trees along banks */}
      {treePositions.map((pos, i) => (
        <Tree key={`tree-${i}`} position={pos} terrainColor={colors.terrain} />
      ))}

      {/* Distant Mountains */}
      {mountainPositions.map((m, i) => (
        <mesh
          key={`mountain-${i}`}
          position={[m.x, m.height / 2 - 2, m.y]}
        >
          <coneGeometry args={[m.width / 2, m.height, 8]} />
          <meshStandardMaterial color="#475569" roughness={1} metalness={0} />
        </mesh>
      ))}

      {/* Sky Backdrop */}
      {/* Game (0, 55, 10) -> Three.js (0, 10, 55) */}
      <mesh position={[0, 10, 55]} rotation={[Math.PI / 6, 0, 0]}>
        <planeGeometry args={[80, 40]} />
        <meshBasicMaterial
          color={colors.sky}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Lane Markers (subtle guide lines on water) */}
      {VISUAL.lanes.positions.map((laneX, i) => (
        <mesh
          key={`lane-${i}`}
          position={[laneX, 0.01, riverLength / 2 - 10]}
        >
          <boxGeometry args={[0.08, 0.02, riverLength]} />
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.2}
            emissive="#6680a0"
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
    </>
  );
}

/**
 * Tree Component
 * Creates a simple tree with trunk and foliage cone
 */
interface TreeProps {
  position: { x: number; y: number; scale: number };
  terrainColor: string;
}

function Tree({ position, terrainColor }: TreeProps) {
  const { x, y, scale } = position;

  return (
    <group>
      {/* Trunk - Game (x, y, 1*scale) -> Three.js (x, 1*scale, y) */}
      <mesh position={[x, 1 * scale, y]} castShadow>
        <cylinderGeometry args={[0.2 * scale, 0.2 * scale, 2 * scale, 8]} />
        <meshStandardMaterial color="#5c3a21" roughness={1} metalness={0} />
      </mesh>

      {/* Foliage - Game (x, y, 3.5*scale) -> Three.js (x, 3.5*scale, y) */}
      <mesh position={[x, 3.5 * scale, y]} castShadow>
        <coneGeometry args={[1 * scale, 3 * scale, 8]} />
        <meshStandardMaterial color={terrainColor} roughness={1} metalness={0} />
      </mesh>
    </group>
  );
}
