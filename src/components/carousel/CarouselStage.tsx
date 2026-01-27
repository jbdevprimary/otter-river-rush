/**
 * CarouselStage Component
 * Main 3D scene composition for the character carousel
 *
 * Positions and animates 3 otter characters:
 * - Center (selected): prominent, fully lit
 * - Back-left: smaller, dimmer, angled toward center
 * - Back-right: smaller, dimmer, angled toward center
 *
 * Handles smooth interpolation during carousel rotation.
 */

import type { OtterCharacter } from '../../game/config';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { CarouselLighting } from './CarouselLighting';
import { OtterModelPreview } from './OtterModelPreview';
import { ProceduralPedestal } from './ProceduralPedestal';

export interface CarouselStageProps {
  /** Array of all otter characters */
  characters: OtterCharacter[];
  /** Currently selected character index */
  currentIndex: number;
  /** Target index during animation */
  targetIndex?: number;
  /** Animation progress 0-1 */
  animationProgress?: number;
  /** Direction of rotation: 1 = right, -1 = left */
  animationDirection?: -1 | 0 | 1;
  /** IDs of unlocked characters */
  unlockedIds: string[];
  /** Whether to show side otters (false in portrait mode) */
  showSideOtters: boolean;
  /** Callback when animation completes */
  onAnimationComplete?: () => void;
}

/** Position constants */
const POSITIONS = {
  center: [0, 0, 2] as [number, number, number],
  backLeft: [-3, 0, 0] as [number, number, number],
  backRight: [3, 0, 0] as [number, number, number],
};

/** Scale constants */
const SCALES = {
  center: 1.2,
  side: 0.9,
};

/** Rotation constants (in radians) */
const ROTATIONS = {
  center: [0, 0, 0] as [number, number, number],
  backLeft: [0, Math.PI / 6, 0] as [number, number, number], // 30deg toward center
  backRight: [0, -Math.PI / 6, 0] as [number, number, number], // -30deg toward center
};

/** Opacity constants */
const OPACITIES = {
  center: 1,
  side: 0.7,
};

/**
 * Easing function for smooth animations (ease-out-cubic)
 */
function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

/**
 * Interpolate between two positions
 */
function lerpPosition(
  from: [number, number, number],
  to: [number, number, number],
  t: number
): [number, number, number] {
  return [
    from[0] + (to[0] - from[0]) * t,
    from[1] + (to[1] - from[1]) * t,
    from[2] + (to[2] - from[2]) * t,
  ];
}

/**
 * Interpolate between two rotations
 */
function lerpRotation(
  from: [number, number, number],
  to: [number, number, number],
  t: number
): [number, number, number] {
  return [
    from[0] + (to[0] - from[0]) * t,
    from[1] + (to[1] - from[1]) * t,
    from[2] + (to[2] - from[2]) * t,
  ];
}

/**
 * Get character at wrapped index
 */
function getCharacterAtIndex(
  characters: OtterCharacter[],
  index: number
): OtterCharacter | undefined {
  if (characters.length === 0) return undefined;
  const wrappedIndex = ((index % characters.length) + characters.length) % characters.length;
  return characters[wrappedIndex];
}

/** Visible otter data structure */
interface VisibleOtter {
  character: OtterCharacter;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  opacity: number;
  isLocked: boolean;
  slot: 'center' | 'left' | 'right' | 'entering' | 'exiting';
}

/** Configuration for calculating otter state */
interface OtterStateConfig {
  isAnimating: boolean;
  animationDirection: -1 | 0 | 1;
  easedProgress: number;
  unlockedIds: string[];
}

/**
 * Calculate center otter state during animation
 */
function calculateCenterOtterState(
  centerChar: OtterCharacter,
  config: OtterStateConfig
): VisibleOtter {
  const { isAnimating, animationDirection, easedProgress, unlockedIds } = config;

  let position = POSITIONS.center;
  let rotation = ROTATIONS.center;
  let scale = SCALES.center;
  let opacity = OPACITIES.center;

  if (isAnimating && animationDirection !== 0) {
    const exitPosition = animationDirection > 0 ? POSITIONS.backLeft : POSITIONS.backRight;
    const exitRotation = animationDirection > 0 ? ROTATIONS.backLeft : ROTATIONS.backRight;

    position = lerpPosition(POSITIONS.center, exitPosition, easedProgress);
    rotation = lerpRotation(ROTATIONS.center, exitRotation, easedProgress);
    scale = SCALES.center + (SCALES.side - SCALES.center) * easedProgress;
    opacity = OPACITIES.center + (OPACITIES.side - OPACITIES.center) * easedProgress;
  }

  return {
    character: centerChar,
    position,
    rotation,
    scale,
    opacity,
    isLocked: !unlockedIds.includes(centerChar.id),
    slot: 'center',
  };
}

/**
 * Calculate entering otter state during animation
 */
function calculateEnteringOtterState(
  newCenterChar: OtterCharacter,
  config: OtterStateConfig
): VisibleOtter {
  const { animationDirection, easedProgress, unlockedIds } = config;

  const enterPosition = animationDirection > 0 ? POSITIONS.backRight : POSITIONS.backLeft;
  const enterRotation = animationDirection > 0 ? ROTATIONS.backRight : ROTATIONS.backLeft;

  return {
    character: newCenterChar,
    position: lerpPosition(enterPosition, POSITIONS.center, easedProgress),
    rotation: lerpRotation(enterRotation, ROTATIONS.center, easedProgress),
    scale: SCALES.side + (SCALES.center - SCALES.side) * easedProgress,
    opacity: OPACITIES.side + (OPACITIES.center - OPACITIES.side) * easedProgress,
    isLocked: !unlockedIds.includes(newCenterChar.id),
    slot: 'entering',
  };
}

/**
 * Calculate side otter state
 */
function calculateSideOtterState(
  sideChar: OtterCharacter,
  side: 'left' | 'right',
  config: OtterStateConfig
): VisibleOtter {
  const { isAnimating, animationDirection, easedProgress, unlockedIds } = config;
  const isLeft = side === 'left';

  let position = isLeft ? POSITIONS.backLeft : POSITIONS.backRight;
  const rotation = isLeft ? ROTATIONS.backLeft : ROTATIONS.backRight;
  const scale = SCALES.side;
  let opacity = OPACITIES.side;

  const shouldAnimate = isLeft
    ? isAnimating && animationDirection < 0
    : isAnimating && animationDirection > 0;

  if (shouldAnimate) {
    opacity = OPACITIES.side * (1 - easedProgress);
    const exitPos: [number, number, number] = isLeft ? [-5, 0, -2] : [5, 0, -2];
    position = lerpPosition(
      isLeft ? POSITIONS.backLeft : POSITIONS.backRight,
      exitPos,
      easedProgress
    );
  }

  return {
    character: sideChar,
    position,
    rotation,
    scale,
    opacity,
    isLocked: !unlockedIds.includes(sideChar.id),
    slot: side,
  };
}

/**
 * Add side characters to the otters array if conditions are met
 */
function addSideCharacters(
  otters: VisibleOtter[],
  characters: OtterCharacter[],
  currentIndex: number,
  centerChar: OtterCharacter | undefined,
  config: OtterStateConfig
): void {
  const enteringChar = otters.find((o) => o.slot === 'entering');
  const leftChar = getCharacterAtIndex(characters, currentIndex - 1);
  const rightChar = getCharacterAtIndex(characters, currentIndex + 1);

  // Add left side character
  const shouldAddLeft = leftChar && leftChar.id !== centerChar?.id;
  const leftNotEntering = !enteringChar || enteringChar.character.id !== leftChar?.id;
  if (shouldAddLeft && leftNotEntering) {
    otters.push(calculateSideOtterState(leftChar, 'left', config));
  }

  // Add right side character
  const shouldAddRight = rightChar && rightChar.id !== centerChar?.id;
  const rightNotEntering = !enteringChar || enteringChar.character.id !== rightChar?.id;
  if (shouldAddRight && rightNotEntering) {
    otters.push(calculateSideOtterState(rightChar, 'right', config));
  }
}

/**
 * Calculate all visible otters based on current state
 */
function calculateVisibleOtters(
  characters: OtterCharacter[],
  currentIndex: number,
  targetIndex: number,
  animationProgress: number,
  animationDirection: -1 | 0 | 1,
  easedProgress: number,
  unlockedIds: string[],
  showSideOtters: boolean
): VisibleOtter[] {
  if (characters.length === 0) return [];

  const isAnimating = animationProgress > 0 && animationProgress < 1;
  const config: OtterStateConfig = { isAnimating, animationDirection, easedProgress, unlockedIds };
  const otters: VisibleOtter[] = [];
  const centerChar = getCharacterAtIndex(characters, currentIndex);

  // Add center character
  if (centerChar) {
    otters.push(calculateCenterOtterState(centerChar, config));
  }

  // Add entering character during animation
  if (isAnimating && animationDirection !== 0) {
    const newCenterChar = getCharacterAtIndex(characters, targetIndex);
    if (newCenterChar && newCenterChar.id !== centerChar?.id) {
      otters.push(calculateEnteringOtterState(newCenterChar, config));
    }
  }

  // Add side characters (only in landscape mode)
  if (showSideOtters && characters.length > 1) {
    addSideCharacters(otters, characters, currentIndex, centerChar, config);
  }

  return otters;
}

export function CarouselStage({
  characters,
  currentIndex,
  targetIndex = currentIndex,
  animationProgress = 0,
  animationDirection = 0,
  unlockedIds,
  showSideOtters,
  onAnimationComplete,
}: CarouselStageProps) {
  const prevProgressRef = useRef(0);

  // Eased progress for smooth animation
  const easedProgress = easeOutCubic(animationProgress);

  // Detect animation completion
  useFrame(() => {
    if (prevProgressRef.current < 1 && animationProgress >= 1) {
      onAnimationComplete?.();
    }
    prevProgressRef.current = animationProgress;
  });

  // Calculate visible characters and their states
  const visibleOtters = useMemo(
    () =>
      calculateVisibleOtters(
        characters,
        currentIndex,
        targetIndex,
        animationProgress,
        animationDirection,
        easedProgress,
        unlockedIds,
        showSideOtters
      ),
    [
      characters,
      currentIndex,
      targetIndex,
      animationProgress,
      animationDirection,
      easedProgress,
      unlockedIds,
      showSideOtters,
    ]
  );

  // Find the center character for pedestal
  const centerOtter = visibleOtters.find(
    (o) => o.slot === 'center' || (o.slot === 'entering' && animationProgress > 0.5)
  );

  return (
    <>
      {/* Lighting setup */}
      <CarouselLighting />

      {/* Pedestal for center character */}
      <ProceduralPedestal
        position={[0, -0.5, 2]}
        radius={1}
        height={0.2}
        showGoldRing={true}
        visible={!!centerOtter}
      />

      {/* Render all visible otters */}
      {visibleOtters.map((otter, index) => (
        <OtterModelPreview
          key={`${otter.character.id}-${otter.slot}`}
          modelPath={otter.character.modelPath}
          isLocked={otter.isLocked}
          position={otter.position}
          rotation={otter.rotation}
          scale={otter.scale}
          opacity={otter.opacity}
          animationOffset={index * 0.5}
        />
      ))}
    </>
  );
}
