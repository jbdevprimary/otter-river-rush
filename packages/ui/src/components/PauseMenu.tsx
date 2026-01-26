/**
 * PauseMenu Component - React/HTML Overlay
 * Displayed when game is paused, with Resume and Quit options
 */

import { UI_COLORS } from '@otter-river-rush/config';
import { useGameStore } from '@otter-river-rush/state';
import type { CSSProperties } from 'react';

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200,
    fontFamily: 'monospace',
  } satisfies CSSProperties,

  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '400px',
  } satisfies CSSProperties,

  title: {
    color: UI_COLORS.menu.text,
    fontSize: '56px',
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 0,
    marginBottom: '40px',
    textShadow: `0 0 15px ${UI_COLORS.menu.accent}`,
  } satisfies CSSProperties,

  button: {
    width: '280px',
    height: '60px',
    backgroundColor: UI_COLORS.menu.accent,
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '24px',
    fontWeight: 'bold',
    fontFamily: 'monospace',
    cursor: 'pointer',
    marginTop: '15px',
    transition: 'all 0.15s ease',
  } satisfies CSSProperties,

  menuButton: {
    width: '280px',
    height: '60px',
    backgroundColor: '#475569',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '24px',
    fontWeight: 'bold',
    fontFamily: 'monospace',
    cursor: 'pointer',
    marginTop: '15px',
    transition: 'all 0.15s ease',
  } satisfies CSSProperties,

  hint: {
    color: '#94a3b8',
    fontSize: '16px',
    textAlign: 'center',
    marginTop: '30px',
  } satisfies CSSProperties,
};

export function PauseMenu() {
  const handleResume = () => {
    useGameStore.getState().resumeGame();
  };

  const handleQuit = () => {
    useGameStore.getState().returnToMenu();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        <h1 style={styles.title}>PAUSED</h1>

        <button
          type="button"
          style={styles.button}
          onClick={handleResume}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#60a5fa';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = UI_COLORS.menu.accent;
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          RESUME
        </button>

        <button
          type="button"
          style={styles.menuButton}
          onClick={handleQuit}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#64748b';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#475569';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          QUIT TO MENU
        </button>

        <p style={styles.hint}>Press ESC to resume</p>
      </div>
    </div>
  );
}
