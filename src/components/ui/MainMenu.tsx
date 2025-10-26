import React from 'react';
import { useGameStore } from '../../hooks/useGameStore';

/**
 * MainMenu Component - Branded game menu
 * Features otter mascot, themed UI, and playful personality
 */

export function MainMenu(): React.JSX.Element {
  const { startGame } = useGameStore();

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-auto game-bg-overlay z-50">
      <div className="w-full max-w-2xl p-6 space-y-6 splash-in">
        {/* Hero Section with Mascot */}
        <div className="text-center">
          <img
            src="/hud/splash-screen.png"
            alt="Rusty the Otter"
            className="mx-auto w-64 h-64 object-contain mb-4 otter-bounce"
          />
          <h1 className="otter-title">Otter River Rush</h1>
          <p className="otter-subtitle mt-3">
            🌊 Jump in and ride the rapids! 🌊
          </p>
          <div className="otter-speech-bubble inline-block mt-4">
            Use Arrow Keys or Swipe to Dodge!
          </div>
        </div>

        {/* Mode Selection */}
        <div className="space-y-4 mt-8">
          <h3 className="otter-subtitle text-center mb-4">
            Choose Your Adventure!
          </h3>

          <button
            onClick={() => startGame('classic')}
            className="otter-mode-card w-full flex items-center gap-4 text-left"
          >
            <div className="otter-mode-icon">
              <img
                src="/icons/mode-rapid-rush.png"
                alt="Rapid Rush"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex-1">
              <div className="otter-mode-title">Rapid Rush</div>
              <div className="otter-mode-desc">
                Endless adventure through wild rapids!
              </div>
            </div>
          </button>

          <button
            onClick={() => startGame('time_trial')}
            className="otter-mode-card w-full flex items-center gap-4 text-left"
          >
            <div className="otter-mode-icon">
              <img
                src="/icons/mode-speed-splash.png"
                alt="Speed Splash"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex-1">
              <div className="otter-mode-title">Speed Splash</div>
              <div className="otter-mode-desc">
                60 seconds of high-speed thrills!
              </div>
            </div>
          </button>

          <button
            onClick={() => startGame('zen')}
            className="otter-mode-card w-full flex items-center gap-4 text-left"
          >
            <div className="otter-mode-icon">
              <img
                src="/icons/mode-chill-cruise.png"
                alt="Chill Cruise"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex-1">
              <div className="otter-mode-title">Chill Cruise</div>
              <div className="otter-mode-desc">
                Relaxing float down the lazy river
              </div>
            </div>
          </button>

          <button
            onClick={() => startGame('daily_challenge')}
            className="otter-mode-card w-full flex items-center gap-4 text-left"
          >
            <div className="otter-mode-icon">
              <img
                src="/icons/mode-daily-dive.png"
                alt="Daily Dive"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex-1">
              <div className="otter-mode-title">Daily Dive</div>
              <div className="otter-mode-desc">Fresh challenge every day!</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
