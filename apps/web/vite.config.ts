import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    // Base path for deployment (Render uses /, GitHub Pages uses /otter-river-rush/)
    base: env.VITE_BASE_URL || '/otter-river-rush/',
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
  };
});
