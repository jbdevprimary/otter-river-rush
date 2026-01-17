/**
 * Theme and color definitions
 */

/**
 * Color palette
 */
export const COLORS = {
  // Biome water colors
  biome: {
    forest: {
      water: '#1e40af',
      fog: '#0f172a',
      primary: '#22c55e',
      secondary: '#166534',
      accent: '#84cc16',
    },
    mountain: {
      water: '#0c4a6e',
      fog: '#1e3a8a',
      primary: '#64748b',
      secondary: '#334155',
      accent: '#38bdf8',
    },
    canyon: {
      water: '#78350f',
      fog: '#451a03',
      primary: '#ea580c',
      secondary: '#9a3412',
      accent: '#fbbf24',
    },
    rapids: {
      water: '#0369a1',
      fog: '#0c4a6e',
      primary: '#0ea5e9',
      secondary: '#0284c7',
      accent: '#67e8f9',
    },
    crystal: {
      water: '#701a75',
      fog: '#3b0764',
      primary: '#a855f7',
      secondary: '#7e22ce',
      accent: '#e879f9',
    },
  },

  // Entity colors
  entities: {
    coin: '#ffd700',
    gemBlue: '#3b82f6',
    gemRed: '#ef4444',
    gemGreen: '#22c55e',
    gemPurple: '#a855f7',
  },

  // Particle colors
  particles: {
    collect: '#ffd700',
    hit: '#ff6b6b',
    powerUp: '#fbbf24',
    splash: '#38bdf8',
    trail: '#a855f7',
  },

  // UI colors
  ui: {
    score: '#ffffff',
    combo: '#fbbf24',
    health: '#ef4444',
    distance: '#3b82f6',
    background: '#0a1628',
    surface: '#1e293b',
    border: '#334155',
    text: {
      primary: '#f8fafc',
      secondary: '#94a3b8',
      muted: '#64748b',
    },
  },

  // Power-up colors
  powerUps: {
    shield: '#3b82f6',
    magnet: '#f59e0b',
    ghost: '#a855f7',
    multiplier: '#22c55e',
    slowMotion: '#06b6d4',
  },

  // Status colors
  status: {
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
} as const;

/**
 * Typography scale
 */
export const TYPOGRAPHY = {
  fontFamily: {
    display: '"Fredoka One", "Comic Sans MS", cursive',
    body: '"Nunito", "Segoe UI", sans-serif',
    mono: '"Fira Code", "Consolas", monospace',
  },

  fontSize: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem', // 48px
    '6xl': '3.75rem', // 60px
  },

  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

/**
 * Spacing scale
 */
export const SPACING = {
  0: '0',
  1: '0.25rem', // 4px
  2: '0.5rem', // 8px
  3: '0.75rem', // 12px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  8: '2rem', // 32px
  10: '2.5rem', // 40px
  12: '3rem', // 48px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
} as const;

/**
 * Border radius scale
 */
export const BORDER_RADIUS = {
  none: '0',
  sm: '0.125rem', // 2px
  base: '0.25rem', // 4px
  md: '0.375rem', // 6px
  lg: '0.5rem', // 8px
  xl: '0.75rem', // 12px
  '2xl': '1rem', // 16px
  '3xl': '1.5rem', // 24px
  full: '9999px',
} as const;

/**
 * Shadow scale
 */
export const SHADOWS = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  glow: {
    gold: '0 0 20px rgba(255, 215, 0, 0.5)',
    blue: '0 0 20px rgba(59, 130, 246, 0.5)',
    purple: '0 0 20px rgba(168, 85, 247, 0.5)',
    green: '0 0 20px rgba(34, 197, 94, 0.5)',
  },
} as const;

/**
 * Transition presets
 */
export const TRANSITIONS = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  timing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const;

/**
 * Z-index scale
 */
export const Z_INDEX = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  overlay: 300,
  modal: 400,
  popover: 500,
  tooltip: 600,
  toast: 700,
} as const;

/**
 * Animation keyframes
 */
export const ANIMATIONS = {
  bounce: 'bounce 0.5s ease-in-out',
  pulse: 'pulse 2s ease-in-out infinite',
  spin: 'spin 1s linear infinite',
  ping: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
  shake: 'shake 0.5s ease-in-out',
  float: 'float 3s ease-in-out infinite',
  glow: 'glow 2s ease-in-out infinite',
} as const;

/**
 * Breakpoints for responsive design
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

/**
 * Get color with opacity
 */
export function withOpacity(color: string, opacity: number): string {
  // If it's a hex color, convert to rgba
  if (color.startsWith('#')) {
    const r = Number.parseInt(color.slice(1, 3), 16);
    const g = Number.parseInt(color.slice(3, 5), 16);
    const b = Number.parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
}
