/**
 * MainMenu - Main menu screen for mobile app
 *
 * Uses NativeWind (Tailwind) for styling with brand colors.
 */

import { useGameStore } from '../game/store';
import type { GameMode } from '../game/types';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

export function MainMenu() {
  const startGame = useGameStore((state) => state.startGame);
  const progress = useGameStore((state) => state.progress);

  const handlePlay = (mode: GameMode = 'classic') => {
    startGame(mode);
  };

  return (
    <View className="flex-1 bg-brand-background items-center justify-center p-6">
      {/* Title */}
      <View className="items-center mb-8">
        <Text className="text-5xl font-bold text-brand-gold tracking-widest">
          OTTER
        </Text>
        <Text className="text-4xl font-semibold text-brand-secondary tracking-[8px] -mt-2">
          RIVER
        </Text>
        <Text className="text-6xl font-bold text-white tracking-[12px] -mt-2">
          RUSH
        </Text>
      </View>

      {/* High Score Display */}
      {progress.highScore > 0 && (
        <View className="items-center mb-8">
          <Text className="text-sm text-slate-400 tracking-widest">
            HIGH SCORE
          </Text>
          <Text className="text-3xl font-bold text-brand-gold">
            {progress.highScore.toLocaleString()}
          </Text>
        </View>
      )}

      {/* Menu Buttons */}
      <View className="w-full max-w-[280px] mb-12">
        <Pressable
          className="bg-brand-success py-4 px-8 rounded-xl mb-4 items-center active:opacity-80"
          onPress={() => handlePlay('classic')}
        >
          <Text className="text-3xl font-bold text-white tracking-widest">
            PLAY
          </Text>
        </Pressable>

        <Pressable
          className="bg-transparent py-4 px-8 rounded-xl mb-4 items-center border-2 border-brand-secondary active:opacity-80"
          onPress={() => handlePlay('time_trial')}
        >
          <Text className="text-lg font-semibold text-brand-secondary tracking-widest">
            TIME TRIAL
          </Text>
        </Pressable>

        <Pressable
          className="bg-transparent py-4 px-8 rounded-xl mb-4 items-center border-2 border-brand-secondary active:opacity-80"
          onPress={() => handlePlay('zen')}
        >
          <Text className="text-lg font-semibold text-brand-secondary tracking-widest">
            ZEN MODE
          </Text>
        </Pressable>
      </View>

      {/* Stats */}
      <View className="flex-row justify-around w-full max-w-[320px] mb-8">
        <View className="items-center">
          <Text className="text-xl font-bold text-white">
            {progress.gamesPlayed}
          </Text>
          <Text className="text-xs text-slate-400 mt-1">Games</Text>
        </View>
        <View className="items-center">
          <Text className="text-xl font-bold text-white">
            {Math.floor(progress.totalDistance)}m
          </Text>
          <Text className="text-xs text-slate-400 mt-1">Distance</Text>
        </View>
        <View className="items-center">
          <Text className="text-xl font-bold text-white">
            {progress.totalCoins}
          </Text>
          <Text className="text-xs text-slate-400 mt-1">Coins</Text>
        </View>
      </View>

      {/* Footer */}
      <View className="absolute bottom-12 items-center">
        <Text className="text-sm text-slate-400 mt-1">Swipe to move lanes</Text>
        <Text className="text-sm text-slate-400 mt-1">
          Collect coins, avoid obstacles!
        </Text>
      </View>
    </View>
  );
}
