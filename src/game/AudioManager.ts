import { Howl } from 'howler';

export class AudioManager {
  private sounds: Map<string, Howl> = new Map();
  private soundEnabled: boolean = true;
  private musicEnabled: boolean = true;

  constructor() {
    // Note: In a real implementation, you would load actual audio files
    // For this demo, we'll create placeholder Howl instances
    this.initializeSounds();
  }

  private initializeSounds(): void {
    // These would be actual audio file paths in production
    // Using data URIs or external URLs to comply with licensing

    // Create silent placeholder sounds for demo purposes
    const silentAudio =
      'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

    this.sounds.set(
      'collision',
      new Howl({
        src: [silentAudio],
        volume: 0.5,
      })
    );

    this.sounds.set(
      'powerup',
      new Howl({
        src: [silentAudio],
        volume: 0.6,
      })
    );

    this.sounds.set(
      'move',
      new Howl({
        src: [silentAudio],
        volume: 0.3,
      })
    );

    this.sounds.set(
      'achievement',
      new Howl({
        src: [silentAudio],
        volume: 0.7,
      })
    );
  }

  playSound(name: string): void {
    if (!this.soundEnabled) return;

    const sound = this.sounds.get(name);
    if (sound) {
      sound.play();
    }
  }

  setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
  }

  setMusicEnabled(enabled: boolean): void {
    this.musicEnabled = enabled;
  }

  setVolume(volume: number): void {
    // Clamp volume between 0 and 1
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.sounds.forEach((sound) => {
      sound.volume(clampedVolume);
    });
  }

  isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  isMusicEnabled(): boolean {
    return this.musicEnabled;
  }

  cleanup(): void {
    this.sounds.forEach((sound) => sound.unload());
    this.sounds.clear();
  }
}
