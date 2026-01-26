/**
 * Menu Component - React/HTML Overlay
 * Main menu and game over screens positioned as an absolute overlay
 */

import { UI_COLORS } from '@otter-river-rush/config';
import { useGameStore } from '@otter-river-rush/state';
import type { CSSProperties } from 'react';

interface MenuProps {
  type: 'menu' | 'game_over';
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
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
    fontSize: '64px',
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: '1.1',
    margin: 0,
    marginBottom: '20px',
    textShadow: `0 0 15px ${UI_COLORS.menu.accent}`,
    whiteSpace: 'pre-line',
  } satisfies CSSProperties,

  subtitle: {
    color: UI_COLORS.menu.accent,
    fontSize: '20px',
    margin: 0,
    marginBottom: '20px',
  } satisfies CSSProperties,

  charInfo: {
    fontSize: '18px',
    margin: 0,
    marginBottom: '20px',
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

  secondaryButton: {
    width: '280px',
    height: '60px',
    backgroundColor: '#6366f1',
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

  controls: {
    color: '#94a3b8',
    fontSize: '16px',
    textAlign: 'center',
    marginTop: '30px',
    lineHeight: '1.5',
    whiteSpace: 'pre-line',
  } satisfies CSSProperties,

  gameOverTitle: {
    color: UI_COLORS.health,
    fontSize: '56px',
    fontWeight: 'bold',
    margin: 0,
    marginBottom: '20px',
    textShadow: '3px 3px 10px #000000',
  } satisfies CSSProperties,

  scoreLabel: {
    color: '#94a3b8',
    fontSize: '20px',
    margin: 0,
    marginTop: '20px',
  } satisfies CSSProperties,

  scoreValue: {
    color: UI_COLORS.combo,
    fontSize: '72px',
    fontWeight: 'bold',
    margin: 0,
    marginBottom: '30px',
    textShadow: `0 0 20px ${UI_COLORS.combo}`,
  } satisfies CSSProperties,
};

export function Menu({ type }: MenuProps) {
  const score = useGameStore((state) => state.score);

  if (type === 'menu') {
    return <MainMenu />;
  }

  return <GameOverMenu finalScore={score} />;
}

function MainMenu() {
  const selectedChar = useGameStore((state) => state.getSelectedCharacter());

  const handlePlay = () => {
    useGameStore.getState().startGame('classic');
  };

  const handleSelectOtter = () => {
    useGameStore.getState().goToCharacterSelect();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        <h1 style={styles.title}>{'OTTER\nRIVER\nRUSH'}</h1>
        <p style={styles.subtitle}>A 3-lane river adventure!</p>
        <p style={{ ...styles.charInfo, color: selectedChar.theme.accentColor }}>
          Playing as: {selectedChar.name}
        </p>

        <button
          type="button"
          style={styles.button}
          onClick={handlePlay}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#60a5fa';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = UI_COLORS.menu.accent;
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          PLAY GAME
        </button>

        <button
          type="button"
          style={styles.secondaryButton}
          onClick={handleSelectOtter}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#818cf8';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#6366f1';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          SELECT OTTER
        </button>

        <p style={styles.controls}>{'<- -> or A D to move\nAvoid rocks, collect coins!'}</p>
      </div>
    </div>
  );
}

interface GameOverMenuProps {
  finalScore: number;
}

function GameOverMenu({ finalScore }: GameOverMenuProps) {
  const handlePlayAgain = () => {
    useGameStore.getState().startGame('classic');
  };

  const handleMainMenu = () => {
    useGameStore.getState().returnToMenu();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        <h1 style={styles.gameOverTitle}>GAME OVER</h1>
        <p style={styles.scoreLabel}>FINAL SCORE</p>
        <p style={styles.scoreValue}>{finalScore}</p>

        <button
          type="button"
          style={styles.button}
          onClick={handlePlayAgain}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#60a5fa';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = UI_COLORS.menu.accent;
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          PLAY AGAIN
        </button>

        <button
          type="button"
          style={styles.menuButton}
          onClick={handleMainMenu}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#64748b';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#475569';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          MAIN MENU
        </button>
      </div>
    </div>
  );
}
