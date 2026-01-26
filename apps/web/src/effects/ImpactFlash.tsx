/**
 * Impact Flash Effect Component
 * Creates a brief red screen overlay when the player takes damage
 *
 * This is a 2D overlay rendered on top of the 3D scene
 */

import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';

export interface ImpactFlashRef {
  /** Trigger the impact flash effect */
  flash: () => void;
}

interface ImpactFlashProps {
  /** Flash duration in milliseconds */
  duration?: number;
  /** Flash color */
  color?: string;
  /** Maximum opacity */
  maxOpacity?: number;
  /** Whether to respect reduced motion preference */
  reducedMotion?: boolean;
}

export const ImpactFlash = forwardRef<ImpactFlashRef, ImpactFlashProps>(
  function ImpactFlash(
    {
      duration = 100,
      color = 'rgba(255, 50, 50, 0.4)',
      maxOpacity = 0.4,
      reducedMotion = false,
    },
    ref
  ) {
    const [isFlashing, setIsFlashing] = useState(false);
    const [opacity, setOpacity] = useState(0);

    // Expose flash method via ref
    useImperativeHandle(
      ref,
      () => ({
        flash: () => {
          if (reducedMotion) return;
          setIsFlashing(true);
          setOpacity(maxOpacity);
        },
      }),
      [maxOpacity, reducedMotion]
    );

    // Animate flash fade-out
    useEffect(() => {
      if (!isFlashing) return;

      const startTime = Date.now();
      let animationFrame: number;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const newOpacity = maxOpacity * (1 - progress);

        setOpacity(newOpacity);

        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate);
        } else {
          setIsFlashing(false);
          setOpacity(0);
        }
      };

      animationFrame = requestAnimationFrame(animate);

      return () => {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
      };
    }, [isFlashing, duration, maxOpacity]);

    if (reducedMotion || opacity <= 0) return null;

    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: color.replace(/[\d.]+\)$/, `${opacity})`),
          pointerEvents: 'none',
          zIndex: 1000,
          transition: 'none',
        }}
        aria-hidden="true"
      />
    );
  }
);
