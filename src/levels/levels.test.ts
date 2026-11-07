import { describe, expect, it } from "vitest";
import { LEVELS, getLevel, validateLevelCatalog } from "./catalog";
import { completeLevel, loadProgress } from "./progress";

describe("level catalog", () => {
  it("contains a valid, solvable tutorial level", () => {
    expect(validateLevelCatalog()).toEqual([]);
    expect(getLevel(1)).toBe(LEVELS[0]);
  });
  it("contains twenty distinct playable puzzles in each of the first two worlds", () => {
    expect(LEVELS).toHaveLength(40);
    for (const world of [1, 2]) {
      const worldLevels = LEVELS.filter(level => level.world === world);
      expect(worldLevels).toHaveLength(20);
      expect(new Set(worldLevels.map(level => JSON.stringify(level.vehicles))).size).toBe(20);
    }
  });
  it("returns undefined for unknown levels", () => expect(getLevel(999)).toBeUndefined());
});

describe("local progress", () => {
  it("unlocks the next level after completion", () => {
    expect(completeLevel({ highestUnlockedLevel: 1, completedLevels: [] }, 1))
      .toEqual({ highestUnlockedLevel: 2, completedLevels: [1] });
  });
  it("unlocks World 2 after completing level 20", () => {
    expect(completeLevel({ highestUnlockedLevel: 20, completedLevels: [] }, 20, 21))
      .toEqual({ highestUnlockedLevel: 21, completedLevels: [20] });
  });
  it("loads a safe default when storage is unavailable", () => {
    const original = globalThis.localStorage;
    Object.defineProperty(globalThis, "localStorage", { configurable: true, value: { getItem: () => { throw new Error("blocked"); } } });
    expect(loadProgress()).toEqual({ highestUnlockedLevel: 1, completedLevels: [] });
    Object.defineProperty(globalThis, "localStorage", { configurable: true, value: original });
  });
});
