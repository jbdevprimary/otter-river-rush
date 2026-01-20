/**
 * Main App Component
 * Otter River Rush Web Application - Babylon.js + Reactylon
 */

import type { Scene } from '@babylonjs/core';
import { Color3, DirectionalLight, FreeCamera, HemisphericLight, Vector3 } from '@babylonjs/core';
import {
  initAudio,
  playCoinPickup,
  playGemPickup,
  playHit,
  playMusic,
  stopMusic,
} from '@otter-river-rush/audio';
import { getCharacter, VISUAL } from '@otter-river-rush/config';
import {
  type CollisionHandlers,
  createInputState,
  createSpawnerState,
  setupKeyboardInput,
  spawn,
  updateAnimation,
  updateCleanup,
  updateCollision,
  updateMovement,
  updateParticles,
  updatePlayerInput,
  updateSpawner,
} from '@otter-river-rush/core';
import { EntityRenderer, GameCanvas, RiverEnvironment } from '@otter-river-rush/rendering';
import { useGameStore } from '@otter-river-rush/state';
import { BabylonCharacterSelect, HUD, Menu } from '@otter-river-rush/ui';
import { useEffect, useRef } from 'react';

export function App() {
  const status = useGameStore((state) => state.status);
  const sceneRef = useRef<Scene | null>(null);
  const spawnerStateRef = useRef(createSpawnerState());
  const inputStateRef = useRef(createInputState());
  const animationFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // Initialize scene with proper camera and lighting
  const handleSceneReady = (scene: Scene) => {
    sceneRef.current = scene;

    // Create camera - BEHIND the player, looking FORWARD down the river
    // Game coords: X=lanes, Y=forward/back (river flow), Z=height
    // Babylon coords: X=lateral, Y=height, Z=depth
    // Transform: Game (x, y, z) → Babylon (x, z, y)
    // Player at game Y=-3, obstacles spawn at game Y=8
    const camera = new FreeCamera(
      'camera',
      new Vector3(0, 4, -10), // Babylon: x=0, height=4 (elevated), z=-10 (behind player)
      scene
    );

    // Look forward down the river (toward where obstacles spawn)
    camera.setTarget(new Vector3(0, 0, 15)); // Babylon: x=0, height=0, z=15 (forward)

    // Lock camera controls for game
    camera.inputs.clear();

    // Create ambient light
    const ambientLight = new HemisphericLight('ambientLight', new Vector3(0, 1, 0), scene);
    ambientLight.intensity = VISUAL.lighting.ambient.intensity;
    ambientLight.diffuse = Color3.FromHexString(VISUAL.lighting.ambient.color);
    ambientLight.groundColor = new Color3(0.2, 0.2, 0.3);

    // Create main directional light (sun)
    const sunLight = new DirectionalLight('sunLight', new Vector3(-1, -2, 1).normalize(), scene);
    sunLight.intensity = VISUAL.lighting.directional.main.intensity;
    sunLight.diffuse = new Color3(1, 0.95, 0.8);

    // Create fill light
    const fillLight = new DirectionalLight('fillLight', new Vector3(1, 1, -1).normalize(), scene);
    fillLight.intensity = VISUAL.lighting.directional.fill.intensity;
    fillLight.diffuse = new Color3(0.6, 0.7, 0.9);

    // Initialize audio system
    initAudio(scene);

    // Start game loop
    startGameLoop();

    // Player will be spawned when game starts (see useEffect below)
  };

  // Game loop
  const startGameLoop = () => {
    const gameLoop = (time: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = time;
      }

      const deltaTime = (time - lastTimeRef.current) / 1000; // Convert to seconds
      lastTimeRef.current = time;

      const currentStatus = useGameStore.getState().status;

      // Run game systems only when playing
      if (currentStatus === 'playing') {
        updatePlayerInput(inputStateRef.current, deltaTime);
        updateMovement(deltaTime);
        updateAnimation(currentStatus);
        updateSpawner(spawnerStateRef.current, time, true);

        const handlers: CollisionHandlers = {
          onObstacleHit: () => {
            playHit();
          },
          onCollectCoin: (value) => {
            playCoinPickup();
            useGameStore.getState().collectCoin(value);
          },
          onCollectGem: (value) => {
            playGemPickup();
            useGameStore.getState().collectGem(value);
          },
          onGameOver: () => {
            stopMusic();
            useGameStore.getState().endGame();
          },
        };
        updateCollision(currentStatus, handlers);

        updateParticles(deltaTime * 1000);
        updateCleanup();

        // Update distance (score progression)
        useGameStore.getState().updateDistance(deltaTime * VISUAL.camera.zoom * 0.5);
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  };

  // Setup input on mount
  useEffect(() => {
    const cleanup = setupKeyboardInput(inputStateRef.current);

    return () => {
      cleanup();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Spawn player when game starts with selected character
  useEffect(() => {
    if (status === 'playing') {
      // Get selected character and spawn player
      const selectedCharId = useGameStore.getState().selectedCharacterId;
      const character = getCharacter(selectedCharId);
      spawn.otter(0, character);
    }
  }, [status]);

  // Handle music based on game status
  useEffect(() => {
    if (status === 'playing') {
      // Start gameplay music when game starts
      playMusic('gameplay');
    } else if (status === 'game_over') {
      // Stop music is handled in onGameOver handler
      // Could play game over jingle here
      playMusic('gameOver', false); // Don't loop game over music
    } else if (status === 'menu') {
      // Could play menu ambient music
      playMusic('ambient');
    }
  }, [status]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <GameCanvas onSceneReady={handleSceneReady}>
        {/* 3D Environment */}
        <RiverEnvironment biome="forest" />

        {/* Entity renderer for player, obstacles, collectibles */}
        <EntityRenderer />

        {/* Babylon.js GUI based on game status */}
        {status === 'playing' && <HUD />}
        {status === 'menu' && <Menu type="menu" />}
        {status === 'character_select' && <BabylonCharacterSelect />}
        {status === 'game_over' && <Menu type="game_over" />}
      </GameCanvas>
    </div>
  );
}
