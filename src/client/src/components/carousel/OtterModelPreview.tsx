/**
 * OtterModelPreview Component
 * GLB model loader with locked/unlocked states for character carousel
 *
 * Renders an otter model with:
 * - Grayscale locked state
 * - Subtle idle bobbing animation
 * - Configurable position, rotation, scale, and opacity
 */

import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

export interface OtterModelPreviewProps {
  /** Path to the GLB model file */
  modelPath: string;
  /** Whether the character is locked */
  isLocked: boolean;
  /** Position in 3D space [x, y, z] */
  position: [number, number, number];
  /** Rotation in radians [x, y, z] */
  rotation: [number, number, number];
  /** Uniform scale factor */
  scale: number;
  /** Opacity for fading (0-1), default 1 */
  opacity?: number;
  /** Animation phase offset for variety */
  animationOffset?: number;
}

/** Grayscale material for locked characters */
const LOCKED_MATERIAL = new THREE.MeshStandardMaterial({
  color: 0x333333,
  roughness: 0.9,
  metalness: 0.1,
});

/** Bob animation parameters */
const BOB_AMPLITUDE = 0.05;
const BOB_SPEED = 1.5;

/**
 * Clone material(s) for a mesh, applying locked state if needed
 */
function cloneMeshMaterials(mesh: THREE.Mesh, isLocked: boolean): void {
  if (isLocked) {
    mesh.material = Array.isArray(mesh.material)
      ? mesh.material.map(() => LOCKED_MATERIAL.clone())
      : LOCKED_MATERIAL.clone();
  } else {
    mesh.material = Array.isArray(mesh.material)
      ? mesh.material.map((mat) => mat.clone())
      : mesh.material.clone();
  }
}

/**
 * Update material opacity for a mesh
 */
function updateMeshOpacity(mesh: THREE.Mesh, opacity: number): void {
  const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  for (const mat of materials) {
    if (mat instanceof THREE.MeshStandardMaterial) {
      mat.transparent = opacity < 1;
      mat.opacity = opacity;
      mat.needsUpdate = true;
    }
  }
}

export function OtterModelPreview({
  modelPath,
  isLocked,
  position,
  rotation,
  scale,
  opacity = 1,
  animationOffset = 0,
}: OtterModelPreviewProps) {
  const groupRef = useRef<THREE.Group>(null);
  const baseY = useRef(position[1]);

  // Load the GLB model
  const { scene } = useGLTF(modelPath);

  // Clone the scene to avoid shared state issues between instances
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);

    // Apply materials based on locked state
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        cloneMeshMaterials(child as THREE.Mesh, isLocked);
      }
    });

    return clone;
  }, [scene, isLocked]);

  // Update opacity when it changes
  useEffect(() => {
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        updateMeshOpacity(child as THREE.Mesh, opacity);
      }
    });
  }, [clonedScene, opacity]);

  // Update base Y when position changes
  useEffect(() => {
    baseY.current = position[1];
  }, [position]);

  // Subtle idle bobbing animation
  useFrame((state) => {
    if (!groupRef.current) return;

    // Calculate bob offset using elapsed time
    const time = state.clock.elapsedTime + animationOffset;
    const bobOffset = Math.sin(time * BOB_SPEED) * BOB_AMPLITUDE;

    // Apply bob to Y position
    groupRef.current.position.y = baseY.current + bobOffset;
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={[scale, scale, scale]}>
      <primitive object={clonedScene} />
    </group>
  );
}

// Preload helper for model paths
OtterModelPreview.preload = (modelPath: string) => {
  useGLTF.preload(modelPath);
};
