/**
 * Otter River Rush - Mobile App Entry Point
 *
 * This is the main entry point for the Expo mobile application.
 * Uses React Three Fiber for 3D rendering with shared game-core logic.
 */

import { useGameStore } from '@otter-river-rush/game-core/store';
import type { GameStatus } from '@otter-river-rush/game-core/types';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { GameCanvas } from './src/components/GameCanvas';
import { GameHUD } from './src/components/GameHUD';
import { MainMenu } from './src/screens/MainMenu';
import { GameOverScreen } from './src/screens/GameOverScreen';

export default function App() {
  const status = useGameStore((state) => state.status);
  const pauseGame = useGameStore((state) => state.pauseGame);
  const resumeGame = useGameStore((state) => state.resumeGame);

  const renderScreen = (gameStatus: GameStatus) => {
    switch (gameStatus) {
      case 'menu':
      case 'character_select':
        return <MainMenu />;
      case 'playing':
        return (
          <View style={styles.gameContainer}>
            <GameCanvas />
            <GameHUD />
            <Pressable style={styles.pauseButton} onPress={pauseGame}>
              <Text style={styles.pauseButtonText}>II</Text>
            </Pressable>
          </View>
        );
      case 'paused':
        return (
          <View style={styles.gameContainer}>
            <GameCanvas />
            <View style={styles.pauseOverlay}>
              <Text style={styles.pauseTitle}>PAUSED</Text>
              <Pressable style={styles.resumeButton} onPress={resumeGame}>
                <Text style={styles.resumeButtonText}>RESUME</Text>
              </Pressable>
            </View>
          </View>
        );
      case 'game_over':
        return <GameOverScreen />;
      case 'loading':
        return (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        );
      default:
        return <MainMenu />;
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        {renderScreen(status)}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e3a5f',
  },
  gameContainer: {
    flex: 1,
  },
  pauseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 48,
    height: 48,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseTitle: {
    color: '#ffffff',
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 32,
  },
  resumeButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 8,
  },
  resumeButtonText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e3a5f',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 24,
  },
});
