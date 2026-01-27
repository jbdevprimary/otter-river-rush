/**
 * GameOverScreen - Game over screen for mobile app
 *
 * Shows final score, stats, and options to play again or return to menu.
 * Uses NativeWind (Tailwind) for styling with brand colors.
 */

import { useGameStore } from '../game/store';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

export function GameOverScreen() {
  const score = useGameStore((state) => state.score);
  const distance = useGameStore((state) => state.distance);
  const coins = useGameStore((state) => state.coins);
  const gems = useGameStore((state) => state.gems);
  const progress = useGameStore((state) => state.progress);
  const startGame = useGameStore((state) => state.startGame);
  const returnToMenu = useGameStore((state) => state.returnToMenu);

  const isNewHighScore = score >= progress.highScore && score > 0;

  const handlePlayAgain = () => {
    startGame('classic');
  };

  return (
    <View className="flex-1 bg-brand-background items-center justify-center p-6">
      {/* Game Over Title */}
      <View className="items-center mb-6">
        <Text className="text-5xl font-bold text-brand-danger tracking-widest">
          GAME OVER
        </Text>
        {isNewHighScore && (
          <Text className="text-xl font-bold text-brand-gold mt-2">
            NEW HIGH SCORE!
          </Text>
        )}
      </View>

      {/* Score Display */}
      <View className="items-center mb-8">
        <Text className="text-base text-slate-500 tracking-widest">SCORE</Text>
        <Text className="text-6xl font-bold text-white">
          {score.toLocaleString()}
        </Text>
      </View>

      {/* Stats Grid */}
      <View className="flex-row justify-around w-full max-w-[320px] mb-8">
        <View className="items-center bg-black/30 p-4 rounded-xl min-w-[90px]">
          <Text className="text-2xl font-bold text-white">
            {Math.floor(distance)}m
          </Text>
          <Text className="text-xs text-slate-500 mt-1">Distance</Text>
        </View>
        <View className="items-center bg-black/30 p-4 rounded-xl min-w-[90px]">
          <Text className="text-2xl font-bold text-brand-gold">{coins}</Text>
          <Text className="text-xs text-slate-500 mt-1">Coins</Text>
        </View>
        <View className="items-center bg-black/30 p-4 rounded-xl min-w-[90px]">
          <Text className="text-2xl font-bold text-purple-500">{gems}</Text>
          <Text className="text-xs text-slate-500 mt-1">Gems</Text>
        </View>
      </View>

      {/* Progress Info */}
      <View className="bg-black/30 p-4 rounded-xl w-full max-w-[280px] mb-8">
        <Text className="text-sm font-bold text-brand-primary text-center mb-3 tracking-widest">
          TOTAL PROGRESS
        </Text>
        <View className="flex-row justify-between mb-2">
          <Text className="text-sm text-slate-500">Games Played:</Text>
          <Text className="text-sm font-bold text-white">
            {progress.gamesPlayed}
          </Text>
        </View>
        <View className="flex-row justify-between mb-2">
          <Text className="text-sm text-slate-500">Total Distance:</Text>
          <Text className="text-sm font-bold text-white">
            {Math.floor(progress.totalDistance)}m
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-sm text-slate-500">Total Coins:</Text>
          <Text className="text-sm font-bold text-white">
            {progress.totalCoins}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="w-full max-w-[280px]">
        <Pressable
          className="bg-brand-success py-4 px-8 rounded-xl mb-3 items-center active:opacity-80"
          onPress={handlePlayAgain}
        >
          <Text className="text-xl font-bold text-white tracking-widest">
            PLAY AGAIN
          </Text>
        </Pressable>
        <Pressable
          className="bg-transparent py-4 px-8 rounded-xl items-center border-2 border-slate-500 active:opacity-80"
          onPress={returnToMenu}
        >
          <Text className="text-base font-semibold text-slate-500 tracking-widest">
            MAIN MENU
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
