/**
 * AccessibilityProvider Component - Cross-platform React Native/Web
 * Applies global accessibility styles (high contrast, colorblind filters, reduced motion)
 * Web-specific features are gated behind platform checks
 */

import { type ReactNode, useEffect } from 'react';
import { Platform } from 'react-native';
import {
  getAccessibilityFilter,
  REDUCED_MOTION_CLASS,
  REDUCED_MOTION_STYLES,
} from '../../../game/config';
import { useGameStore } from '../../../game/store';

interface AccessibilityProviderProps {
  children: ReactNode;
}

/**
 * Check if we're running on web platform
 */
const isWeb = Platform.OS === 'web';

/**
 * Injects CSS styles into the document head (web only)
 */
function injectStyles(id: string, css: string): void {
  if (!isWeb || typeof document === 'undefined') return;

  let styleElement = document.getElementById(id) as HTMLStyleElement | null;
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = id;
    document.head.appendChild(styleElement);
  }
  styleElement.textContent = css;
}

/**
 * Removes injected CSS styles from the document head (web only)
 */
function removeStyles(id: string): void {
  if (!isWeb || typeof document === 'undefined') return;

  const styleElement = document.getElementById(id);
  if (styleElement) {
    styleElement.remove();
  }
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const accessibility = useGameStore((state) => state.accessibility);

  // Apply reduced motion styles (web only)
  useEffect(() => {
    if (!isWeb || typeof document === 'undefined') return;

    const styleId = 'accessibility-reduced-motion';

    if (accessibility.reducedMotion) {
      // Add reduced motion class to body
      document.body.classList.add(REDUCED_MOTION_CLASS);
      // Inject reduced motion CSS
      injectStyles(styleId, REDUCED_MOTION_STYLES);
    } else {
      // Remove reduced motion class from body
      document.body.classList.remove(REDUCED_MOTION_CLASS);
      // Remove reduced motion CSS
      removeStyles(styleId);
    }

    return () => {
      if (typeof document !== 'undefined') {
        document.body.classList.remove(REDUCED_MOTION_CLASS);
        removeStyles(styleId);
      }
    };
  }, [accessibility.reducedMotion]);

  // Apply colorblind and high contrast filters (web only)
  useEffect(() => {
    if (!isWeb || typeof document === 'undefined') return;

    const filter = getAccessibilityFilter(accessibility.colorblindMode, accessibility.highContrast);

    // Apply filter to the root element
    const root = document.documentElement;
    if (filter !== 'none') {
      root.style.filter = filter;
    } else {
      root.style.filter = '';
    }

    return () => {
      if (typeof document !== 'undefined') {
        document.documentElement.style.filter = '';
      }
    };
  }, [accessibility.colorblindMode, accessibility.highContrast]);

  // Apply prefers-reduced-motion media query detection (web only)
  useEffect(() => {
    if (!isWeb || typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      // If user has system-level reduced motion preference and our setting is off,
      // respect the system preference
      if (e.matches && !accessibility.reducedMotion) {
        // Note: We don't auto-enable reduced motion here to respect user's explicit choice
        // But we could add a prompt or notification about the system preference
        console.log('System prefers reduced motion. Consider enabling Reduced Motion in Settings.');
      }
    };

    // Check initial state
    handleChange(mediaQuery);

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [accessibility.reducedMotion]);

  // On native platforms, accessibility is handled by the OS accessibility services
  // The accessibility settings in the game store can still be used to adjust
  // game-specific features like particle effects and animation speeds

  return <>{children}</>;
}
