import { describe, expect, it } from "vitest";
import { LEVELS, getLevel, validateLevelCatalog } from "./catalog";
import { completeLevel, loadProgress } from "./progress";

describe("level catalog", () => {
  it("contains a valid, solvable tutorial level", () => {
    expect(validateLevelCatalog()).toEqual([]);
    expect(getLevel(1)).toBe(LEVELS[0]);
  });
  it("contains three distinct playable puzzles", () => {
    expect(LEVELS).toHaveLength(3);
    expect(new Set(LEVELS.map(level => JSON.stringify(level.vehicles))).size).toBe(3);
  });
  it("returns undefined for unknown levels", () => expect(getLevel(999)).toBeUndefined());
});

describe("local progress", () => {
  it("unlocks the next level after completion", () => {
    expect(completeLevel({ highestUnlockedLevel: 1, completedLevels: [] }, 1))
      .toEqual({ highestUnlockedLevel: 2, completedLevels: [1] });
  });
  it("loads a safe default when storage is unavailable", () => {
    const original = globalThis.localStorage;
    Object.defineProperty(globalThis, "localStorage", { configurable: true, value: { getItem: () => { throw new Error("blocked"); } } });
    expect(loadProgress()).toEqual({ highestUnlockedLevel: 1, completedLevels: [] });
    Object.defineProperty(globalThis, "localStorage", { configurable: true, value: original });
  });
});
