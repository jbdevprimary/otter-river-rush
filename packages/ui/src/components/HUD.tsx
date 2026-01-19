/**
 * HUD Component
 * Heads-up display showing score, distance, lives, etc.
 */

import { useGameStore } from '@otter-river-rush/state';

export function HUD() {
  const score = useGameStore((state) => state.score);
  const distance = useGameStore((state) => state.distance);
  const lives = useGameStore((state) => state.lives);
  const combo = useGameStore((state) => state.combo);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        color: 'white',
        fontSize: '18px',
        fontFamily: 'monospace',
        pointerEvents: 'none',
        zIndex: 100,
      }}
    >
      <div>
        <div>Score: {score}</div>
        <div>Distance: {Math.floor(distance)}m</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div>Lives: {'\u2665'.repeat(lives)}</div>
        {combo > 1 && <div>Combo: x{combo}</div>}
      </div>
    </div>
  );
}
