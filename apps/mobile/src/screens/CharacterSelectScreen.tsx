/**
 * CharacterSelectScreen - 3D Character Carousel Selection
 *
 * Full screen combining:
 * - 3D otter carousel with stage lighting
 * - 2D overlay with character info, navigation, and start button
 * - Portrait/landscape responsive layout
 * - Swipe gesture support
 */

import {
  OTTER_CHARACTERS,
  getCharacter,
  isCharacterUnlocked,
  type OtterCharacter,
} from '@otter-river-rush/game-core/config';
import { useGameStore } from '@otter-river-rush/game-core/store';
import { CharacterCarousel3D } from '@otter-river-rush/rendering';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

/** Swipe threshold in pixels */
const SWIPE_THRESHOLD = 50;

export function CharacterSelectScreen() {
  const { selectedCharacterId, selectCharacter, startGame, returnToMenu, progress } =
    useGameStore();

  // Find current character index
  const [carouselIndex, setCarouselIndex] = useState(() => {
    const idx = OTTER_CHARACTERS.findIndex((c) => c.id === selectedCharacterId);
    return idx >= 0 ? idx : 0;
  });

  // Store rotation controls from carousel
  const rotationControlsRef = useRef<{
    rotateLeft: () => void;
    rotateRight: () => void;
  } | null>(null);

  // Responsive layout detection
  const { breakpoints } = useResponsiveLayout();
  const isPortrait = breakpoints.isPortrait;

  // Calculate unlocked character IDs
  const unlockedIds = useMemo(() => {
    return OTTER_CHARACTERS.filter((c) => isCharacterUnlocked(c, progress)).map((c) => c.id);
  }, [progress]);

  // Current character
  const currentCharacter = OTTER_CHARACTERS[carouselIndex];
  const isCurrentUnlocked = currentCharacter
    ? unlockedIds.includes(currentCharacter.id)
    : false;

  // Handle carousel rotation
  const handleRotate = useCallback((newIndex: number) => {
    setCarouselIndex(newIndex);
  }, []);

  // Handle rotation controls ready
  const handleRotationControlsReady = useCallback(
    (controls: { rotateLeft: () => void; rotateRight: () => void }) => {
      rotationControlsRef.current = controls;
    },
    []
  );

  // Navigation handlers
  const handlePrevious = useCallback(() => {
    rotationControlsRef.current?.rotateLeft();
  }, []);

  const handleNext = useCallback(() => {
    rotationControlsRef.current?.rotateRight();
  }, []);

  // Start game with selected character
  const handleStartGame = useCallback(() => {
    if (isCurrentUnlocked && currentCharacter) {
      selectCharacter(currentCharacter.id);
      startGame('classic');
    }
  }, [isCurrentUnlocked, currentCharacter, selectCharacter, startGame]);

  // Back to menu
  const handleBack = useCallback(() => {
    returnToMenu();
  }, [returnToMenu]);

  // Swipe gesture
  const panGesture = Gesture.Pan().onEnd((event) => {
    if (event.velocityX > 500 || event.translationX > SWIPE_THRESHOLD) {
      handlePrevious();
    } else if (event.velocityX < -500 || event.translationX < -SWIPE_THRESHOLD) {
      handleNext();
    }
  });

  return (
    <GestureDetector gesture={panGesture}>
      <View className="flex-1 bg-brand-background">
        {/* 3D Carousel - Full screen background */}
        <View className="absolute inset-0">
          <CharacterCarousel3D
            characters={OTTER_CHARACTERS}
            currentIndex={carouselIndex}
            unlockedIds={unlockedIds}
            isPortrait={isPortrait}
            onRotate={handleRotate}
            onRotationControlsReady={handleRotationControlsReady}
          />
        </View>

        {/* 2D Overlay */}
        <View className="flex-1 justify-between" pointerEvents="box-none">
          {/* Top Section - Back Button */}
          <View className="flex-row justify-start p-4 pt-6">
            <Pressable
              className="bg-black/50 px-6 py-3 rounded-xl active:bg-black/70"
              onPress={handleBack}
            >
              <Text className="text-white text-lg font-semibold">BACK</Text>
            </Pressable>
          </View>

          {/* Bottom Section - Character Info & Controls */}
          <View className="items-center pb-8 px-4">
            {/* Character Info Card */}
            {currentCharacter && (
              <View className="bg-black/70 rounded-2xl p-5 mb-6 w-full max-w-md">
                {/* Name & Title */}
                <Text className="text-white text-3xl font-bold text-center">
                  {currentCharacter.name}
                </Text>
                <Text
                  className="text-lg text-center mt-1"
                  style={{ color: currentCharacter.theme.accentColor }}
                >
                  {currentCharacter.title}
                </Text>

                {/* Description / Personality */}
                <Text className="text-slate-300 text-sm text-center mt-3 leading-5">
                  {currentCharacter.personality}
                </Text>

                {/* Stats or Lock Hint */}
                {isCurrentUnlocked ? (
                  <TraitsList traits={currentCharacter.traits} />
                ) : (
                  <LockedHint character={currentCharacter} />
                )}
              </View>
            )}

            {/* Navigation Arrows */}
            <View className="flex-row items-center justify-center gap-8 mb-6">
              <Pressable
                className="w-14 h-14 bg-white/20 rounded-full items-center justify-center active:bg-white/30"
                onPress={handlePrevious}
              >
                <Text className="text-white text-2xl font-bold">{'<'}</Text>
              </Pressable>

              {/* Dots indicator */}
              <View className="flex-row gap-2">
                {OTTER_CHARACTERS.map((_, idx) => (
                  <View
                    key={idx}
                    className={`w-3 h-3 rounded-full ${
                      idx === carouselIndex ? 'bg-brand-gold' : 'bg-white/30'
                    }`}
                  />
                ))}
              </View>

              <Pressable
                className="w-14 h-14 bg-white/20 rounded-full items-center justify-center active:bg-white/30"
                onPress={handleNext}
              >
                <Text className="text-white text-2xl font-bold">{'>'}</Text>
              </Pressable>
            </View>

            {/* Start Game Button */}
            <Pressable
              className={`px-12 py-4 rounded-xl ${
                isCurrentUnlocked
                  ? 'bg-brand-success active:bg-green-600'
                  : 'bg-slate-600 opacity-60'
              }`}
              onPress={handleStartGame}
              disabled={!isCurrentUnlocked}
            >
              <Text className="text-white text-2xl font-bold tracking-widest">
                {isCurrentUnlocked ? 'START GAME' : 'LOCKED'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </GestureDetector>
  );
}

/**
 * Character traits display
 */
interface TraitsListProps {
  traits: OtterCharacter['traits'];
}

function TraitsList({ traits }: TraitsListProps) {
  const traitsToShow: Array<{ id: string; text: string; isPositive: boolean }> = [];

  if (traits.scrollSpeedMod !== 1.0) {
    const isPositive = traits.scrollSpeedMod < 1;
    const percent = Math.round((traits.scrollSpeedMod - 1) * 100);
    traitsToShow.push({
      id: 'speed',
      text: `Speed ${percent > 0 ? '+' : ''}${percent}%`,
      isPositive,
    });
  }

  if (traits.laneChangeSpeed !== 1.0) {
    const isPositive = traits.laneChangeSpeed > 1;
    const percent = Math.round((traits.laneChangeSpeed - 1) * 100);
    traitsToShow.push({
      id: 'agility',
      text: `Agility ${percent > 0 ? '+' : ''}${percent}%`,
      isPositive,
    });
  }

  if (traits.coinValueMod !== 1.0) {
    const isPositive = traits.coinValueMod > 1;
    traitsToShow.push({
      id: 'coins',
      text: `Coins x${traits.coinValueMod}`,
      isPositive,
    });
  }

  if (traits.gemValueMod !== 1.0) {
    const isPositive = traits.gemValueMod > 1;
    traitsToShow.push({
      id: 'gems',
      text: `Gems x${traits.gemValueMod}`,
      isPositive,
    });
  }

  if (traits.startingHealth !== 3) {
    const isPositive = traits.startingHealth > 3;
    traitsToShow.push({
      id: 'health',
      text: `Hearts: ${traits.startingHealth}`,
      isPositive,
    });
  }

  if (traitsToShow.length === 0) {
    return (
      <Text className="text-slate-400 text-sm text-center mt-3">
        Balanced stats - perfect for beginners!
      </Text>
    );
  }

  return (
    <View className="flex-row flex-wrap justify-center gap-2 mt-4">
      {traitsToShow.map((trait) => (
        <View
          key={trait.id}
          className={`px-3 py-1 rounded-full ${
            trait.isPositive ? 'bg-green-500/30' : 'bg-red-500/30'
          }`}
        >
          <Text className={`text-xs font-medium ${trait.isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {trait.text}
          </Text>
        </View>
      ))}
    </View>
  );
}

/**
 * Locked character hint
 */
interface LockedHintProps {
  character: OtterCharacter;
}

function LockedHint({ character }: LockedHintProps) {
  return (
    <View className="items-center mt-4">
      <Text className="text-red-400 text-base font-bold">LOCKED</Text>
      {character.unlock.hint && (
        <Text className="text-slate-400 text-sm text-center mt-2">
          {character.unlock.hint}
        </Text>
      )}
    </View>
  );
}
