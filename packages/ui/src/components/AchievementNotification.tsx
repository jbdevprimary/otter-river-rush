/**
 * Achievement Notification Component
 * Displays achievement unlock popups with animations
 */

import { useAchievementStore } from '@otter-river-rush/state';
import { type CSSProperties, useCallback, useEffect, useState } from 'react';

/**
 * Rarity-based color configurations
 */
const RARITY_COLORS: Record<string, { bg: string; border: string; glow: string; text: string }> = {
  common: {
    bg: 'rgba(71, 85, 105, 0.95)',
    border: '#64748b',
    glow: 'rgba(100, 116, 139, 0.5)',
    text: '#e2e8f0',
  },
  rare: {
    bg: 'rgba(30, 64, 175, 0.95)',
    border: '#3b82f6',
    glow: 'rgba(59, 130, 246, 0.5)',
    text: '#93c5fd',
  },
  epic: {
    bg: 'rgba(88, 28, 135, 0.95)',
    border: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.5)',
    text: '#d8b4fe',
  },
  legendary: {
    bg: 'rgba(161, 98, 7, 0.95)',
    border: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.6)',
    text: '#fcd34d',
  },
};

/**
 * Icon mapping for achievement types
 */
const ICON_MAP: Record<string, string> = {
  wave: '\u{1F30A}', // Wave emoji
  river: '\u{1F3CA}', // Swimmer emoji
  medal: '\u{1F3C5}', // Medal emoji
  trophy: '\u{1F3C6}', // Trophy emoji
  coin: '\u{1FA99}', // Coin emoji
  coins: '\u{1F4B0}', // Money bag emoji
  treasure: '\u{1F4B0}', // Money bag emoji
  crown: '\u{1F451}', // Crown emoji
  gem: '\u{1F48E}', // Gem emoji
  gems: '\u{1F48E}', // Gem emoji
  diamond: '\u{1F48E}', // Diamond emoji
  fire: '\u{1F525}', // Fire emoji
  flame: '\u{1F525}', // Fire emoji
  inferno: '\u{1F525}', // Fire emoji
  star: '\u{2B50}', // Star emoji
  shield: '\u{1F6E1}', // Shield emoji
  heart: '\u{2764}', // Heart emoji
  sparkle: '\u{2728}', // Sparkles emoji
  calendar: '\u{1F4C5}', // Calendar emoji
  team: '\u{1F9A6}', // Otter emoji
  default: '\u{1F3C6}', // Default trophy
};

const styles = {
  container: {
    position: 'fixed',
    top: '80px',
    right: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    zIndex: 300,
    pointerEvents: 'none',
  } satisfies CSSProperties,

  notification: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 20px',
    borderRadius: '12px',
    fontFamily: 'monospace',
    minWidth: '280px',
    maxWidth: '350px',
    transform: 'translateX(0)',
    opacity: 1,
    transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
    pointerEvents: 'auto',
    cursor: 'pointer',
  } satisfies CSSProperties,

  notificationEntering: {
    transform: 'translateX(100%)',
    opacity: 0,
  } satisfies CSSProperties,

  notificationExiting: {
    transform: 'translateX(100%)',
    opacity: 0,
  } satisfies CSSProperties,

  iconContainer: {
    fontSize: '32px',
    lineHeight: 1,
    flexShrink: 0,
  } satisfies CSSProperties,

  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    overflow: 'hidden',
  } satisfies CSSProperties,

  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '2px',
  } satisfies CSSProperties,

  label: {
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    opacity: 0.8,
    margin: 0,
  } satisfies CSSProperties,

  name: {
    fontSize: '16px',
    fontWeight: 'bold',
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  } satisfies CSSProperties,

  description: {
    fontSize: '12px',
    opacity: 0.9,
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  } satisfies CSSProperties,

  rarityBadge: {
    fontSize: '9px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    padding: '2px 6px',
    borderRadius: '4px',
    fontWeight: 'bold',
  } satisfies CSSProperties,
};

interface NotificationItemProps {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  onDismiss: (id: string) => void;
}

function NotificationItem({ id, name, description, icon, rarity, onDismiss }: NotificationItemProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const colors = RARITY_COLORS[rarity] || RARITY_COLORS.common;
  const iconEmoji = ICON_MAP[icon] || ICON_MAP.default;

  useEffect(() => {
    // Animate in
    const enterTimer = setTimeout(() => setIsVisible(true), 50);

    // Auto dismiss after 5 seconds
    const dismissTimer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onDismiss(id), 300);
    }, 5000);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(dismissTimer);
    };
  }, [id, onDismiss]);

  const handleClick = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => onDismiss(id), 300);
  }, [id, onDismiss]);

  const notificationStyle: CSSProperties = {
    ...styles.notification,
    backgroundColor: colors.bg,
    border: `2px solid ${colors.border}`,
    boxShadow: `0 4px 20px ${colors.glow}, 0 0 40px ${colors.glow}`,
    color: colors.text,
    ...((!isVisible || isExiting) && styles.notificationEntering),
  };

  return (
    <div style={notificationStyle} onClick={handleClick} role="alert" aria-live="polite">
      <div style={styles.iconContainer}>{iconEmoji}</div>
      <div style={styles.content}>
        <div style={styles.header}>
          <p style={styles.label}>Achievement Unlocked!</p>
          <span
            style={{
              ...styles.rarityBadge,
              backgroundColor: colors.border,
              color: rarity === 'legendary' ? '#1a1a1a' : '#ffffff',
            }}
          >
            {rarity}
          </span>
        </div>
        <p style={styles.name}>{name}</p>
        <p style={styles.description}>{description}</p>
      </div>
    </div>
  );
}

/**
 * Achievement Notification Container
 * Renders all pending achievement notifications
 */
export function AchievementNotification() {
  const pendingNotifications = useAchievementStore((state) => state.pendingNotifications);
  const dismissNotification = useAchievementStore((state) => state.dismissNotification);

  if (pendingNotifications.length === 0) {
    return null;
  }

  return (
    <div style={styles.container}>
      {pendingNotifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          id={notification.id}
          name={notification.name}
          description={notification.description}
          icon={notification.icon}
          rarity={notification.rarity}
          onDismiss={dismissNotification}
        />
      ))}
    </div>
  );
}
