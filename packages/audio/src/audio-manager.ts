/**
 * Audio Manager for Otter River Rush
 * Uses Babylon.js Sound for audio playback
 */

import { Sound, Scene, Engine } from '@babylonjs/core';

// Audio asset paths
export const AUDIO_PATHS = {
  music: {
    gameplay: '/assets/audio/music/flowing-rocks.ogg',
    ambient: '/assets/audio/music/night-at-beach.ogg',
    gameOver: '/assets/audio/music/game-over.ogg',
  },
  sfx: {
    coinPickup: '/assets/audio/sfx/coin-pickup.ogg',
    gemPickup: '/assets/audio/sfx/gem-pickup.ogg',
    bonus: '/assets/audio/sfx/bonus.ogg',
    hit: '/assets/audio/sfx/hit.ogg',
    click: '/assets/audio/sfx/click.ogg',
    confirm: '/assets/audio/sfx/confirm.ogg',
  },
  ambient: {
    waterDrip1: '/assets/audio/ambient/water-drip1.ogg',
    waterDrip2: '/assets/audio/ambient/water-drip2.ogg',
  },
} as const;

export type MusicTrack = keyof typeof AUDIO_PATHS.music;
export type SFXSound = keyof typeof AUDIO_PATHS.sfx;
export type AmbientSound = keyof typeof AUDIO_PATHS.ambient;

interface AudioManagerState {
  initialized: boolean;
  musicVolume: number;
  sfxVolume: number;
  ambientVolume: number;
  currentMusic: Sound | null;
  scene: Scene | null;
}

const state: AudioManagerState = {
  initialized: false,
  musicVolume: 0.5,
  sfxVolume: 0.7,
  ambientVolume: 0.3,
  currentMusic: null,
  scene: null,
};

// Preloaded sounds cache
const soundCache: Map<string, Sound> = new Map();

/**
 * Initialize the audio manager with a Babylon.js scene
 */
export function initAudio(scene: Scene): void {
  if (state.initialized) return;

  state.scene = scene;
  state.initialized = true;

  // Enable audio engine
  Engine.audioEngine?.unlock();

  // Preload frequently used sounds
  preloadSFX();
}

/**
 * Preload all SFX sounds for instant playback
 */
function preloadSFX(): void {
  if (!state.scene) return;

  Object.entries(AUDIO_PATHS.sfx).forEach(([name, path]) => {
    const sound = new Sound(
      `sfx_${name}`,
      path,
      state.scene!,
      null,
      { autoplay: false, volume: state.sfxVolume }
    );
    soundCache.set(path, sound);
  });
}

/**
 * Play a sound effect
 */
export function playSFX(name: SFXSound): void {
  if (!state.scene || !state.initialized) return;

  const path = AUDIO_PATHS.sfx[name];
  let sound = soundCache.get(path);

  if (sound) {
    sound.setVolume(state.sfxVolume);
    sound.play();
  } else {
    // Create and play if not cached
    sound = new Sound(
      `sfx_${name}`,
      path,
      state.scene,
      () => sound?.play(),
      { autoplay: false, volume: state.sfxVolume }
    );
    soundCache.set(path, sound);
  }
}

/**
 * Play background music
 */
export function playMusic(track: MusicTrack, loop: boolean = true): void {
  if (!state.scene || !state.initialized) return;

  // Stop current music
  stopMusic();

  const path = AUDIO_PATHS.music[track];
  state.currentMusic = new Sound(
    `music_${track}`,
    path,
    state.scene,
    () => state.currentMusic?.play(),
    { autoplay: false, loop, volume: state.musicVolume }
  );
}

/**
 * Stop current music
 */
export function stopMusic(): void {
  if (state.currentMusic) {
    state.currentMusic.stop();
    state.currentMusic.dispose();
    state.currentMusic = null;
  }
}

/**
 * Pause current music
 */
export function pauseMusic(): void {
  state.currentMusic?.pause();
}

/**
 * Resume current music
 */
export function resumeMusic(): void {
  state.currentMusic?.play();
}

/**
 * Set music volume (0-1)
 */
export function setMusicVolume(volume: number): void {
  state.musicVolume = Math.max(0, Math.min(1, volume));
  if (state.currentMusic) {
    state.currentMusic.setVolume(state.musicVolume);
  }
}

/**
 * Set SFX volume (0-1)
 */
export function setSFXVolume(volume: number): void {
  state.sfxVolume = Math.max(0, Math.min(1, volume));
  // Update all cached SFX volumes
  soundCache.forEach((sound) => {
    if (sound.name.startsWith('sfx_')) {
      sound.setVolume(state.sfxVolume);
    }
  });
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
  soundCache.forEach((sound) => sound.dispose());
  soundCache.clear();
  state.initialized = false;
  state.scene = null;
}
