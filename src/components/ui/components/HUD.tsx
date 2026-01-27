/**
 * HUD Component - Cross-platform React Native/Web
 * Heads-up display positioned as an absolute overlay
 * Uses NativeWind styling
 */

import { useCallback, useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import {
  getActivePowerUps,
  getComboMultiplier,
  getComboTimeRemaining,
  getTutorialTimeRemaining,
  POWER_UP_DISPLAYS,
  TIME_TRIAL_DURATION_MS,
  useAchievementChecker,
  useGameStore,
} from '../../../game/store';
import type { PowerUpType } from '../../../game/types';

type ActivePowerUp = { type: PowerUpType; timeRemaining: number };

export function HUD() {
  const score = useGameStore((state) => state.score);
  const distance = useGameStore((state) => state.distance);
  const lives = useGameStore((state) => state.lives);
  const combo = useGameStore((state) => state.combo);
  const comboTimer = useGameStore((state) => state.comboTimer);
  const mode = useGameStore((state) => state.mode);
  const gameStartTime = useGameStore((state) => state.gameStartTime);
  const timeRemaining = useGameStore((state) => state.timeRemaining);

  const isZenMode = mode === 'zen';
  const isTimeTrialMode = mode === 'time_trial';

  // Check for achievements during gameplay
  useAchievementChecker();

  // Track combo timer remaining with periodic updates
  const [comboTimeLeft, setComboTimeLeft] = useState(0);

  useEffect(() => {
    if (comboTimer === null || combo === 0) {
      setComboTimeLeft(0);
      return;
    }

    const interval = setInterval(() => {
      const remaining = getComboTimeRemaining(comboTimer);
      setComboTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 50);

    setComboTimeLeft(getComboTimeRemaining(comboTimer));

    return () => clearInterval(interval);
  }, [comboTimer, combo]);

  // Track tutorial time remaining with periodic updates
  const [tutorialTimeLeft, setTutorialTimeLeft] = useState(() => getTutorialTimeRemaining());

  useEffect(() => {
    if (gameStartTime === null) {
      setTutorialTimeLeft(0);
      return;
    }

    setTutorialTimeLeft(getTutorialTimeRemaining());

    const interval = setInterval(() => {
      const remaining = getTutorialTimeRemaining();
      setTutorialTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [gameStartTime]);

  // Track active power-ups
  const [activePowerUps, setActivePowerUps] = useState<ActivePowerUp[]>([]);

  // Wrap getActivePowerUps in a stable callback
  const updateActivePowerUps = useCallback(() => {
    setActivePowerUps(getActivePowerUps());
  }, []);

  useEffect(() => {
    const interval = setInterval(updateActivePowerUps, 100);

    updateActivePowerUps();

    return () => clearInterval(interval);
  }, [updateActivePowerUps]);

  // Generate hearts based on lives
  const heartsDisplay = lives > 0 ? '\u2665 '.repeat(lives).trim() : '\u2661';

  const handlePause = () => {
    useGameStore.getState().pauseGame();
  };

  // Use numeric percentage for React Native compatibility
  const comboTimerWidthPercent = comboTimeLeft * 100;
  const timeTrialProgressWidthPercent = timeRemaining
    ? (timeRemaining / TIME_TRIAL_DURATION_MS) * 100
    : 0;

  return (
    <>
      {/* Pause Button */}
      <Pressable
        className="absolute top-5 right-5 w-12 h-12 bg-black/50 border-2 border-white/30 rounded-xl flex-row items-center justify-center z-[102]"
        onPress={handlePause}
        accessibilityLabel="Pause game"
      >
        <View className="flex-row gap-1">
          <View className="w-1.5 h-5 bg-white rounded-sm" />
          <View className="w-1.5 h-5 bg-white rounded-sm" />
        </View>
      </Pressable>

      {/* Tutorial Banner */}
      {tutorialTimeLeft > 0 && !isZenMode && !isTimeTrialMode && (
        <View className="absolute top-20 left-1/2 -translate-x-1/2 px-6 py-3 bg-emerald-500/90 rounded-lg border-2 border-emerald-400 z-[101]">
          <Text className="text-white text-lg font-bold text-center">
            TUTORIAL - {tutorialTimeLeft}s
          </Text>
          <Text className="text-emerald-100 text-xs text-center mt-1">
            You are invincible! Learn the controls.
          </Text>
        </View>
      )}

      {/* Time Trial Timer */}
      {isTimeTrialMode && timeRemaining !== null && (
        <View
          className={`absolute top-20 left-1/2 -translate-x-1/2 px-8 py-4 rounded-xl border-[3px] min-w-[200px] items-center z-[101] ${
            timeRemaining <= 10000
              ? 'bg-brand-danger/95 border-red-400'
              : 'bg-amber-500/95 border-amber-400'
          }`}
        >
          <Text className="text-amber-100 text-xs font-bold uppercase tracking-widest mb-1">
            Time Trial
          </Text>
          <Text className="text-white text-4xl font-bold">{Math.ceil(timeRemaining / 1000)}s</Text>
          <View className="w-full h-2 bg-black/30 rounded mt-2 overflow-hidden">
            <View
              className="h-full bg-white rounded"
              style={{ width: `${timeTrialProgressWidthPercent}%` as unknown as number }}
            />
          </View>
        </View>
      )}

      {/* Main HUD Container */}
      <View className="absolute top-0 left-0 right-0 p-5 flex-row justify-between items-start z-[100] pointer-events-none font-mono">
        {/* Left Panel - Score & Distance */}
        <View className="flex-col items-start">
          <Text className="text-white text-[28px] font-bold">SCORE: {score}</Text>
          <Text className="text-brand-primary text-xl mt-1">DISTANCE: {Math.floor(distance)}m</Text>
          {isZenMode && <Text className="text-emerald-500 text-xl mt-2">ZEN MODE</Text>}
        </View>

        {/* Right Panel - Lives & Combo */}
        <View className="flex-col items-end mt-10">
          {/* Hide lives in zen/time trial modes */}
          {!isZenMode && !isTimeTrialMode && (
            <Text className="text-brand-danger text-[28px]">{heartsDisplay}</Text>
          )}

          {/* Combo display with timer bar */}
          {combo > 0 && (
            <View className="flex-col items-end min-w-[120px] mt-1">
              <Text className="text-brand-gold text-2xl font-bold">COMBO x{combo}</Text>
              {getComboMultiplier(combo) > 1 && (
                <Text className="text-emerald-500 text-sm font-bold mt-0.5">
                  {getComboMultiplier(combo)}x SCORE
                </Text>
              )}
              <View className="w-full h-1.5 bg-black/50 rounded mt-1 overflow-hidden">
                <View
                  className={`h-full rounded ${
                    comboTimeLeft < 0.3
                      ? 'bg-brand-danger'
                      : comboTimeLeft < 0.6
                        ? 'bg-amber-400'
                        : 'bg-brand-gold'
                  }`}
                  style={{ width: `${comboTimerWidthPercent}%` as unknown as number }}
                />
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Active Power-ups Display */}
      {activePowerUps.length > 0 && (
        <View className="absolute bottom-5 left-5 flex-col gap-2 z-[100] pointer-events-none">
          {activePowerUps.map(({ type, timeRemaining: powerUpTime }) => {
            const display = POWER_UP_DISPLAYS[type];
            const maxDurations: Record<PowerUpType, number> = {
              shield: 0,
              magnet: 8,
              ghost: 5,
              multiplier: 10,
              slowMotion: 5,
            };
            const maxDuration = maxDurations[type];
            const widthPercent = maxDuration > 0 ? (powerUpTime / maxDuration) * 100 : 100;

            return (
              <View
                key={type}
                className="flex-row items-center gap-2 px-3 py-2 rounded-lg bg-black/60"
              >
                <View
                  className="w-8 h-8 rounded-full items-center justify-center"
                  style={{ backgroundColor: display.color }}
                >
                  <Text className="text-white text-base font-bold">{display.icon}</Text>
                </View>
                <View className="flex-col">
                  <Text className="text-white text-sm font-bold">{display.name}</Text>
                  <Text className="text-slate-400 text-xs">
                    {powerUpTime === -1 ? 'ACTIVE' : `${powerUpTime}s`}
                  </Text>
                  {powerUpTime !== -1 && (
                    <View className="w-[60px] h-1 bg-white/20 rounded mt-1 overflow-hidden">
                      <View
                        className="h-full rounded"
                        style={{
                          width: `${widthPercent}%`,
                          backgroundColor: display.color,
                        }}
                      />
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </>
  );
}
