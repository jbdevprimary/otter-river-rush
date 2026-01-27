/**
 * @otter-river-rush/audio
 * Audio system for Otter River Rush using Tone.js for procedural audio generation
 */

export {
  type AmbientSound,
  AUDIO_PATHS,
  type AudioConfig,
  disposeAudio,
  ensureAudioContext,
  type GemType,
  initAudio,
  isMuted,
  type MusicTrack,
  pauseMusic,
  playClick,
  playCoinPickup,
  playConfirm,
  playGemPickup,
  playHit,
  playMusic,
  playNearMiss,
  playSFX,
  playSplash,
  resumeMusic,
  type SFXSound,
  setMusicVolume,
  setMuted,
  setSFXVolume,
  stopMusic,
} from './audio-manager';
