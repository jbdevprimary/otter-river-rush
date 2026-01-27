/**
 * Achievement Notification Component - Cross-platform React Native/Web
 * Displays achievement unlock popups with animations
 * Uses NativeWind styling
 */

import { useAchievementStore } from '../../../game/store';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

/**
 * Rarity-based color configurations
 */
const RARITY_COLORS: Record<
  string,
  { bg: string; border: string; text: string }
> = {
  common: {
    bg: 'bg-slate-600/95',
    border: 'border-slate-500',
    text: 'text-slate-200',
  },
  rare: {
    bg: 'bg-blue-800/95',
    border: 'border-blue-500',
    text: 'text-blue-200',
  },
  epic: {
    bg: 'bg-purple-800/95',
    border: 'border-purple-500',
    text: 'text-purple-200',
  },
  legendary: {
    bg: 'bg-amber-700/95',
    border: 'border-amber-500',
    text: 'text-amber-200',
  },
};

/**
 * Icon mapping for achievement types
 */
const ICON_MAP: Record<string, string> = {
  wave: '\u{1F30A}',
  river: '\u{1F3CA}',
  medal: '\u{1F3C5}',
  trophy: '\u{1F3C6}',
  coin: '\u{1FA99}',
  coins: '\u{1F4B0}',
  treasure: '\u{1F4B0}',
  crown: '\u{1F451}',
  gem: '\u{1F48E}',
  gems: '\u{1F48E}',
  diamond: '\u{1F48E}',
  fire: '\u{1F525}',
  flame: '\u{1F525}',
  inferno: '\u{1F525}',
  star: '\u{2B50}',
  shield: '\u{1F6E1}',
  heart: '\u{2764}',
  sparkle: '\u{2728}',
  calendar: '\u{1F4C5}',
  team: '\u{1F9A6}',
  default: '\u{1F3C6}',
};

interface NotificationItemProps {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  onDismiss: (id: string) => void;
}

function NotificationItem({
  id,
  name,
  description,
  icon,
  rarity,
  onDismiss,
}: NotificationItemProps) {
  const [isVisible, setIsVisible] = useState(false);

  const colors = RARITY_COLORS[rarity] || RARITY_COLORS.common;
  const iconEmoji = ICON_MAP[icon] || ICON_MAP.default;

  useEffect(() => {
    // Animate in
    const enterTimer = setTimeout(() => setIsVisible(true), 50);

    // Auto dismiss after 5 seconds
    const dismissTimer = setTimeout(() => {
      onDismiss(id);
    }, 5000);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(dismissTimer);
    };
  }, [id, onDismiss]);

  const handleClick = useCallback(() => {
    onDismiss(id);
  }, [id, onDismiss]);

  const rarityBadgeColors = {
    common: 'bg-slate-500',
    rare: 'bg-blue-500',
    epic: 'bg-purple-500',
    legendary: 'bg-amber-500',
  };

  return (
    <Pressable
      className={`flex-row items-center gap-3 px-5 py-4 rounded-xl border-2 min-w-[280px] max-w-[350px] ${colors.bg} ${colors.border} ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onPress={handleClick}
      accessibilityRole="alert"
    >
      <Text className="text-[32px]">{iconEmoji}</Text>
      <View className="flex-1 flex-col gap-1 overflow-hidden">
        <View className="flex-row items-center gap-2 mb-0.5">
          <Text className={`text-[10px] uppercase tracking-wider opacity-80 ${colors.text}`}>
            Achievement Unlocked!
          </Text>
          <View
            className={`px-1.5 py-0.5 rounded ${rarityBadgeColors[rarity]}`}
          >
            <Text
              className={`text-[9px] uppercase tracking-tight font-bold ${
                rarity === 'legendary' ? 'text-slate-900' : 'text-white'
              }`}
            >
              {rarity}
            </Text>
          </View>
        </View>
        <Text
          className={`text-base font-bold ${colors.text}`}
          numberOfLines={1}
        >
          {name}
        </Text>
        <Text className={`text-xs opacity-90 ${colors.text}`} numberOfLines={1}>
          {description}
        </Text>
      </View>
    </Pressable>
  );
}

/**
 * Achievement Notification Container
 * Renders all pending achievement notifications
 */
export function AchievementNotification() {
  const pendingNotifications = useAchievementStore(
    (state) => state.pendingNotifications
  );
  const dismissNotification = useAchievementStore(
    (state) => state.dismissNotification
  );

  if (pendingNotifications.length === 0) {
    return null;
  }

  return (
    <View className="absolute top-20 right-5 flex-col gap-3 z-[300] pointer-events-none">
      {pendingNotifications.map((notification) => (
        <View key={notification.id} className="pointer-events-auto">
          <NotificationItem
            id={notification.id}
            name={notification.name}
            description={notification.description}
            icon={notification.icon}
            rarity={notification.rarity}
            onDismiss={dismissNotification}
          />
        </View>
      ))}
    </View>
  );
}
