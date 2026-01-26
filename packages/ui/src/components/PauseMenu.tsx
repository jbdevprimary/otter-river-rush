/**
 * PauseMenu Component - Cross-platform React Native/Web
 * Displayed when game is paused, with Resume and Quit options
 * Uses NativeWind styling
 */

import { useGameStore } from '@otter-river-rush/state';
import { Pressable, Text, View } from 'react-native';

export function PauseMenu() {
  const handleResume = () => {
    useGameStore.getState().resumeGame();
  };

  const handleQuit = () => {
    useGameStore.getState().returnToMenu();
  };

  return (
    <View className="absolute inset-0 bg-brand-background/75 justify-center items-center z-[200] font-mono">
      <View className="flex-col items-center w-[400px]">
        <Text className="text-white text-6xl font-bold text-center mb-10">
          PAUSED
        </Text>

        <Pressable
          className="w-[280px] h-[60px] bg-brand-primary rounded-xl items-center justify-center mt-4 active:bg-blue-400 active:scale-105"
          onPress={handleResume}
        >
          <Text className="text-white text-2xl font-bold font-mono">
            RESUME
          </Text>
        </Pressable>

        <Pressable
          className="w-[280px] h-[60px] bg-slate-600 rounded-xl items-center justify-center mt-4 active:bg-slate-500 active:scale-105"
          onPress={handleQuit}
        >
          <Text className="text-white text-2xl font-bold font-mono">
            QUIT TO MENU
          </Text>
        </Pressable>

        <Text className="text-slate-400 text-base text-center mt-8">
          Press ESC to resume
        </Text>
      </View>
    </View>
  );
}
