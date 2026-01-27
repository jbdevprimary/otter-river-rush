/**
 * Graphics Quality Store
 *
 * Manages graphics quality settings with persistence.
 * Auto-detects recommended quality on first load.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  type GraphicsQuality,
  type QualitySettings,
  getQualitySettings,
  detectRecommendedQuality,
} from '../config/graphics-quality';

interface GraphicsState {
  /** Current quality preset */
  quality: GraphicsQuality;
  /** Resolved settings for current quality */
  settings: QualitySettings;
  /** Whether quality has been manually set by user */
  isManuallySet: boolean;
  /** Set quality preset */
  setQuality: (quality: GraphicsQuality) => void;
  /** Auto-detect and set recommended quality */
  autoDetectQuality: () => void;
  /** Reset to auto-detected quality */
  resetToAuto: () => void;
}

export const useGraphicsStore = create<GraphicsState>()(
  persist(
    (set) => {
      const initialQuality = detectRecommendedQuality();

      return {
        quality: initialQuality,
        settings: getQualitySettings(initialQuality),
        isManuallySet: false,

        setQuality: (quality) =>
          set({
            quality,
            settings: getQualitySettings(quality),
            isManuallySet: true,
          }),

        autoDetectQuality: () => {
          const detected = detectRecommendedQuality();
          set({
            quality: detected,
            settings: getQualitySettings(detected),
            isManuallySet: false,
          });
        },

        resetToAuto: () => {
          const detected = detectRecommendedQuality();
          set({
            quality: detected,
            settings: getQualitySettings(detected),
            isManuallySet: false,
          });
        },
      };
    },
    {
      name: 'otter-graphics-quality',
      partialize: (state) => ({
        quality: state.quality,
        isManuallySet: state.isManuallySet,
      }),
      onRehydrateStorage: () => (state) => {
        // After rehydrating, recalculate settings from stored quality
        if (state) {
          state.settings = getQualitySettings(state.quality);
        }
      },
    }
  )
);

/**
 * Hook to get current quality settings
 */
export function useQualitySettings(): QualitySettings {
  return useGraphicsStore((state) => state.settings);
}

/**
 * Hook to get current quality level
 */
export function useQualityLevel(): GraphicsQuality {
  return useGraphicsStore((state) => state.quality);
}
