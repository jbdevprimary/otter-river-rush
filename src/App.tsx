/**
 * Otter River Rush - Mobile App Entry Point
 *
 * This is the main entry point for the Expo mobile application.
 * Uses React Three Fiber for 3D rendering with shared game-core logic.
 * Styled with NativeWind (Tailwind CSS).
 */

import './global.css';

import { useGameStore } from './game/store';
import type { GameStatus } from './game/types';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Pressable, SafeAreaView, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { GameCanvas } from './components/game/GameCanvas';
import { GameHUD } from './components/game/GameHUD';
import { MainMenu } from './screens/MainMenu';
import { GameOverScreen } from './screens/GameOverScreen';

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
          <View className="flex-1">
            <GameCanvas />
            <GameHUD />
            <Pressable
              className="absolute top-4 right-4 w-12 h-12 bg-black/50 rounded-xl justify-center items-center"
              onPress={pauseGame}
            >
              <Text className="text-white text-xl font-bold">II</Text>
            </Pressable>
          </View>
        );
      case 'paused':
        return (
          <View className="flex-1">
            <GameCanvas />
            <View className="absolute inset-0 bg-black/70 justify-center items-center">
              <Text className="text-white text-5xl font-bold mb-8">PAUSED</Text>
              <Pressable
                className="bg-brand-success px-12 py-4 rounded-lg active:opacity-80"
                onPress={resumeGame}
              >
                <Text className="text-white text-2xl font-bold">RESUME</Text>
              </Pressable>
            </View>
          </View>
        );
      case 'game_over':
        return <GameOverScreen />;
      case 'loading':
        return (
          <View className="flex-1 justify-center items-center bg-brand-surface">
            <Text className="text-white text-2xl">Loading...</Text>
          </View>
        );
      default:
        return <MainMenu />;
    }
  };

  return (
    <GestureHandlerRootView className="flex-1">
      <SafeAreaView className="flex-1 bg-brand-surface">
        <StatusBar style="light" />
        {renderScreen(status)}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
