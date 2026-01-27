/**
 * ProceduralPedestal Component
 * Hexagonal platform for the center otter in the carousel
 *
 * Features:
 * - Hexagonal cylinder (6-sided) with wood texture
 * - Optional gold ring around the edge
 * - Configurable size and position
 */

import { useMemo } from 'react';
import * as THREE from 'three';

export interface ProceduralPedestalProps {
  /** Position in 3D space [x, y, z] */
  position: [number, number, number];
  /** Radius of the hexagonal platform */
  radius?: number;
  /** Height of the platform */
  height?: number;
  /** Whether to show the decorative gold ring */
  showGoldRing?: boolean;
  /** Visibility for fade animations */
  visible?: boolean;
}

/** Wood color for the pedestal */
const WOOD_COLOR = '#4a3728';
/** Gold color for the ring */
const GOLD_COLOR = '#ffd700';

export function ProceduralPedestal({
  position,
  radius = 0.8,
  height = 0.15,
  showGoldRing = true,
  visible = true,
}: ProceduralPedestalProps) {
  // Memoize materials to avoid recreation
  const woodMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: WOOD_COLOR,
        roughness: 0.8,
        metalness: 0.1,
      }),
    []
  );

  const goldMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: GOLD_COLOR,
        roughness: 0.3,
        metalness: 0.8,
        emissive: GOLD_COLOR,
        emissiveIntensity: 0.3,
      }),
    []
  );

  if (!visible) return null;

  return (
    <group position={position}>
      {/* Main hexagonal platform */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[radius, radius, height, 6]} />
        <primitive object={woodMaterial} />
      </mesh>

      {/* Top face detail - slightly raised */}
      <mesh position={[0, height / 2 + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <cylinderGeometry args={[radius * 0.9, radius * 0.9, 0.02, 6]} />
        <meshStandardMaterial color="#5a4738" roughness={0.7} metalness={0.15} />
      </mesh>

      {/* Gold ring around edge */}
      {showGoldRing && (
        <mesh position={[0, height / 2 + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[radius * 0.95, 0.02, 8, 6]} />
          <primitive object={goldMaterial} />
        </mesh>
      )}

      {/* Bottom shadow catcher */}
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[radius * 2.5, radius * 2.5]} />
        <shadowMaterial transparent opacity={0.3} />
      </mesh>
    </group>
  );
}
