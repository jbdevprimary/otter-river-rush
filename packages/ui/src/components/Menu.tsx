/**
 * Menu Component - React/HTML Overlay
 * Main menu and game over screens positioned as an absolute overlay
 */

import { UI_COLORS } from '@otter-river-rush/config';
import { addScore, isHighScore, useGameStore } from '@otter-river-rush/state';
import type { GameMode } from '@otter-river-rush/types';
import { type CSSProperties, useEffect, useState } from 'react';
import { Leaderboard } from './Leaderboard';

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

  modeSelectionContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '10px',
    marginBottom: '10px',
    width: '100%',
  } satisfies CSSProperties,

  modeLabel: {
    color: '#94a3b8',
    fontSize: '14px',
    margin: 0,
    marginBottom: '10px',
    textTransform: 'uppercase',
    letterSpacing: '2px',
  } satisfies CSSProperties,

  modeButtonsRow: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
  } satisfies CSSProperties,

  modeButton: {
    width: '135px',
    height: '50px',
    backgroundColor: '#334155',
    color: '#94a3b8',
    border: '2px solid #475569',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    fontFamily: 'monospace',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  } satisfies CSSProperties,

  modeButtonActive: {
    width: '135px',
    height: '50px',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: '2px solid #60a5fa',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    fontFamily: 'monospace',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)',
  } satisfies CSSProperties,

  zenModeButtonActive: {
    width: '135px',
    height: '50px',
    backgroundColor: '#10b981',
    color: '#ffffff',
    border: '2px solid #34d399',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    fontFamily: 'monospace',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)',
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

  newHighScoreText: {
    color: '#22c55e',
    fontSize: '18px',
    fontWeight: 'bold',
    margin: 0,
    marginBottom: '10px',
    textShadow: '0 0 10px rgba(34, 197, 94, 0.5)',
    animation: 'pulse 1.5s ease-in-out infinite',
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
  const [selectedMode, setSelectedMode] = useState<GameMode>('classic');

  const handlePlay = () => {
    useGameStore.getState().startGame(selectedMode);
  };

  const handleSelectOtter = () => {
    useGameStore.getState().goToCharacterSelect();
  };

  const getModeButtonStyle = (mode: GameMode) => {
    if (selectedMode === mode) {
      return mode === 'zen' ? styles.zenModeButtonActive : styles.modeButtonActive;
    }
    return styles.modeButton;
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        <h1 style={styles.title}>{'OTTER\nRIVER\nRUSH'}</h1>
        <p style={styles.subtitle}>A 3-lane river adventure!</p>
        <p style={{ ...styles.charInfo, color: selectedChar.theme.accentColor }}>
          Playing as: {selectedChar.name}
        </p>

        {/* Mode Selection */}
        <div style={styles.modeSelectionContainer}>
          <p style={styles.modeLabel}>Select Mode</p>
          <div style={styles.modeButtonsRow}>
            <button
              type="button"
              style={getModeButtonStyle('classic')}
              onClick={() => setSelectedMode('classic')}
              onMouseEnter={(e) => {
                if (selectedMode !== 'classic') {
                  e.currentTarget.style.backgroundColor = '#475569';
                  e.currentTarget.style.borderColor = '#64748b';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedMode !== 'classic') {
                  e.currentTarget.style.backgroundColor = '#334155';
                  e.currentTarget.style.borderColor = '#475569';
                }
              }}
            >
              CLASSIC
            </button>
            <button
              type="button"
              style={getModeButtonStyle('zen')}
              onClick={() => setSelectedMode('zen')}
              onMouseEnter={(e) => {
                if (selectedMode !== 'zen') {
                  e.currentTarget.style.backgroundColor = '#475569';
                  e.currentTarget.style.borderColor = '#64748b';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedMode !== 'zen') {
                  e.currentTarget.style.backgroundColor = '#334155';
                  e.currentTarget.style.borderColor = '#475569';
                }
              }}
            >
              ZEN
            </button>
          </div>
          <p style={{ ...styles.modeLabel, marginTop: '8px', fontSize: '12px', color: '#64748b' }}>
            {selectedMode === 'zen'
              ? 'No obstacles - just relax and collect!'
              : 'Avoid obstacles and survive!'}
          </p>
        </div>

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
  const mode = useGameStore((state) => state.mode);
  const distance = useGameStore((state) => state.distance);
  const selectedCharacterId = useGameStore((state) => state.selectedCharacterId);
  const [highlightRank, setHighlightRank] = useState<number | null>(null);
  const [scoreSaved, setScoreSaved] = useState(false);

  // Save score to leaderboard when game over screen appears
  useEffect(() => {
    if (scoreSaved) return;

    // Check if score qualifies for leaderboard
    if (isHighScore(finalScore)) {
      const rank = addScore(finalScore, distance, selectedCharacterId, mode);
      setHighlightRank(rank);
    }
    setScoreSaved(true);
  }, [finalScore, distance, selectedCharacterId, mode, scoreSaved]);

  const handlePlayAgain = () => {
    useGameStore.getState().startGame(mode);
  };

  const handleMainMenu = () => {
    useGameStore.getState().returnToMenu();
  };

  return (
    <div style={styles.overlay}>
      <div style={{ ...styles.container, maxHeight: '90vh', overflowY: 'auto' }}>
        <h1 style={styles.gameOverTitle}>GAME OVER</h1>
        <p style={styles.scoreLabel}>FINAL SCORE</p>
        <p style={styles.scoreValue}>{finalScore}</p>

        {highlightRank !== null && (
          <p style={styles.newHighScoreText}>NEW HIGH SCORE! Rank #{highlightRank}</p>
        )}

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

        {/* Leaderboard Display */}
        <Leaderboard highlightRank={highlightRank} />
      </div>
    </div>
  );
}
