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
let melodySynth: Tone.PolySynth | null = null;
let bassSynth: Tone.Synth | null = null;
let splashSynth: Tone.NoiseSynth | null = null;
let riverFilter: Tone.AutoFilter | null = null;

// Effects for audio processing
let masterGain: Tone.Gain | null = null;
let sfxGain: Tone.Gain | null = null;
let musicGain: Tone.Gain | null = null;
let ambientGain: Tone.Gain | null = null;
let reverb: Tone.Reverb | null = null;
let delay: Tone.FeedbackDelay | null = null;
let chorusEffect: Tone.Chorus | null = null;

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
  ambientGain = new Tone.Gain(state.ambientVolume).connect(masterGain);

  // Create effects
  reverb = new Tone.Reverb({
    decay: 2.5,
    wet: 0.35,
  }).connect(sfxGain);

  delay = new Tone.FeedbackDelay({
    delayTime: '8n',
    feedback: 0.2,
    wet: 0.15,
  }).connect(sfxGain);

  // Chorus for lush water/ambient sounds
  chorusEffect = new Tone.Chorus({
    frequency: 1.5,
    delayTime: 3.5,
    depth: 0.7,
    wet: 0.5,
  }).connect(musicGain).start();

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

  // Ambient water synth - ethereal pad for atmosphere
  ambientSynth = new Tone.FMSynth({
    harmonicity: 2,
    modulationIndex: 5,
    envelope: {
      attack: 1.0,
      decay: 0.8,
      sustain: 0.9,
      release: 2,
    },
    modulation: {
      type: 'sine',
    },
  }).connect(chorusEffect);

  // Noise synth for continuous water/river sounds
  noiseSynth = new Tone.NoiseSynth({
    noise: {
      type: 'pink',
    },
    envelope: {
      attack: 2.0,
      decay: 0.5,
      sustain: 1,
      release: 2,
    },
  }).connect(ambientGain);

  // Melody synth for playful game music - marimba/xylophone-like
  melodySynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
      type: 'sine',
    },
    envelope: {
      attack: 0.01,
      decay: 0.5,
      sustain: 0.1,
      release: 1.0,
    },
  }).connect(chorusEffect);

  // Bass synth for warm, flowing bass line
  bassSynth = new Tone.Synth({
    oscillator: {
      type: 'triangle',
    },
    envelope: {
      attack: 0.1,
      decay: 0.3,
      sustain: 0.6,
      release: 0.5,
    },
  }).connect(musicGain);

  // Splash synth for water interaction sounds
  splashSynth = new Tone.NoiseSynth({
    noise: {
      type: 'white',
    },
    envelope: {
      attack: 0.001,
      decay: 0.2,
      sustain: 0,
      release: 0.3,
    },
  }).connect(reverb);

  state.initialized = true;
}

/**
 * Play a subtle water splash sound
 * Used when collecting items or near-misses in the water
 */
export function playSplash(intensity: number = 0.5): void {
  if (!state.initialized || state.muted || !splashSynth) return;

  if (Tone.getContext().state !== 'running') {
    Tone.start();
  }

  splashSynth.triggerAttackRelease('8n', Tone.now(), intensity * 0.3 * state.sfxVolume);
}

/**
 * Play a procedurally generated coin pickup sound
 * Creates an ascending arpeggio of bell-like tones with a subtle splash
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

  // Add subtle splash
  playSplash(0.3);
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
 * Procedural gameplay music - playful, flowing music with water ambience
 * Features:
 * - Continuous filtered water/river sound
 * - Playful pentatonic melody patterns
 * - Warm, pulsing bass line
 * - Occasional splashy accents
 */
function startGameplayMusic(): void {
  if (!noiseSynth || !ambientSynth || !melodySynth || !bassSynth || !musicGain || !ambientGain) return;

  // Create and store river filter for continuous water sound
  riverFilter = new Tone.AutoFilter({
    frequency: 0.3, // Slow modulation for flowing water effect
    baseFrequency: 150,
    octaves: 3,
  })
    .connect(ambientGain)
    .start();

  // Start continuous river/water ambient sound
  noiseSynth.disconnect();
  noiseSynth.connect(riverFilter);
  noiseSynth.triggerAttack(Tone.now(), 0.25 * state.ambientVolume);

  // Pentatonic scale for playful, non-dissonant melodies
  const melodyNotes = ['C5', 'D5', 'E5', 'G5', 'A5', 'C6', 'D6'];
  const bassNotes = ['C2', 'D2', 'E2', 'G2', 'A2'];

  // Create a sequence of melodic patterns that loop
  let melodyIndex = 0;
  const melodyPatterns = [
    ['C5', 'E5', 'G5', 'E5'],
    ['D5', 'G5', 'A5', 'G5'],
    ['E5', 'A5', 'C6', 'A5'],
    ['G5', 'C6', 'D6', 'C6'],
  ];

  // Main music loop with playful melody
  state.currentMusicLoop = new Tone.Loop((time) => {
    if (state.muted) return;

    // Playful melody notes (play every beat with some variation)
    if (melodySynth && Math.random() > 0.3) {
      const pattern = melodyPatterns[melodyIndex % melodyPatterns.length];
      const noteIndex = Math.floor((Tone.getTransport().position.toString().split(':')[1] as unknown as number) % 4);
      const note = pattern[noteIndex] || melodyNotes[Math.floor(Math.random() * melodyNotes.length)];
      melodySynth.triggerAttackRelease(note, '8n', time, 0.2 * state.musicVolume);
    }

    // Occasional harmony note
    if (ambientSynth && Math.random() > 0.8) {
      const harmonyNote = melodyNotes[Math.floor(Math.random() * 4)]; // Lower notes
      ambientSynth.triggerAttackRelease(harmonyNote, '2n', time, 0.08 * state.musicVolume);
    }
  }, '8n').start(0);

  // Bass pattern loop - warm, pulsing foundation (auto-starts)
  new Tone.Loop((time) => {
    if (state.muted || !bassSynth) return;
    const bassNote = bassNotes[Math.floor(Math.random() * bassNotes.length)];
    bassSynth.triggerAttackRelease(bassNote, '2n', time, 0.15 * state.musicVolume);
  }, '2n').start(0);

  // Change melody pattern periodically for variety (auto-starts)
  new Tone.Loop(() => {
    melodyIndex = (melodyIndex + 1) % melodyPatterns.length;
  }, '4m').start(0);

  // Set tempo for a playful, energetic feel
  Tone.getTransport().bpm.value = 120;
  Tone.getTransport().start();
}

/**
 * Ambient background - gentle, peaceful river sounds for menu
 * Creates a calming atmosphere with soft water sounds and occasional gentle tones
 */
function startAmbientMusic(): void {
  if (!noiseSynth || !ambientSynth || !musicGain || !ambientGain) return;

  // Gentle water ambient
  riverFilter = new Tone.AutoFilter({
    frequency: 0.1, // Very slow modulation for calm water
    baseFrequency: 80,
    octaves: 1.5,
  })
    .connect(ambientGain)
    .start();

  noiseSynth.disconnect();
  noiseSynth.connect(riverFilter);
  noiseSynth.triggerAttack(Tone.now(), 0.2 * state.ambientVolume);

  // Occasional gentle ambient tones
  const ambientNotes = ['C3', 'E3', 'G3', 'C4', 'E4'];

  state.currentMusicLoop = new Tone.Loop((time) => {
    if (state.muted || !ambientSynth) return;

    // Very occasional gentle tones
    if (Math.random() > 0.85) {
      const note = ambientNotes[Math.floor(Math.random() * ambientNotes.length)];
      ambientSynth.triggerAttackRelease(note, '1n', time, 0.05 * state.musicVolume);
    }
  }, '2n').start(0);

  Tone.getTransport().bpm.value = 60; // Slow, calm tempo
  Tone.getTransport().start();
}

/**
 * Game over music - somber, reflective descending tones
 */
function startGameOverMusic(): void {
  if (!ambientSynth || !melodySynth) return;

  const now = Tone.now();

  // Sad, descending melody
  const notes = ['E5', 'D5', 'C5', 'B4', 'A4', 'G4'];
  notes.forEach((note, i) => {
    melodySynth!.triggerAttackRelease(
      note,
      '4n',
      now + i * 0.4,
      0.25 * state.musicVolume
    );
  });

  // Low, somber chord underneath
  setTimeout(() => {
    if (ambientSynth) {
      ambientSynth.triggerAttackRelease('A3', '2n', Tone.now(), 0.15 * state.musicVolume);
    }
  }, 800);
}

/**
 * Stop current music and ambient sounds
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

  if (riverFilter) {
    riverFilter.stop();
    riverFilter.dispose();
    riverFilter = null;
  }

  Tone.getTransport().stop();
  Tone.getTransport().cancel(); // Clear all scheduled events
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
  melodySynth?.dispose();
  bassSynth?.dispose();
  splashSynth?.dispose();

  // Dispose effects
  reverb?.dispose();
  delay?.dispose();
  chorusEffect?.dispose();
  sfxGain?.dispose();
  musicGain?.dispose();
  ambientGain?.dispose();
  masterGain?.dispose();

  // Reset references
  coinSynth = null;
  gemSynth = null;
  hitSynth = null;
  uiSynth = null;
  ambientSynth = null;
  noiseSynth = null;
  melodySynth = null;
  bassSynth = null;
  splashSynth = null;
  reverb = null;
  delay = null;
  chorusEffect = null;
  sfxGain = null;
  musicGain = null;
  ambientGain = null;
  masterGain = null;

  state.initialized = false;
  state.contextStarted = false;
}
