/**
 * HUD Component - React/HTML Overlay
 * Heads-up display positioned as an absolute overlay on top of the Canvas
 */

import { UI_COLORS } from '@otter-river-rush/config';
import { useGameStore } from '@otter-river-rush/state';
import type { CSSProperties } from 'react';

const styles = {
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    padding: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    pointerEvents: 'none',
    zIndex: 100,
    fontFamily: 'monospace',
  } satisfies CSSProperties,

  leftPanel: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  } satisfies CSSProperties,

  rightPanel: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  } satisfies CSSProperties,

  scoreText: {
    color: UI_COLORS.score,
    fontSize: '28px',
    fontWeight: 'bold',
    textShadow: '2px 2px 4px #000000',
    margin: 0,
  } satisfies CSSProperties,

  distanceText: {
    color: UI_COLORS.distance,
    fontSize: '20px',
    textShadow: '1px 1px 2px #000000',
    margin: 0,
    marginTop: '4px',
  } satisfies CSSProperties,

  livesText: {
    color: UI_COLORS.health,
    fontSize: '28px',
    textShadow: '2px 2px 4px #000000',
    margin: 0,
  } satisfies CSSProperties,

  comboText: {
    color: UI_COLORS.combo,
    fontSize: '24px',
    fontWeight: 'bold',
    textShadow: '1px 1px 3px #000000',
    margin: 0,
    marginTop: '4px',
    minHeight: '30px',
  } satisfies CSSProperties,
};

export function HUD() {
  const score = useGameStore((state) => state.score);
  const distance = useGameStore((state) => state.distance);
  const lives = useGameStore((state) => state.lives);
  const combo = useGameStore((state) => state.combo);

  // Generate hearts based on lives
  const heartsDisplay = lives > 0 ? '\u2665 '.repeat(lives).trim() : '\u2661';

  return (
    <div style={styles.container}>
      {/* Left side - Score & Distance */}
      <div style={styles.leftPanel}>
        <p style={styles.scoreText}>SCORE: {score}</p>
        <p style={styles.distanceText}>DISTANCE: {Math.floor(distance)}m</p>
      </div>

      {/* Right side - Lives & Combo */}
      <div style={styles.rightPanel}>
        <p style={styles.livesText}>{heartsDisplay}</p>
        <p style={styles.comboText}>{combo > 1 ? `COMBO x${combo}` : ''}</p>
      </div>
    </div>
  );
}
