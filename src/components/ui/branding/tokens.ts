/**
 * Brand Identity Tokens
 * See docs/BRAND_IDENTITY.md for full specification
 */

export const BRAND_COLORS = {
  // Rusty's Colors
  otterBrown: '#8B5A3C',
  otterCream: '#F4E4C1',
  otterDark: '#5C3A29',
  otterNose: '#2C1810',

  // Water Colors
  riverBlue: '#4A9ECD',
  riverLight: '#7FCCF7',
  riverDark: '#2E6B8F',
  waterFoam: '#FFFFFF',

  // Nature Colors
  forestGreen: '#4A7C59',
  forestDark: '#2F5940',
  mountainGray: '#8B9DAF',
  canyonOrange: '#D97E4A',
  rapidsPurple: '#6B5B95',

  // Collectibles
  coinGold: '#FFD700',
  gemBlue: '#4169E1',
  gemRed: '#DC143C',
  gemGreen: '#32CD32',

  // UI/Feedback
  successGreen: '#4CAF50',
  warningYellow: '#FFC107',
  dangerRed: '#F44336',
  infoBlue: '#2196F3',

  // Legacy aliases
  primary: '#4A9ECD',
  secondary: '#8B5A3C',
  background: '#1e3a5f',
  text: '#ffffff',
  accent: '#4A9ECD',
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
  muted: '#8B9DAF',
  border: '#5C3A29',
} as const;

export const UI_COLORS = {
  score: '#FFD700',
  combo: '#FFD700',
  health: '#F44336',
  distance: '#4A9ECD',
  menu: {
    background: BRAND_COLORS.background,
    text: BRAND_COLORS.text,
    accent: BRAND_COLORS.accent,
  },
} as const;

export const BIOME_COLORS = {
  forest: {
    sky: '#87CEEB',
    tree: '#4A7C59',
    dark: '#2F5940',
  },
  mountain: {
    sky: '#B0C4DE',
    rock: '#6B7C8C',
    snow: '#F0F8FF',
  },
  canyon: {
    sky: '#FFB347',
    rock: '#CD853F',
    shadow: '#8B4513',
  },
  rapids: {
    sky: '#483D8B',
    water: '#6B5B95',
    foam: '#FFFFFF',
  },
} as const;
