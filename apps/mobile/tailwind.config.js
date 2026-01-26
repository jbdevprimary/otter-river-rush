/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.tsx',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#3b82f6',
        'brand-secondary': '#6366f1',
        'brand-background': '#0f172a',
        'brand-surface': '#1e293b',
        'brand-gold': '#ffd700',
        'brand-danger': '#ef4444',
        'brand-success': '#22c55e',
        'brand-warning': '#f59e0b',
      },
      fontFamily: {
        sans: ['System', 'sans-serif'],
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
