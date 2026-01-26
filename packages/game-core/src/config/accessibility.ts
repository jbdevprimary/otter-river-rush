/**
 * Accessibility Configuration
 * Color palettes for colorblind modes and high contrast settings
 */

import type { ColorblindMode } from '../store/game-store';

/**
 * CSS filter values for colorblind simulation modes.
 * These use SVG filter matrices to transform colors for different types of color blindness.
 */
export const COLORBLIND_FILTERS: Record<ColorblindMode, string> = {
  none: 'none',
  // Protanopia: Red-blind - difficulty distinguishing red and green
  protanopia: `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'><filter id='protanopia'><feColorMatrix type='matrix' values='0.567 0.433 0 0 0 0.558 0.442 0 0 0 0 0.242 0.758 0 0 0 0 0 1 0'/></filter></svg>#protanopia")`,
  // Deuteranopia: Green-blind - difficulty distinguishing red and green
  deuteranopia: `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'><filter id='deuteranopia'><feColorMatrix type='matrix' values='0.625 0.375 0 0 0 0.7 0.3 0 0 0 0 0.3 0.7 0 0 0 0 0 1 0'/></filter></svg>#deuteranopia")`,
  // Tritanopia: Blue-blind - difficulty distinguishing blue and yellow
  tritanopia: `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'><filter id='tritanopia'><feColorMatrix type='matrix' values='0.95 0.05 0 0 0 0 0.433 0.567 0 0 0 0.475 0.525 0 0 0 0 0 1 0'/></filter></svg>#tritanopia")`,
};

/**
 * Alternative color palettes for colorblind-friendly UI.
 * These replace problematic color combinations with distinguishable alternatives.
 */
export const COLORBLIND_PALETTES: Record<
  ColorblindMode,
  {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    danger: string;
    info: string;
    coin: string;
    gem: string;
    health: string;
    combo: string;
  }
> = {
  none: {
    primary: '#3b82f6', // Blue
    secondary: '#6366f1', // Indigo
    success: '#22c55e', // Green
    warning: '#fbbf24', // Yellow/Amber
    danger: '#ef4444', // Red
    info: '#06b6d4', // Cyan
    coin: '#ffd700', // Gold
    gem: '#ef4444', // Red
    health: '#ef4444', // Red
    combo: '#fbbf24', // Amber
  },
  // Protanopia-friendly: Replace reds with blues/oranges
  protanopia: {
    primary: '#3b82f6', // Blue
    secondary: '#8b5cf6', // Purple
    success: '#06b6d4', // Cyan (instead of green)
    warning: '#f97316', // Orange (high saturation)
    danger: '#1e40af', // Dark blue (instead of red)
    info: '#06b6d4', // Cyan
    coin: '#f97316', // Orange
    gem: '#8b5cf6', // Purple (instead of red)
    health: '#1e40af', // Dark blue
    combo: '#f97316', // Orange
  },
  // Deuteranopia-friendly: Similar to protanopia
  deuteranopia: {
    primary: '#3b82f6', // Blue
    secondary: '#a855f7', // Purple
    success: '#14b8a6', // Teal (instead of green)
    warning: '#f59e0b', // Amber
    danger: '#1d4ed8', // Blue (instead of red)
    info: '#06b6d4', // Cyan
    coin: '#f59e0b', // Amber
    gem: '#a855f7', // Purple (instead of red)
    health: '#1d4ed8', // Blue
    combo: '#f59e0b', // Amber
  },
  // Tritanopia-friendly: Replace blues with reds/pinks
  tritanopia: {
    primary: '#ec4899', // Pink (instead of blue)
    secondary: '#f43f5e', // Rose
    success: '#22c55e', // Green (still visible)
    warning: '#f97316', // Orange
    danger: '#dc2626', // Red
    info: '#ec4899', // Pink
    coin: '#f97316', // Orange
    gem: '#dc2626', // Red
    health: '#dc2626', // Red
    combo: '#f97316', // Orange
  },
};

/**
 * High contrast color overrides.
 * These provide maximum contrast for users with low vision.
 */
export const HIGH_CONTRAST_COLORS = {
  background: '#000000',
  foreground: '#ffffff',
  primary: '#00ffff', // Cyan - high visibility
  secondary: '#ff00ff', // Magenta - high visibility
  success: '#00ff00', // Bright green
  warning: '#ffff00', // Bright yellow
  danger: '#ff0000', // Bright red
  info: '#00ffff', // Cyan
  border: '#ffffff',
  text: '#ffffff',
  textMuted: '#cccccc',
  // Game-specific high contrast colors
  coin: '#ffff00', // Bright yellow
  gem: '#ff00ff', // Magenta
  health: '#ff0000', // Bright red
  combo: '#ffff00', // Bright yellow
  obstacle: '#ff0000', // Bright red for visibility
  player: '#00ff00', // Bright green
};

/**
 * Get the CSS filter string for the current colorblind mode and high contrast settings.
 */
export function getAccessibilityFilter(
  colorblindMode: ColorblindMode,
  highContrast: boolean
): string {
  const filters: string[] = [];

  // Apply colorblind filter if needed
  if (colorblindMode !== 'none') {
    filters.push(COLORBLIND_FILTERS[colorblindMode]);
  }

  // Apply high contrast filter
  if (highContrast) {
    filters.push('contrast(1.4) saturate(1.2)');
  }

  return filters.length > 0 ? filters.join(' ') : 'none';
}

/**
 * Get the appropriate color palette based on colorblind mode.
 */
export function getColorPalette(colorblindMode: ColorblindMode) {
  return COLORBLIND_PALETTES[colorblindMode];
}

/**
 * Game speed multiplier labels for UI display.
 */
export const GAME_SPEED_LABELS: Record<number, string> = {
  0.5: 'Slow (0.5x)',
  0.75: 'Relaxed (0.75x)',
  1: 'Normal (1x)',
};

/**
 * Reduced motion CSS class name for global application.
 */
export const REDUCED_MOTION_CLASS = 'reduced-motion';

/**
 * CSS to apply when reduced motion is enabled.
 * This disables or reduces all animations and transitions.
 */
export const REDUCED_MOTION_STYLES = `
  .${REDUCED_MOTION_CLASS} * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  .${REDUCED_MOTION_CLASS} .particle,
  .${REDUCED_MOTION_CLASS} .floating-text {
    display: none !important;
  }
`;
