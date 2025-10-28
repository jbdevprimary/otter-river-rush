import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { Mesh } from 'three';
import { useGameStore } from '../../hooks/useGameStore';
import { getSpritePath } from '../../utils/assets';

/**
 * Coin Component - Collectible currency
 * Awards points and increases coin count
 */

interface CoinProps {
  initialPosition: [number, number, number];
  value?: number;
  onCollect?: () => void;
  onOffScreen?: () => void;
}

export function Coin({
  initialPosition,
  value = 1,
  onCollect,
  onOffScreen,
}: CoinProps): React.JSX.Element | null {
  const meshRef = useRef<Mesh>(null);
  const { status, collectCoin } = useGameStore();
  const [position, setPosition] = useState(initialPosition);
  const [collected, setCollected] = useState(false);

  const texture = useTexture(getSpritePath('coin.png'));
  const scrollSpeed = 5;

  useFrame((state, delta) => {
    if (!meshRef.current || status !== 'playing' || collected) return;

    // Scroll down
    const newY = position[1] - scrollSpeed * delta;
    setPosition([position[0], newY, position[2]]);
    meshRef.current.position.y = newY;

    // Rotate for visual effect
    meshRef.current.rotation.z += delta * 3;

    // Gentle floating animation
    const float = Math.sin(state.clock.elapsedTime * 3) * 0.05;
    meshRef.current.position.x = position[0] + float;

    // Check if off-screen
    if (newY < -10) {
      onOffScreen?.();
    }

    // Simple collision detection (will be improved)
    // Check distance to otter (assumed at [0, -3, 0])
    const distance = Math.sqrt(
      Math.pow(position[0], 2) + Math.pow(newY + 3, 2)
    );

    if (distance < 0.8 && !collected) {
      setCollected(true);
      collectCoin(value);
      onCollect?.();
    }
  });

  if (collected) return null;

  return (
    <mesh ref={meshRef} position={position}>
      <planeGeometry args={[0.5, 0.5]} />
      <meshBasicMaterial map={texture} transparent />
    </mesh>
  );
}
