import React from 'react';
import { useGameStore } from '../../hooks/useGameStore';

/**
 * HUD Component - Heads-up display during gameplay
 * Shows score, distance, coins, gems, combo
 */

export function HUD(): React.JSX.Element {
  const { score, distance, coins, gems, combo, lives } = useGameStore();

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Score and stats */}
      <div className="absolute top-4 left-4 space-y-2">
        <div className="text-3xl font-bold text-white drop-shadow-lg">
          Score: {score.toLocaleString()}
        </div>
        <div className="text-xl text-white/90 drop-shadow-lg">
          Distance: {Math.floor(distance)}m
        </div>
        <div className="flex gap-4 text-lg text-white/80 drop-shadow-lg">
          <span>💰 {coins}</span>
          <span>💎 {gems}</span>
        </div>
      </div>

      {/* Combo indicator */}
      {combo > 0 && (
        <div className="absolute top-4 right-4">
          <div className="badge badge-primary badge-lg text-xl font-bold animate-pulse">
            {combo}x Combo!
          </div>
        </div>
      )}

      {/* Lives */}
      <div className="absolute bottom-4 left-4 flex gap-2">
        {Array.from({ length: lives }).map((_, i) => (
          <span key={i} className="text-3xl drop-shadow-lg">
            ❤️
          </span>
        ))}
      </div>
    </div>
  );
}
