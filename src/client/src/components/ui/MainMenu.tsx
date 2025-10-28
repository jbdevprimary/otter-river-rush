import React from 'react';
import { useGameStore } from '../../hooks/useGameStore';
import { getHudPath, getIconPath } from '../../utils/assets';

/**
 * MainMenu Component - Branded game menu
 * Features otter mascot, themed UI, and playful personality
 */

export function MainMenu(): React.JSX.Element {
  const { startGame } = useGameStore();

  return (
    <div id="startScreen" className="fixed inset-0 flex items-start justify-center pointer-events-auto game-bg-overlay z-50 overflow-y-auto pt-8">
      <div className="w-full max-w-xl p-3 space-y-2 splash-in">
        {/* Hero Section with Mascot */}
        <div className="text-center">
          <img
            src={getHudPath('splash-screen.png')}
            alt="Rusty the Otter"
            className="mx-auto w-24 h-24 object-contain mb-1 otter-bounce"
          />
          <h1 className="otter-title text-3xl">Otter River Rush</h1>
          <p className="otter-subtitle mt-1 text-sm">
            🌊 Jump in and ride the rapids! 🌊
          </p>
          <div className="otter-speech-bubble inline-block mt-1 text-xs">
            Use Arrow Keys or Swipe to Dodge!
          </div>
        </div>

        {/* Mode Selection */}
        <div className="space-y-1.5 mt-2">
          <h3 className="otter-subtitle text-center mb-1 text-sm">
            Choose Your Adventure!
          </h3>

          <button
            id="classicButton"
            onClick={() => startGame('classic')}
            className="otter-mode-card w-full flex items-center gap-4 text-left"
          >
            <div className="otter-mode-icon">
              <img
                src={getIconPath('mode-rapid-rush.png')}
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
            id="timeTrialButton"
            onClick={() => startGame('time_trial')}
            className="otter-mode-card w-full flex items-center gap-4 text-left"
          >
            <div className="otter-mode-icon">
              <img
                src={getIconPath('mode-speed-splash.png')}
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
            id="zenButton"
            onClick={() => startGame('zen')}
            className="otter-mode-card w-full flex items-center gap-4 text-left"
          >
            <div className="otter-mode-icon">
              <img
                src={getIconPath('mode-chill-cruise.png')}
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
            id="dailyButton"
            onClick={() => startGame('daily_challenge')}
            className="otter-mode-card w-full flex items-center gap-4 text-left"
          >
            <div className="otter-mode-icon">
              <img
                src={getIconPath('mode-daily-dive.png')}
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
