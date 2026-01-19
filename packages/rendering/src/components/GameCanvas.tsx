/**
 * Game Canvas Component
 * Main Babylon.js canvas wrapper using Reactylon
 */

import { Scene as BabylonScene, Color3 } from '@babylonjs/core';
import { VISUAL } from '@otter-river-rush/config';
import type { ReactNode } from 'react';
import { Scene } from 'reactylon';
import { Engine } from 'reactylon/web';

export interface GameCanvasProps {
  children?: ReactNode;
  onSceneReady?: (scene: BabylonScene) => void;
}

export function GameCanvas({ children, onSceneReady }: GameCanvasProps) {
  const handleSceneReady = (scene: BabylonScene) => {
    // Set background color
    const bgColor = Color3.FromHexString(VISUAL.colors.background);
    scene.clearColor = bgColor.toColor4(1);

    // Set fog
    scene.fogMode = BabylonScene.FOGMODE_LINEAR;
    scene.fogColor = Color3.FromHexString(VISUAL.fog.color);
    scene.fogStart = VISUAL.fog.near;
    scene.fogEnd = VISUAL.fog.far;

    // Call user callback
    onSceneReady?.(scene);
  };

  return (
    <Engine engineOptions={{ antialias: true, adaptToDeviceRatio: true }}>
      <Scene onSceneReady={handleSceneReady}>{children}</Scene>
    </Engine>
  );
}
