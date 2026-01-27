/**
 * Waterfall Effect Component
 * Renders visual effects for waterfalls including mist particles,
 * spray textures, and speed lines
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ============================================================================
// Types
// ============================================================================

interface WaterfallEffectProps {
  /** Position of the waterfall (center of the drop) */
  position: [number, number, number];
  /** Width of the waterfall */
  width: number;
  /** Height of the drop */
  dropHeight: number;
  /** Intensity of the effect (0-1) */
  intensity?: number;
  /** Water color */
  waterColor?: string;
  /** Mist color */
  mistColor?: string;
}

// ============================================================================
// Constants
// ============================================================================

const MIST_PARTICLE_COUNT = 100;
const SPRAY_PARTICLE_COUNT = 50;
const SPEED_LINE_COUNT = 20;

// ============================================================================
// Main Component
// ============================================================================

export function WaterfallEffect({
  position,
  width,
  dropHeight,
  intensity = 1.0,
  waterColor = '#4a90a4',
  mistColor = '#ffffff',
}: WaterfallEffectProps) {
  const mistRef = useRef<THREE.Points>(null);
  const sprayRef = useRef<THREE.Points>(null);
  const speedLinesRef = useRef<THREE.Points>(null);

  // Generate mist particles at the base of the waterfall
  const mistGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(MIST_PARTICLE_COUNT * 3);
    const velocities = new Float32Array(MIST_PARTICLE_COUNT * 3);
    const sizes = new Float32Array(MIST_PARTICLE_COUNT);

    for (let i = 0; i < MIST_PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      // Spread particles at the base
      positions[i3] = (Math.random() - 0.5) * width * 1.5;
      positions[i3 + 1] = Math.random() * 2; // Rising mist
      positions[i3 + 2] = (Math.random() - 0.5) * 2;

      // Upward velocity with some spread
      velocities[i3] = (Math.random() - 0.5) * 0.5;
      velocities[i3 + 1] = 0.5 + Math.random() * 0.5;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.3;

      sizes[i] = 0.3 + Math.random() * 0.4;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    return geometry;
  }, [width]);

  // Generate spray particles falling with the water
  const sprayGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(SPRAY_PARTICLE_COUNT * 3);
    const phases = new Float32Array(SPRAY_PARTICLE_COUNT);

    for (let i = 0; i < SPRAY_PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * width;
      positions[i3 + 1] = Math.random() * dropHeight;
      positions[i3 + 2] = (Math.random() - 0.5) * 0.5;
      phases[i] = Math.random() * Math.PI * 2;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));

    return geometry;
  }, [width, dropHeight]);

  // Generate speed lines for the falling water effect
  const speedLinesGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(SPEED_LINE_COUNT * 6); // 2 vertices per line
    const phases = new Float32Array(SPEED_LINE_COUNT);

    for (let i = 0; i < SPEED_LINE_COUNT; i++) {
      const i6 = i * 6;
      const x = (Math.random() - 0.5) * width * 0.8;
      const z = (Math.random() - 0.5) * 0.3;
      const startY = Math.random() * dropHeight;
      const lineLength = 0.5 + Math.random() * 1.0;

      // Start point
      positions[i6] = x;
      positions[i6 + 1] = startY;
      positions[i6 + 2] = z;

      // End point (below start)
      positions[i6 + 3] = x;
      positions[i6 + 4] = startY - lineLength;
      positions[i6 + 5] = z;

      phases[i] = Math.random();
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));

    return geometry;
  }, [width, dropHeight]);

  // Animate particles
  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    // Animate mist particles
    if (mistRef.current) {
      const positions = mistRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const velocities = mistRef.current.geometry.attributes.velocity as THREE.BufferAttribute;

      for (let i = 0; i < MIST_PARTICLE_COUNT; i++) {
        const i3 = i * 3;

        // Update position based on velocity
        positions.array[i3] += velocities.array[i3] * delta * intensity;
        positions.array[i3 + 1] += velocities.array[i3 + 1] * delta * intensity;
        positions.array[i3 + 2] += velocities.array[i3 + 2] * delta * intensity;

        // Reset particles that rise too high
        if (positions.array[i3 + 1] > dropHeight * 0.5) {
          positions.array[i3] = (Math.random() - 0.5) * width * 1.5;
          positions.array[i3 + 1] = 0;
          positions.array[i3 + 2] = (Math.random() - 0.5) * 2;
        }
      }

      positions.needsUpdate = true;
    }

    // Animate spray particles
    if (sprayRef.current) {
      const positions = sprayRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const phases = sprayRef.current.geometry.attributes.phase as THREE.BufferAttribute;

      for (let i = 0; i < SPRAY_PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        const phase = phases.array[i];

        // Move down rapidly
        positions.array[i3 + 1] -= delta * 8 * intensity;

        // Add horizontal wobble
        positions.array[i3] += Math.sin(time * 5 + phase) * delta * 0.5;

        // Reset when reaching bottom
        if (positions.array[i3 + 1] < -dropHeight * 0.2) {
          positions.array[i3] = (Math.random() - 0.5) * width;
          positions.array[i3 + 1] = dropHeight;
          positions.array[i3 + 2] = (Math.random() - 0.5) * 0.5;
        }
      }

      positions.needsUpdate = true;
    }

    // Animate speed lines
    if (speedLinesRef.current) {
      const positions = speedLinesRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const phases = speedLinesRef.current.geometry.attributes.phase as THREE.BufferAttribute;

      for (let i = 0; i < SPEED_LINE_COUNT; i++) {
        const i6 = i * 6;
        const moveAmount = delta * 10 * intensity;

        // Move both vertices down
        positions.array[i6 + 1] -= moveAmount;
        positions.array[i6 + 4] -= moveAmount;

        // Reset when line goes below waterfall
        if (positions.array[i6 + 4] < -dropHeight * 0.3) {
          const x = (Math.random() - 0.5) * width * 0.8;
          const z = (Math.random() - 0.5) * 0.3;
          const lineLength = 0.5 + Math.random() * 1.0;

          positions.array[i6] = x;
          positions.array[i6 + 1] = dropHeight + phases.array[i] * 2;
          positions.array[i6 + 2] = z;
          positions.array[i6 + 3] = x;
          positions.array[i6 + 4] = dropHeight + phases.array[i] * 2 - lineLength;
          positions.array[i6 + 5] = z;
        }
      }

      positions.needsUpdate = true;
    }
  });

  return (
    <group position={position}>
      {/* Mist particles at the base */}
      <points ref={mistRef} geometry={mistGeometry}>
        <pointsMaterial
          color={mistColor}
          size={0.4}
          transparent
          opacity={0.3 * intensity}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Spray particles falling */}
      <points ref={sprayRef} geometry={sprayGeometry} position={[0, -dropHeight / 2, 0]}>
        <pointsMaterial
          color={waterColor}
          size={0.15}
          transparent
          opacity={0.6 * intensity}
          sizeAttenuation
          depthWrite={false}
        />
      </points>

      {/* Speed lines */}
      <lineSegments ref={speedLinesRef} geometry={speedLinesGeometry} position={[0, -dropHeight / 2, 0]}>
        <lineBasicMaterial
          color={mistColor}
          transparent
          opacity={0.4 * intensity}
          linewidth={1}
        />
      </lineSegments>

      {/* Foam at the base */}
      <mesh position={[0, -dropHeight - 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[width * 0.6, 32]} />
        <meshBasicMaterial
          color={mistColor}
          transparent
          opacity={0.5 * intensity}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Splash ring animation */}
      <SplashRing
        position={[0, -dropHeight, 0]}
        width={width}
        intensity={intensity}
        color={mistColor}
      />
    </group>
  );
}

// ============================================================================
// Splash Ring Sub-component
// ============================================================================

interface SplashRingProps {
  position: [number, number, number];
  width: number;
  intensity: number;
  color: string;
}

function SplashRing({ position, width, intensity, color }: SplashRingProps) {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ringRef.current) {
      const time = state.clock.elapsedTime;
      const scale = 0.5 + (time % 1) * 0.5; // Pulsing scale
      const opacity = (1 - (time % 1)) * 0.3 * intensity;

      ringRef.current.scale.setScalar(scale);
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity = opacity;
    }
  });

  return (
    <mesh ref={ringRef} position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[width * 0.4, width * 0.5, 32]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.3}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

export default WaterfallEffect;
