import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Base path for GitHub Pages deployment at /otter-river-rush/
  base: '/otter-river-rush/',
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  optimizeDeps: {
    include: ['@babylonjs/core', '@babylonjs/loaders', 'reactylon'],
  },
});
