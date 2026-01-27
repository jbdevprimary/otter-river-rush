/**
 * Fork Indicator Component
 * Visual indicator showing upcoming river forks with branch hints
 * Displays icons for safe vs risky paths and difficulty indicators
 */

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ============================================================================
// Types
// ============================================================================

interface ForkIndicatorProps {
  /** Distance to the upcoming fork */
  distanceToFork: number;
  /** Which side is the safe path */
  safeSide: 'left' | 'right';
  /** Player's current choice (if committed) */
  currentChoice?: 'left' | 'right' | 'undecided';
  /** Position to render the indicator */
  position: [number, number, number];
  /** Whether to show the indicator */
  visible?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const INDICATOR_COLORS = {
  safe: '#4ade80', // Green for safe path
  risky: '#f87171', // Red for risky path
  neutral: '#94a3b8', // Gray for undecided
  warning: '#fbbf24', // Yellow for fork warning
};

const PULSE_SPEED = 2;
const FLOAT_SPEED = 1.5;
const FLOAT_AMPLITUDE = 0.2;

// ============================================================================
// Main Component
// ============================================================================

export function ForkIndicator({
  distanceToFork,
  safeSide,
  currentChoice = 'undecided',
  position,
  visible = true,
}: ForkIndicatorProps) {
  const groupRef = useRef<THREE.Group>(null);
  const leftArrowRef = useRef<THREE.Mesh>(null);
  const rightArrowRef = useRef<THREE.Mesh>(null);
  const warningRef = useRef<THREE.Mesh>(null);

  // Calculate opacity based on distance (fade in as player approaches)
  const opacity = useMemo(() => {
    if (distanceToFork > 80) return 0;
    if (distanceToFork > 60) return (80 - distanceToFork) / 20;
    return 1;
  }, [distanceToFork]);

  // Determine arrow colors based on safe side and current choice
  const leftColor = useMemo(() => {
    if (currentChoice === 'left') return INDICATOR_COLORS.safe;
    if (currentChoice === 'right') return INDICATOR_COLORS.neutral;
    return safeSide === 'left' ? INDICATOR_COLORS.safe : INDICATOR_COLORS.risky;
  }, [safeSide, currentChoice]);

  const rightColor = useMemo(() => {
    if (currentChoice === 'right') return INDICATOR_COLORS.safe;
    if (currentChoice === 'left') return INDICATOR_COLORS.neutral;
    return safeSide === 'right' ? INDICATOR_COLORS.safe : INDICATOR_COLORS.risky;
  }, [safeSide, currentChoice]);

  // Animate the indicator
  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (groupRef.current) {
      // Float up and down
      groupRef.current.position.y = position[1] + Math.sin(time * FLOAT_SPEED) * FLOAT_AMPLITUDE;
    }

    // Pulse the arrows
    if (leftArrowRef.current && currentChoice === 'undecided') {
      const scale = 1 + Math.sin(time * PULSE_SPEED) * 0.1;
      leftArrowRef.current.scale.setScalar(scale);
    }

    if (rightArrowRef.current && currentChoice === 'undecided') {
      const scale = 1 + Math.sin(time * PULSE_SPEED + Math.PI) * 0.1;
      rightArrowRef.current.scale.setScalar(scale);
    }

    // Rotate warning icon
    if (warningRef.current) {
      warningRef.current.rotation.y = time * 0.5;
    }
  });

  if (!visible || opacity === 0) return null;

  return (
    <group ref={groupRef} position={position}>
      {/* Warning icon above */}
      <mesh ref={warningRef} position={[0, 1.5, 0]}>
        <octahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial
          color={INDICATOR_COLORS.warning}
          emissive={INDICATOR_COLORS.warning}
          emissiveIntensity={0.5}
          transparent
          opacity={opacity}
        />
      </mesh>

      {/* Fork symbol */}
      <ForkSymbol position={[0, 0.8, 0]} opacity={opacity} />

      {/* Left arrow */}
      <group position={[-1.5, 0, 0]}>
        <mesh ref={leftArrowRef}>
          <ArrowGeometry direction="left" />
          <meshStandardMaterial
            color={leftColor}
            emissive={leftColor}
            emissiveIntensity={currentChoice === 'left' ? 0.8 : 0.3}
            transparent
            opacity={opacity * (currentChoice === 'right' ? 0.3 : 1)}
          />
        </mesh>
        {/* Safe/Risky label */}
        <BranchLabel
          position={[0, -0.8, 0]}
          text={safeSide === 'left' ? 'SAFE' : 'RISK'}
          color={leftColor}
          opacity={opacity}
        />
      </group>

      {/* Right arrow */}
      <group position={[1.5, 0, 0]}>
        <mesh ref={rightArrowRef}>
          <ArrowGeometry direction="right" />
          <meshStandardMaterial
            color={rightColor}
            emissive={rightColor}
            emissiveIntensity={currentChoice === 'right' ? 0.8 : 0.3}
            transparent
            opacity={opacity * (currentChoice === 'left' ? 0.3 : 1)}
          />
        </mesh>
        {/* Safe/Risky label */}
        <BranchLabel
          position={[0, -0.8, 0]}
          text={safeSide === 'right' ? 'SAFE' : 'RISK'}
          color={rightColor}
          opacity={opacity}
        />
      </group>

      {/* Distance indicator */}
      <DistanceBar
        position={[0, -1.5, 0]}
        distance={distanceToFork}
        opacity={opacity}
      />
    </group>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

/**
 * Arrow geometry pointing left or right
 */
function ArrowGeometry({ direction }: { direction: 'left' | 'right' }) {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    const flip = direction === 'left' ? -1 : 1;

    // Arrow shape
    s.moveTo(0, 0.4);
    s.lineTo(0.5 * flip, 0);
    s.lineTo(0.2 * flip, 0);
    s.lineTo(0.2 * flip, -0.4);
    s.lineTo(-0.2 * flip, -0.4);
    s.lineTo(-0.2 * flip, 0);
    s.lineTo(-0.5 * flip, 0);
    s.closePath();

    return s;
  }, [direction]);

  return (
    <shapeGeometry args={[shape]} />
  );
}

/**
 * Fork symbol (Y shape)
 */
function ForkSymbol({ position, opacity }: { position: [number, number, number]; opacity: number }) {
  return (
    <group position={position}>
      {/* Main stem */}
      <mesh position={[0, -0.3, 0]}>
        <boxGeometry args={[0.1, 0.4, 0.05]} />
        <meshStandardMaterial
          color={INDICATOR_COLORS.warning}
          transparent
          opacity={opacity}
        />
      </mesh>
      {/* Left branch */}
      <mesh position={[-0.15, 0.1, 0]} rotation={[0, 0, Math.PI / 6]}>
        <boxGeometry args={[0.1, 0.35, 0.05]} />
        <meshStandardMaterial
          color={INDICATOR_COLORS.warning}
          transparent
          opacity={opacity}
        />
      </mesh>
      {/* Right branch */}
      <mesh position={[0.15, 0.1, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <boxGeometry args={[0.1, 0.35, 0.05]} />
        <meshStandardMaterial
          color={INDICATOR_COLORS.warning}
          transparent
          opacity={opacity}
        />
      </mesh>
    </group>
  );
}

/**
 * Branch label (SAFE/RISK text placeholder - uses simple geometry)
 */
function BranchLabel({
  position,
  text,
  color,
  opacity,
}: {
  position: [number, number, number];
  text: string;
  color: string;
  opacity: number;
}) {
  // Simple visual indicator instead of text (text would require font loading)
  const isSafe = text === 'SAFE';

  return (
    <group position={position}>
      {isSafe ? (
        // Checkmark for safe
        <mesh>
          <torusGeometry args={[0.2, 0.05, 8, 16]} />
          <meshStandardMaterial color={color} transparent opacity={opacity * 0.8} />
        </mesh>
      ) : (
        // Exclamation for risky
        <group>
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[0.08, 0.25, 0.05]} />
            <meshStandardMaterial color={color} transparent opacity={opacity * 0.8} />
          </mesh>
          <mesh position={[0, -0.15, 0]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial color={color} transparent opacity={opacity * 0.8} />
          </mesh>
        </group>
      )}
    </group>
  );
}

/**
 * Distance progress bar
 */
function DistanceBar({
  position,
  distance,
  opacity,
}: {
  position: [number, number, number];
  distance: number;
  opacity: number;
}) {
  // Progress from 0 to 1 (0 = 80m away, 1 = at fork)
  const progress = Math.max(0, Math.min(1, 1 - distance / 80));

  return (
    <group position={position}>
      {/* Background bar */}
      <mesh>
        <boxGeometry args={[2, 0.1, 0.02]} />
        <meshBasicMaterial color="#374151" transparent opacity={opacity * 0.5} />
      </mesh>
      {/* Progress fill */}
      <mesh position={[(progress - 1) * 1, 0, 0.01]}>
        <boxGeometry args={[2 * progress, 0.1, 0.02]} />
        <meshBasicMaterial
          color={progress > 0.7 ? INDICATOR_COLORS.warning : INDICATOR_COLORS.safe}
          transparent
          opacity={opacity}
        />
      </mesh>
    </group>
  );
}

export default ForkIndicator;
