/**
 * HUD Component - React/HTML Overlay
 * Heads-up display positioned as an absolute overlay on top of the Canvas
 */

import { UI_COLORS } from '@otter-river-rush/config';
import {
  useGameStore,
  getTutorialTimeRemaining,
  getComboTimeRemaining,
  getComboMultiplier,
  getActivePowerUps,
  POWER_UP_DISPLAYS,
  useAchievementChecker,
  TIME_TRIAL_DURATION_MS,
} from '@otter-river-rush/state';
import type { PowerUpType } from '@otter-river-rush/types';
import { useState, useEffect, type CSSProperties } from 'react';

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
    marginTop: '40px', // Space for pause button
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

  comboContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    minWidth: '120px',
  } satisfies CSSProperties,

  comboTimerContainer: {
    width: '100%',
    height: '6px',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: '3px',
    overflow: 'hidden',
    marginTop: '4px',
  } satisfies CSSProperties,

  comboTimerBar: {
    height: '100%',
    backgroundColor: UI_COLORS.combo,
    borderRadius: '3px',
    transition: 'width 0.1s linear',
  } satisfies CSSProperties,

  comboMultiplier: {
    color: '#10b981',
    fontSize: '14px',
    fontWeight: 'bold',
    textShadow: '1px 1px 2px #000000',
    margin: 0,
    marginTop: '2px',
  } satisfies CSSProperties,

  tutorialBanner: {
    position: 'fixed',
    top: '80px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '12px 24px',
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    borderRadius: '8px',
    border: '2px solid #34d399',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    zIndex: 101,
  } satisfies CSSProperties,

  tutorialText: {
    color: '#ffffff',
    fontSize: '18px',
    fontWeight: 'bold',
    textShadow: '1px 1px 2px #000000',
    margin: 0,
    textAlign: 'center',
  } satisfies CSSProperties,

  tutorialSubtext: {
    color: '#d1fae5',
    fontSize: '12px',
    margin: 0,
    marginTop: '4px',
    textAlign: 'center',
  } satisfies CSSProperties,

  pauseButton: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    width: '48px',
    height: '48px',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    pointerEvents: 'auto',
    zIndex: 102,
    touchAction: 'manipulation',
    WebkitTapHighlightColor: 'transparent',
  } satisfies CSSProperties,

  pauseIcon: {
    display: 'flex',
    gap: '4px',
  } satisfies CSSProperties,

  pauseBar: {
    width: '6px',
    height: '20px',
    backgroundColor: '#ffffff',
    borderRadius: '2px',
  } satisfies CSSProperties,

  // Time Trial timer styles
  timeTrialBanner: {
    position: 'fixed',
    top: '80px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '16px 32px',
    backgroundColor: 'rgba(245, 158, 11, 0.95)',
    borderRadius: '12px',
    border: '3px solid #fbbf24',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
    zIndex: 101,
    minWidth: '200px',
    textAlign: 'center',
  } satisfies CSSProperties,

  timeTrialBannerUrgent: {
    position: 'fixed',
    top: '80px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '16px 32px',
    backgroundColor: 'rgba(239, 68, 68, 0.95)',
    borderRadius: '12px',
    border: '3px solid #f87171',
    boxShadow: '0 4px 20px rgba(239, 68, 68, 0.5)',
    zIndex: 101,
    minWidth: '200px',
    textAlign: 'center',
    animation: 'pulse 0.5s ease-in-out infinite',
  } satisfies CSSProperties,

  timeTrialTimer: {
    color: '#ffffff',
    fontSize: '36px',
    fontWeight: 'bold',
    textShadow: '2px 2px 4px #000000',
    margin: 0,
  } satisfies CSSProperties,

  timeTrialLabel: {
    color: '#fef3c7',
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    margin: 0,
    marginBottom: '4px',
  } satisfies CSSProperties,

  timeTrialProgressContainer: {
    width: '100%',
    height: '8px',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '4px',
    overflow: 'hidden',
    marginTop: '8px',
  } satisfies CSSProperties,

  timeTrialProgressBar: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: '4px',
    transition: 'width 0.1s linear',
  } satisfies CSSProperties,

  // Power-up display styles
  powerUpsContainer: {
    position: 'fixed',
    bottom: '20px',
    left: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    pointerEvents: 'none',
    zIndex: 100,
  } satisfies CSSProperties,

  powerUpItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    borderRadius: '8px',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(4px)',
  } satisfies CSSProperties,

  powerUpIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#ffffff',
    textShadow: '1px 1px 2px #000000',
  } satisfies CSSProperties,

  powerUpInfo: {
    display: 'flex',
    flexDirection: 'column',
  } satisfies CSSProperties,

  powerUpName: {
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 'bold',
    textShadow: '1px 1px 2px #000000',
    margin: 0,
  } satisfies CSSProperties,

  powerUpTimer: {
    color: '#94a3b8',
    fontSize: '12px',
    margin: 0,
  } satisfies CSSProperties,

  powerUpTimerBar: {
    width: '60px',
    height: '4px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '2px',
    overflow: 'hidden',
    marginTop: '4px',
  } satisfies CSSProperties,

  powerUpTimerFill: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 0.1s linear',
  } satisfies CSSProperties,
};

export function HUD() {
  const score = useGameStore((state) => state.score);
  const distance = useGameStore((state) => state.distance);
  const lives = useGameStore((state) => state.lives);
  const combo = useGameStore((state) => state.combo);
  const comboTimer = useGameStore((state) => state.comboTimer);
  const mode = useGameStore((state) => state.mode);
  const gameStartTime = useGameStore((state) => state.gameStartTime);
  const timeRemaining = useGameStore((state) => state.timeRemaining);

  const isZenMode = mode === 'zen';
  const isTimeTrialMode = mode === 'time_trial';

  // Check for achievements during gameplay
  useAchievementChecker();

  // Track combo timer remaining with periodic updates
  const [comboTimeLeft, setComboTimeLeft] = useState(0);

  useEffect(() => {
    if (comboTimer === null || combo === 0) {
      setComboTimeLeft(0);
      return;
    }

    // Update combo timer every 50ms for smooth animation
    const interval = setInterval(() => {
      const remaining = getComboTimeRemaining(comboTimer);
      setComboTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 50);

    // Set initial value
    setComboTimeLeft(getComboTimeRemaining(comboTimer));

    return () => clearInterval(interval);
  }, [comboTimer, combo]);

  // Track tutorial time remaining with periodic updates
  const [tutorialTimeLeft, setTutorialTimeLeft] = useState(() => getTutorialTimeRemaining());

  useEffect(() => {
    // Only run timer if game has started and tutorial period is potentially active
    if (gameStartTime === null) {
      setTutorialTimeLeft(0);
      return;
    }

    // Update immediately
    setTutorialTimeLeft(getTutorialTimeRemaining());

    // Update every 100ms for smooth countdown
    const interval = setInterval(() => {
      const remaining = getTutorialTimeRemaining();
      setTutorialTimeLeft(remaining);

      // Stop interval when tutorial ends
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [gameStartTime]);

  // Track active power-ups
  const powerUps = useGameStore((state) => state.powerUps);
  const [activePowerUps, setActivePowerUps] = useState<Array<{ type: PowerUpType; timeRemaining: number }>>([]);

  useEffect(() => {
    // Update active power-ups every 100ms
    const interval = setInterval(() => {
      setActivePowerUps(getActivePowerUps());
    }, 100);

    // Initial update
    setActivePowerUps(getActivePowerUps());

    return () => clearInterval(interval);
  }, [powerUps]);

  // Generate hearts based on lives
  const heartsDisplay = lives > 0 ? '\u2665 '.repeat(lives).trim() : '\u2661';

  const handlePause = () => {
    useGameStore.getState().pauseGame();
  };

  return (
    <>
      {/* Pause Button - Mobile-first, touch-friendly */}
      <button
        style={styles.pauseButton}
        onClick={handlePause}
        aria-label="Pause game"
      >
        <div style={styles.pauseIcon}>
          <div style={styles.pauseBar} />
          <div style={styles.pauseBar} />
        </div>
      </button>

      {/* Tutorial Banner - shown during tutorial period (not in zen or time trial mode) */}
      {tutorialTimeLeft > 0 && !isZenMode && !isTimeTrialMode && (
        <div style={styles.tutorialBanner}>
          <p style={styles.tutorialText}>TUTORIAL - {tutorialTimeLeft}s</p>
          <p style={styles.tutorialSubtext}>You are invincible! Learn the controls.</p>
        </div>
      )}

      {/* Time Trial Timer - prominent countdown display */}
      {isTimeTrialMode && timeRemaining !== null && (
        <div
          style={
            timeRemaining <= 10000
              ? styles.timeTrialBannerUrgent
              : styles.timeTrialBanner
          }
        >
          <p style={styles.timeTrialLabel}>Time Trial</p>
          <p style={styles.timeTrialTimer}>
            {Math.ceil(timeRemaining / 1000)}s
          </p>
          {/* Progress bar showing time remaining */}
          <div style={styles.timeTrialProgressContainer}>
            <div
              style={{
                ...styles.timeTrialProgressBar,
                width: `${(timeRemaining / TIME_TRIAL_DURATION_MS) * 100}%`,
                backgroundColor:
                  timeRemaining <= 10000
                    ? '#fef2f2' // White-ish for urgent
                    : '#ffffff',
              }}
            />
          </div>
        </div>
      )}

      <div style={styles.container}>
        {/* Left side - Score & Distance */}
        <div style={styles.leftPanel}>
          <p style={styles.scoreText}>SCORE: {score}</p>
          <p style={styles.distanceText}>DISTANCE: {Math.floor(distance)}m</p>
          {isZenMode && (
            <p style={{ ...styles.distanceText, color: '#10b981', marginTop: '8px' }}>ZEN MODE</p>
          )}
        </div>

        {/* Right side - Lives & Combo */}
        <div style={styles.rightPanel}>
          {/* Hide lives display in zen mode and time trial mode */}
          {!isZenMode && !isTimeTrialMode && <p style={styles.livesText}>{heartsDisplay}</p>}

          {/* Combo display with timer bar */}
          {combo > 0 && (
            <div style={styles.comboContainer}>
              <p style={styles.comboText}>COMBO x{combo}</p>
              {/* Show multiplier when 10+ combo */}
              {getComboMultiplier(combo) > 1 && (
                <p style={styles.comboMultiplier}>
                  {getComboMultiplier(combo)}x SCORE
                </p>
              )}
              {/* Combo timer bar */}
              <div style={styles.comboTimerContainer}>
                <div
                  style={{
                    ...styles.comboTimerBar,
                    width: `${comboTimeLeft * 100}%`,
                    backgroundColor:
                      comboTimeLeft < 0.3
                        ? '#ef4444' // Red when low
                        : comboTimeLeft < 0.6
                          ? '#fbbf24' // Yellow when medium
                          : UI_COLORS.combo, // Normal color
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active Power-ups Display */}
      {activePowerUps.length > 0 && (
        <div style={styles.powerUpsContainer}>
          {activePowerUps.map(({ type, timeRemaining }) => {
            const display = POWER_UP_DISPLAYS[type];
            // For timed power-ups, calculate width percentage
            // Shield shows "ACTIVE" instead of timer
            const maxDurations: Record<PowerUpType, number> = {
              shield: 0,
              magnet: 8,
              ghost: 5,
              multiplier: 10,
              slowMotion: 5,
            };
            const maxDuration = maxDurations[type];
            const widthPercent = maxDuration > 0 ? (timeRemaining / maxDuration) * 100 : 100;

            return (
              <div key={type} style={styles.powerUpItem}>
                <div
                  style={{
                    ...styles.powerUpIcon,
                    backgroundColor: display.color,
                    boxShadow: `0 0 10px ${display.color}`,
                  }}
                >
                  {display.icon}
                </div>
                <div style={styles.powerUpInfo}>
                  <p style={styles.powerUpName}>{display.name}</p>
                  <p style={styles.powerUpTimer}>
                    {timeRemaining === -1 ? 'ACTIVE' : `${timeRemaining}s`}
                  </p>
                  {timeRemaining !== -1 && (
                    <div style={styles.powerUpTimerBar}>
                      <div
                        style={{
                          ...styles.powerUpTimerFill,
                          width: `${widthPercent}%`,
                          backgroundColor: display.color,
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
