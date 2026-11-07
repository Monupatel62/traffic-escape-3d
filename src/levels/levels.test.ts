import { describe, expect, it } from "vitest";
import { LEVELS, getLevel, validateLevelCatalog } from "./catalog";
import { completeLevel, loadProgress } from "./progress";

describe("level catalog", () => {
  it("contains a valid, solvable tutorial level", () => {
    expect(validateLevelCatalog()).toEqual([]);
    expect(getLevel(1)).toBe(LEVELS[0]);
  });
  it("contains twenty distinct playable puzzles in all five worlds", () => {
    expect(LEVELS).toHaveLength(100);
    for (const world of [1, 2, 3, 4, 5]) {
      const worldLevels = LEVELS.filter(level => level.world === world);
      expect(worldLevels).toHaveLength(20);
      expect(new Set(worldLevels.map(level => JSON.stringify(level.vehicles))).size).toBe(20);
    }
  });
  it("adds cross-traffic variety to the later worlds", () => {
    for (const world of [3, 4, 5]) {
      const worldLevels = LEVELS.filter(level => level.world === world);
      const crossTraffic = worldLevels.map(level =>
        level.vehicles.find(vehicle => vehicle.id === "v7")
      );
      expect(crossTraffic.every(vehicle =>
        vehicle?.axis === "horizontal" && vehicle.y === 5 && vehicle.length === 2
      )).toBe(true);
      expect(new Set(crossTraffic.map(vehicle => vehicle?.x)).size).toBe(3);
    }
  });
  it("places at least one blocker in every level's target escape lane", () => {
    for (const level of LEVELS) {
      const target = level.vehicles.find(vehicle => vehicle.target)!;
      const blocked = level.vehicles.some(vehicle => {
        if (vehicle.id === target.id) return false;
        for (let offset = 0; offset < vehicle.length; offset++) {
          const x = vehicle.axis === "horizontal" ? vehicle.x + offset : vehicle.x;
          const y = vehicle.axis === "vertical" ? vehicle.y + offset : vehicle.y;
          if (y === target.y && x >= target.x + target.length && x < level.gridSize) return true;
        }
        return false;
      });
      expect(blocked, `Level ${level.id} should require clearing traffic from the target lane`).toBe(true);
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
  it("unlocks World 3 after completing level 40", () => {
    expect(completeLevel({ highestUnlockedLevel: 40, completedLevels: [] }, 40, 41))
      .toEqual({ highestUnlockedLevel: 41, completedLevels: [40] });
  });
  it("unlocks World 4 after completing level 60", () => {
    expect(completeLevel({ highestUnlockedLevel: 60, completedLevels: [] }, 60, 61))
      .toEqual({ highestUnlockedLevel: 61, completedLevels: [60] });
  });
  it("unlocks World 5 after completing level 80", () => {
    expect(completeLevel({ highestUnlockedLevel: 80, completedLevels: [] }, 80, 81))
      .toEqual({ highestUnlockedLevel: 81, completedLevels: [80] });
  });
  it("loads a safe default when storage is unavailable", () => {
    const original = globalThis.localStorage;
    Object.defineProperty(globalThis, "localStorage", { configurable: true, value: { getItem: () => { throw new Error("blocked"); } } });
    expect(loadProgress()).toEqual({ highestUnlockedLevel: 1, completedLevels: [] });
    Object.defineProperty(globalThis, "localStorage", { configurable: true, value: original });
  });
});
