/**
 * @otter-river-rush/audio
 * Audio system for Otter River Rush using Tone.js for procedural audio generation
 */

export {
  initAudio,
  ensureAudioContext,
  playSFX,
  playMusic,
  stopMusic,
  pauseMusic,
  resumeMusic,
  setMusicVolume,
  setSFXVolume,
  setMuted,
  isMuted,
  playCoinPickup,
  playGemPickup,
  playHit,
  playClick,
  playConfirm,
  playNearMiss,
  disposeAudio,
  AUDIO_PATHS,
  type AudioConfig,
  type MusicTrack,
  type SFXSound,
  type AmbientSound,
  type GemType,
} from './audio-manager';
