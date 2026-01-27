/**
 * Section Effects Component
 * Renders visual effects based on the current river section type
 *
 * - Rapids: White water foam, spray particles, turbulent surface
 * - Calm Pool: Lily pads, calm ripples, ambient particles
 * - Whirlpool: Spiral water effect (handled separately by WhirlpoolEffect)
 */

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { RiverSectionType } from '../../../../game/types';

// ============================================================================
// Types
// ============================================================================

interface SectionEffectsProps {
  /** Current section type */
  sectionType: RiverSectionType;
  /** Player distance for positioning */
  playerDistance: number;
  /** River width at current position */
  riverWidth: number;
  /** River center X position */
  centerX?: number;
  /** Whether effects are enabled */
  enabled?: boolean;
}

interface RapidsEffectsProps {
  playerDistance: number;
  riverWidth: number;
  centerX: number;
}

interface CalmPoolEffectsProps {
  playerDistance: number;
  riverWidth: number;
  centerX: number;
}

// ============================================================================
// Constants
// ============================================================================

const FOAM_PARTICLE_COUNT = 50;
const LILY_PAD_COUNT = 8;

// ============================================================================
// Main Component
// ============================================================================

export function SectionEffects({
  sectionType,
  playerDistance,
  riverWidth,
  centerX = 0,
  enabled = true,
}: SectionEffectsProps) {
  if (!enabled) return null;

  switch (sectionType) {
    case 'rapids':
      return (
        <RapidsEffects
          playerDistance={playerDistance}
          riverWidth={riverWidth}
          centerX={centerX}
        />
      );
    case 'calm_pool':
      return (
        <CalmPoolEffects
          playerDistance={playerDistance}
          riverWidth={riverWidth}
          centerX={centerX}
        />
      );
    case 'whirlpool':
      // Whirlpool is handled by WhirlpoolEffect component
      return null;
    case 'normal':
    default:
      return null;
  }
}

// ============================================================================
// Rapids Effects
// ============================================================================

function RapidsEffects({ playerDistance: _playerDistance, riverWidth, centerX }: RapidsEffectsProps) {
  const foamRef = useRef<THREE.Points>(null);
  const sprayRef = useRef<THREE.Points>(null);

  // Create foam particles
  const foamGeometry = useMemo(() => {
    const positions = new Float32Array(FOAM_PARTICLE_COUNT * 3);
    const velocities = new Float32Array(FOAM_PARTICLE_COUNT * 3);
    const sizes = new Float32Array(FOAM_PARTICLE_COUNT);

    for (let i = 0; i < FOAM_PARTICLE_COUNT; i++) {
      const i3 = i * 3;

      // Random position within river bounds
      positions[i3] = centerX + (Math.random() - 0.5) * riverWidth;
      positions[i3 + 1] = 0.1; // Just above water
      positions[i3 + 2] = (Math.random() - 0.5) * 40; // Spread along river

      // Random velocities for animation
      velocities[i3] = (Math.random() - 0.5) * 2;
      velocities[i3 + 1] = Math.random() * 0.5;
      velocities[i3 + 2] = -Math.random() * 3 - 2; // Flow downstream

      // Random sizes
      sizes[i] = Math.random() * 0.3 + 0.1;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    return geometry;
  }, [centerX, riverWidth]);

  // Create spray particles (mist)
  const sprayGeometry = useMemo(() => {
    const count = 30;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      positions[i3] = centerX + (Math.random() - 0.5) * riverWidth * 0.6;
      positions[i3 + 1] = Math.random() * 0.8 + 0.2;
      positions[i3 + 2] = (Math.random() - 0.5) * 30;

      sizes[i] = Math.random() * 0.15 + 0.05;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    return geometry;
  }, [centerX, riverWidth]);

  // Animate foam particles
  useFrame((state, delta) => {
    if (!foamRef.current) return;

    const positions = foamRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const velocities = foamRef.current.geometry.attributes.velocity as THREE.BufferAttribute;
    const posArray = positions.array as Float32Array;
    const velArray = velocities.array as Float32Array;

    for (let i = 0; i < FOAM_PARTICLE_COUNT; i++) {
      const i3 = i * 3;

      // Update position
      posArray[i3] += velArray[i3] * delta;
      posArray[i3 + 1] += velArray[i3 + 1] * delta;
      posArray[i3 + 2] += velArray[i3 + 2] * delta;

      // Reset particles that have moved too far
      if (posArray[i3 + 2] < -25) {
        posArray[i3] = centerX + (Math.random() - 0.5) * riverWidth;
        posArray[i3 + 1] = 0.1;
        posArray[i3 + 2] = 20;
      }

      // Bounce off river edges
      const halfWidth = riverWidth / 2;
      if (posArray[i3] < centerX - halfWidth || posArray[i3] > centerX + halfWidth) {
        velArray[i3] *= -0.8;
      }
    }

    positions.needsUpdate = true;

    // Animate spray
    if (sprayRef.current) {
      const sprayPositions = sprayRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const sprayArray = sprayPositions.array as Float32Array;

      for (let i = 0; i < 30; i++) {
        const i3 = i * 3;
        // Gentle floating motion
        sprayArray[i3 + 1] += Math.sin(state.clock.elapsedTime * 2 + i) * delta * 0.3;

        // Keep in bounds
        if (sprayArray[i3 + 1] > 1.2) sprayArray[i3 + 1] = 0.2;
        if (sprayArray[i3 + 1] < 0.1) sprayArray[i3 + 1] = 0.8;
      }

      sprayPositions.needsUpdate = true;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Foam particles */}
      <points ref={foamRef} geometry={foamGeometry}>
        <pointsMaterial
          color="#ffffff"
          size={0.25}
          transparent
          opacity={0.7}
          sizeAttenuation
          depthWrite={false}
        />
      </points>

      {/* Spray/mist particles */}
      <points ref={sprayRef} geometry={sprayGeometry}>
        <pointsMaterial
          color="#e0f0ff"
          size={0.15}
          transparent
          opacity={0.4}
          sizeAttenuation
          depthWrite={false}
        />
      </points>

      {/* Foam strips on water surface */}
      <FoamStrips riverWidth={riverWidth} centerX={centerX} />
    </group>
  );
}

/**
 * Animated foam strips on water surface for rapids
 */
function FoamStrips({ riverWidth, centerX }: { riverWidth: number; centerX: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    // Animate UV offset for flowing foam texture effect
    const material = meshRef.current.material as THREE.MeshBasicMaterial;
    if (material.map) {
      material.map.offset.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <mesh ref={meshRef} position={[centerX, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[riverWidth * 0.8, 50, 1, 1]} />
      <meshBasicMaterial
        color="#ffffff"
        transparent
        opacity={0.15}
        depthWrite={false}
      />
    </mesh>
  );
}

// ============================================================================
// Calm Pool Effects
// ============================================================================

function CalmPoolEffects({ playerDistance: _playerDistance, riverWidth, centerX }: CalmPoolEffectsProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Generate lily pad positions deterministically
  const lilyPads = useMemo(() => {
    const pads: Array<{
      x: number;
      z: number;
      scale: number;
      rotation: number;
    }> = [];

    for (let i = 0; i < LILY_PAD_COUNT; i++) {
      // Use deterministic pseudo-random based on index
      const seed = i * 12345;
      const randX = Math.sin(seed) * 0.5 + 0.5;
      const randZ = Math.cos(seed * 2) * 0.5 + 0.5;
      const randScale = Math.sin(seed * 3) * 0.5 + 0.5;
      const randRotation = Math.cos(seed * 4) * Math.PI * 2;

      pads.push({
        x: centerX + (randX - 0.5) * riverWidth * 0.6,
        z: (randZ - 0.5) * 40,
        scale: 0.3 + randScale * 0.4,
        rotation: randRotation,
      });
    }

    return pads;
  }, [centerX, riverWidth]);

  // Gentle bob animation
  useFrame((state) => {
    if (!groupRef.current) return;

    groupRef.current.children.forEach((child, i) => {
      if (child instanceof THREE.Mesh) {
        // Gentle floating motion
        child.position.y = 0.02 + Math.sin(state.clock.elapsedTime * 0.8 + i * 0.5) * 0.01;
        // Subtle rotation
        child.rotation.z = Math.sin(state.clock.elapsedTime * 0.3 + i) * 0.05;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {/* Lily Pads */}
      {lilyPads.map((pad, i) => (
        <LilyPad
          key={`lily-${i}`}
          position={[pad.x, 0.02, pad.z]}
          scale={pad.scale}
          rotation={pad.rotation}
        />
      ))}

      {/* Calm water shimmer overlay */}
      <mesh position={[centerX, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[riverWidth, 50]} />
        <meshBasicMaterial
          color="#90d0ff"
          transparent
          opacity={0.08}
          depthWrite={false}
        />
      </mesh>

      {/* Ambient particles (dragonflies/sparkles) */}
      <AmbientParticles centerX={centerX} riverWidth={riverWidth} />
    </group>
  );
}

/**
 * Simple lily pad shape
 */
function LilyPad({
  position,
  scale,
  rotation,
}: {
  position: [number, number, number];
  scale: number;
  rotation: number;
}) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, rotation]} scale={scale}>
      <circleGeometry args={[0.5, 16]} />
      <meshStandardMaterial
        color="#2d5a27"
        roughness={0.8}
        metalness={0.1}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/**
 * Floating ambient particles for calm pool atmosphere
 */
function AmbientParticles({ centerX, riverWidth }: { centerX: number; riverWidth: number }) {
  const ref = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const count = 20;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      positions[i3] = centerX + (Math.random() - 0.5) * riverWidth;
      positions[i3 + 1] = Math.random() * 1.5 + 0.3;
      positions[i3 + 2] = (Math.random() - 0.5) * 40;

      // Warm golden colors for dragonflies/sparkles
      colors[i3] = 0.9 + Math.random() * 0.1;
      colors[i3 + 1] = 0.8 + Math.random() * 0.2;
      colors[i3 + 2] = 0.3 + Math.random() * 0.2;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    return geo;
  }, [centerX, riverWidth]);

  useFrame((state) => {
    if (!ref.current) return;

    const positions = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    const posArray = positions.array as Float32Array;

    for (let i = 0; i < 20; i++) {
      const i3 = i * 3;
      // Gentle floating/hovering motion
      posArray[i3] += Math.sin(state.clock.elapsedTime + i) * 0.005;
      posArray[i3 + 1] += Math.sin(state.clock.elapsedTime * 0.5 + i * 0.3) * 0.003;
    }

    positions.needsUpdate = true;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        size={0.08}
        transparent
        opacity={0.7}
        vertexColors
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

export default SectionEffects;
