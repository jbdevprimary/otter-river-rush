/**
 * @otter-river-rush/audio
 * Audio system for Otter River Rush using Howler.js for cross-platform support
 */

export {
  initAudio,
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
  disposeAudio,
  AUDIO_PATHS,
  type AudioConfig,
  type MusicTrack,
  type SFXSound,
  type AmbientSound,
} from './audio-manager';
