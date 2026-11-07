import { afterEach, describe, expect, it } from "vitest";
import { loadAudioSettings, saveAudioSettings } from "./audio";

afterEach(() => localStorage.clear());

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
