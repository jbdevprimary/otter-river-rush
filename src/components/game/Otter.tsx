import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { Mesh } from 'three';
import { useGameStore } from '../../hooks/useGameStore';
import { useInput, useTouchInput } from '../../hooks/useInput';

/**
 * Enhanced Otter Component with Movement
 * Now responds to input and moves between lanes
 */

const LANES = [-2, 0, 2]; // Three lanes: left, center, right
const MOVE_SPEED = 8; // How fast otter switches lanes

export function Otter(): React.JSX.Element {
  const meshRef = useRef<Mesh>(null);
  const { status } = useGameStore();
  const [currentLane, setCurrentLane] = useState(1); // Start in center lane
  const [targetX, setTargetX] = useState(LANES[1]);

  const texture = useTexture('/sprites/otter.png');

  // Handle input
  const handleMove = (direction: 'left' | 'right'): void => {
    if (direction === 'left' && currentLane > 0) {
      const newLane = currentLane - 1;
      setCurrentLane(newLane);
      setTargetX(LANES[newLane]);
    } else if (direction === 'right' && currentLane < LANES.length - 1) {
      const newLane = currentLane + 1;
      setCurrentLane(newLane);
      setTargetX(LANES[newLane]);
    }
  };

  useInput({ onMove: handleMove, enabled: status === 'playing' });
  useTouchInput(handleMove);

  // Animation loop
  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Smooth lane movement (lerp to target position)
    const currentX = meshRef.current.position.x;
    const newX = currentX + (targetX - currentX) * MOVE_SPEED * delta;
    meshRef.current.position.x = newX;

    // Gentle bobbing animation
    if (status === 'playing') {
      const bob = Math.sin(state.clock.elapsedTime * 3) * 0.08;
      meshRef.current.position.y = -3 + bob;
    }

    // Tilt when moving
    const tilt = (targetX - currentX) * 0.3;
    meshRef.current.rotation.z = tilt;
  });

  return (
    <group>
      {/* Main otter sprite */}
      <mesh ref={meshRef} position={[0, -3, 0]}>
        <planeGeometry args={[1.2, 1.2]} />
        <meshBasicMaterial map={texture} transparent />
      </mesh>

      {/* Lane indicators (dev mode) */}
      {import.meta.env.DEV && (
        <>
          {LANES.map((x, i) => (
            <mesh key={i} position={[x, -4, -0.5]}>
              <planeGeometry args={[0.1, 8]} />
              <meshBasicMaterial
                color={i === currentLane ? '#3b82f6' : '#334155'}
                transparent
                opacity={0.3}
              />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}
