/**
 * Settings Component - Cross-platform React Native/Web
 * Modal overlay for adjusting game audio settings
 * Mobile-first design with large touch targets (min 44px)
 * Uses NativeWind styling
 */

import { GAME_SPEED_LABELS } from '../../../game/config';
import {
  type ColorblindMode,
  type GameSpeedOption,
  useGameStore,
} from '../../../game/store';
import {
  setMusicVolume,
  setSFXVolume,
  setMuted,
  playClick,
} from '../../../lib/audio';
import { useCallback, useEffect } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_KEY = 'otter-river-rush-settings';

interface SettingsData {
  musicVolume: number;
  sfxVolume: number;
  musicEnabled: boolean;
  soundEnabled: boolean;
}

function loadSettingsFromStorage(): SettingsData | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as SettingsData;
    }
  } catch {
    // Ignore storage errors
  }
  return null;
}

function saveSettingsToStorage(settings: SettingsData): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Toggle Switch Component
 */
function Toggle({
  enabled,
  onToggle,
  label,
}: {
  enabled: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <Pressable
      className={`w-16 h-11 rounded-full relative ${
        enabled ? 'bg-brand-success' : 'bg-slate-500'
      }`}
      onPress={onToggle}
      accessibilityLabel={label}
      accessibilityRole="switch"
    >
      <View
        className={`absolute top-1 w-9 h-9 bg-white rounded-full shadow ${
          enabled ? 'left-6' : 'left-1'
        }`}
      />
    </Pressable>
  );
}

/**
 * Volume Slider Component (simplified for cross-platform)
 */
function VolumeControl({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  disabled: boolean;
}) {
  const increaseVolume = () => {
    if (!disabled && value < 100) {
      onChange(Math.min(100, value + 10));
    }
  };

  const decreaseVolume = () => {
    if (!disabled && value > 0) {
      onChange(Math.max(0, value - 10));
    }
  };

  return (
    <View className="flex-row items-center justify-between w-full min-h-[44px] mb-4">
      <Text className="text-white text-lg">{label}</Text>
      <View className="flex-row items-center gap-3 w-[60%]">
        <Pressable
          className={`w-11 h-11 rounded-lg items-center justify-center ${
            disabled ? 'bg-slate-700' : 'bg-slate-600 active:bg-slate-500'
          }`}
          onPress={decreaseVolume}
          disabled={disabled}
        >
          <Text className="text-white text-2xl font-bold">-</Text>
        </Pressable>
        <View className="flex-1 h-2 bg-slate-700 rounded overflow-hidden">
          <View
            className={`h-full rounded ${disabled ? 'bg-slate-500' : 'bg-brand-primary'}`}
            style={{ width: `${value}%` }}
          />
        </View>
        <Pressable
          className={`w-11 h-11 rounded-lg items-center justify-center ${
            disabled ? 'bg-slate-700' : 'bg-slate-600 active:bg-slate-500'
          }`}
          onPress={increaseVolume}
          disabled={disabled}
        >
          <Text className="text-white text-2xl font-bold">+</Text>
        </Pressable>
        <Text className="text-brand-primary text-base font-bold min-w-[48px] text-right">
          {value}%
        </Text>
      </View>
    </View>
  );
}

export function Settings({ isOpen, onClose }: SettingsProps) {
  const soundEnabled = useGameStore((state) => state.soundEnabled);
  const musicEnabled = useGameStore((state) => state.musicEnabled);
  const volume = useGameStore((state) => state.volume);
  const accessibility = useGameStore((state) => state.accessibility);

  // Accessibility handlers
  const handleHighContrastToggle = useCallback(() => {
    playClick();
    useGameStore.getState().updateAccessibility({
      highContrast: !accessibility.highContrast,
    });
  }, [accessibility.highContrast]);

  const handleColorblindModeChange = useCallback((mode: ColorblindMode) => {
    playClick();
    useGameStore.getState().updateAccessibility({
      colorblindMode: mode,
    });
  }, []);

  const handleReducedMotionToggle = useCallback(() => {
    playClick();
    useGameStore.getState().updateAccessibility({
      reducedMotion: !accessibility.reducedMotion,
    });
  }, [accessibility.reducedMotion]);

  const handleGameSpeedChange = useCallback((speed: GameSpeedOption) => {
    playClick();
    useGameStore.getState().updateAccessibility({
      gameSpeedMultiplier: speed,
    });
  }, []);

  const speedOptions: GameSpeedOption[] = [0.5, 0.75, 1];
  const colorblindModes: ColorblindMode[] = [
    'none',
    'protanopia',
    'deuteranopia',
    'tritanopia',
  ];

  // Sync audio manager with store on mount and changes
  useEffect(() => {
    setMusicVolume(musicEnabled ? volume : 0);
    setSFXVolume(soundEnabled ? volume : 0);
    setMuted(!soundEnabled && !musicEnabled);
  }, [soundEnabled, musicEnabled, volume]);

  // Load settings from localStorage on mount
  useEffect(() => {
    const stored = loadSettingsFromStorage();
    if (stored) {
      useGameStore.getState().updateSettings({
        soundEnabled: stored.soundEnabled,
        musicEnabled: stored.musicEnabled,
        volume: stored.musicVolume,
      });
    }
  }, []);

  const handleMusicVolumeChange = useCallback(
    (newValue: number) => {
      const newVolume = newValue / 100;
      useGameStore.getState().updateSettings({ volume: newVolume });
      setMusicVolume(musicEnabled ? newVolume : 0);

      saveSettingsToStorage({
        musicVolume: newVolume,
        sfxVolume: soundEnabled ? newVolume : 0,
        musicEnabled,
        soundEnabled,
      });
    },
    [musicEnabled, soundEnabled]
  );

  const handleSFXVolumeChange = useCallback(
    (newValue: number) => {
      const newVolume = newValue / 100;
      useGameStore.getState().updateSettings({ volume: newVolume });
      setSFXVolume(soundEnabled ? newVolume : 0);

      saveSettingsToStorage({
        musicVolume: musicEnabled ? newVolume : 0,
        sfxVolume: newVolume,
        musicEnabled,
        soundEnabled,
      });
    },
    [musicEnabled, soundEnabled]
  );

  const handleMusicToggle = useCallback(() => {
    playClick();
    const newEnabled = !musicEnabled;
    useGameStore.getState().updateSettings({ musicEnabled: newEnabled });
    setMusicVolume(newEnabled ? volume : 0);

    saveSettingsToStorage({
      musicVolume: volume,
      sfxVolume: volume,
      musicEnabled: newEnabled,
      soundEnabled,
    });
  }, [musicEnabled, volume, soundEnabled]);

  const handleSFXToggle = useCallback(() => {
    const newEnabled = !soundEnabled;
    useGameStore.getState().updateSettings({ soundEnabled: newEnabled });
    setSFXVolume(newEnabled ? volume : 0);
    setMuted(!newEnabled && !musicEnabled);

    if (newEnabled) {
      playClick();
    }

    saveSettingsToStorage({
      musicVolume: volume,
      sfxVolume: volume,
      musicEnabled,
      soundEnabled: newEnabled,
    });
  }, [soundEnabled, volume, musicEnabled]);

  const handleClose = useCallback(() => {
    playClick();
    onClose();
  }, [onClose]);

  // Calculate display values
  const musicVolumeDisplay = Math.round((musicEnabled ? volume : 0) * 100);
  const sfxVolumeDisplay = Math.round((soundEnabled ? volume : 0) * 100);

  if (!isOpen) return null;

  return (
    <Pressable
      className="absolute inset-0 bg-brand-background/90 justify-center items-center z-[300] p-5"
      onPress={handleClose}
    >
      <Pressable
        className="flex-col items-center w-full max-w-[400px] max-h-[90vh] bg-brand-surface rounded-2xl p-6 border-2 border-brand-primary"
        onPress={(e) => e.stopPropagation()}
      >
        <ScrollView
          className="w-full"
          contentContainerStyle={{ alignItems: 'center' }}
          showsVerticalScrollIndicator={false}
        >
          <Text className="text-white text-4xl font-bold text-center mb-6">
            SETTINGS
          </Text>

          {/* Music Section */}
          <View className="w-full mb-5">
            <Text className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-3">
              Music
            </Text>

            <View className="flex-row items-center justify-between w-full min-h-[44px] mb-4">
              <Text className="text-white text-lg">Music</Text>
              <Toggle
                enabled={musicEnabled}
                onToggle={handleMusicToggle}
                label={musicEnabled ? 'Disable music' : 'Enable music'}
              />
            </View>

            <VolumeControl
              label="Volume"
              value={musicVolumeDisplay}
              onChange={handleMusicVolumeChange}
              disabled={!musicEnabled}
            />
          </View>

          <View className="w-full h-px bg-slate-700 my-2" />

          {/* SFX Section */}
          <View className="w-full mb-5">
            <Text className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-3">
              Sound Effects
            </Text>

            <View className="flex-row items-center justify-between w-full min-h-[44px] mb-4">
              <Text className="text-white text-lg">SFX</Text>
              <Toggle
                enabled={soundEnabled}
                onToggle={handleSFXToggle}
                label={soundEnabled ? 'Disable SFX' : 'Enable SFX'}
              />
            </View>

            <VolumeControl
              label="Volume"
              value={sfxVolumeDisplay}
              onChange={handleSFXVolumeChange}
              disabled={!soundEnabled}
            />
          </View>

          <View className="w-full h-px bg-slate-700 my-2" />

          {/* Accessibility Section */}
          <View className="w-full mb-5">
            <Text className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-3">
              Accessibility
            </Text>

            {/* High Contrast */}
            <View className="flex-row items-center justify-between w-full min-h-[44px] mb-4">
              <View className="flex-col flex-1">
                <Text className="text-white text-lg">High Contrast</Text>
                <Text className="text-slate-500 text-xs">
                  Increase color contrast
                </Text>
              </View>
              <Toggle
                enabled={accessibility.highContrast}
                onToggle={handleHighContrastToggle}
                label={
                  accessibility.highContrast
                    ? 'Disable high contrast'
                    : 'Enable high contrast'
                }
              />
            </View>

            {/* Colorblind Mode */}
            <View className="flex-row items-center justify-between w-full min-h-[44px] mb-4">
              <View className="flex-col flex-1">
                <Text className="text-white text-lg">Colorblind Mode</Text>
                <Text className="text-slate-500 text-xs">
                  Adjust colors for visibility
                </Text>
              </View>
            </View>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {colorblindModes.map((mode) => (
                <Pressable
                  key={mode}
                  className={`px-3 py-2 rounded-lg min-h-[44px] items-center justify-center ${
                    accessibility.colorblindMode === mode
                      ? 'bg-brand-primary'
                      : 'bg-slate-700 active:bg-slate-600'
                  }`}
                  onPress={() => handleColorblindModeChange(mode)}
                >
                  <Text
                    className={`text-sm font-bold capitalize ${
                      accessibility.colorblindMode === mode
                        ? 'text-white'
                        : 'text-slate-400'
                    }`}
                  >
                    {mode === 'none' ? 'None' : mode}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Reduced Motion */}
            <View className="flex-row items-center justify-between w-full min-h-[44px] mb-4">
              <View className="flex-col flex-1">
                <Text className="text-white text-lg">Reduced Motion</Text>
                <Text className="text-slate-500 text-xs">
                  Disable particles
                </Text>
              </View>
              <Toggle
                enabled={accessibility.reducedMotion}
                onToggle={handleReducedMotionToggle}
                label={
                  accessibility.reducedMotion
                    ? 'Disable reduced motion'
                    : 'Enable reduced motion'
                }
              />
            </View>

            {/* Game Speed */}
            <View className="flex-row items-center justify-between w-full min-h-[44px] mb-4">
              <View className="flex-col flex-1">
                <Text className="text-white text-lg">Game Speed</Text>
                <Text className="text-slate-500 text-xs">
                  Slow down gameplay
                </Text>
              </View>
            </View>
            <View className="flex-row gap-2 justify-end flex-wrap">
              {speedOptions.map((speed) => (
                <Pressable
                  key={speed}
                  className={`px-3 py-2 rounded-lg min-h-[44px] min-w-[55px] items-center justify-center ${
                    accessibility.gameSpeedMultiplier === speed
                      ? 'bg-brand-primary'
                      : 'bg-slate-700 active:bg-slate-600'
                  }`}
                  onPress={() => handleGameSpeedChange(speed)}
                >
                  <Text
                    className={`text-xs font-bold ${
                      accessibility.gameSpeedMultiplier === speed
                        ? 'text-white'
                        : 'text-slate-400'
                    }`}
                  >
                    {GAME_SPEED_LABELS[speed]}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Pressable
            className="w-full h-14 bg-brand-primary rounded-xl items-center justify-center mt-2 active:bg-blue-400 active:scale-[1.02]"
            onPress={handleClose}
          >
            <Text className="text-white text-xl font-bold font-mono">
              CLOSE
            </Text>
          </Pressable>

          <Text className="text-slate-500 text-xs text-center mt-4">
            Press ESC to close
          </Text>
        </ScrollView>
      </Pressable>
    </Pressable>
  );
}
