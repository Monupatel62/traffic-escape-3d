import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadAudioSettings, saveAudioSettings } from "./audio";

const storage = new Map<string, string>();
const localStorageMock = {
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, value: string) => { storage.set(key, String(value)); },
  removeItem: (key: string) => { storage.delete(key); },
  clear: () => storage.clear()
};

beforeEach(() => {
  storage.clear();
  vi.stubGlobal("localStorage", localStorageMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("audio preferences", () => {
  it("defaults to sound effects on and music off", () => {
    expect(loadAudioSettings()).toEqual({ soundEnabled: true, musicEnabled: false });
  });

  it("persists both audio preferences", () => {
    saveAudioSettings({ soundEnabled: false, musicEnabled: true });
    expect(loadAudioSettings()).toEqual({ soundEnabled: false, musicEnabled: true });
  });

  it("falls back safely when stored settings are invalid", () => {
    localStorage.setItem("traffic-escape-3d-audio-v1", "{broken");
    expect(loadAudioSettings()).toEqual({ soundEnabled: true, musicEnabled: false });
  });
});
