import { describe, expect, it } from "vitest";
import { canPlaceVehicle, isTargetAtExit, type PuzzleVehicle } from "./rules";

const cars: PuzzleVehicle[] = [
  { id: "player", x: 0, y: 2, length: 2, axis: "horizontal", target: true },
  { id: "blocker", x: 4, y: 0, length: 3, axis: "vertical" },
  { id: "side", x: 1, y: 4, length: 2, axis: "horizontal" }
];

describe("puzzle movement rules", () => {
  it("allows movement along the vehicle's lane", () => {
    expect(canPlaceVehicle(cars[0], 1, 2, cars, 6)).toBe(true);
  });

  it("rejects movement across lanes", () => {
    expect(canPlaceVehicle(cars[0], 1, 3, cars, 6)).toBe(false);
  });

  it("rejects a move outside the board", () => {
    expect(canPlaceVehicle(cars[0], 5, 2, cars, 6)).toBe(false);
  });

  it("rejects overlapping another vehicle", () => {
    expect(canPlaceVehicle(cars[0], 3, 2, cars, 6)).toBe(false);
  });

  it("allows a vertical blocker to slide down into empty cells", () => {
    expect(canPlaceVehicle(cars[1], 4, 3, cars, 6)).toBe(true);
  });

  it("detects the target vehicle at the exit", () => {
    expect(isTargetAtExit({ ...cars[0], x: 4 }, 6)).toBe(true);
    expect(isTargetAtExit(cars[0], 6)).toBe(false);
  });
});
