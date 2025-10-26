import React from 'react';
import { GameCanvas } from './game/GameCanvas';
import { MainMenu } from './ui/MainMenu';
import { HUD } from './ui/HUD';
import { GameOver } from './ui/GameOver';
import { useGameStore } from '../hooks/useGameStore';

/**
 * App Component - Main React application
 * Manages game state and renders appropriate screens
 */

export function App(): React.JSX.Element {
  const { status } = useGameStore();

  return (
    <div className="fixed inset-0 w-screen h-screen">
      {/* Fullscreen Game Canvas (always rendered) */}
      <GameCanvas showStats={import.meta.env.DEV} />

      {/* UI Overlays positioned absolutely over the game */}
      {status === 'menu' && <MainMenu />}
      {status === 'playing' && <HUD />}
      {status === 'game_over' && <GameOver />}

      {/* Pause screen */}
      {status === 'paused' && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-auto game-bg-overlay z-50">
          <div className="otter-panel w-full max-w-sm splash-in">
            <h2 className="otter-subtitle text-center mb-6">⏸️ Paused</h2>
            <div className="space-y-3">
              <button
                onClick={() => useGameStore.getState().resumeGame()}
                className="otter-btn otter-btn-primary w-full"
              >
                ▶️ Resume
              </button>
              <button
                onClick={() => useGameStore.getState().returnToMenu()}
                className="otter-btn otter-btn-secondary w-full"
              >
                🏠 River Bank
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
