/**
 * Section Tracker
 * Tracks section transitions and provides data for UI indicators
 *
 * When the player enters a new section type, a transition event is triggered
 * that can be used to show UI notifications and trigger haptic feedback.
 */

import type { RiverSectionType } from '../types/river-path';
import { haptics } from '../utils';

// ============================================================================
// Types
// ============================================================================

export interface SectionTransition {
  /** Previous section type */
  from: RiverSectionType;
  /** New section type */
  to: RiverSectionType;
  /** Timestamp of transition */
  timestamp: number;
  /** Distance where transition occurred */
  distance: number;
}

export interface SectionIndicator {
  /** Section type */
  type: RiverSectionType;
  /** Display name */
  name: string;
  /** Short description */
  description: string;
  /** Color for UI */
  color: string;
  /** Icon emoji or identifier */
  icon: string;
  /** Whether this is a warning (dangerous section) */
  isWarning: boolean;
}

// ============================================================================
// Constants
// ============================================================================

export const SECTION_INDICATORS: Record<RiverSectionType, SectionIndicator> = {
  normal: {
    type: 'normal',
    name: 'River',
    description: 'Normal water',
    color: '#4a9eff',
    icon: 'water',
    isWarning: false,
  },
  rapids: {
    type: 'rapids',
    name: 'Rapids!',
    description: 'Fast water ahead!',
    color: '#ff6b35',
    icon: 'warning',
    isWarning: true,
  },
  calm_pool: {
    type: 'calm_pool',
    name: 'Calm Pool',
    description: 'Easy collecting!',
    color: '#4ade80',
    icon: 'lily',
    isWarning: false,
  },
  whirlpool: {
    type: 'whirlpool',
    name: 'Whirlpool!',
    description: 'Stay on the sides!',
    color: '#a855f7',
    icon: 'spiral',
    isWarning: true,
  },
};

/** Duration to show section indicator (ms) */
export const INDICATOR_DURATION = 2000;

// ============================================================================
// Section Tracker State
// ============================================================================

interface SectionTrackerState {
  /** Current section type */
  currentSection: RiverSectionType;
  /** Recent transitions for UI display */
  recentTransitions: SectionTransition[];
  /** Last transition timestamp */
  lastTransitionTime: number;
  /** Callbacks for section change events */
  listeners: Set<(transition: SectionTransition) => void>;
}

const state: SectionTrackerState = {
  currentSection: 'normal',
  recentTransitions: [],
  lastTransitionTime: 0,
  listeners: new Set(),
};

// ============================================================================
// Tracker Functions
// ============================================================================

/**
 * Update the current section based on game state
 * Call this in the game loop with the current segment's section type
 */
export function updateSectionTracker(
  sectionType: RiverSectionType,
  distance: number
): void {
  if (sectionType === state.currentSection) {
    return; // No change
  }

  const transition: SectionTransition = {
    from: state.currentSection,
    to: sectionType,
    timestamp: Date.now(),
    distance,
  };

  // Update state
  state.currentSection = sectionType;
  state.lastTransitionTime = transition.timestamp;
  state.recentTransitions.push(transition);

  // Keep only recent transitions (last 5)
  if (state.recentTransitions.length > 5) {
    state.recentTransitions.shift();
  }

  // Trigger haptic feedback based on section type
  triggerSectionHaptic(sectionType);

  // Notify listeners
  for (const listener of state.listeners) {
    listener(transition);
  }
}

/**
 * Get the current section type
 */
export function getCurrentSection(): RiverSectionType {
  return state.currentSection;
}

/**
 * Get the indicator info for a section type
 */
export function getSectionIndicator(type: RiverSectionType): SectionIndicator {
  return SECTION_INDICATORS[type];
}

/**
 * Check if there's an active transition indicator to show
 * Returns the transition if it occurred within INDICATOR_DURATION, null otherwise
 */
export function getActiveTransition(): SectionTransition | null {
  const now = Date.now();
  const lastTransition = state.recentTransitions[state.recentTransitions.length - 1];

  if (!lastTransition) return null;
  if (now - lastTransition.timestamp > INDICATOR_DURATION) return null;

  // Don't show indicator for normal->normal or initial state
  if (lastTransition.to === 'normal' && lastTransition.from === 'normal') {
    return null;
  }

  return lastTransition;
}

/**
 * Get time remaining for active indicator (0-1 ratio)
 */
export function getIndicatorProgress(): number {
  const transition = getActiveTransition();
  if (!transition) return 0;

  const elapsed = Date.now() - transition.timestamp;
  return Math.max(0, 1 - elapsed / INDICATOR_DURATION);
}

/**
 * Subscribe to section changes
 */
export function onSectionChange(
  callback: (transition: SectionTransition) => void
): () => void {
  state.listeners.add(callback);
  return () => state.listeners.delete(callback);
}

/**
 * Reset the tracker (call on game restart)
 */
export function resetSectionTracker(): void {
  state.currentSection = 'normal';
  state.recentTransitions = [];
  state.lastTransitionTime = 0;
}

// ============================================================================
// Haptic Feedback
// ============================================================================

/**
 * Trigger appropriate haptic feedback for section type
 */
function triggerSectionHaptic(sectionType: RiverSectionType): void {
  switch (sectionType) {
    case 'rapids':
      haptics.warning();
      break;
    case 'whirlpool':
      haptics.warning();
      break;
    case 'calm_pool':
      haptics.selection();
      break;
    case 'normal':
    default:
      // No haptic for returning to normal
      break;
  }
}
