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
    <div className="relative w-full h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Game Canvas (always rendered) */}
      <GameCanvas showStats={import.meta.env.DEV} />

      {/* UI Overlays */}
      {status === 'menu' && <MainMenu />}
      {status === 'playing' && <HUD />}
      {status === 'game_over' && <GameOver />}

      {/* Pause screen */}
      {status === 'paused' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto bg-slate-900/90">
          <div className="card bg-base-100 shadow-xl w-full max-w-sm">
            <div className="card-body">
              <h2 className="card-title text-3xl justify-center mb-6">
                ⏸️ Paused
              </h2>
              <div className="space-y-3">
                <button
                  onClick={() => useGameStore.getState().resumeGame()}
                  className="btn btn-primary btn-lg w-full"
                >
                  ▶️ Resume
                </button>
                <button
                  onClick={() => useGameStore.getState().returnToMenu()}
                  className="btn btn-ghost w-full"
                >
                  🏠 Quit to Menu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
