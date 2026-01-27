/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.tsx',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Rusty's Colors
        'otter-brown': '#8B5A3C',
        'otter-cream': '#F4E4C1',
        'otter-dark': '#5C3A29',
        'otter-nose': '#2C1810',

        // Water Colors
        'river-blue': '#4A9ECD',
        'river-light': '#7FCCF7',
        'river-dark': '#2E6B8F',
        'water-foam': '#FFFFFF',

        // Nature Colors
        'forest-green': '#4A7C59',
        'forest-dark': '#2F5940',
        'mountain-gray': '#8B9DAF',
        'canyon-orange': '#D97E4A',
        'rapids-purple': '#6B5B95',

        // Collectibles
        'coin-gold': '#FFD700',
        'gem-blue': '#4169E1',
        'gem-red': '#DC143C',
        'gem-green': '#32CD32',

        // UI/Feedback
        'success-green': '#4CAF50',
        'warning-yellow': '#FFC107',
        'danger-red': '#F44336',
        'info-blue': '#2196F3',

        // Biome: Forest
        'bg-forest-sky': '#87CEEB',
        'bg-forest-tree': '#4A7C59',
        'bg-forest-dark': '#2F5940',

        // Biome: Mountain
        'bg-mountain-sky': '#B0C4DE',
        'bg-mountain-rock': '#6B7C8C',
        'bg-mountain-snow': '#F0F8FF',

        // Biome: Canyon
        'bg-canyon-sky': '#FFB347',
        'bg-canyon-rock': '#CD853F',
        'bg-canyon-shadow': '#8B4513',

        // Biome: Rapids
        'bg-rapids-sky': '#483D8B',
        'bg-rapids-water': '#6B5B95',
        'bg-rapids-foam': '#FFFFFF',

        // Legacy aliases (backward compat)
        'brand-primary': '#4A9ECD',
        'brand-secondary': '#8B5A3C',
        'brand-background': '#1e3a5f',
        'brand-surface': '#2E6B8F',
        'brand-gold': '#FFD700',
        'brand-danger': '#F44336',
        'brand-success': '#4CAF50',
        'brand-warning': '#FFC107',
      },
      fontFamily: {
        display: ['Fredoka One', 'Nunito', 'sans-serif'],
        sans: ['Nunito', 'Open Sans', 'sans-serif'],
        score: ['Bebas Neue', 'Impact', 'sans-serif'],
        mono: ['Courier', 'monospace'],
      },
      // Responsive breakpoints for different device form factors
      screens: {
        // Phone portrait (Pixel 8A: 412x924)
        'phone': '320px',
        // Phone landscape / small tablet
        'phone-lg': '480px',
        // Tablet portrait (iPad mini: 768px)
        'tablet': '768px',
        // Tablet landscape / Pixel Tablet (1280x800)
        'tablet-lg': '1024px',
        // Foldable unfolded (Pixel Fold outer: ~840px)
        'foldable': '840px',
        // Desktop/large screens
        'desktop': '1280px',
        // Landscape-specific (use with media query)
        'landscape': { raw: '(orientation: landscape)' },
        // Portrait-specific
        'portrait': { raw: '(orientation: portrait)' },
      },
      // Safe area spacing for notches and dynamic islands
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
    },
  },
  plugins: [],
};
