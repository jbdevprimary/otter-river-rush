/**
 * useCarouselRotation Hook
 * Animation state management for the character carousel
 *
 * Handles circular rotation with smooth animations and exposes
 * methods for swipe/arrow handlers.
 */

import { useCallback, useRef, useState } from 'react';

export interface CarouselRotationState {
  /** Current visible index */
  currentIndex: number;
  /** Target index during animation */
  targetIndex: number;
  /** Whether animation is in progress */
  isAnimating: boolean;
  /** Animation progress from 0 to 1 */
  rotationProgress: number;
  /** Direction of rotation: 1 = right, -1 = left, 0 = none */
  direction: -1 | 0 | 1;
}

export interface UseCarouselRotationResult {
  state: CarouselRotationState;
  /** Rotate carousel to the left (previous character) */
  rotateLeft: () => void;
  /** Rotate carousel to the right (next character) */
  rotateRight: () => void;
  /** Jump directly to a specific index */
  jumpTo: (index: number) => void;
  /** Update animation progress (call from useFrame) */
  updateProgress: (delta: number) => void;
}

/** Animation duration in seconds */
const ANIMATION_DURATION = 0.3;

/**
 * Hook for managing carousel rotation state and animations
 * @param totalCount - Total number of items in the carousel
 * @param initialIndex - Starting index (default: 0)
 */
export function useCarouselRotation(
  totalCount: number,
  initialIndex = 0
): UseCarouselRotationResult {
  const [state, setState] = useState<CarouselRotationState>({
    currentIndex: initialIndex,
    targetIndex: initialIndex,
    isAnimating: false,
    rotationProgress: 0,
    direction: 0,
  });

  // Track animation start time for progress calculation
  const animationStartTime = useRef<number | null>(null);

  /**
   * Wrap index to handle circular rotation
   */
  const wrapIndex = useCallback(
    (index: number): number => {
      if (totalCount === 0) return 0;
      return ((index % totalCount) + totalCount) % totalCount;
    },
    [totalCount]
  );

  /**
   * Start rotation animation in a direction
   */
  const startRotation = useCallback(
    (direction: -1 | 1) => {
      if (state.isAnimating || totalCount < 2) return;

      const newTarget = wrapIndex(state.currentIndex + direction);

      setState((prev) => ({
        ...prev,
        targetIndex: newTarget,
        isAnimating: true,
        rotationProgress: 0,
        direction,
      }));

      animationStartTime.current = performance.now() / 1000;
    },
    [state.isAnimating, state.currentIndex, totalCount, wrapIndex]
  );

  /**
   * Rotate carousel to the left (previous character)
   */
  const rotateLeft = useCallback(() => {
    startRotation(-1);
  }, [startRotation]);

  /**
   * Rotate carousel to the right (next character)
   */
  const rotateRight = useCallback(() => {
    startRotation(1);
  }, [startRotation]);

  /**
   * Jump directly to a specific index (no animation)
   */
  const jumpTo = useCallback(
    (index: number) => {
      const wrappedIndex = wrapIndex(index);
      setState({
        currentIndex: wrappedIndex,
        targetIndex: wrappedIndex,
        isAnimating: false,
        rotationProgress: 0,
        direction: 0,
      });
      animationStartTime.current = null;
    },
    [wrapIndex]
  );

  /**
   * Update animation progress (call this from useFrame)
   */
  const updateProgress = useCallback(
    (delta: number) => {
      if (!state.isAnimating) return;

      setState((prev) => {
        // Calculate new progress
        const newProgress = Math.min(prev.rotationProgress + delta / ANIMATION_DURATION, 1);

        // Animation complete
        if (newProgress >= 1) {
          return {
            currentIndex: prev.targetIndex,
            targetIndex: prev.targetIndex,
            isAnimating: false,
            rotationProgress: 0,
            direction: 0,
          };
        }

        return {
          ...prev,
          rotationProgress: newProgress,
        };
      });
    },
    [state.isAnimating]
  );

  return {
    state,
    rotateLeft,
    rotateRight,
    jumpTo,
    updateProgress,
  };
}
