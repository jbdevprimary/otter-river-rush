/**
 * Dynamic River Environment Component
 * Creates the water/river visual with animated flow and dynamic width
 * Responds to river width changes from the river width store
 *
 * Game Coordinate System:
 * - X: left/right (lanes at dynamic positions)
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

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { BIOME_COLORS, VISUAL } from '../../../../game/config';
import type { BiomeType } from '../../../../game/types';
import * as THREE from 'three';
import { AnimatedWaterMaterial } from '../shaders';

interface DynamicRiverEnvironmentProps {
  biome?: BiomeType;
  /** Current river width from store */
  riverWidth: number;
  /** Current lane positions from store */
  lanePositions: [number, number, number];
  /** Whether the river is currently in a narrow section */
  isNarrow?: boolean;
}

export function DynamicRiverEnvironment({
  biome = 'forest',
  riverWidth,
  lanePositions,
  isNarrow = false,
}: DynamicRiverEnvironmentProps) {
  const waterRef = useRef<THREE.Mesh>(null);
  const leftBankRef = useRef<THREE.Mesh>(null);
  const rightBankRef = useRef<THREE.Mesh>(null);

  const colors = BIOME_COLORS[biome];
  const riverLength = 50;
  const bankWidth = 6;

  // Animate river width transitions smoothly via geometry update
  const [displayWidth, setDisplayWidth] = useState(riverWidth);

  // Smooth width transition using animation frame
  useFrame((_, delta) => {
    if (Math.abs(displayWidth - riverWidth) > 0.01) {
      const lerpFactor = Math.min(1, delta * 3); // Smooth transition
      setDisplayWidth(displayWidth + (riverWidth - displayWidth) * lerpFactor);
    } else if (displayWidth !== riverWidth) {
      setDisplayWidth(riverWidth);
    }
  });

  // Compute foam color from water color (lighter version for fresnel edges)
  const foamColor = useMemo(() => {
    const color = new THREE.Color(colors.water);
    color.lerp(new THREE.Color('#ffffff'), 0.7);
    return `#${color.getHexString()}`;
  }, [colors.water]);

  // Tree positions - positioned relative to river width
  const treePositions = useMemo(() => {
    const halfWidth = displayWidth / 2;
    const baseOffset = 2; // Distance from river edge

    return [
      // Left side trees (various Y positions along the river)
      { x: -(halfWidth + baseOffset), y: -5, scale: 1.2 },
      { x: -(halfWidth + baseOffset + 1), y: 0, scale: 1.0 },
      { x: -(halfWidth + baseOffset - 0.5), y: 5, scale: 1.4 },
      { x: -(halfWidth + baseOffset + 0.5), y: 10, scale: 0.9 },
      { x: -(halfWidth + baseOffset + 1), y: 15, scale: 1.1 },
      { x: -(halfWidth + baseOffset - 0.5), y: 20, scale: 1.3 },
      { x: -(halfWidth + baseOffset), y: 25, scale: 1.0 },
      { x: -(halfWidth + baseOffset + 1), y: 30, scale: 1.2 },
      // Right side trees
      { x: halfWidth + baseOffset, y: -3, scale: 1.1 },
      { x: halfWidth + baseOffset + 1, y: 2, scale: 0.9 },
      { x: halfWidth + baseOffset - 0.5, y: 7, scale: 1.3 },
      { x: halfWidth + baseOffset + 0.5, y: 12, scale: 1.0 },
      { x: halfWidth + baseOffset + 1, y: 17, scale: 1.2 },
      { x: halfWidth + baseOffset - 0.5, y: 22, scale: 1.1 },
      { x: halfWidth + baseOffset, y: 27, scale: 1.4 },
      { x: halfWidth + baseOffset + 1, y: 32, scale: 0.9 },
    ];
  }, [displayWidth]);

  // Riverbank rock positions - appear when narrow
  const narrowIndicators = useMemo(() => {
    if (!isNarrow) return [];

    const halfWidth = displayWidth / 2;
    const indicators = [];

    // Add rocks along the narrowed sections
    for (let y = 0; y < riverLength; y += 8) {
      indicators.push(
        { x: -(halfWidth - 0.3), y: y - 5, scale: 0.4 + Math.random() * 0.3 },
        { x: halfWidth - 0.3, y: y - 3, scale: 0.4 + Math.random() * 0.3 }
      );
    }

    return indicators;
  }, [isNarrow, displayWidth, riverLength]);

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

  // Update bank positions when river width changes
  useEffect(() => {
    if (leftBankRef.current) {
      leftBankRef.current.position.x = -(displayWidth / 2 + bankWidth / 2);
    }
    if (rightBankRef.current) {
      rightBankRef.current.position.x = displayWidth / 2 + bankWidth / 2;
    }
  }, [displayWidth, bankWidth]);

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

      {/* River/Water Surface - Animated shader with waves and flow */}
      {/* Game (0, riverLength/2-10, -0.1) -> Three.js (0, -0.1, riverLength/2-10) */}
      <mesh
        ref={waterRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.1, riverLength / 2 - 10]}
        receiveShadow
      >
        <planeGeometry args={[displayWidth, riverLength, 64, 64]} />
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
        ref={leftBankRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[-(displayWidth / 2 + bankWidth / 2), 0, riverLength / 2 - 10]}
        receiveShadow
      >
        <planeGeometry args={[bankWidth, riverLength]} />
        <meshStandardMaterial color={colors.terrain} roughness={1} metalness={0} />
      </mesh>

      {/* Right Riverbank */}
      <mesh
        ref={rightBankRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[displayWidth / 2 + bankWidth / 2, 0, riverLength / 2 - 10]}
        receiveShadow
      >
        <planeGeometry args={[bankWidth, riverLength]} />
        <meshStandardMaterial color={colors.terrain} roughness={1} metalness={0} />
      </mesh>

      {/* Riverbank edge indicators - rocks/debris at water edge */}
      <RiverbankEdges
        riverWidth={displayWidth}
        riverLength={riverLength}
        terrainColor={colors.terrain}
        isNarrow={isNarrow}
      />

      {/* Narrow section indicators - rocks jutting into river */}
      {narrowIndicators.map((rock, i) => (
        <mesh
          key={`narrow-rock-${i}`}
          position={[rock.x, 0.1, rock.y]}
          castShadow
        >
          <dodecahedronGeometry args={[rock.scale, 1]} />
          <meshStandardMaterial color="#475569" roughness={0.9} metalness={0} />
        </mesh>
      ))}

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
      <mesh position={[0, 10, 55]} rotation={[Math.PI / 6, 0, 0]}>
        <planeGeometry args={[80, 40]} />
        <meshBasicMaterial
          color={colors.sky}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Lane Markers (subtle guide lines on water) */}
      {lanePositions.map((laneX, i) => (
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

      {/* Width transition indicator - subtle glow at edges when transitioning */}
      <WidthTransitionIndicator
        riverWidth={displayWidth}
        targetWidth={riverWidth}
        riverLength={riverLength}
      />
    </>
  );
}

/**
 * Riverbank Edges Component
 * Creates visual edge indicators along the river banks
 */
interface RiverbankEdgesProps {
  riverWidth: number;
  riverLength: number;
  terrainColor: string;
  isNarrow: boolean;
}

function RiverbankEdges({ riverWidth, riverLength, terrainColor, isNarrow }: RiverbankEdgesProps) {
  const halfWidth = riverWidth / 2;

  // Create edge indicator positions
  const edgePositions = useMemo(() => {
    const positions = [];
    const spacing = 3;

    for (let y = -10; y < riverLength - 10; y += spacing) {
      // Left edge
      positions.push({
        x: -halfWidth + 0.2,
        y,
        scale: 0.2 + Math.random() * 0.1,
        rotation: Math.random() * Math.PI,
      });
      // Right edge
      positions.push({
        x: halfWidth - 0.2,
        y,
        scale: 0.2 + Math.random() * 0.1,
        rotation: Math.random() * Math.PI,
      });
    }

    return positions;
  }, [halfWidth, riverLength]);

  // Edge color - slightly darker than terrain, brighter when narrow
  const edgeColor = isNarrow ? '#ff9966' : '#3d5a3d';

  return (
    <>
      {edgePositions.map((edge, i) => (
        <mesh
          key={`edge-${i}`}
          position={[edge.x, 0.02, edge.y]}
          rotation={[0, edge.rotation, 0]}
        >
          <cylinderGeometry args={[edge.scale, edge.scale * 0.8, 0.05, 6]} />
          <meshStandardMaterial
            color={edgeColor}
            roughness={0.9}
            metalness={0}
            transparent
            opacity={isNarrow ? 0.9 : 0.6}
          />
        </mesh>
      ))}
    </>
  );
}

/**
 * Width Transition Indicator
 * Shows a subtle visual effect when river width is transitioning
 */
interface WidthTransitionIndicatorProps {
  riverWidth: number;
  targetWidth: number;
  riverLength: number;
}

function WidthTransitionIndicator({ riverWidth, targetWidth, riverLength }: WidthTransitionIndicatorProps) {
  const isTransitioning = Math.abs(riverWidth - targetWidth) > 0.1;

  if (!isTransitioning) return null;

  const isNarrowing = targetWidth < riverWidth;
  const halfWidth = riverWidth / 2;

  return (
    <>
      {/* Left edge glow */}
      <mesh position={[-halfWidth, 0.03, riverLength / 2 - 10]}>
        <boxGeometry args={[0.3, 0.1, riverLength]} />
        <meshBasicMaterial
          color={isNarrowing ? '#ff6b6b' : '#6bff6b'}
          transparent
          opacity={0.3}
        />
      </mesh>
      {/* Right edge glow */}
      <mesh position={[halfWidth, 0.03, riverLength / 2 - 10]}>
        <boxGeometry args={[0.3, 0.1, riverLength]} />
        <meshBasicMaterial
          color={isNarrowing ? '#ff6b6b' : '#6bff6b'}
          transparent
          opacity={0.3}
        />
      </mesh>
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

export default DynamicRiverEnvironment;
