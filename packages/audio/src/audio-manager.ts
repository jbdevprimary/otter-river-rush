/**
 * Audio Manager for Otter River Rush
 * Uses Tone.js for procedural audio generation
 * Synthesizes all game sounds in real-time for a lightweight, cross-platform solution
 */

import * as Tone from 'tone';

// Gem types for different tones
export type GemType = 'blue' | 'green' | 'purple';

export type MusicTrack = 'gameplay' | 'ambient' | 'gameOver';
export type SFXSound =
  | 'coinPickup'
  | 'gemPickup'
  | 'bonus'
  | 'hit'
  | 'click'
  | 'confirm'
  | 'nearMiss';
export type AmbientSound = 'waterDrip1' | 'waterDrip2';

/** Optional configuration for audio initialization */
export interface AudioConfig {
  musicVolume?: number;
  sfxVolume?: number;
  ambientVolume?: number;
}

interface AudioManagerState {
  initialized: boolean;
  contextStarted: boolean;
  musicVolume: number;
  sfxVolume: number;
  ambientVolume: number;
  muted: boolean;
  currentMusicLoop: Tone.Loop | null;
  currentMusicTrack: MusicTrack | null;
}

const state: AudioManagerState = {
  initialized: false,
  contextStarted: false,
  musicVolume: 0.5,
  sfxVolume: 0.7,
  ambientVolume: 0.3,
  muted: false,
  currentMusicLoop: null,
  currentMusicTrack: null,
};

// Synth instances for different sound types
let coinSynth: Tone.PolySynth | null = null;
let gemSynth: Tone.PolySynth | null = null;
let hitSynth: Tone.MembraneSynth | null = null;
let uiSynth: Tone.Synth | null = null;
let ambientSynth: Tone.FMSynth | null = null;
let noiseSynth: Tone.NoiseSynth | null = null;

// Effects for audio processing
let masterGain: Tone.Gain | null = null;
let sfxGain: Tone.Gain | null = null;
let musicGain: Tone.Gain | null = null;
let reverb: Tone.Reverb | null = null;
let delay: Tone.FeedbackDelay | null = null;

// Legacy paths for backwards compatibility (not used with procedural audio)
export const AUDIO_PATHS = {
  music: {
    gameplay: '',
    ambient: '',
    gameOver: '',
  },
  sfx: {
    coinPickup: '',
    gemPickup: '',
    bonus: '',
    hit: '',
    click: '',
    confirm: '',
    nearMiss: '',
  },
  ambient: {
    waterDrip1: '',
    waterDrip2: '',
  },
} as const;

/**
 * Ensure Tone.js audio context is started
 * Must be called from a user interaction event handler
 */
export async function ensureAudioContext(): Promise<void> {
  if (state.contextStarted) return;

  if (Tone.getContext().state !== 'running') {
    await Tone.start();
  }
  state.contextStarted = true;
}

/**
 * Initialize the audio manager with Tone.js synthesizers
 * Sets up all synths and effects for procedural audio generation
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

  // Create master gain and routing
  masterGain = new Tone.Gain(1).toDestination();
  sfxGain = new Tone.Gain(state.sfxVolume).connect(masterGain);
  musicGain = new Tone.Gain(state.musicVolume).connect(masterGain);

  // Create effects
  reverb = new Tone.Reverb({
    decay: 1.5,
    wet: 0.3,
  }).connect(sfxGain);

  delay = new Tone.FeedbackDelay({
    delayTime: '8n',
    feedback: 0.2,
    wet: 0.15,
  }).connect(sfxGain);

  // Coin pickup synth - bright, bell-like chimes
  coinSynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
      type: 'sine',
    },
    envelope: {
      attack: 0.001,
      decay: 0.3,
      sustain: 0,
      release: 0.5,
    },
  }).connect(delay);

  // Gem pickup synth - richer, more resonant tones
  gemSynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
      type: 'triangle',
    },
    envelope: {
      attack: 0.005,
      decay: 0.4,
      sustain: 0.1,
      release: 0.8,
    },
  }).connect(reverb);

  // Hit/collision synth - percussive impact
  hitSynth = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 4,
    oscillator: {
      type: 'sine',
    },
    envelope: {
      attack: 0.001,
      decay: 0.4,
      sustain: 0,
      release: 0.4,
    },
  }).connect(sfxGain);

  // UI interaction synth
  uiSynth = new Tone.Synth({
    oscillator: {
      type: 'square',
    },
    envelope: {
      attack: 0.001,
      decay: 0.1,
      sustain: 0,
      release: 0.1,
    },
  }).connect(sfxGain);

  // Ambient water synth
  ambientSynth = new Tone.FMSynth({
    harmonicity: 3,
    modulationIndex: 10,
    envelope: {
      attack: 0.5,
      decay: 0.5,
      sustain: 0.8,
      release: 1,
    },
    modulation: {
      type: 'sine',
    },
  }).connect(musicGain);

  // Noise synth for water/ambient sounds
  noiseSynth = new Tone.NoiseSynth({
    noise: {
      type: 'pink',
    },
    envelope: {
      attack: 0.5,
      decay: 0.5,
      sustain: 1,
      release: 1,
    },
  }).connect(musicGain);

  state.initialized = true;
}

/**
 * Play a procedurally generated coin pickup sound
 * Creates an ascending arpeggio of bell-like tones
 */
export function playCoinPickup(): void {
  if (!state.initialized || state.muted || !coinSynth) return;

  // Ensure context is running (best effort, may not work without user interaction)
  if (Tone.getContext().state !== 'running') {
    Tone.start();
  }

  const now = Tone.now();
  // Ascending major arpeggio with high notes for a cheerful "bling"
  coinSynth.triggerAttackRelease('C6', '32n', now, 0.5 * state.sfxVolume);
  coinSynth.triggerAttackRelease('E6', '32n', now + 0.03, 0.6 * state.sfxVolume);
  coinSynth.triggerAttackRelease('G6', '32n', now + 0.06, 0.7 * state.sfxVolume);
  coinSynth.triggerAttackRelease('C7', '16n', now + 0.09, 0.8 * state.sfxVolume);
}

/**
 * Play a procedurally generated gem pickup sound
 * Different tones based on gem type
 */
export function playGemPickup(gemType: GemType = 'blue'): void {
  if (!state.initialized || state.muted || !gemSynth) return;

  if (Tone.getContext().state !== 'running') {
    Tone.start();
  }

  const now = Tone.now();

  // Different chord progressions based on gem type
  const chords: Record<GemType, string[]> = {
    blue: ['E5', 'G#5', 'B5', 'E6'], // E major - ethereal, watery
    green: ['G5', 'B5', 'D6', 'G6'], // G major - fresh, natural
    purple: ['A5', 'C#6', 'E6', 'A6'], // A major - mystical, royal
  };

  const notes = chords[gemType];
  notes.forEach((note, i) => {
    gemSynth!.triggerAttackRelease(
      note,
      '8n',
      now + i * 0.05,
      (0.4 + i * 0.15) * state.sfxVolume
    );
  });
}

/**
 * Play a procedurally generated hit/collision sound
 * Low impact thud with quick decay
 */
export function playHit(): void {
  if (!state.initialized || state.muted || !hitSynth) return;

  if (Tone.getContext().state !== 'running') {
    Tone.start();
  }

  hitSynth.triggerAttackRelease('C2', '8n', Tone.now(), 0.8 * state.sfxVolume);
}

/**
 * Play UI click sound
 */
export function playClick(): void {
  if (!state.initialized || state.muted || !uiSynth) return;

  if (Tone.getContext().state !== 'running') {
    Tone.start();
  }

  uiSynth.triggerAttackRelease('A5', '32n', Tone.now(), 0.3 * state.sfxVolume);
}

/**
 * Play UI confirmation sound
 */
export function playConfirm(): void {
  if (!state.initialized || state.muted || !uiSynth) return;

  if (Tone.getContext().state !== 'running') {
    Tone.start();
  }

  const now = Tone.now();
  uiSynth.triggerAttackRelease('C5', '32n', now, 0.4 * state.sfxVolume);
  uiSynth.triggerAttackRelease('E5', '32n', now + 0.05, 0.5 * state.sfxVolume);
  uiSynth.triggerAttackRelease('G5', '16n', now + 0.1, 0.6 * state.sfxVolume);
}

/**
 * Play a sound effect by name
 */
export function playSFX(name: SFXSound): void {
  switch (name) {
    case 'coinPickup':
      playCoinPickup();
      break;
    case 'gemPickup':
      playGemPickup();
      break;
    case 'bonus':
      playBonusSound();
      break;
    case 'hit':
      playHit();
      break;
    case 'click':
      playClick();
      break;
    case 'confirm':
      playConfirm();
      break;
    case 'nearMiss':
      playNearMiss();
      break;
  }
}

/**
 * Play bonus pickup sound - extra rewarding
 */
function playBonusSound(): void {
  if (!state.initialized || state.muted || !coinSynth) return;

  if (Tone.getContext().state !== 'running') {
    Tone.start();
  }

  const now = Tone.now();
  // Triumphant ascending scale
  const notes = ['C5', 'E5', 'G5', 'C6', 'E6', 'G6', 'C7'];
  notes.forEach((note, i) => {
    coinSynth!.triggerAttackRelease(
      note,
      '16n',
      now + i * 0.04,
      (0.3 + i * 0.1) * state.sfxVolume
    );
  });
}

/**
 * Play near-miss sound - exciting close call effect
 * Quick ascending swoosh sound indicating a close dodge
 */
export function playNearMiss(): void {
  if (!state.initialized || state.muted || !coinSynth) return;

  if (Tone.getContext().state !== 'running') {
    Tone.start();
  }

  const now = Tone.now();
  // Quick ascending "whoosh" with a triumphant feel
  const notes = ['D5', 'F#5', 'A5', 'D6'];
  notes.forEach((note, i) => {
    coinSynth!.triggerAttackRelease(
      note,
      '32n',
      now + i * 0.025,
      (0.4 + i * 0.1) * state.sfxVolume
    );
  });
}

/**
 * Play background music - procedural ambient river sounds
 */
export function playMusic(track: MusicTrack, _loop: boolean = true): void {
  if (!state.initialized || state.muted) return;

  // Stop current music
  stopMusic();

  if (Tone.getContext().state !== 'running') {
    Tone.start();
  }

  state.currentMusicTrack = track;

  switch (track) {
    case 'gameplay':
      startGameplayMusic();
      break;
    case 'ambient':
      startAmbientMusic();
      break;
    case 'gameOver':
      startGameOverMusic();
      break;
  }
}

/**
 * Procedural gameplay music - flowing water with melodic elements
 */
function startGameplayMusic(): void {
  if (!noiseSynth || !ambientSynth || !musicGain) return;

  // Start filtered pink noise for water ambience
  const filter = new Tone.AutoFilter({
    frequency: '4n',
    baseFrequency: 200,
    octaves: 4,
  })
    .connect(musicGain)
    .start();

  noiseSynth.disconnect();
  noiseSynth.connect(filter);
  noiseSynth.triggerAttack(Tone.now(), 0.15 * state.musicVolume);

  // Add melodic pattern
  const pentatonic = ['C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5'];

  state.currentMusicLoop = new Tone.Loop((time) => {
    if (!ambientSynth || state.muted) return;

    // Randomly play notes from pentatonic scale
    if (Math.random() > 0.6) {
      const note = pentatonic[Math.floor(Math.random() * pentatonic.length)];
      ambientSynth.triggerAttackRelease(note, '2n', time, 0.1 * state.musicVolume);
    }
  }, '4n').start(0);

  Tone.getTransport().start();
}

/**
 * Ambient background - gentle water sounds
 */
function startAmbientMusic(): void {
  if (!noiseSynth || !musicGain) return;

  const filter = new Tone.AutoFilter({
    frequency: '2n',
    baseFrequency: 100,
    octaves: 2,
  })
    .connect(musicGain)
    .start();

  noiseSynth.disconnect();
  noiseSynth.connect(filter);
  noiseSynth.triggerAttack(Tone.now(), 0.1 * state.musicVolume);

  Tone.getTransport().start();
}

/**
 * Game over music - somber descending tones
 */
function startGameOverMusic(): void {
  if (!ambientSynth) return;

  const now = Tone.now();
  const notes = ['E4', 'D4', 'C4', 'B3', 'A3'];

  notes.forEach((note, i) => {
    ambientSynth!.triggerAttackRelease(
      note,
      '2n',
      now + i * 0.5,
      0.3 * state.musicVolume
    );
  });
}

/**
 * Stop current music
 */
export function stopMusic(): void {
  if (state.currentMusicLoop) {
    state.currentMusicLoop.stop();
    state.currentMusicLoop.dispose();
    state.currentMusicLoop = null;
  }

  if (noiseSynth) {
    noiseSynth.triggerRelease(Tone.now());
  }

  Tone.getTransport().stop();
  state.currentMusicTrack = null;
}

/**
 * Pause current music
 */
export function pauseMusic(): void {
  Tone.getTransport().pause();
}

/**
 * Resume current music
 */
export function resumeMusic(): void {
  if (state.currentMusicTrack) {
    Tone.getTransport().start();
  }
}

/**
 * Set music volume (0-1)
 */
export function setMusicVolume(volume: number): void {
  state.musicVolume = Math.max(0, Math.min(1, volume));
  if (musicGain) {
    musicGain.gain.value = state.musicVolume;
  }
}

/**
 * Set SFX volume (0-1)
 */
export function setSFXVolume(volume: number): void {
  state.sfxVolume = Math.max(0, Math.min(1, volume));
  if (sfxGain) {
    sfxGain.gain.value = state.sfxVolume;
  }
}

/**
 * Set global mute state
 */
export function setMuted(muted: boolean): void {
  state.muted = muted;
  if (masterGain) {
    masterGain.gain.value = muted ? 0 : 1;
  }
}

/**
 * Get current mute state
 */
export function isMuted(): boolean {
  return state.muted;
}

/**
 * Cleanup audio resources
 */
export function disposeAudio(): void {
  stopMusic();

  // Dispose synths
  coinSynth?.dispose();
  gemSynth?.dispose();
  hitSynth?.dispose();
  uiSynth?.dispose();
  ambientSynth?.dispose();
  noiseSynth?.dispose();

  // Dispose effects
  reverb?.dispose();
  delay?.dispose();
  sfxGain?.dispose();
  musicGain?.dispose();
  masterGain?.dispose();

  // Reset references
  coinSynth = null;
  gemSynth = null;
  hitSynth = null;
  uiSynth = null;
  ambientSynth = null;
  noiseSynth = null;
  reverb = null;
  delay = null;
  sfxGain = null;
  musicGain = null;
  masterGain = null;

  state.initialized = false;
  state.contextStarted = false;
}
