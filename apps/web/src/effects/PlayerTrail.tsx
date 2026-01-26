/**
 * Player Trail Effect Component
 * Creates a fading trail behind the otter when moving
 *
 * Uses a series of trail segments that fade based on their age
 */

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { queries } from '@otter-river-rush/core';

interface TrailPoint {
  position: THREE.Vector3;
  timestamp: number;
}

interface PlayerTrailProps {
  /** Maximum number of trail points to keep */
  maxPoints?: number;
  /** How long trail points stay visible (ms) */
  trailDuration?: number;
  /** Trail color */
  color?: string;
  /** Whether to respect reduced motion preference */
  reducedMotion?: boolean;
  /** Whether the game is currently playing */
  isPlaying?: boolean;
}

export function PlayerTrail({
  maxPoints = 20,
  trailDuration = 500,
  color = '#4fc3f7',
  reducedMotion = false,
  isPlaying = false,
}: PlayerTrailProps) {
  const trailPoints = useRef<TrailPoint[]>([]);
  const meshRef = useRef<THREE.Mesh>(null);
  const lastPlayerPos = useRef<THREE.Vector3 | null>(null);

  // Create geometry for trail
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    // We'll update positions dynamically
    const positions = new Float32Array(maxPoints * 3 * 2); // 2 vertices per point (for width)
    const alphas = new Float32Array(maxPoints * 2);
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
    return geo;
  }, [maxPoints]);

  // Shader material for fading trail
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      vertexShader: `
        attribute float alpha;
        varying float vAlpha;
        void main() {
          vAlpha = alpha;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        varying float vAlpha;
        void main() {
          gl_FragColor = vec4(color, vAlpha * 0.6);
        }
      `,
      uniforms: {
        color: { value: new THREE.Color(color) },
      },
    });
  }, [color]);

  // Clear trail when game stops
  useEffect(() => {
    if (!isPlaying) {
      trailPoints.current = [];
      lastPlayerPos.current = null;
    }
  }, [isPlaying]);

  // Update trail each frame
  useFrame(() => {
    if (!isPlaying || reducedMotion) return;

    // Get player entity
    const [player] = queries.player.entities;
    if (!player?.position) return;

    const now = Date.now();
    const currentPos = new THREE.Vector3(
      -player.position.x, // Negate X (camera behind player inverts left/right)
      player.position.z,  // Game Z -> Three.js Y
      player.position.y   // Game Y -> Three.js Z
    );

    // Only add point if player has moved
    if (
      !lastPlayerPos.current ||
      currentPos.distanceTo(lastPlayerPos.current) > 0.05
    ) {
      trailPoints.current.push({
        position: currentPos.clone(),
        timestamp: now,
      });
      lastPlayerPos.current = currentPos.clone();
    }

    // Remove old points
    trailPoints.current = trailPoints.current.filter(
      (point) => now - point.timestamp < trailDuration
    );

    // Limit to max points
    if (trailPoints.current.length > maxPoints) {
      trailPoints.current = trailPoints.current.slice(-maxPoints);
    }

    // Update geometry
    const positions = geometry.attributes.position.array as Float32Array;
    const alphas = geometry.attributes.alpha.array as Float32Array;

    const trailWidth = 0.3;
    const points = trailPoints.current;

    for (let i = 0; i < maxPoints; i++) {
      if (i < points.length) {
        const point = points[i];
        const age = (now - point.timestamp) / trailDuration;
        const alpha = 1 - age;

        // Left vertex
        positions[i * 6] = point.position.x - trailWidth * (1 - age * 0.5);
        positions[i * 6 + 1] = point.position.y - 0.3; // Slightly below player
        positions[i * 6 + 2] = point.position.z;
        alphas[i * 2] = alpha;

        // Right vertex
        positions[i * 6 + 3] = point.position.x + trailWidth * (1 - age * 0.5);
        positions[i * 6 + 4] = point.position.y - 0.3;
        positions[i * 6 + 5] = point.position.z;
        alphas[i * 2 + 1] = alpha;
      } else {
        // Hide unused vertices
        positions[i * 6] = 0;
        positions[i * 6 + 1] = -100;
        positions[i * 6 + 2] = 0;
        positions[i * 6 + 3] = 0;
        positions[i * 6 + 4] = -100;
        positions[i * 6 + 5] = 0;
        alphas[i * 2] = 0;
        alphas[i * 2 + 1] = 0;
      }
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.alpha.needsUpdate = true;

    // Update index for triangle strip
    const indices: number[] = [];
    for (let i = 0; i < Math.min(points.length - 1, maxPoints - 1); i++) {
      indices.push(i * 2, i * 2 + 1, i * 2 + 2);
      indices.push(i * 2 + 1, i * 2 + 3, i * 2 + 2);
    }
    geometry.setIndex(indices);
  });

  if (reducedMotion) return null;

  return <mesh ref={meshRef} geometry={geometry} material={material} />;
}
