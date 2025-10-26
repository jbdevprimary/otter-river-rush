import React from 'react';
import { useGameStore } from '../../hooks/useGameStore';

/**
 * GameOver Component - Game over screen with stats
 */

export function GameOver(): React.JSX.Element {
  const {
    score,
    distance,
    coins,
    gems,
    highScore,
    returnToMenu,
    startGame,
    mode,
  } = useGameStore();

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-auto bg-slate-900/95">
      <div className="card bg-base-100 shadow-xl w-full max-w-md">
        <div className="card-body">
          <h2 className="card-title text-3xl text-center justify-center text-error mb-4">
            Game Over!
          </h2>

          <div className="stats stats-vertical shadow mb-4">
            <div className="stat">
              <div className="stat-title">Score</div>
              <div className="stat-value text-primary">
                {score.toLocaleString()}
              </div>
            </div>
            <div className="stat">
              <div className="stat-title">Distance</div>
              <div className="stat-value text-secondary text-2xl">
                {Math.floor(distance)}m
              </div>
            </div>
            <div className="stat">
              <div className="stat-title">Collectibles</div>
              <div className="stat-desc text-lg">
                {coins} 💰 | {gems} 💎
              </div>
            </div>
          </div>

          {score === highScore && highScore > 0 && (
            <div className="alert alert-success mb-4">
              <span className="font-bold">🎉 New High Score!</span>
            </div>
          )}

          <div className="alert alert-info mb-4">
            <span className="font-bold">
              High Score: {highScore.toLocaleString()}
            </span>
          </div>

          <div className="card-actions justify-end gap-2">
            <button
              onClick={() => startGame(mode)}
              className="btn btn-primary flex-1"
            >
              Play Again
            </button>
            <button onClick={returnToMenu} className="btn btn-ghost flex-1">
              Main Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
