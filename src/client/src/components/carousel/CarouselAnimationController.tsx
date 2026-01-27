/**
 * CarouselAnimationController Component
 * Internal component that drives carousel animation via useFrame
 *
 * This is a headless component - it renders nothing but updates
 * the animation progress each frame when animating.
 */

import { useFrame } from '@react-three/fiber';

export interface CarouselAnimationControllerProps {
  /** Whether animation is currently in progress */
  isAnimating: boolean;
  /** Function to update animation progress, receives delta time */
  updateProgress: (delta: number) => void;
}

/**
 * Drives carousel animation updates via useFrame
 * Must be a child of the R3F Canvas to access useFrame
 */
export function CarouselAnimationController({
  isAnimating,
  updateProgress,
}: CarouselAnimationControllerProps) {
  useFrame((_, delta) => {
    if (isAnimating) {
      updateProgress(delta);
    }
  });

  // This component renders nothing - it's purely for animation logic
  return null;
}
