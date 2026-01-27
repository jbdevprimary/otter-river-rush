/**
 * CharacterCarousel3D Component
 * Canvas wrapper for the 3D character carousel
 *
 * Provides:
 * - React Three Fiber Canvas with proper camera setup
 * - Carousel stage with characters
 * - Rotation animation management
 * - Responsive layout handling
 */

import type { OtterCharacter } from '../../game/config';
import { Canvas } from '@react-three/fiber';
import { Suspense, useCallback, useEffect } from 'react';
import * as THREE from 'three';
import { useCarouselRotation } from './useCarouselRotation';
import { CarouselAnimationController } from './CarouselAnimationController';
import { CarouselStage } from './CarouselStage';

export interface CharacterCarousel3DProps {
  /** Array of all otter characters */
  characters: OtterCharacter[];
  /** Currently selected character index */
  currentIndex: number;
  /** IDs of unlocked characters */
  unlockedIds: string[];
  /** Whether device is in portrait orientation */
  isPortrait: boolean;
  /** Callback when carousel rotates to new index */
  onRotate: (newIndex: number) => void;
  /** Optional: expose rotation controls to parent */
  onRotationControlsReady?: (controls: { rotateLeft: () => void; rotateRight: () => void }) => void;
}

/** Camera configuration */
const CAMERA_CONFIG = {
  position: [0, 2, 8] as [number, number, number],
  fov: 50,
  near: 0.1,
  far: 100,
};

/** Loading fallback */
function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshBasicMaterial color="#666666" wireframe />
    </mesh>
  );
}

export function CharacterCarousel3D({
  characters,
  currentIndex,
  unlockedIds,
  isPortrait,
  onRotate,
  onRotationControlsReady,
}: CharacterCarousel3DProps) {
  // Use carousel rotation hook for animation state
  const { state, rotateLeft, rotateRight, jumpTo, updateProgress } = useCarouselRotation(
    characters.length,
    currentIndex
  );

  // Sync external index changes
  useEffect(() => {
    if (currentIndex !== state.currentIndex && !state.isAnimating) {
      jumpTo(currentIndex);
    }
  }, [currentIndex, state.currentIndex, state.isAnimating, jumpTo]);

  // Notify parent when animation completes
  const handleAnimationComplete = useCallback(() => {
    if (state.targetIndex !== currentIndex) {
      onRotate(state.targetIndex);
    }
  }, [state.targetIndex, currentIndex, onRotate]);

  // Expose controls to parent
  useEffect(() => {
    onRotationControlsReady?.({ rotateLeft, rotateRight });
  }, [rotateLeft, rotateRight, onRotationControlsReady]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        rotateLeft();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        rotateRight();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [rotateLeft, rotateRight]);

  return (
    <Canvas
      shadows
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
      }}
      dpr={[1, 2]}
      camera={{
        position: CAMERA_CONFIG.position,
        fov: CAMERA_CONFIG.fov,
        near: CAMERA_CONFIG.near,
        far: CAMERA_CONFIG.far,
      }}
      onCreated={(state) => {
        // Set background to transparent for UI layering
        state.scene.background = null;
      }}
    >
      <Suspense fallback={<LoadingFallback />}>
        {/* Animation controller - updates progress via useFrame */}
        <CarouselAnimationController
          isAnimating={state.isAnimating}
          updateProgress={updateProgress}
        />

        {/* Carousel stage with characters */}
        <CarouselStage
          characters={characters}
          currentIndex={state.currentIndex}
          targetIndex={state.targetIndex}
          animationProgress={state.rotationProgress}
          animationDirection={state.direction}
          unlockedIds={unlockedIds}
          showSideOtters={!isPortrait}
          onAnimationComplete={handleAnimationComplete}
        />
      </Suspense>
    </Canvas>
  );
}

/**
 * Preload all character models
 */
CharacterCarousel3D.preloadModels = (characters: OtterCharacter[]) => {
  // This would use useGLTF.preload in a real scenario
  // but that needs to be called within a component or effect
  console.log(
    '[CharacterCarousel3D] Preloading models:',
    characters.map((c) => c.modelPath)
  );
};
