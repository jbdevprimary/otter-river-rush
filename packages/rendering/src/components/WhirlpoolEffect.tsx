/**
 * Whirlpool Effect Component
 * Renders animated whirlpool hazards with:
 * - Spiral water animation
 * - Pull force visualization
 * - Safe channel indicators
 * - Particle effects (bubbles, mist)
 */

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ============================================================================
// Types
// ============================================================================

interface WhirlpoolEffectProps {
  /** Center X position */
  centerX: number;
  /** Distance along river (Y position relative to player) */
  relativeY: number;
  /** Inner hazard radius */
  radius: number;
  /** Outer pull force radius */
  pullRadius: number;
  /** Safe channel width on each side */
  safeChannelWidth: number;
  /** Rotation speed multiplier */
  rotationSpeed?: number;
  /** River width for context */
  riverWidth: number;
  /** Opacity for fade effects */
  opacity?: number;
}

// ============================================================================
// Constants
// ============================================================================

const SPIRAL_SEGMENTS = 64;
const SPIRAL_RINGS = 8;
const BUBBLE_COUNT = 30;
const MIST_COUNT = 20;

// ============================================================================
// Main Component
// ============================================================================

export function WhirlpoolEffect({
  centerX,
  relativeY,
  radius,
  pullRadius,
  safeChannelWidth,
  rotationSpeed = 1,
  riverWidth,
  opacity = 1,
}: WhirlpoolEffectProps) {
  const groupRef = useRef<THREE.Group>(null);
  const spiralRef = useRef<THREE.Mesh>(null);
  const bubblesRef = useRef<THREE.Points>(null);

  // Create spiral geometry
  const spiralGeometry = useMemo(() => {
    return createSpiralGeometry(radius, pullRadius, SPIRAL_SEGMENTS, SPIRAL_RINGS);
  }, [radius, pullRadius]);

  // Create bubble particles
  const bubbleGeometry = useMemo(() => {
    const positions = new Float32Array(BUBBLE_COUNT * 3);
    const velocities = new Float32Array(BUBBLE_COUNT * 3);
    const phases = new Float32Array(BUBBLE_COUNT);

    for (let i = 0; i < BUBBLE_COUNT; i++) {
      const i3 = i * 3;
      // Random position within pull radius
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * pullRadius;

      positions[i3] = Math.cos(angle) * dist;
      positions[i3 + 1] = -0.1; // Below water surface
      positions[i3 + 2] = Math.sin(angle) * dist;

      // Velocities for spiral motion
      velocities[i3] = (Math.random() - 0.5) * 0.5;
      velocities[i3 + 1] = Math.random() * 0.5; // Rise up
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.5;

      phases[i] = Math.random() * Math.PI * 2;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));

    return geometry;
  }, [pullRadius]);

  // Animate
  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    // Rotate entire group (spiral effect)
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * rotationSpeed * 0.5;
    }

    // Animate spiral distortion
    if (spiralRef.current) {
      const positions = spiralRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const posArray = positions.array as Float32Array;
      const vertexCount = posArray.length / 3;

      for (let i = 0; i < vertexCount; i++) {
        const i3 = i * 3;
        const x = posArray[i3];
        const z = posArray[i3 + 2];
        const dist = Math.sqrt(x * x + z * z);

        // Spiral depression - deeper in center
        const baseDepth = -0.3 * (1 - dist / pullRadius);
        const waveDepth = Math.sin(dist * 2 + time * 3) * 0.05;
        posArray[i3 + 1] = baseDepth + waveDepth;
      }

      positions.needsUpdate = true;
    }

    // Animate bubbles
    if (bubblesRef.current) {
      const positions = bubblesRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const velocities = bubblesRef.current.geometry.attributes.velocity as THREE.BufferAttribute;
      const phases = bubblesRef.current.geometry.attributes.phase as THREE.BufferAttribute;
      const posArray = positions.array as Float32Array;
      const velArray = velocities.array as Float32Array;
      const phaseArray = phases.array as Float32Array;

      for (let i = 0; i < BUBBLE_COUNT; i++) {
        const i3 = i * 3;

        // Spiral motion toward center
        const x = posArray[i3];
        const z = posArray[i3 + 2];
        const dist = Math.sqrt(x * x + z * z);
        const angle = Math.atan2(z, x);

        // Inward spiral with rotation
        const spiralAngle = angle + delta * rotationSpeed * (1 + (pullRadius - dist) / pullRadius);
        const newDist = Math.max(0.1, dist - delta * 0.3);

        posArray[i3] = Math.cos(spiralAngle) * newDist;
        posArray[i3 + 2] = Math.sin(spiralAngle) * newDist;

        // Rise with wobble
        posArray[i3 + 1] += velArray[i3 + 1] * delta;
        posArray[i3 + 1] += Math.sin(time * 2 + phaseArray[i]) * 0.01;

        // Reset bubbles that rise too high or reach center
        if (posArray[i3 + 1] > 0.5 || newDist < 0.2) {
          const resetAngle = Math.random() * Math.PI * 2;
          const resetDist = pullRadius * (0.5 + Math.random() * 0.5);
          posArray[i3] = Math.cos(resetAngle) * resetDist;
          posArray[i3 + 1] = -0.2;
          posArray[i3 + 2] = Math.sin(resetAngle) * resetDist;
        }
      }

      positions.needsUpdate = true;
    }
  });

  return (
    <group position={[centerX, 0, relativeY]}>
      <group ref={groupRef}>
        {/* Spiral water surface */}
        <mesh ref={spiralRef} geometry={spiralGeometry} rotation={[-Math.PI / 2, 0, 0]}>
          <meshStandardMaterial
            color="#1a4d6e"
            transparent
            opacity={opacity * 0.8}
            side={THREE.DoubleSide}
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>

        {/* Danger zone indicator (inner radius) */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0, radius, 32]} />
          <meshBasicMaterial
            color="#ff4444"
            transparent
            opacity={opacity * 0.3}
            depthWrite={false}
          />
        </mesh>

        {/* Pull zone indicator (outer radius) */}
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius, pullRadius, 32]} />
          <meshBasicMaterial
            color="#ffaa44"
            transparent
            opacity={opacity * 0.15}
            depthWrite={false}
          />
        </mesh>

        {/* Bubbles */}
        <points ref={bubblesRef} geometry={bubbleGeometry}>
          <pointsMaterial
            color="#ffffff"
            size={0.1}
            transparent
            opacity={opacity * 0.6}
            sizeAttenuation
            depthWrite={false}
          />
        </points>

        {/* Center vortex glow */}
        <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[radius * 0.5, 16]} />
          <meshBasicMaterial
            color="#002244"
            transparent
            opacity={opacity * 0.5}
          />
        </mesh>
      </group>

      {/* Safe channel indicators */}
      <SafeChannelIndicators
        centerX={0}
        riverWidth={riverWidth}
        pullRadius={pullRadius}
        safeChannelWidth={safeChannelWidth}
        opacity={opacity}
      />
    </group>
  );
}

// ============================================================================
// Helper Components
// ============================================================================

/**
 * Create spiral geometry for whirlpool surface
 */
function createSpiralGeometry(
  innerRadius: number,
  outerRadius: number,
  segments: number,
  rings: number
): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();

  const vertices: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  // Create concentric rings with spiral pattern
  for (let ring = 0; ring <= rings; ring++) {
    const t = ring / rings;
    const radius = innerRadius + (outerRadius - innerRadius) * t;

    for (let seg = 0; seg <= segments; seg++) {
      const angle = (seg / segments) * Math.PI * 2;
      // Add spiral twist that increases toward center
      const spiralTwist = (1 - t) * Math.PI * 2;

      const x = Math.cos(angle + spiralTwist) * radius;
      const z = Math.sin(angle + spiralTwist) * radius;
      // Depression in center
      const y = -0.3 * (1 - t * t);

      vertices.push(x, y, z);
      uvs.push(seg / segments, t);

      // Create triangles
      if (ring < rings && seg < segments) {
        const current = ring * (segments + 1) + seg;
        const next = (ring + 1) * (segments + 1) + seg;

        indices.push(current, next, current + 1);
        indices.push(current + 1, next, next + 1);
      }
    }
  }

  geometry.setIndex(indices);
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.computeVertexNormals();

  return geometry;
}

/**
 * Safe channel indicators on the sides of the whirlpool
 */
function SafeChannelIndicators({
  centerX,
  riverWidth,
  pullRadius,
  safeChannelWidth,
  opacity,
}: {
  centerX: number;
  riverWidth: number;
  pullRadius: number;
  safeChannelWidth: number;
  opacity: number;
}) {
  const halfRiver = riverWidth / 2;
  const leftChannelCenter = centerX - pullRadius - safeChannelWidth / 2;
  const rightChannelCenter = centerX + pullRadius + safeChannelWidth / 2;

  // Only show if channels fit within river bounds
  const showLeft = leftChannelCenter - safeChannelWidth / 2 >= -halfRiver;
  const showRight = rightChannelCenter + safeChannelWidth / 2 <= halfRiver;

  return (
    <>
      {/* Left safe channel */}
      {showLeft && (
        <group position={[leftChannelCenter, 0.03, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[safeChannelWidth, pullRadius * 3]} />
            <meshBasicMaterial
              color="#44ff88"
              transparent
              opacity={opacity * 0.2}
              depthWrite={false}
            />
          </mesh>
          {/* Arrow indicator */}
          <mesh position={[0, 0.1, -pullRadius]} rotation={[0, 0, 0]}>
            <coneGeometry args={[0.3, 0.5, 8]} />
            <meshBasicMaterial
              color="#44ff88"
              transparent
              opacity={opacity * 0.6}
            />
          </mesh>
        </group>
      )}

      {/* Right safe channel */}
      {showRight && (
        <group position={[rightChannelCenter, 0.03, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[safeChannelWidth, pullRadius * 3]} />
            <meshBasicMaterial
              color="#44ff88"
              transparent
              opacity={opacity * 0.2}
              depthWrite={false}
            />
          </mesh>
          {/* Arrow indicator */}
          <mesh position={[0, 0.1, -pullRadius]} rotation={[0, 0, 0]}>
            <coneGeometry args={[0.3, 0.5, 8]} />
            <meshBasicMaterial
              color="#44ff88"
              transparent
              opacity={opacity * 0.6}
            />
          </mesh>
        </group>
      )}
    </>
  );
}

export default WhirlpoolEffect;
