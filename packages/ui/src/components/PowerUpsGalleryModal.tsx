/**
 * PowerUpsGalleryModal - Grid display of power-ups with locked/unlocked status
 * Uses 9-slice styled panel for branded appearance
 */

import type { PowerUpType } from '@otter-river-rush/game-core/types';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';

import { NineSliceButton, NineSlicePanel, type AtlasMetadata } from '../nine-slice';

/**
 * Power-up display information
 */
interface PowerUpInfo {
  type: PowerUpType;
  name: string;
  description: string;
  icon: string;
  unlockHint?: string;
}

/**
 * Default power-up definitions
 */
const POWER_UP_INFO: PowerUpInfo[] = [
  {
    type: 'shield',
    name: 'Shield',
    description: 'Protects from one obstacle hit',
    icon: '🛡️',
    unlockHint: 'Unlocked from the start',
  },
  {
    type: 'magnet',
    name: 'Magnet',
    description: 'Attracts nearby coins automatically',
    icon: '🧲',
    unlockHint: 'Collect 500 total coins',
  },
  {
    type: 'slowMotion',
    name: 'Slow Motion',
    description: 'Slows down time for easier dodging',
    icon: '⏱️',
    unlockHint: 'Travel 5,000m total distance',
  },
  {
    type: 'ghost',
    name: 'Ghost',
    description: 'Pass through obstacles unharmed',
    icon: '👻',
    unlockHint: 'Achieve a 50x combo',
  },
  {
    type: 'multiplier',
    name: 'Multiplier',
    description: 'Doubles all coin and gem values',
    icon: '✨',
    unlockHint: 'Unlock 3 otter characters',
  },
];

export interface PowerUpsGalleryModalProps {
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
  /** Set of unlocked power-up types */
  unlockedPowerUps?: Set<PowerUpType>;
  /** Custom power-up info (overrides defaults) */
  powerUpInfo?: PowerUpInfo[];
  /** Handler for selecting a power-up */
  onSelectPowerUp?: (type: PowerUpType) => void;
}

/**
 * Single power-up card in the grid
 */
interface PowerUpCardProps {
  info: PowerUpInfo;
  isUnlocked: boolean;
  onSelect?: () => void;
}

function PowerUpCard({ info, isUnlocked, onSelect }: PowerUpCardProps) {
  return (
    <Pressable
      className={`w-[140px] h-[160px] rounded-xl p-3 items-center justify-center ${
        isUnlocked
          ? 'bg-brand-surface border-2 border-brand-primary active:bg-slate-700'
          : 'bg-slate-800 border-2 border-slate-600'
      }`}
      onPress={isUnlocked ? onSelect : undefined}
      disabled={!isUnlocked}
      accessibilityLabel={`${info.name} power-up, ${isUnlocked ? 'unlocked' : 'locked'}`}
      accessibilityRole="button"
    >
      {/* Icon */}
      <View
        className={`w-16 h-16 rounded-full items-center justify-center mb-2 ${
          isUnlocked ? 'bg-brand-primary/20' : 'bg-slate-700'
        }`}
      >
        <Text className="text-3xl">{isUnlocked ? info.icon : '🔒'}</Text>
      </View>

      {/* Name */}
      <Text
        className={`text-sm font-bold text-center ${isUnlocked ? 'text-white' : 'text-slate-500'}`}
        numberOfLines={1}
      >
        {info.name}
      </Text>

      {/* Status indicator */}
      <View
        className={`mt-2 px-2 py-1 rounded-full ${
          isUnlocked ? 'bg-brand-success/20' : 'bg-slate-700'
        }`}
      >
        <Text
          className={`text-xs font-semibold ${
            isUnlocked ? 'text-brand-success' : 'text-slate-500'
          }`}
        >
          {isUnlocked ? '✓ Unlocked' : 'Locked'}
        </Text>
      </View>
    </Pressable>
  );
}

/**
 * Power-up detail panel shown when selecting an unlocked power-up
 */
interface PowerUpDetailProps {
  info: PowerUpInfo;
  isUnlocked: boolean;
}

function PowerUpDetail({ info, isUnlocked }: PowerUpDetailProps) {
  return (
    <View className="bg-slate-800/50 rounded-xl p-4 mt-4">
      <View className="flex-row items-center mb-2">
        <Text className="text-2xl mr-2">{info.icon}</Text>
        <Text className="text-white text-xl font-bold">{info.name}</Text>
      </View>
      <Text className="text-slate-300 text-sm leading-5 mb-2">{info.description}</Text>
      {!isUnlocked && info.unlockHint && (
        <View className="flex-row items-center mt-2">
          <Text className="text-slate-400 text-xs">🔓 {info.unlockHint}</Text>
        </View>
      )}
    </View>
  );
}

/**
 * PowerUpsGalleryModal - Displays power-ups in a grid with unlock status
 */
export function PowerUpsGalleryModal({
  visible,
  onClose,
  panelMetadata,
  panelAtlasSource,
  closeButtonMetadata,
  closeButtonAtlasSource,
  secondaryButtonMetadata,
  secondaryButtonAtlasSource,
  unlockedPowerUps = new Set(['shield']), // Shield unlocked by default
  powerUpInfo = POWER_UP_INFO,
  onSelectPowerUp,
}: PowerUpsGalleryModalProps) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // Track selected power-up for detail view
  const [selectedPowerUp, setSelectedPowerUp] = useState<PowerUpType | null>(null);

  // Calculate responsive panel size
  const panelSize = useMemo(() => {
    const maxWidth = Math.min(screenWidth - 32, 450);
    const maxHeight = Math.min(screenHeight - 80, 600);
    return { width: maxWidth, height: maxHeight };
  }, [screenWidth, screenHeight]);

  // Get selected power-up info
  const selectedInfo = useMemo(() => {
    if (!selectedPowerUp) return null;
    return powerUpInfo.find((p) => p.type === selectedPowerUp) ?? null;
  }, [selectedPowerUp, powerUpInfo]);

  const handleSelectPowerUp = (type: PowerUpType) => {
    setSelectedPowerUp(type);
    onSelectPowerUp?.(type);
  };

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
            accessibilityLabel="Power-ups gallery"
          >
            <ScrollView
              className="flex-1"
              contentContainerStyle={{ paddingBottom: 16 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Header */}
              <Text className="text-white text-3xl font-bold text-center mb-2">POWER-UPS</Text>
              <Text className="text-slate-400 text-sm text-center mb-6">
                Collect power-ups during gameplay
              </Text>

              {/* Power-ups grid */}
              <View className="flex-row flex-wrap justify-center gap-3 mb-4">
                {powerUpInfo.map((info) => (
                  <PowerUpCard
                    key={info.type}
                    info={info}
                    isUnlocked={unlockedPowerUps.has(info.type)}
                    onSelect={() => handleSelectPowerUp(info.type)}
                  />
                ))}
              </View>

              {/* Selected power-up detail */}
              {selectedInfo && (
                <PowerUpDetail
                  info={selectedInfo}
                  isUnlocked={unlockedPowerUps.has(selectedInfo.type)}
                />
              )}

              {/* Stats */}
              <View className="flex-row justify-around mt-6 mb-4">
                <View className="items-center">
                  <Text className="text-2xl font-bold text-brand-gold">
                    {unlockedPowerUps.size}
                  </Text>
                  <Text className="text-xs text-slate-400 mt-1">Unlocked</Text>
                </View>
                <View className="items-center">
                  <Text className="text-2xl font-bold text-slate-500">
                    {powerUpInfo.length - unlockedPowerUps.size}
                  </Text>
                  <Text className="text-xs text-slate-400 mt-1">Locked</Text>
                </View>
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
