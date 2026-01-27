/**
 * SettingsModal - 9-Slice styled settings modal
 * Wraps the settings functionality with branded 9-slice UI
 */

import { useCallback, useMemo } from 'react';
import { Modal, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';

import { NineSliceButton, NineSlicePanel, type AtlasMetadata } from '../nine-slice';

export interface SettingsModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Close handler */
  onClose: () => void;
  /** Panel metadata */
  panelMetadata: AtlasMetadata;
  /** Panel atlas source */
  panelAtlasSource: number | { uri: string };
  /** Close button metadata */
  closeButtonMetadata: AtlasMetadata;
  /** Close button atlas source */
  closeButtonAtlasSource: number | { uri: string };
  /** Secondary button metadata (for close button) */
  secondaryButtonMetadata: AtlasMetadata;
  /** Secondary button atlas source */
  secondaryButtonAtlasSource: number | { uri: string };
  /** Current music enabled state */
  musicEnabled?: boolean;
  /** Current sound enabled state */
  soundEnabled?: boolean;
  /** Current volume (0-1) */
  volume?: number;
  /** Music toggle handler */
  onMusicToggle?: () => void;
  /** Sound toggle handler */
  onSoundToggle?: () => void;
  /** Volume change handler */
  onVolumeChange?: (volume: number) => void;
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
      className={`w-16 h-11 rounded-full relative ${enabled ? 'bg-brand-success' : 'bg-slate-500'}`}
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
 * Volume Control Component
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

/**
 * SettingsModal - Modal with 9-slice styled panel
 */
export function SettingsModal({
  visible,
  onClose,
  panelMetadata,
  panelAtlasSource,
  closeButtonMetadata,
  closeButtonAtlasSource,
  secondaryButtonMetadata,
  secondaryButtonAtlasSource,
  musicEnabled = true,
  soundEnabled = true,
  volume = 0.8,
  onMusicToggle,
  onSoundToggle,
  onVolumeChange,
}: SettingsModalProps) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // Calculate responsive panel size
  const panelSize = useMemo(() => {
    const maxWidth = Math.min(screenWidth - 48, 400);
    const maxHeight = Math.min(screenHeight - 100, 500);
    return { width: maxWidth, height: maxHeight };
  }, [screenWidth, screenHeight]);

  // Volume display values
  const musicVolumeDisplay = Math.round((musicEnabled ? volume : 0) * 100);
  const sfxVolumeDisplay = Math.round((soundEnabled ? volume : 0) * 100);

  const handleMusicVolumeChange = useCallback(
    (newValue: number) => {
      onVolumeChange?.(newValue / 100);
    },
    [onVolumeChange]
  );

  const handleSFXVolumeChange = useCallback(
    (newValue: number) => {
      onVolumeChange?.(newValue / 100);
    },
    [onVolumeChange]
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/70 justify-center items-center" onPress={onClose}>
        <Pressable onPress={(e) => e.stopPropagation()}>
          <NineSlicePanel
            metadata={panelMetadata}
            atlasSource={panelAtlasSource}
            width={panelSize.width}
            height={panelSize.height}
            showCloseButton
            onClose={onClose}
            closeButtonMetadata={closeButtonMetadata}
            closeButtonAtlasSource={closeButtonAtlasSource}
            accessibilityLabel="Settings panel"
          >
            <ScrollView
              className="flex-1"
              contentContainerStyle={{ paddingBottom: 16 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Header */}
              <Text className="text-white text-3xl font-bold text-center mb-6">SETTINGS</Text>

              {/* Music Section */}
              <View className="mb-5">
                <Text className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-3">
                  Music
                </Text>

                <View className="flex-row items-center justify-between min-h-[44px] mb-4">
                  <Text className="text-white text-lg">Music</Text>
                  <Toggle
                    enabled={musicEnabled}
                    onToggle={onMusicToggle ?? (() => {})}
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

              <View className="h-px bg-slate-700 my-2" />

              {/* SFX Section */}
              <View className="mb-5">
                <Text className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-3">
                  Sound Effects
                </Text>

                <View className="flex-row items-center justify-between min-h-[44px] mb-4">
                  <Text className="text-white text-lg">SFX</Text>
                  <Toggle
                    enabled={soundEnabled}
                    onToggle={onSoundToggle ?? (() => {})}
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

              {/* Close Button */}
              <View className="mt-4 items-center">
                <NineSliceButton
                  metadata={secondaryButtonMetadata}
                  atlasSource={secondaryButtonAtlasSource}
                  onPress={onClose}
                  width={200}
                  height={56}
                >
                  CLOSE
                </NineSliceButton>
              </View>
            </ScrollView>
          </NineSlicePanel>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
