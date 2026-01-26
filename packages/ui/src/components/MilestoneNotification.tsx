/**
 * Milestone Notification Component
 * Displays distance milestone popups with celebration effects
 */

import { useGameStore } from '@otter-river-rush/state';
import { type CSSProperties, useCallback, useEffect, useRef, useState } from 'react';

/**
 * Distance milestones to celebrate (in meters)
 */
const MILESTONES = [100, 250, 500, 1000, 2000, 3000, 5000] as const;

/**
 * Check if milestone is a major one (1000m+)
 */
function isMajorMilestone(distance: number): boolean {
  return distance >= 1000;
}

/**
 * Get milestone styling based on distance
 */
function getMilestoneStyle(distance: number): {
  bg: string;
  border: string;
  glow: string;
  text: string;
  label: string;
} {
  if (distance >= 5000) {
    return {
      bg: 'rgba(161, 98, 7, 0.95)',
      border: '#f59e0b',
      glow: 'rgba(245, 158, 11, 0.6)',
      text: '#fcd34d',
      label: 'LEGENDARY!',
    };
  }
  if (distance >= 3000) {
    return {
      bg: 'rgba(88, 28, 135, 0.95)',
      border: '#a855f7',
      glow: 'rgba(168, 85, 247, 0.5)',
      text: '#d8b4fe',
      label: 'EPIC!',
    };
  }
  if (distance >= 1000) {
    return {
      bg: 'rgba(30, 64, 175, 0.95)',
      border: '#3b82f6',
      glow: 'rgba(59, 130, 246, 0.5)',
      text: '#93c5fd',
      label: 'AMAZING!',
    };
  }
  return {
    bg: 'rgba(16, 185, 129, 0.95)',
    border: '#10b981',
    glow: 'rgba(16, 185, 129, 0.5)',
    text: '#a7f3d0',
    label: 'NICE!',
  };
}

const styles = {
  container: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 400,
    pointerEvents: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  } satisfies CSSProperties,

  notification: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px 40px',
    borderRadius: '16px',
    fontFamily: 'monospace',
    textAlign: 'center',
    transform: 'scale(1) translateY(0)',
    opacity: 1,
    transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease-out',
  } satisfies CSSProperties,

  notificationEntering: {
    transform: 'scale(0.3) translateY(40px)',
    opacity: 0,
  } satisfies CSSProperties,

  notificationExiting: {
    transform: 'scale(0.8) translateY(-20px)',
    opacity: 0,
  } satisfies CSSProperties,

  labelText: {
    fontSize: '14px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '3px',
    margin: 0,
    marginBottom: '4px',
  } satisfies CSSProperties,

  distanceText: {
    fontSize: '48px',
    fontWeight: 'bold',
    margin: 0,
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
  } satisfies CSSProperties,

  majorDistanceText: {
    fontSize: '64px',
    fontWeight: 'bold',
    margin: 0,
    textShadow: '3px 3px 6px rgba(0, 0, 0, 0.3)',
  } satisfies CSSProperties,

  celebration: {
    position: 'absolute',
    fontSize: '24px',
    animation: 'sparkle 0.6s ease-out forwards',
  } satisfies CSSProperties,
};

// CSS keyframes for sparkle animation (injected once)
const sparkleKeyframes = `
@keyframes sparkle {
  0% {
    transform: scale(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: scale(1.5) rotate(180deg);
    opacity: 0;
  }
}
@keyframes pulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.05);
  }
}
`;

interface MilestoneItemProps {
  distance: number;
  onDismiss: () => void;
}

function MilestoneItem({ distance, onDismiss }: MilestoneItemProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const isMajor = isMajorMilestone(distance);
  const milestoneStyle = getMilestoneStyle(distance);

  useEffect(() => {
    // Animate in
    const enterTimer = setTimeout(() => setIsVisible(true), 50);

    // Auto dismiss after 2 seconds
    const dismissTimer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onDismiss, 400);
    }, 2000);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(dismissTimer);
    };
  }, [onDismiss]);

  const notificationStyle: CSSProperties = {
    ...styles.notification,
    backgroundColor: milestoneStyle.bg,
    border: `3px solid ${milestoneStyle.border}`,
    boxShadow: `0 8px 32px ${milestoneStyle.glow}, 0 0 60px ${milestoneStyle.glow}`,
    color: milestoneStyle.text,
    ...((!isVisible || isExiting) &&
      (isExiting ? styles.notificationExiting : styles.notificationEntering)),
    ...(isMajor && { animation: 'pulse 0.5s ease-in-out 2' }),
  };

  // Generate sparkle positions for major milestones
  const sparkles = isMajor
    ? [
        { top: '-20px', left: '10%' },
        { top: '-15px', right: '15%' },
        { bottom: '-20px', left: '20%' },
        { bottom: '-15px', right: '10%' },
        { top: '50%', left: '-30px' },
        { top: '50%', right: '-30px' },
      ]
    : [];

  return (
    <div style={notificationStyle} role="alert" aria-live="polite">
      <p style={styles.labelText}>{milestoneStyle.label}</p>
      <p style={isMajor ? styles.majorDistanceText : styles.distanceText}>{distance}m!</p>

      {/* Sparkle effects for major milestones */}
      {isVisible &&
        !isExiting &&
        sparkles.map((pos, i) => (
          <span
            key={i}
            style={{
              ...styles.celebration,
              ...pos,
              animationDelay: `${i * 0.1}s`,
            }}
          >
            {'\u2728'}
          </span>
        ))}
    </div>
  );
}

/**
 * Milestone Notification Container
 * Tracks distance and shows notifications when milestones are reached
 */
export function MilestoneNotification() {
  const distance = useGameStore((state) => state.distance);
  const status = useGameStore((state) => state.status);

  // Track which milestones have been shown in current game session
  const shownMilestonesRef = useRef<Set<number>>(new Set());
  const [activeMilestone, setActiveMilestone] = useState<number | null>(null);
  const stylesInjectedRef = useRef(false);

  // Inject keyframe styles once
  useEffect(() => {
    if (!stylesInjectedRef.current) {
      const styleSheet = document.createElement('style');
      styleSheet.textContent = sparkleKeyframes;
      document.head.appendChild(styleSheet);
      stylesInjectedRef.current = true;
    }
  }, []);

  // Reset shown milestones when game restarts
  useEffect(() => {
    if (status === 'menu' || status === 'character_select') {
      shownMilestonesRef.current.clear();
      setActiveMilestone(null);
    }
  }, [status]);

  // Check for new milestones
  useEffect(() => {
    if (status !== 'playing') return;

    const currentDistance = Math.floor(distance);

    for (const milestone of MILESTONES) {
      if (currentDistance >= milestone && !shownMilestonesRef.current.has(milestone)) {
        // Mark as shown and trigger notification
        shownMilestonesRef.current.add(milestone);
        setActiveMilestone(milestone);
        break; // Only show one milestone at a time
      }
    }
  }, [distance, status]);

  // Handle dismissal
  const handleDismiss = useCallback(() => {
    setActiveMilestone(null);
  }, []);

  // Don't render if no active milestone or not playing
  if (activeMilestone === null || status !== 'playing') {
    return null;
  }

  return (
    <div style={styles.container}>
      <MilestoneItem
        key={activeMilestone}
        distance={activeMilestone}
        onDismiss={handleDismiss}
      />
    </div>
  );
}
