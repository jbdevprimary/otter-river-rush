import React from 'react';
import { useGameStore } from '../../hooks/useGameStore';

/**
 * MainMenu Component - React version of the main menu
 * Uses Zustand store for state management
 */

export function MainMenu(): React.JSX.Element {
  const { startGame } = useGameStore();

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-auto bg-slate-900/90">
      <div className="w-full max-w-2xl p-8 space-y-6">
        {/* Logo */}
        <div className="text-center">
          <img
            src="/hud/splash-screen.png"
            alt="Otter River Rush"
            className="mx-auto w-48 h-48 object-contain mb-4 animate-bounce"
          />
          <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
            Otter River Rush
          </h1>
          <p className="text-xl text-blue-300 mt-2">
            🌊 Race down the wild river! 🌊
          </p>
          <p className="text-sm text-slate-400 mt-2">
            Swipe LEFT/RIGHT or use Arrow Keys to dodge obstacles
          </p>
        </div>

        {/* Mode Selection */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white text-center">
            Select Game Mode:
          </h3>

          <button
            onClick={() => startGame('classic')}
            className="btn btn-primary w-full flex items-center justify-start gap-4 h-auto py-4 px-6 text-left hover:scale-105 transition-transform"
          >
            <span className="text-3xl">🏃</span>
            <div className="flex-1">
              <div className="font-bold text-lg">Classic</div>
              <div className="text-sm opacity-80">
                Endless runner with increasing difficulty
              </div>
            </div>
          </button>

          <button
            onClick={() => startGame('time_trial')}
            className="btn btn-secondary w-full flex items-center justify-start gap-4 h-auto py-4 px-6 text-left hover:scale-105 transition-transform"
          >
            <span className="text-3xl">⏱️</span>
            <div className="flex-1">
              <div className="font-bold text-lg">Time Trial</div>
              <div className="text-sm opacity-80">
                Reach max distance in 60 seconds
              </div>
            </div>
          </button>

          <button
            onClick={() => startGame('zen')}
            className="btn btn-accent w-full flex items-center justify-start gap-4 h-auto py-4 px-6 text-left hover:scale-105 transition-transform"
          >
            <span className="text-3xl">🧘</span>
            <div className="flex-1">
              <div className="font-bold text-lg">Zen Mode</div>
              <div className="text-sm opacity-80">
                Relaxing ride, collect coins peacefully
              </div>
            </div>
          </button>

          <button
            onClick={() => startGame('daily_challenge')}
            className="btn btn-warning w-full flex items-center justify-start gap-4 h-auto py-4 px-6 text-left hover:scale-105 transition-transform"
          >
            <span className="text-3xl">🎲</span>
            <div className="flex-1">
              <div className="font-bold text-lg">Daily Challenge</div>
              <div className="text-sm opacity-80">New challenge every day!</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
