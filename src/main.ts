import './style.css';
import { Game } from './game/Game';

const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;

if (!canvas) {
  throw new Error('Canvas element not found');
}

const game = new Game(canvas);
game.run();

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then(() => {
        // Service worker registered successfully
      })
      .catch((error: Error) => {
        console.error('SW registration failed:', error);
      });
  });
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  game.cleanup();
});
