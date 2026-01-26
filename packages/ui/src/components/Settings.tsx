/**
 * Settings Component - React/HTML Overlay
 * Modal overlay for adjusting game audio settings
 * Mobile-first design with large touch targets (min 44px)
 */

import { GAME_SPEED_LABELS, UI_COLORS } from '@otter-river-rush/config';
import {
  type ColorblindMode,
  type GameSpeedOption,
  useGameStore,
} from '@otter-river-rush/state';
import {
  setMusicVolume,
  setSFXVolume,
  setMuted,
  playClick,
} from '@otter-river-rush/audio';
import type { CSSProperties } from 'react';
import { useCallback, useEffect } from 'react';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_KEY = 'otter-river-rush-settings';

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 300,
    fontFamily: 'monospace',
    padding: '20px',
    boxSizing: 'border-box',
  } satisfies CSSProperties,

  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    maxWidth: '400px',
    maxHeight: '90vh',
    overflowY: 'auto',
    backgroundColor: '#1e293b',
    borderRadius: '16px',
    padding: '24px',
    boxSizing: 'border-box',
    border: `2px solid ${UI_COLORS.menu.accent}`,
    boxShadow: `0 0 30px rgba(59, 130, 246, 0.3)`,
  } satisfies CSSProperties,

  title: {
    color: UI_COLORS.menu.text,
    fontSize: '36px',
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 0,
    marginBottom: '24px',
    textShadow: `0 0 15px ${UI_COLORS.menu.accent}`,
  } satisfies CSSProperties,

  section: {
    width: '100%',
    marginBottom: '20px',
  } satisfies CSSProperties,

  sectionTitle: {
    color: '#94a3b8',
    fontSize: '14px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    margin: 0,
    marginBottom: '12px',
  } satisfies CSSProperties,

  settingRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: '16px',
    minHeight: '44px',
  } satisfies CSSProperties,

  label: {
    color: UI_COLORS.menu.text,
    fontSize: '18px',
    margin: 0,
  } satisfies CSSProperties,

  sliderContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '60%',
  } satisfies CSSProperties,

  slider: {
    flex: 1,
    height: '44px',
    appearance: 'none',
    background: 'transparent',
    cursor: 'pointer',
    WebkitAppearance: 'none',
  } satisfies CSSProperties,

  sliderValue: {
    color: UI_COLORS.menu.accent,
    fontSize: '16px',
    fontWeight: 'bold',
    minWidth: '48px',
    textAlign: 'right',
  } satisfies CSSProperties,

  toggle: {
    width: '64px',
    height: '44px',
    borderRadius: '22px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative',
    padding: 0,
  } satisfies CSSProperties,

  toggleKnob: {
    position: 'absolute',
    top: '4px',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
  } satisfies CSSProperties,

  closeButton: {
    width: '100%',
    height: '56px',
    backgroundColor: UI_COLORS.menu.accent,
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '20px',
    fontWeight: 'bold',
    fontFamily: 'monospace',
    cursor: 'pointer',
    marginTop: '8px',
    transition: 'all 0.15s ease',
    minHeight: '44px',
  } satisfies CSSProperties,

  divider: {
    width: '100%',
    height: '1px',
    backgroundColor: '#334155',
    margin: '8px 0 20px 0',
  } satisfies CSSProperties,

  select: {
    padding: '8px 12px',
    backgroundColor: '#334155',
    color: '#e2e8f0',
    border: '1px solid #475569',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'monospace',
    cursor: 'pointer',
    minWidth: '150px',
    minHeight: '44px',
  } satisfies CSSProperties,

  speedButtonsRow: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  } satisfies CSSProperties,

  speedButton: {
    padding: '8px 10px',
    backgroundColor: '#334155',
    color: '#94a3b8',
    border: '1px solid #475569',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: 'bold',
    fontFamily: 'monospace',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    minHeight: '44px',
    minWidth: '55px',
  } satisfies CSSProperties,

  speedButtonActive: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    borderColor: '#60a5fa',
  } satisfies CSSProperties,

  settingDescription: {
    color: '#64748b',
    fontSize: '11px',
    margin: 0,
    marginTop: '2px',
  } satisfies CSSProperties,

  labelWithDescription: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    flex: 1,
  } satisfies CSSProperties,
};

// Custom slider styles injected as CSS
const sliderStyles = `
  .settings-slider {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 8px;
    border-radius: 4px;
    background: #334155;
    outline: none;
    margin: 18px 0;
  }

  .settings-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    border: 3px solid #ffffff;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    transition: transform 0.1s ease;
  }

  .settings-slider::-webkit-slider-thumb:hover {
    transform: scale(1.1);
  }

  .settings-slider::-webkit-slider-thumb:active {
    transform: scale(1.05);
  }

  .settings-slider::-moz-range-thumb {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    border: 3px solid #ffffff;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    transition: transform 0.1s ease;
  }

  .settings-slider::-moz-range-thumb:hover {
    transform: scale(1.1);
  }

  .settings-slider::-moz-range-track {
    height: 8px;
    border-radius: 4px;
    background: #334155;
  }
`;

interface SettingsData {
  musicVolume: number;
  sfxVolume: number;
  musicEnabled: boolean;
  soundEnabled: boolean;
}

function loadSettingsFromStorage(): SettingsData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as SettingsData;
    }
  } catch {
    // Ignore storage errors
  }
  return null;
}

function saveSettingsToStorage(settings: SettingsData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage errors
  }
}

export function Settings({ isOpen, onClose }: SettingsProps) {
  const soundEnabled = useGameStore((state) => state.soundEnabled);
  const musicEnabled = useGameStore((state) => state.musicEnabled);
  const volume = useGameStore((state) => state.volume);
  const accessibility = useGameStore((state) => state.accessibility);

  // Accessibility handlers
  const handleHighContrastToggle = useCallback(() => {
    playClick();
    useGameStore.getState().updateAccessibility({
      highContrast: !accessibility.highContrast,
    });
  }, [accessibility.highContrast]);

  const handleColorblindModeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      playClick();
      useGameStore.getState().updateAccessibility({
        colorblindMode: e.target.value as ColorblindMode,
      });
    },
    []
  );

  const handleReducedMotionToggle = useCallback(() => {
    playClick();
    useGameStore.getState().updateAccessibility({
      reducedMotion: !accessibility.reducedMotion,
    });
  }, [accessibility.reducedMotion]);

  const handleGameSpeedChange = useCallback((speed: GameSpeedOption) => {
    playClick();
    useGameStore.getState().updateAccessibility({
      gameSpeedMultiplier: speed,
    });
  }, []);

  const speedOptions: GameSpeedOption[] = [0.5, 0.75, 1];

  // Sync audio manager with store on mount and changes
  useEffect(() => {
    setMusicVolume(musicEnabled ? volume : 0);
    setSFXVolume(soundEnabled ? volume : 0);
    setMuted(!soundEnabled && !musicEnabled);
  }, [soundEnabled, musicEnabled, volume]);

  // Load settings from localStorage on mount
  useEffect(() => {
    const stored = loadSettingsFromStorage();
    if (stored) {
      useGameStore.getState().updateSettings({
        soundEnabled: stored.soundEnabled,
        musicEnabled: stored.musicEnabled,
        volume: stored.musicVolume, // Use music volume as the main volume
      });
    }
  }, []);

  const handleMusicVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVolume = Number(e.target.value) / 100;
      useGameStore.getState().updateSettings({ volume: newVolume });
      setMusicVolume(musicEnabled ? newVolume : 0);

      // Save to localStorage
      saveSettingsToStorage({
        musicVolume: newVolume,
        sfxVolume: soundEnabled ? newVolume : 0,
        musicEnabled,
        soundEnabled,
      });
    },
    [musicEnabled, soundEnabled]
  );

  const handleSFXVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVolume = Number(e.target.value) / 100;
      useGameStore.getState().updateSettings({ volume: newVolume });
      setSFXVolume(soundEnabled ? newVolume : 0);

      // Save to localStorage
      saveSettingsToStorage({
        musicVolume: musicEnabled ? newVolume : 0,
        sfxVolume: newVolume,
        musicEnabled,
        soundEnabled,
      });
    },
    [musicEnabled, soundEnabled]
  );

  const handleMusicToggle = useCallback(() => {
    playClick();
    const newEnabled = !musicEnabled;
    useGameStore.getState().updateSettings({ musicEnabled: newEnabled });
    setMusicVolume(newEnabled ? volume : 0);

    // Save to localStorage
    saveSettingsToStorage({
      musicVolume: volume,
      sfxVolume: volume,
      musicEnabled: newEnabled,
      soundEnabled,
    });
  }, [musicEnabled, volume, soundEnabled]);

  const handleSFXToggle = useCallback(() => {
    const newEnabled = !soundEnabled;
    useGameStore.getState().updateSettings({ soundEnabled: newEnabled });
    setSFXVolume(newEnabled ? volume : 0);
    setMuted(!newEnabled && !musicEnabled);

    // Play click after updating so new setting takes effect
    if (newEnabled) {
      playClick();
    }

    // Save to localStorage
    saveSettingsToStorage({
      musicVolume: volume,
      sfxVolume: volume,
      musicEnabled,
      soundEnabled: newEnabled,
    });
  }, [soundEnabled, volume, musicEnabled]);

  const handleClose = useCallback(() => {
    playClick();
    onClose();
  }, [onClose]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  // Inject slider styles
  useEffect(() => {
    const styleId = 'settings-slider-styles';
    if (!document.getElementById(styleId)) {
      const styleElement = document.createElement('style');
      styleElement.id = styleId;
      styleElement.textContent = sliderStyles;
      document.head.appendChild(styleElement);
    }
  }, []);

  if (!isOpen) return null;

  const getToggleStyle = (enabled: boolean): CSSProperties => ({
    ...styles.toggle,
    backgroundColor: enabled ? '#22c55e' : '#64748b',
  });

  const getToggleKnobStyle = (enabled: boolean): CSSProperties => ({
    ...styles.toggleKnob,
    left: enabled ? '24px' : '4px',
  });

  // Calculate display values
  const musicVolumeDisplay = Math.round((musicEnabled ? volume : 0) * 100);
  const sfxVolumeDisplay = Math.round((soundEnabled ? volume : 0) * 100);

  return (
    <div style={styles.overlay} onClick={handleClose}>
      <div style={styles.container} onClick={(e) => e.stopPropagation()}>
        <h1 style={styles.title}>SETTINGS</h1>

        {/* Music Section */}
        <div style={styles.section}>
          <p style={styles.sectionTitle}>Music</p>

          {/* Music On/Off Toggle */}
          <div style={styles.settingRow}>
            <p style={styles.label}>Music</p>
            <button
              type="button"
              style={getToggleStyle(musicEnabled)}
              onClick={handleMusicToggle}
              aria-label={musicEnabled ? 'Disable music' : 'Enable music'}
              aria-pressed={musicEnabled}
            >
              <div style={getToggleKnobStyle(musicEnabled)} />
            </button>
          </div>

          {/* Music Volume Slider */}
          <div style={styles.settingRow}>
            <p style={styles.label}>Volume</p>
            <div style={styles.sliderContainer}>
              <input
                type="range"
                min="0"
                max="100"
                value={musicVolumeDisplay}
                onChange={handleMusicVolumeChange}
                className="settings-slider"
                style={styles.slider}
                disabled={!musicEnabled}
                aria-label="Music volume"
              />
              <span style={styles.sliderValue}>{musicVolumeDisplay}%</span>
            </div>
          </div>
        </div>

        <div style={styles.divider} />

        {/* SFX Section */}
        <div style={styles.section}>
          <p style={styles.sectionTitle}>Sound Effects</p>

          {/* SFX On/Off Toggle */}
          <div style={styles.settingRow}>
            <p style={styles.label}>SFX</p>
            <button
              type="button"
              style={getToggleStyle(soundEnabled)}
              onClick={handleSFXToggle}
              aria-label={soundEnabled ? 'Disable sound effects' : 'Enable sound effects'}
              aria-pressed={soundEnabled}
            >
              <div style={getToggleKnobStyle(soundEnabled)} />
            </button>
          </div>

          {/* SFX Volume Slider */}
          <div style={styles.settingRow}>
            <p style={styles.label}>Volume</p>
            <div style={styles.sliderContainer}>
              <input
                type="range"
                min="0"
                max="100"
                value={sfxVolumeDisplay}
                onChange={handleSFXVolumeChange}
                className="settings-slider"
                style={styles.slider}
                disabled={!soundEnabled}
                aria-label="Sound effects volume"
              />
              <span style={styles.sliderValue}>{sfxVolumeDisplay}%</span>
            </div>
          </div>
        </div>

        <div style={styles.divider} />

        {/* Accessibility Section */}
        <div style={styles.section}>
          <p style={styles.sectionTitle}>Accessibility</p>

          {/* High Contrast Toggle */}
          <div style={styles.settingRow}>
            <div style={styles.labelWithDescription}>
              <p style={styles.label}>High Contrast</p>
              <p style={styles.settingDescription}>
                Increase color contrast
              </p>
            </div>
            <button
              type="button"
              style={getToggleStyle(accessibility.highContrast)}
              onClick={handleHighContrastToggle}
              aria-label={
                accessibility.highContrast
                  ? 'Disable high contrast'
                  : 'Enable high contrast'
              }
              aria-pressed={accessibility.highContrast}
            >
              <div style={getToggleKnobStyle(accessibility.highContrast)} />
            </button>
          </div>

          {/* Colorblind Mode Select */}
          <div style={styles.settingRow}>
            <div style={styles.labelWithDescription}>
              <p style={styles.label}>Colorblind Mode</p>
              <p style={styles.settingDescription}>
                Adjust colors for visibility
              </p>
            </div>
            <select
              value={accessibility.colorblindMode}
              onChange={handleColorblindModeChange}
              style={styles.select}
              aria-label="Select colorblind mode"
            >
              <option value="none">None</option>
              <option value="protanopia">Protanopia</option>
              <option value="deuteranopia">Deuteranopia</option>
              <option value="tritanopia">Tritanopia</option>
            </select>
          </div>

          {/* Reduced Motion Toggle */}
          <div style={styles.settingRow}>
            <div style={styles.labelWithDescription}>
              <p style={styles.label}>Reduced Motion</p>
              <p style={styles.settingDescription}>
                Disable particles
              </p>
            </div>
            <button
              type="button"
              style={getToggleStyle(accessibility.reducedMotion)}
              onClick={handleReducedMotionToggle}
              aria-label={
                accessibility.reducedMotion
                  ? 'Disable reduced motion'
                  : 'Enable reduced motion'
              }
              aria-pressed={accessibility.reducedMotion}
            >
              <div style={getToggleKnobStyle(accessibility.reducedMotion)} />
            </button>
          </div>

          {/* Game Speed Buttons */}
          <div style={styles.settingRow}>
            <div style={styles.labelWithDescription}>
              <p style={styles.label}>Game Speed</p>
              <p style={styles.settingDescription}>
                Slow down gameplay
              </p>
            </div>
            <div style={styles.speedButtonsRow}>
              {speedOptions.map((speed) => (
                <button
                  key={speed}
                  type="button"
                  style={{
                    ...styles.speedButton,
                    ...(accessibility.gameSpeedMultiplier === speed
                      ? styles.speedButtonActive
                      : {}),
                  }}
                  onClick={() => handleGameSpeedChange(speed)}
                  aria-pressed={accessibility.gameSpeedMultiplier === speed}
                >
                  {GAME_SPEED_LABELS[speed]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          style={styles.closeButton}
          onClick={handleClose}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#60a5fa';
            e.currentTarget.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = UI_COLORS.menu.accent;
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          CLOSE
        </button>

        <p style={{ color: '#64748b', fontSize: '12px', marginTop: '16px', textAlign: 'center' }}>
          Press ESC to close
        </p>
      </div>
    </div>
  );
}
