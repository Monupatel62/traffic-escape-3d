export type SoundName = "move" | "win" | "click";

export type AudioSettings = {
  soundEnabled: boolean;
  musicEnabled: boolean;
};

const STORAGE_KEY = "traffic-escape-3d-audio-v1";
const DEFAULT_SETTINGS: AudioSettings = { soundEnabled: true, musicEnabled: false };

export function loadAudioSettings(): AudioSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return { ...DEFAULT_SETTINGS };
    const settings = value as Partial<AudioSettings>;
    return {
      soundEnabled: typeof settings.soundEnabled === "boolean" ? settings.soundEnabled : DEFAULT_SETTINGS.soundEnabled,
      musicEnabled: typeof settings.musicEnabled === "boolean" ? settings.musicEnabled : DEFAULT_SETTINGS.musicEnabled
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveAudioSettings(settings: AudioSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Audio preferences are optional; gameplay must continue if storage is unavailable.
  }
}

export class GameAudio {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private musicOscillators: OscillatorNode[] = [];
  private settings: AudioSettings;

  constructor(settings = loadAudioSettings()) {
    this.settings = settings;
  }

  getSettings(): AudioSettings {
    return { ...this.settings };
  }

  setSettings(settings: AudioSettings): void {
    this.settings = { ...settings };
    saveAudioSettings(this.settings);
    if (this.settings.musicEnabled) this.startMusic();
    else this.stopMusic();
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === "undefined" || !(window.AudioContext)) return null;
    if (!this.context) {
      this.context = new AudioContext();
      this.master = this.context.createGain();
      this.master.gain.value = 0.18;
      this.master.connect(this.context.destination);
    }
    if (this.context.state === "suspended") void this.context.resume();
    return this.context;
  }

  play(name: SoundName): void {
    if (!this.settings.soundEnabled) return;
    const context = this.ensureContext();
    if (!context || !this.master) return;
    const now = context.currentTime;
    const notes = name === "win" ? [523.25, 659.25, 783.99] : name === "move" ? [330] : [440];
    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = name === "move" ? "triangle" : "sine";
      oscillator.frequency.setValueAtTime(frequency, now + index * 0.11);
      gain.gain.setValueAtTime(0.0001, now + index * 0.11);
      gain.gain.exponentialRampToValueAtTime(name === "move" ? 0.12 : 0.1, now + index * 0.11 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.11 + (name === "move" ? 0.11 : 0.24));
      oscillator.connect(gain);
      gain.connect(this.master!);
      oscillator.start(now + index * 0.11);
      oscillator.stop(now + index * 0.11 + (name === "move" ? 0.12 : 0.25));
    });
  }

  private startMusic(): void {
    const context = this.ensureContext();
    if (!context || !this.master || this.musicOscillators.length) return;
    this.musicGain = context.createGain();
    this.musicGain.gain.value = 0.018;
    this.musicGain.connect(this.master);
    [130.81, 164.81].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      oscillator.type = index === 0 ? "sine" : "triangle";
      oscillator.frequency.value = frequency;
      oscillator.connect(this.musicGain!);
      oscillator.start();
      this.musicOscillators.push(oscillator);
    });
  }

  private stopMusic(): void {
    for (const oscillator of this.musicOscillators) {
      try { oscillator.stop(); } catch { /* already stopped */ }
      oscillator.disconnect();
    }
    this.musicOscillators = [];
    this.musicGain?.disconnect();
    this.musicGain = null;
  }

  dispose(): void {
    this.stopMusic();
    if (this.context && this.context.state !== "closed") void this.context.close();
    this.context = null;
    this.master = null;
  }
}
