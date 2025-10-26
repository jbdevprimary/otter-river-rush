import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { Mesh } from 'three';
import { useGameStore } from '../../hooks/useGameStore';

/**
 * Gem Component - Rare collectible
 * Awards bonus points and increases gem count
 */

interface GemProps {
  initialPosition: [number, number, number];
  color?: 'blue' | 'red';
  value?: number;
  onCollect?: () => void;
  onOffScreen?: () => void;
}

export function Gem({
  initialPosition,
  color = 'blue',
  value = 1,
  onCollect,
  onOffScreen,
}: GemProps): React.JSX.Element | null {
  const meshRef = useRef<Mesh>(null);
  const { status, collectGem } = useGameStore();
  const [position, setPosition] = useState(initialPosition);
  const [collected, setCollected] = useState(false);

  const texture = useTexture(`/sprites/gem-${color}.png`);
  const scrollSpeed = 5;

  useFrame((state, delta) => {
    if (!meshRef.current || status !== 'playing' || collected) return;

    // Scroll down
    const newY = position[1] - scrollSpeed * delta;
    setPosition([position[0], newY, position[2]]);
    meshRef.current.position.y = newY;

    // Sparkle animation - rotate and scale
    meshRef.current.rotation.z += delta * 4;
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 5) * 0.1;
    meshRef.current.scale.setScalar(pulse);

    // Check if off-screen
    if (newY < -10) {
      onOffScreen?.();
    }

    // Simple collision detection
    const distance = Math.sqrt(
      Math.pow(position[0], 2) + Math.pow(newY + 3, 2)
    );

    if (distance < 0.8 && !collected) {
      setCollected(true);
      collectGem(value);
      onCollect?.();
    }
  });

  if (collected) return null;

  return (
    <mesh ref={meshRef} position={position}>
      <planeGeometry args={[0.6, 0.6]} />
      <meshBasicMaterial map={texture} transparent />
    </mesh>
  );
}
