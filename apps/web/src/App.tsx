/**
 * Main App Component
 * Otter River Rush Web Application
 */

import { useEffect, useRef } from 'react';
import { GameCanvas, EntityRenderer } from '@otter-river-rush/rendering';
import { HUD } from '@otter-river-rush/ui';
import { useGameStore } from '@otter-river-rush/state';
import {
  spawn,
  updateMovement,
  updateCollision,
  updateSpawner,
  updateCleanup,
  updateAnimation,
  updateParticles,
  createSpawnerState,
  setupKeyboardInput,
  updatePlayerInput,
  createInputState,
  type CollisionHandlers,
} from '@otter-river-rush/core';
import type { Scene } from '@babylonjs/core';
import { ArcRotateCamera, Vector3, HemisphericLight } from '@babylonjs/core';
import { VISUAL } from '@otter-river-rush/config';

export function App() {
  const status = useGameStore((state) => state.status);
  const sceneRef = useRef<Scene | null>(null);
  const spawnerStateRef = useRef(createSpawnerState());
  const inputStateRef = useRef(createInputState());
  const animationFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // Initialize scene
  const handleSceneReady = (scene: Scene) => {
    sceneRef.current = scene;

    // Create camera
    const camera = new ArcRotateCamera(
      'camera',
      0,
      Math.PI / 3,
      15,
      Vector3.Zero(),
      scene
    );
    camera.attachControl(scene.getEngine().getRenderingCanvas(), true);
    camera.lowerRadiusLimit = 10;
    camera.upperRadiusLimit = 20;

    // Create lights
    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = VISUAL.lighting.ambient.intensity;

    // Start game loop
    startGameLoop();

    // Spawn player
    spawn.otter(0);
  };

  // Game loop
  const startGameLoop = () => {
    const gameLoop = (time: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = time;
      }

      const deltaTime = (time - lastTimeRef.current) / 1000; // Convert to seconds
      lastTimeRef.current = time;

      // Run systems
      updatePlayerInput(inputStateRef.current, deltaTime);
      updateMovement(deltaTime);
      updateAnimation(status);
      updateSpawner(spawnerStateRef.current, time, status === 'playing');

      const handlers: CollisionHandlers = {
        onObstacleHit: () => {
          // Handle obstacle hit (play sound, etc.)
        },
        onCollectCoin: (value) => {
          useGameStore.getState().collectCoin(value);
        },
        onCollectGem: (value) => {
          useGameStore.getState().collectGem(value);
        },
        onGameOver: () => {
          useGameStore.getState().endGame();
        },
      };
      updateCollision(status, handlers);

      updateParticles(deltaTime * 1000); // Convert to milliseconds
      updateCleanup();

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  };

  // Setup input and start game on mount
  useEffect(() => {
    const cleanup = setupKeyboardInput(inputStateRef.current);
    useGameStore.getState().startGame('classic');

    return () => {
      cleanup();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <GameCanvas onSceneReady={handleSceneReady}>
        <EntityRenderer />
      </GameCanvas>
      {status === 'playing' && <HUD />}
      {status === 'menu' && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: 'white',
          fontSize: '48px',
          fontFamily: 'monospace',
        }}>
          <h1>Otter River Rush</h1>
          <button
            onClick={() => useGameStore.getState().startGame('classic')}
            style={{
              marginTop: '20px',
              padding: '15px 30px',
              fontSize: '24px',
              cursor: 'pointer',
            }}
          >
            Start Game
          </button>
        </div>
      )}
      {status === 'game_over' && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: 'white',
          fontSize: '48px',
          fontFamily: 'monospace',
        }}>
          <h1>Game Over</h1>
          <div style={{ fontSize: '24px', marginTop: '20px' }}>
            Score: {useGameStore.getState().score}
          </div>
          <button
            onClick={() => useGameStore.getState().returnToMenu()}
            style={{
              marginTop: '20px',
              padding: '15px 30px',
              fontSize: '24px',
              cursor: 'pointer',
            }}
          >
            Return to Menu
          </button>
        </div>
      )}
    </div>
  );
}
