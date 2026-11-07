import { describe, expect, it } from "vitest";
import { vehicleWorldPosition, worldAxisToGridStart } from "./coordinates";
import type { PuzzleVehicle } from "./rules";

describe("vehicle board coordinates", () => {
  it("centers a horizontal vehicle on its row and grid cells", () => {
    const vehicle: PuzzleVehicle = { id: "h", x: 0, y: 2, length: 2, axis: "horizontal" };
    expect(vehicleWorldPosition(vehicle)).toEqual({ x: -2, z: -0.5 });
  });

  it("centers a vertical vehicle on its column and grid cells", () => {
    const vehicle: PuzzleVehicle = { id: "v", x: 4, y: 1, length: 3, axis: "vertical" };
    expect(vehicleWorldPosition(vehicle)).toEqual({ x: 1.5, z: -0.5 });
  });

  it("converts both lane coordinates back to their grid start", () => {
    expect(worldAxisToGridStart(-2, 0, 2)).toBe(0);
    expect(worldAxisToGridStart(0, 0, 3)).toBe(2);
    expect(worldAxisToGridStart(-1.5, 0, 2)).toBe(0);
  });

  it("preserves the grabbed pointer offset", () => {
    expect(worldAxisToGridStart(-1.5, 0.5, 2)).toBe(0);
  });
});
