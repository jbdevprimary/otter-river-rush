/**
 * Audio Manager for Otter River Rush
 * Uses Howler.js for cross-platform audio playback (web + React Native via expo-av bridge)
 */

import { Howl, Howler } from 'howler';

// Use Vite's base URL for GitHub Pages subdirectory deployment
const BASE_URL = `${import.meta.env.BASE_URL ?? '/'}assets`;

// Audio asset paths
export const AUDIO_PATHS = {
  music: {
    gameplay: `${BASE_URL}/audio/music/flowing-rocks.ogg`,
    ambient: `${BASE_URL}/audio/music/night-at-beach.ogg`,
    gameOver: `${BASE_URL}/audio/music/game-over.ogg`,
  },
  sfx: {
    coinPickup: `${BASE_URL}/audio/sfx/coin-pickup.ogg`,
    gemPickup: `${BASE_URL}/audio/sfx/gem-pickup.ogg`,
    bonus: `${BASE_URL}/audio/sfx/bonus.ogg`,
    hit: `${BASE_URL}/audio/sfx/hit.ogg`,
    click: `${BASE_URL}/audio/sfx/click.ogg`,
    confirm: `${BASE_URL}/audio/sfx/confirm.ogg`,
  },
  ambient: {
    waterDrip1: `${BASE_URL}/audio/ambient/water-drip1.ogg`,
    waterDrip2: `${BASE_URL}/audio/ambient/water-drip2.ogg`,
  },
} as const;

export type MusicTrack = keyof typeof AUDIO_PATHS.music;
export type SFXSound = keyof typeof AUDIO_PATHS.sfx;
export type AmbientSound = keyof typeof AUDIO_PATHS.ambient;

/** Optional configuration for audio initialization */
export interface AudioConfig {
  musicVolume?: number;
  sfxVolume?: number;
  ambientVolume?: number;
}

interface AudioManagerState {
  initialized: boolean;
  musicVolume: number;
  sfxVolume: number;
  ambientVolume: number;
  muted: boolean;
  currentMusic: Howl | null;
  currentMusicId: number | null;
}

const state: AudioManagerState = {
  initialized: false,
  musicVolume: 0.5,
  sfxVolume: 0.7,
  ambientVolume: 0.3,
  muted: false,
  currentMusic: null,
  currentMusicId: null,
};

// Preloaded sounds cache
const soundCache: Map<string, Howl> = new Map();

/**
 * Initialize the audio manager
 * No longer requires a Scene parameter - Howler.js works standalone
 */
export function initAudio(config?: AudioConfig): void {
  if (state.initialized) return;

  // Apply optional config
  if (config?.musicVolume !== undefined) {
    state.musicVolume = Math.max(0, Math.min(1, config.musicVolume));
  }
  if (config?.sfxVolume !== undefined) {
    state.sfxVolume = Math.max(0, Math.min(1, config.sfxVolume));
  }
  if (config?.ambientVolume !== undefined) {
    state.ambientVolume = Math.max(0, Math.min(1, config.ambientVolume));
  }

  state.initialized = true;

  // Preload frequently used sounds
  preloadSFX();
}

/**
 * Preload all SFX sounds for instant playback
 */
function preloadSFX(): void {
  Object.entries(AUDIO_PATHS.sfx).forEach(([, path]) => {
    const sound = new Howl({
      src: [path],
      volume: state.sfxVolume,
      preload: true,
    });
    soundCache.set(path, sound);
  });
}

/**
 * Play a sound effect
 */
export function playSFX(name: SFXSound): void {
  if (!state.initialized) return;

  const path = AUDIO_PATHS.sfx[name];
  let sound = soundCache.get(path);

  if (sound) {
    sound.volume(state.sfxVolume);
    sound.play();
  } else {
    // Create and play if not cached
    sound = new Howl({
      src: [path],
      volume: state.sfxVolume,
    });
    soundCache.set(path, sound);
    // Play once loaded
    sound.once('load', () => {
      sound!.play();
    });
  }
}

/**
 * Play background music
 */
export function playMusic(track: MusicTrack, loop: boolean = true): void {
  if (!state.initialized) return;

  // Stop current music
  stopMusic();

  const path = AUDIO_PATHS.music[track];
  const music = new Howl({
    src: [path],
    loop,
    volume: state.musicVolume,
  });

  state.currentMusic = music;

  // Play once loaded
  music.once('load', () => {
    state.currentMusicId = music.play();
  });
}

/**
 * Stop current music
 */
export function stopMusic(): void {
  if (state.currentMusic) {
    state.currentMusic.stop();
    state.currentMusic.unload();
    state.currentMusic = null;
    state.currentMusicId = null;
  }
}

/**
 * Pause current music
 */
export function pauseMusic(): void {
  if (state.currentMusic && state.currentMusicId !== null) {
    state.currentMusic.pause(state.currentMusicId);
  }
}

/**
 * Resume current music
 */
export function resumeMusic(): void {
  if (state.currentMusic && state.currentMusicId !== null) {
    state.currentMusic.play(state.currentMusicId);
  }
}

/**
 * Set music volume (0-1)
 */
export function setMusicVolume(volume: number): void {
  state.musicVolume = Math.max(0, Math.min(1, volume));
  if (state.currentMusic) {
    state.currentMusic.volume(state.musicVolume);
  }
}

/**
 * Set SFX volume (0-1)
 */
export function setSFXVolume(volume: number): void {
  state.sfxVolume = Math.max(0, Math.min(1, volume));
  // Update all cached SFX volumes
  Object.values(AUDIO_PATHS.sfx).forEach((path) => {
    const sound = soundCache.get(path);
    if (sound) {
      sound.volume(state.sfxVolume);
    }
  });
}

/**
 * Set global mute state
 */
export function setMuted(muted: boolean): void {
  state.muted = muted;
  Howler.mute(muted);
}

/**
 * Get current mute state
 */
export function isMuted(): boolean {
  return state.muted;
}

/**
 * Play coin pickup sound
 */
export function playCoinPickup(): void {
  playSFX('coinPickup');
}

/**
 * Play gem pickup sound
 */
export function playGemPickup(): void {
  playSFX('gemPickup');
}

/**
 * Play hit/damage sound
 */
export function playHit(): void {
  playSFX('hit');
}

/**
 * Play UI click sound
 */
export function playClick(): void {
  playSFX('click');
}

/**
 * Play confirmation sound
 */
export function playConfirm(): void {
  playSFX('confirm');
}

/**
 * Cleanup audio resources
 */
export function disposeAudio(): void {
  stopMusic();
  soundCache.forEach((sound) => sound.unload());
  soundCache.clear();
  state.initialized = false;
}
