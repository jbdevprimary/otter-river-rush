/**
 * Milestone Notification Component - Cross-platform React Native/Web
 * Displays distance milestone popups with celebration effects
 * Uses NativeWind styling
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { useGameStore } from '../../../game/store';

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
  bgClass: string;
  borderClass: string;
  textClass: string;
  label: string;
} {
  if (distance >= 5000) {
    return {
      bgClass: 'bg-amber-700/95',
      borderClass: 'border-amber-500',
      textClass: 'text-amber-200',
      label: 'LEGENDARY!',
    };
  }
  if (distance >= 3000) {
    return {
      bgClass: 'bg-purple-800/95',
      borderClass: 'border-purple-500',
      textClass: 'text-purple-200',
      label: 'EPIC!',
    };
  }
  if (distance >= 1000) {
    return {
      bgClass: 'bg-blue-800/95',
      borderClass: 'border-blue-500',
      textClass: 'text-blue-200',
      label: 'AMAZING!',
    };
  }
  return {
    bgClass: 'bg-emerald-500/95',
    borderClass: 'border-emerald-400',
    textClass: 'text-emerald-100',
    label: 'NICE!',
  };
}

interface MilestoneItemProps {
  distance: number;
  onDismiss: () => void;
}

function MilestoneItem({ distance, onDismiss }: MilestoneItemProps) {
  const [isVisible, setIsVisible] = useState(false);
  const isMajor = isMajorMilestone(distance);
  const milestoneStyle = getMilestoneStyle(distance);

  useEffect(() => {
    // Animate in
    const enterTimer = setTimeout(() => setIsVisible(true), 50);

    // Auto dismiss after 2 seconds
    const dismissTimer = setTimeout(() => {
      onDismiss();
    }, 2000);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(dismissTimer);
    };
  }, [onDismiss]);

  return (
    <View
      className={`flex-col items-center px-10 py-5 rounded-2xl border-[3px] ${milestoneStyle.bgClass} ${milestoneStyle.borderClass} ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      accessibilityRole="alert"
    >
      <Text
        className={`text-sm font-bold uppercase tracking-widest mb-1 ${milestoneStyle.textClass}`}
      >
        {milestoneStyle.label}
      </Text>
      <Text
        className={`font-bold ${isMajor ? 'text-6xl' : 'text-5xl'} ${milestoneStyle.textClass}`}
      >
        {distance}m!
      </Text>

      {/* Sparkle effects for major milestones */}
      {isVisible && isMajor && (
        <>
          <Text className="absolute -top-5 left-[10%] text-2xl">{'\u2728'}</Text>
          <Text className="absolute -top-4 right-[15%] text-2xl">{'\u2728'}</Text>
          <Text className="absolute -bottom-5 left-[20%] text-2xl">{'\u2728'}</Text>
          <Text className="absolute -bottom-4 right-[10%] text-2xl">{'\u2728'}</Text>
        </>
      )}
    </View>
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
    <View className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[400] pointer-events-none flex-col items-center gap-2">
      <MilestoneItem key={activeMilestone} distance={activeMilestone} onDismiss={handleDismiss} />
    </View>
  );
}
