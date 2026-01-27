/**
 * Game Canvas Component
 * Main React Three Fiber canvas wrapper
 *
 * Coordinate System (Three.js Y-up):
 * - X: left/right (lanes)
 * - Y: up/down (height)
 * - Z: forward/back (depth into screen)
 *
 * Game Coordinate Transform: Game (x, y, z) -> Three.js (x, z, y)
 * - Game X (lanes) -> Three.js X
 * - Game Y (forward/depth) -> Three.js Z
 * - Game Z (height) -> Three.js Y
 */

import { Canvas, type RootState } from '@react-three/fiber';
import type { ReactNode } from 'react';
import { Suspense } from 'react';
import * as THREE from 'three';
import { VISUAL } from '../../../game/config';

export interface GameCanvasProps {
  children?: ReactNode;
  onCreated?: (state: RootState) => void;
}

/**
 * Loading fallback shown while assets load
 */
function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#4a5568" wireframe />
    </mesh>
  );
}

export function GameCanvas({ children, onCreated }: GameCanvasProps) {
  const handleCreated = (state: RootState) => {
    // Set background color
    state.scene.background = new THREE.Color(VISUAL.colors.background);

    // Set fog
    state.scene.fog = new THREE.Fog(VISUAL.fog.color, VISUAL.fog.near, VISUAL.fog.far);

    // Call user callback
    onCreated?.(state);
  };

  return (
    <Canvas
      shadows
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      }}
      dpr={[1, 2]}
      camera={{
        position: [
          VISUAL.camera.position.x,
          VISUAL.camera.position.z, // Game Z -> Three.js Y (height)
          VISUAL.camera.position.y, // Game Y -> Three.js Z (depth, looking forward)
        ],
        fov: VISUAL.camera.fov,
        near: VISUAL.camera.near,
        far: VISUAL.camera.far,
      }}
      onCreated={handleCreated}
    >
      <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
    </Canvas>
  );
}
