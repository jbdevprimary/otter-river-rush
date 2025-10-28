import React, { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrthographicCamera, Stats } from '@react-three/drei';
import { Suspense } from 'react';
import { useGameStore } from '../../hooks/useGameStore';
import { EntityRenderer } from './EntityRenderer';
import { GameSystems } from '../../ecs/systems';
import { InputSystem } from '../../ecs/input-system';
import { spawn, queries } from '../../ecs/world';
import { River } from './River';
import { LaneMarkers } from './LaneMarkers';
import { CameraSystem } from '../../ecs/camera-system';
import { ScoreSystem } from '../../ecs/score-system';
import { PowerUpSystem } from '../../ecs/power-up-system';
import { TouchInputSystem } from '../../ecs/touch-input-system';
import { BiomeSystem } from '../../ecs/biome-system';
import { DifficultySystem } from '../../ecs/difficulty-system';
import { AchievementSystem } from '../../ecs/achievement-system';
import { ComboSystem } from '../../ecs/combo-system';
import { MagnetSystem } from '../../ecs/magnet-system';
import { NearMissSystem } from '../../ecs/near-miss-system';
import { ShieldEffectSystem } from '../../ecs/shield-effect-system';
import { WeatherSystem } from '../../ecs/weather-system';
import { QuestSystem } from '../../ecs/quest-system';
import { LeaderboardSystem } from '../../ecs/leaderboard-system';
import { EnemySystem } from '../../ecs/enemy-system';
import { VisualEffects } from './VisualEffects';
import { Skybox } from './Skybox';
import { VISUAL } from '../../config/visual-constants';

interface GameCanvasProps {
  showStats?: boolean;
}

export function GameCanvas({ showStats = false }: GameCanvasProps): React.JSX.Element {
  const { status } = useGameStore();
  
  // Initialize player when game starts
  useEffect(() => {
    if (status === 'playing') {
      if (queries.player.entities.length === 0) {
        spawn.otter(0);
      }
    }
  }, [status]);

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
        <OrthographicCamera
          makeDefault
          position={[VISUAL.camera.position.x, VISUAL.camera.position.y, VISUAL.camera.position.z]}
          zoom={VISUAL.camera.zoom}
          near={VISUAL.camera.near}
          far={VISUAL.camera.far}
        />

        <ambientLight intensity={VISUAL.lighting.ambient.intensity} color={VISUAL.lighting.ambient.color} />
        <directionalLight 
          position={VISUAL.lighting.directional.main.position} 
          intensity={VISUAL.lighting.directional.main.intensity} 
        />
        <directionalLight 
          position={VISUAL.lighting.directional.fill.position} 
          intensity={VISUAL.lighting.directional.fill.intensity} 
        />

        <Suspense fallback={null}>
          <Skybox />
          <River />
          <LaneMarkers />
          <fog attach="fog" args={[VISUAL.fog.color, VISUAL.fog.near, VISUAL.fog.far]} />
          
          <EntityRenderer />
          
          <GameSystems />
          <InputSystem />
          <TouchInputSystem />
          <CameraSystem />
          <ScoreSystem />
          <PowerUpSystem />
          <BiomeSystem />
          <DifficultySystem />
          <AchievementSystem />
          <ComboSystem />
          <MagnetSystem />
          <NearMissSystem />
          <ShieldEffectSystem />
          <WeatherSystem />
          <QuestSystem />
          <LeaderboardSystem />
          <EnemySystem />
        </Suspense>

        <VisualEffects />
        {showStats && <Stats />}
      </Canvas>
    </div>
  );
}
