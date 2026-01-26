/**
 * GameHUD - Heads-up display for mobile game
 *
 * Shows score, distance, coins, lives, and touch controls.
 */

import { useGameStore } from '@otter-river-rush/game-core/store';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

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
      {/* @ts-expect-error React 19 + Reanimated type compatibility */}
      <Animated.View style={[styles.touchArea, animatedStyle]}>
        <View style={styles.swipeIndicator}>
          <Text style={styles.swipeText}>SWIPE TO MOVE</Text>
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
    <View style={styles.statsContainer}>
      <View style={styles.statRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>SCORE</Text>
          <Text style={styles.statValue}>{score.toLocaleString()}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>DISTANCE</Text>
          <Text style={styles.statValue}>{Math.floor(distance)}m</Text>
        </View>
      </View>
      <View style={styles.statRow}>
        <View style={styles.statItem}>
          <Text style={styles.coinIcon}>$</Text>
          <Text style={styles.statValue}>{coins}</Text>
        </View>
        <View style={styles.livesContainer}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Text
              key={i}
              style={[styles.heartIcon, i >= lives && styles.heartEmpty]}
            >
              {i < lives ? 'O' : 'X'}
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
    <View style={styles.laneButtons}>
      <Pressable style={styles.laneButton} onPress={handleMoveLeft}>
        <Text style={styles.laneButtonText}>{'<'}</Text>
      </Pressable>
      <Pressable style={styles.laneButton} onPress={handleMoveRight}>
        <Text style={styles.laneButtonText}>{'>'}</Text>
      </Pressable>
    </View>
  );
}

/**
 * Main HUD component
 */
export function GameHUD() {
  return (
    <View style={styles.container} pointerEvents="box-none">
      <StatsDisplay />
      <TouchControls />
      <LaneButtons />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: 16,
  },
  statsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    padding: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statLabel: {
    color: '#aaaaaa',
    fontSize: 12,
    marginRight: 8,
  },
  statValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  coinIcon: {
    color: '#FFD700',
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 4,
  },
  livesContainer: {
    flexDirection: 'row',
  },
  heartIcon: {
    color: '#FF4444',
    fontSize: 20,
    marginLeft: 4,
  },
  heartEmpty: {
    opacity: 0.3,
  },
  touchArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeIndicator: {
    opacity: 0.3,
  },
  swipeText: {
    color: '#ffffff',
    fontSize: 14,
  },
  laneButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingBottom: 32,
  },
  laneButton: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  laneButtonText: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
  },
});
