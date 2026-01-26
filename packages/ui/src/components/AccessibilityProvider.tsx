/**
 * AccessibilityProvider Component
 * Applies global accessibility styles (high contrast, colorblind filters, reduced motion)
 */

import {
  getAccessibilityFilter,
  REDUCED_MOTION_CLASS,
  REDUCED_MOTION_STYLES,
} from '@otter-river-rush/config';
import { useGameStore } from '@otter-river-rush/state';
import { useEffect, type ReactNode } from 'react';

interface AccessibilityProviderProps {
  children: ReactNode;
}

/**
 * Injects CSS styles into the document head
 */
function injectStyles(id: string, css: string): void {
  let styleElement = document.getElementById(id) as HTMLStyleElement | null;
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = id;
    document.head.appendChild(styleElement);
  }
  styleElement.textContent = css;
}

/**
 * Removes injected CSS styles from the document head
 */
function removeStyles(id: string): void {
  const styleElement = document.getElementById(id);
  if (styleElement) {
    styleElement.remove();
  }
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const accessibility = useGameStore((state) => state.accessibility);

  // Apply reduced motion styles
  useEffect(() => {
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
      document.body.classList.remove(REDUCED_MOTION_CLASS);
      removeStyles(styleId);
    };
  }, [accessibility.reducedMotion]);

  // Apply colorblind and high contrast filters
  useEffect(() => {
    const filter = getAccessibilityFilter(
      accessibility.colorblindMode,
      accessibility.highContrast
    );

    // Apply filter to the root element
    const root = document.documentElement;
    if (filter !== 'none') {
      root.style.filter = filter;
    } else {
      root.style.filter = '';
    }

    return () => {
      root.style.filter = '';
    };
  }, [accessibility.colorblindMode, accessibility.highContrast]);

  // Apply prefers-reduced-motion media query detection
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      // If user has system-level reduced motion preference and our setting is off,
      // respect the system preference
      if (e.matches && !accessibility.reducedMotion) {
        // Note: We don't auto-enable reduced motion here to respect user's explicit choice
        // But we could add a prompt or notification about the system preference
        console.log(
          'System prefers reduced motion. Consider enabling Reduced Motion in Settings.'
        );
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

  return <>{children}</>;
}
