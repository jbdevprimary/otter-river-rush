import React, { useState, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrthographicCamera, Stats } from '@react-three/drei';
import { Suspense } from 'react';
import { Otter } from './Otter';
import { Background } from './Background';
import { Rock } from './Rock';
import { Coin } from './Coin';
import { Gem } from './Gem';
import { useGameStore } from '../../hooks/useGameStore';

/**
 * Enhanced GameCanvas with entity spawning
 * Spawns rocks, coins, and gems during gameplay
 */

interface GameCanvasProps {
  showStats?: boolean;
}

interface Entity {
  id: number;
  type: 'rock' | 'coin' | 'gem';
  position: [number, number, number];
  variant?: number;
}

export function GameCanvas({
  showStats = false,
}: GameCanvasProps): React.JSX.Element {
  const { status } = useGameStore();
  const [entities, setEntities] = useState<Entity[]>([]);
  const [nextId, setNextId] = useState(0);

  // Spawn entities periodically
  const spawnEntity = useCallback(() => {
    if (status !== 'playing') return;

    const lanes = [-2, 0, 2];
    const randomLane = lanes[Math.floor(Math.random() * lanes.length)];
    const type = Math.random();

    let newEntity: Entity;

    if (type < 0.5) {
      // 50% rocks
      newEntity = {
        id: nextId,
        type: 'rock',
        position: [randomLane, 8, 0],
        variant: Math.floor(Math.random() * 3) + 1,
      };
    } else if (type < 0.85) {
      // 35% coins
      newEntity = {
        id: nextId,
        type: 'coin',
        position: [randomLane, 8, 0.1],
      };
    } else {
      // 15% gems
      newEntity = {
        id: nextId,
        type: 'gem',
        position: [randomLane, 8, 0.1],
        variant: Math.random() > 0.7 ? 2 : 1, // Mostly blue, some red
      };
    }

    setEntities((prev) => [...prev, newEntity]);
    setNextId((prev) => prev + 1);
  }, [status, nextId]);

  // Remove entity when off-screen
  const removeEntity = useCallback((id: number) => {
    setEntities((prev) => prev.filter((e) => e.id !== id));
  }, []);

  // Simple spawning system (will be improved)
  useEffect(() => {
    const interval = window.setInterval(() => {
      if (status === 'playing') {
        spawnEntity();
      }
    }, 1500); // Spawn every 1.5 seconds

    return () => window.clearInterval(interval);
  }, [status, spawnEntity]);

  return (
    <div className="fixed inset-0 w-screen h-screen">
      <Canvas
        className="w-full h-full"
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
      >
        {/* Camera setup */}
        <OrthographicCamera
          makeDefault
          position={[0, 0, 10]}
          zoom={0.8}
          near={0.1}
          far={1000}
        />

        {/* Lighting */}
        <ambientLight intensity={0.9} />
        <directionalLight position={[10, 10, 5]} intensity={0.6} />

        {/* Game content */}
        <Suspense fallback={null}>
          <Background />
          <Otter />

          {/* Render spawned entities */}
          {entities.map((entity) => {
            switch (entity.type) {
              case 'rock':
                return (
                  <Rock
                    key={entity.id}
                    initialPosition={entity.position}
                    variant={entity.variant as 1 | 2 | 3}
                    onOffScreen={() => removeEntity(entity.id)}
                  />
                );
              case 'coin':
                return (
                  <Coin
                    key={entity.id}
                    initialPosition={entity.position}
                    onCollect={() => removeEntity(entity.id)}
                    onOffScreen={() => removeEntity(entity.id)}
                  />
                );
              case 'gem':
                return (
                  <Gem
                    key={entity.id}
                    initialPosition={entity.position}
                    color={entity.variant === 2 ? 'red' : 'blue'}
                    onCollect={() => removeEntity(entity.id)}
                    onOffScreen={() => removeEntity(entity.id)}
                  />
                );
            }
          })}
        </Suspense>

        {/* Performance stats (dev mode) */}
        {showStats && <Stats />}
      </Canvas>
    </div>
  );
}
