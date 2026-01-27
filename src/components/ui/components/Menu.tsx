/**
 * Menu Component - Cross-platform React Native/Web
 * Main menu and game over screens using NativeWind styling
 */

import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { addScore, isHighScore, useGameStore } from '../../../game/store';
import type { GameMode } from '../../../game/types';
import { Leaderboard } from './Leaderboard';
import { Settings } from './Settings';

interface MenuProps {
  type: 'menu' | 'game_over';
}

export function Menu({ type }: MenuProps) {
  const score = useGameStore((state) => state.score);

  if (type === 'menu') {
    return <MainMenu />;
  }

  return <GameOverMenu finalScore={score} />;
}

function MainMenu() {
  const selectedChar = useGameStore((state) => state.getSelectedCharacter());
  const [selectedMode, setSelectedMode] = useState<GameMode>('classic');
  const [showSettings, setShowSettings] = useState(false);

  const handlePlay = () => {
    useGameStore.getState().startGame(selectedMode);
  };

  const handleSelectOtter = () => {
    useGameStore.getState().goToCharacterSelect();
  };

  const handleOpenSettings = () => {
    setShowSettings(true);
  };

  const handleCloseSettings = () => {
    setShowSettings(false);
  };

  const getModeButtonClasses = (mode: GameMode) => {
    const base =
      'flex-1 min-w-[100px] max-w-[135px] h-[50px] rounded-lg items-center justify-center border-2';
    if (selectedMode === mode) {
      if (mode === 'zen') {
        return `${base} bg-emerald-500 border-emerald-400`;
      }
      if (mode === 'time_trial') {
        return `${base} bg-amber-500 border-amber-400`;
      }
      return `${base} bg-brand-primary border-blue-400`;
    }
    return `${base} bg-slate-700 border-slate-600 active:bg-slate-600`;
  };

  const getModeButtonTextClasses = (mode: GameMode) => {
    if (selectedMode === mode) {
      return 'text-white text-base font-bold font-mono';
    }
    return 'text-slate-400 text-base font-bold font-mono';
  };

  return (
    <View className="absolute inset-0 bg-brand-background/85 justify-center items-center z-[200] font-mono">
      <View className="flex-col items-center w-[90%] max-w-[400px] p-5">
        <Text className="text-white text-5xl font-bold text-center leading-tight mb-5">
          {'OTTER\nRIVER\nRUSH'}
        </Text>
        <Text className="text-brand-primary text-lg mb-5">A 3-lane river adventure!</Text>
        <Text className="text-lg mb-5" style={{ color: selectedChar.theme.accentColor }}>
          Playing as: {selectedChar.name}
        </Text>

        {/* Mode Selection */}
        <View className="flex-col items-center mt-2.5 mb-2.5 w-full">
          <Text className="text-slate-400 text-xs uppercase tracking-widest mb-2.5">
            Select Mode
          </Text>
          <View className="flex-row gap-2.5 justify-center flex-wrap w-full">
            <Pressable
              className={getModeButtonClasses('classic')}
              onPress={() => setSelectedMode('classic')}
            >
              <Text className={getModeButtonTextClasses('classic')}>CLASSIC</Text>
            </Pressable>
            <Pressable
              className={getModeButtonClasses('time_trial')}
              onPress={() => setSelectedMode('time_trial')}
            >
              <Text className={getModeButtonTextClasses('time_trial')}>TIME TRIAL</Text>
            </Pressable>
            <Pressable
              className={getModeButtonClasses('zen')}
              onPress={() => setSelectedMode('zen')}
            >
              <Text className={getModeButtonTextClasses('zen')}>ZEN</Text>
            </Pressable>
          </View>
          <Text className="text-slate-500 text-xs mt-2 text-center">
            {selectedMode === 'zen'
              ? 'No obstacles - just relax and collect!'
              : selectedMode === 'time_trial'
                ? '60 seconds - race for high score!'
                : 'Avoid obstacles and survive!'}
          </Text>
        </View>

        <Pressable
          className="w-full max-w-[280px] h-[60px] bg-brand-primary rounded-xl items-center justify-center mt-4 active:bg-blue-400 active:scale-105"
          onPress={handlePlay}
        >
          <Text className="text-white text-2xl font-bold font-mono">PLAY GAME</Text>
        </Pressable>

        <Pressable
          className="w-full max-w-[280px] h-[60px] bg-indigo-500 rounded-xl items-center justify-center mt-4 active:bg-indigo-400 active:scale-105"
          onPress={handleSelectOtter}
        >
          <Text className="text-white text-2xl font-bold font-mono">SELECT OTTER</Text>
        </Pressable>

        <Pressable
          className="w-full max-w-[280px] h-[60px] bg-slate-700 border-2 border-slate-600 rounded-xl items-center justify-center mt-4 active:bg-slate-600 active:scale-105"
          onPress={handleOpenSettings}
        >
          <Text className="text-white text-2xl font-bold font-mono">SETTINGS</Text>
        </Pressable>

        <Text className="text-slate-400 text-base text-center mt-8 leading-6">
          {'<- -> or A D to move\nAvoid rocks, collect coins!'}
        </Text>
      </View>

      {/* Settings Modal */}
      <Settings isOpen={showSettings} onClose={handleCloseSettings} />
    </View>
  );
}

interface GameOverMenuProps {
  finalScore: number;
}

function GameOverMenu({ finalScore }: GameOverMenuProps) {
  const mode = useGameStore((state) => state.mode);
  const distance = useGameStore((state) => state.distance);
  const selectedCharacterId = useGameStore((state) => state.selectedCharacterId);
  const [highlightRank, setHighlightRank] = useState<number | null>(null);
  const [scoreSaved, setScoreSaved] = useState(false);

  // Save score to leaderboard when game over screen appears
  useEffect(() => {
    if (scoreSaved) return;

    // Check if score qualifies for leaderboard
    if (isHighScore(finalScore)) {
      const rank = addScore(finalScore, distance, selectedCharacterId, mode);
      setHighlightRank(rank);
    }
    setScoreSaved(true);
  }, [finalScore, distance, selectedCharacterId, mode, scoreSaved]);

  const handlePlayAgain = () => {
    useGameStore.getState().startGame(mode);
  };

  const handleMainMenu = () => {
    useGameStore.getState().returnToMenu();
  };

  return (
    <View className="absolute inset-0 bg-brand-background/85 justify-center items-center z-[200] font-mono">
      <ScrollView
        className="w-[90%] max-w-[400px] max-h-[90vh] p-5"
        contentContainerStyle={{ alignItems: 'center' }}
      >
        <Text className="text-brand-danger text-5xl font-bold mb-5">GAME OVER</Text>
        <Text className="text-slate-400 text-xl mt-5">FINAL SCORE</Text>
        <Text className="text-brand-gold text-6xl font-bold mb-8">{finalScore}</Text>

        {highlightRank !== null && (
          <Text className="text-brand-success text-lg font-bold mb-2.5">
            NEW HIGH SCORE! Rank #{highlightRank}
          </Text>
        )}

        <Pressable
          className="w-full max-w-[280px] h-[60px] bg-brand-primary rounded-xl items-center justify-center mt-4 active:bg-blue-400 active:scale-105"
          onPress={handlePlayAgain}
        >
          <Text className="text-white text-2xl font-bold font-mono">PLAY AGAIN</Text>
        </Pressable>

        <Pressable
          className="w-full max-w-[280px] h-[60px] bg-slate-600 rounded-xl items-center justify-center mt-4 active:bg-slate-500 active:scale-105"
          onPress={handleMainMenu}
        >
          <Text className="text-white text-2xl font-bold font-mono">MAIN MENU</Text>
        </Pressable>

        {/* Leaderboard Display */}
        <Leaderboard highlightRank={highlightRank} />
      </ScrollView>
    </View>
  );
}
