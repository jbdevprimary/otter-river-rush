import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { Mesh } from 'three';
import { useGameStore } from '../../hooks/useGameStore';
import { getSpritePath } from '../../utils/assets';

/**
 * Rock Component - Obstacle entity
 * Scrolls down the river, damages player on collision
 */

interface RockProps {
  initialPosition: [number, number, number];
  variant?: 1 | 2 | 3;
  onOffScreen?: () => void;
}

export function Rock({
  initialPosition,
  variant = 1,
  onOffScreen,
}: RockProps): React.JSX.Element {
  const meshRef = useRef<Mesh>(null);
  const { status } = useGameStore();
  const [position, setPosition] = useState(initialPosition);

  // Load rock texture based on variant
  const texture = useTexture(getSpritePath(`rock-${variant}.png`));

  // Scroll speed (meters per second)
  const scrollSpeed = 5;

  useFrame((state, delta) => {
    if (!meshRef.current || status !== 'playing') return;

    // Move rock downward (scrolling effect)
    const newY = position[1] - scrollSpeed * delta;
    setPosition([position[0], newY, position[2]]);
    meshRef.current.position.y = newY;

    // Check if off-screen
    if (newY < -10) {
      onOffScreen?.();
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <planeGeometry args={[0.8, 0.8]} />
      <meshBasicMaterial map={texture} transparent />
    </mesh>
  );
}
