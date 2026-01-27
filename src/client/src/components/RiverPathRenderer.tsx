/**
 * River Path Renderer
 * Renders a curved river following path points from the river path store
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

import { useMemo, useRef } from 'react';
import { BIOME_COLORS, VISUAL } from '../../../../game/config';
import { useRiverPathStore } from '../../../../game/store';
import type { BiomeType, RiverPathPoint } from '../../../../game/types';
import * as THREE from 'three';
import { AnimatedWaterMaterial } from '../shaders';

// ============================================================================
// Types
// ============================================================================

interface RiverPathRendererProps {
  /** Player's current distance along the river */
  playerDistance: number;
  /** Current biome for visual styling */
  biome?: BiomeType;
  /** Render distance behind player */
  renderBehind?: number;
  /** Render distance ahead of player */
  renderAhead?: number;
  /** Show lane markers */
  showLaneMarkers?: boolean;
  /** Lane count (3 or 5) */
  laneCount?: 3 | 5;
}

// ============================================================================
// Main Component
// ============================================================================

export function RiverPathRenderer({
  playerDistance,
  biome = 'forest',
  renderBehind = 20,
  renderAhead = 50,
  showLaneMarkers = true,
  laneCount = 3,
}: RiverPathRendererProps) {
  const waterMeshRef = useRef<THREE.Mesh>(null);

  // Get path points in the visible range
  const pathPoints = useRiverPathStore((state) =>
    state.getPathPointsInRange(
      playerDistance - renderBehind,
      playerDistance + renderAhead
    )
  );

  const colors = BIOME_COLORS[biome];

  // Compute foam color from water color
  const foamColor = useMemo(() => {
    const color = new THREE.Color(colors.water);
    color.lerp(new THREE.Color('#ffffff'), 0.7);
    return `#${color.getHexString()}`;
  }, [colors.water]);

  // Generate river mesh geometry from path points
  const riverGeometry = useMemo(() => {
    if (pathPoints.length < 2) {
      // Fallback to simple plane if not enough points
      return new THREE.PlaneGeometry(8, 70, 32, 32);
    }

    return createRiverGeometry(pathPoints, playerDistance);
  }, [pathPoints, playerDistance]);

  // Generate bank geometries
  const { leftBankGeometry, rightBankGeometry } = useMemo(() => {
    if (pathPoints.length < 2) {
      return {
        leftBankGeometry: new THREE.PlaneGeometry(6, 70),
        rightBankGeometry: new THREE.PlaneGeometry(6, 70),
      };
    }

    return createBankGeometries(pathPoints, playerDistance, 4); // 4 = bank width
  }, [pathPoints, playerDistance]);

  // Lane marker positions
  const laneMarkers = useMemo(() => {
    if (!showLaneMarkers || pathPoints.length < 2) return [];

    return createLaneMarkers(pathPoints, playerDistance, laneCount);
  }, [pathPoints, playerDistance, showLaneMarkers, laneCount]);

  return (
    <>
      {/* Lighting */}
      <ambientLight
        color={VISUAL.lighting.ambient.color}
        intensity={VISUAL.lighting.ambient.intensity}
      />
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
      <mesh
        ref={waterMeshRef}
        geometry={riverGeometry}
        receiveShadow
      >
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
      <mesh geometry={leftBankGeometry} receiveShadow>
        <meshStandardMaterial color={colors.terrain} roughness={1} metalness={0} />
      </mesh>

      {/* Right Riverbank */}
      <mesh geometry={rightBankGeometry} receiveShadow>
        <meshStandardMaterial color={colors.terrain} roughness={1} metalness={0} />
      </mesh>

      {/* Lane Markers */}
      {laneMarkers.map((marker, i) => (
        <mesh
          key={`lane-marker-${i}`}
          position={marker.position}
          rotation={marker.rotation}
        >
          <boxGeometry args={[0.08, 0.02, 2]} />
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.2}
            emissive="#6680a0"
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}

      {/* Sky Backdrop */}
      <mesh position={[0, 10, 55]} rotation={[Math.PI / 6, 0, 0]}>
        <planeGeometry args={[80, 40]} />
        <meshBasicMaterial color={colors.sky} side={THREE.DoubleSide} />
      </mesh>
    </>
  );
}

// ============================================================================
// Geometry Generation Functions
// ============================================================================

/**
 * Create river water surface geometry following path points
 * Uses BufferGeometry for efficient curved surface
 */
function createRiverGeometry(
  pathPoints: RiverPathPoint[],
  playerDistance: number
): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();

  // We need at least 2 points
  if (pathPoints.length < 2) {
    return new THREE.PlaneGeometry(8, 70, 32, 32);
  }

  // Create vertices, UVs, and indices
  const vertices: number[] = [];
  const uvs: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];

  const widthSegments = 16; // Segments across the river width

  // For each path point, create a row of vertices across the river
  for (let i = 0; i < pathPoints.length; i++) {
    const point = pathPoints[i];
    const v = i / (pathPoints.length - 1); // V coordinate (along river)

    // Get perpendicular direction for width
    const angle = point.angleXY;
    const perpX = Math.cos(angle + Math.PI / 2);
    // perpZ used for 3D curves in future: Math.sin(angle + Math.PI / 2)

    for (let j = 0; j <= widthSegments; j++) {
      const u = j / widthSegments; // U coordinate (across river)
      const widthOffset = (u - 0.5) * point.width;

      // Calculate vertex position
      // Game coords: (centerX + perpOffset, distance, centerZ)
      // Three.js coords: (x, z, y) where y is height
      const x = point.centerX + perpX * widthOffset;
      const y = point.centerZ - 0.1; // Slight offset below ground
      const z = point.distance - playerDistance; // Relative to player

      vertices.push(x, y, z);
      uvs.push(u, v);
      normals.push(0, 1, 0); // Default up normal, will be smoothed

      // Create triangle indices (except for last row)
      if (i < pathPoints.length - 1 && j < widthSegments) {
        const current = i * (widthSegments + 1) + j;
        const next = (i + 1) * (widthSegments + 1) + j;

        // Two triangles per quad
        indices.push(current, next, current + 1);
        indices.push(current + 1, next, next + 1);
      }
    }
  }

  geometry.setIndex(indices);
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));

  // Compute smooth normals
  geometry.computeVertexNormals();

  return geometry;
}

/**
 * Calculate bank width based on river width
 * Banks thin out as river widens, disappear in very wide sections
 */
function calculateDynamicBankWidth(riverWidth: number): number {
  const NARROW_THRESHOLD = 6;
  const WIDE_THRESHOLD = 12;
  const MAX_BANK = 4.0;
  const MIN_BANK = 0;

  if (riverWidth >= WIDE_THRESHOLD) return MIN_BANK;
  if (riverWidth <= NARROW_THRESHOLD) return MAX_BANK;

  const t = (riverWidth - NARROW_THRESHOLD) / (WIDE_THRESHOLD - NARROW_THRESHOLD);
  return MAX_BANK + (MIN_BANK - MAX_BANK) * t;
}

/**
 * Create bank geometries following path points
 * Bank width varies dynamically based on river width at each point
 */
function createBankGeometries(
  pathPoints: RiverPathPoint[],
  playerDistance: number,
  _defaultBankWidth: number // Kept for backwards compatibility, but uses dynamic width
): { leftBankGeometry: THREE.BufferGeometry; rightBankGeometry: THREE.BufferGeometry } {
  const leftGeometry = new THREE.BufferGeometry();
  const rightGeometry = new THREE.BufferGeometry();

  if (pathPoints.length < 2) {
    return {
      leftBankGeometry: new THREE.PlaneGeometry(4, 70),
      rightBankGeometry: new THREE.PlaneGeometry(4, 70),
    };
  }

  // Create vertices for left and right banks
  const leftVertices: number[] = [];
  const rightVertices: number[] = [];
  const leftUvs: number[] = [];
  const rightUvs: number[] = [];
  const leftIndices: number[] = [];
  const rightIndices: number[] = [];

  const widthSegments = 4;

  for (let i = 0; i < pathPoints.length; i++) {
    const point = pathPoints[i];
    const v = i / (pathPoints.length - 1);

    const angle = point.angleXY;
    const perpX = Math.cos(angle + Math.PI / 2);
    // perpZ used for 3D curves in future: Math.sin(angle + Math.PI / 2)

    const halfRiver = point.width / 2;
    // Dynamic bank width based on river width at this point
    const bankWidth = calculateDynamicBankWidth(point.width);

    // Skip bank generation if bank width is effectively zero
    if (bankWidth < 0.1) {
      // Still need to add vertices to maintain index consistency
      for (let j = 0; j <= widthSegments; j++) {
        const x = point.centerX - perpX * halfRiver;
        const z = point.distance - playerDistance;
        leftVertices.push(x, 0, z);
        leftUvs.push(0, v);
      }
      for (let j = 0; j <= widthSegments; j++) {
        const x = point.centerX + perpX * halfRiver;
        const z = point.distance - playerDistance;
        rightVertices.push(x, 0, z);
        rightUvs.push(0, v);
      }
    } else {
      // Left bank vertices
      for (let j = 0; j <= widthSegments; j++) {
        const u = j / widthSegments;
        const bankOffset = halfRiver + u * bankWidth;

        const x = point.centerX - perpX * bankOffset;
        const y = 0; // Ground level
        const z = point.distance - playerDistance;

        leftVertices.push(x, y, z);
        leftUvs.push(u, v);
      }

      // Right bank vertices
      for (let j = 0; j <= widthSegments; j++) {
        const u = j / widthSegments;
        const bankOffset = halfRiver + u * bankWidth;

        const x = point.centerX + perpX * bankOffset;
        const y = 0;
        const z = point.distance - playerDistance;

        rightVertices.push(x, y, z);
        rightUvs.push(u, v);
      }
    }

    // Create indices
    if (i < pathPoints.length - 1) {
      for (let j = 0; j < widthSegments; j++) {
        const current = i * (widthSegments + 1) + j;
        const next = (i + 1) * (widthSegments + 1) + j;

        leftIndices.push(current, next, current + 1);
        leftIndices.push(current + 1, next, next + 1);

        rightIndices.push(current, current + 1, next);
        rightIndices.push(current + 1, next + 1, next);
      }
    }
  }

  leftGeometry.setIndex(leftIndices);
  leftGeometry.setAttribute('position', new THREE.Float32BufferAttribute(leftVertices, 3));
  leftGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(leftUvs, 2));
  leftGeometry.computeVertexNormals();

  rightGeometry.setIndex(rightIndices);
  rightGeometry.setAttribute('position', new THREE.Float32BufferAttribute(rightVertices, 3));
  rightGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(rightUvs, 2));
  rightGeometry.computeVertexNormals();

  return { leftBankGeometry: leftGeometry, rightBankGeometry: rightGeometry };
}

/**
 * Create lane marker positions following path
 */
function createLaneMarkers(
  pathPoints: RiverPathPoint[],
  playerDistance: number,
  laneCount: 3 | 5
): Array<{ position: [number, number, number]; rotation: [number, number, number] }> {
  const markers: Array<{ position: [number, number, number]; rotation: [number, number, number] }> = [];

  // Sample every few path points for lane markers
  const step = Math.max(1, Math.floor(pathPoints.length / 20));

  for (let i = 0; i < pathPoints.length; i += step) {
    const point = pathPoints[i];
    const laneOffset = laneCount === 3 ? point.width / 3 : point.width / 5;

    // Create marker for each lane
    const lanes = laneCount === 3 ? [-1, 0, 1] : [-2, -1, 0, 1, 2];

    for (const lane of lanes) {
      const x = point.centerX + lane * laneOffset;
      const y = 0.01; // Just above water
      const z = point.distance - playerDistance;

      markers.push({
        position: [x, y, z],
        rotation: [0, point.angleXY, 0],
      });
    }
  }

  return markers;
}

export default RiverPathRenderer;
