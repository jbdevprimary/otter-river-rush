/**
 * GameHUD - Heads-up display for mobile game
 *
 * Shows score, distance, coins, lives, and touch controls.
 * Uses NativeWind (Tailwind) for styling with brand colors.
 */

import { Pressable, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useGameStore } from '../../game/store';

// Constants for life display (max 3 lives)
const LIFE_INDICES = [0, 1, 2] as const;

/**
 * Touch control area for lane movement
 */
function TouchControls() {
  const translateX = useSharedValue(0);

  // Swipe gesture for lane changes
  const swipeGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      // Determine swipe direction and trigger lane change
      if (event.translationX > 50) {
        // Swipe right - move right lane
        console.log('Move right');
      } else if (event.translationX < -50) {
        // Swipe left - move left lane
        console.log('Move left');
      }
      translateX.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value * 0.1 }],
  }));

  return (
    <GestureDetector gesture={swipeGesture}>
      <Animated.View style={animatedStyle} className="flex-1 justify-center items-center">
        <View className="opacity-30">
          <Text className="text-white text-sm">SWIPE TO MOVE</Text>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

/**
 * Stats display showing score, coins, etc.
 */
function StatsDisplay() {
  const score = useGameStore((state) => state.score);
  const distance = useGameStore((state) => state.distance);
  const coins = useGameStore((state) => state.coins);
  const lives = useGameStore((state) => state.lives);

  return (
    <View className="bg-black/50 rounded-xl p-3">
      <View className="flex-row justify-between mb-2">
        <View className="flex-row items-center">
          <Text className="text-slate-400 text-xs mr-2">SCORE</Text>
          <Text className="text-white text-lg font-bold">{score.toLocaleString()}</Text>
        </View>
        <View className="flex-row items-center">
          <Text className="text-slate-400 text-xs mr-2">DISTANCE</Text>
          <Text className="text-white text-lg font-bold">{Math.floor(distance)}m</Text>
        </View>
      </View>
      <View className="flex-row justify-between">
        <View className="flex-row items-center">
          <Text className="text-brand-gold text-xl font-bold mr-1">$</Text>
          <Text className="text-white text-lg font-bold">{coins}</Text>
        </View>
        <View className="flex-row">
          {LIFE_INDICES.map((lifeIndex) => (
            <Text
              key={`life-${lifeIndex}`}
              className={`text-xl ml-1 ${
                lifeIndex < lives ? 'text-brand-danger' : 'text-brand-danger/30'
              }`}
            >
              {lifeIndex < lives ? 'O' : 'X'}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}

/**
 * Lane change buttons for alternative touch control
 */
function LaneButtons() {
  const handleMoveLeft = () => {
    // Trigger left lane change via input system
    console.log('Move left button pressed');
  };

  const handleMoveRight = () => {
    // Trigger right lane change via input system
    console.log('Move right button pressed');
  };

  return (
    <View className="flex-row justify-between px-8 pb-8">
      <Pressable
        className="w-20 h-20 bg-white/20 rounded-full justify-center items-center border-2 border-white/40 active:bg-white/30"
        onPress={handleMoveLeft}
      >
        <Text className="text-white text-3xl font-bold">{'<'}</Text>
      </Pressable>
      <Pressable
        className="w-20 h-20 bg-white/20 rounded-full justify-center items-center border-2 border-white/40 active:bg-white/30"
        onPress={handleMoveRight}
      >
        <Text className="text-white text-3xl font-bold">{'>'}</Text>
      </Pressable>
    </View>
  );
}

/**
 * Main HUD component
 */
export function GameHUD() {
  return (
    <View className="absolute inset-0 justify-between p-4" pointerEvents="box-none">
      <StatsDisplay />
      <TouchControls />
      <LaneButtons />
    </View>
  );
}
