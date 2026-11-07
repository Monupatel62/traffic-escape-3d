import { describe, expect, it } from "vitest";
import { canPlaceVehicle, canSlideVehicle, isTargetAtExit, solvePuzzle, validatePuzzle, type PuzzleVehicle } from "./rules";

const cars: PuzzleVehicle[] = [
  { id: "player", x: 0, y: 2, length: 2, axis: "horizontal", target: true },
  { id: "blocker", x: 4, y: 0, length: 3, axis: "vertical" },
  { id: "side", x: 1, y: 4, length: 2, axis: "horizontal" }
];

describe("puzzle movement rules", () => {
  it("allows movement along the vehicle's lane", () => expect(canPlaceVehicle(cars[0], 1, 2, cars, 6)).toBe(true));
  it("rejects movement across lanes", () => expect(canPlaceVehicle(cars[0], 1, 3, cars, 6)).toBe(false));
  it("rejects movement outside the board", () => expect(canPlaceVehicle(cars[0], 5, 2, cars, 6)).toBe(false));
  it("rejects overlapping another vehicle", () => expect(canPlaceVehicle(cars[0], 3, 2, cars, 6)).toBe(false));
  it("allows a vertical blocker to slide down into empty cells", () => expect(canPlaceVehicle(cars[1], 4, 3, cars, 6)).toBe(true));
  it("detects the target vehicle at the exit", () => {
    expect(isTargetAtExit({ ...cars[0], x: 4 }, 6)).toBe(true);
    expect(isTargetAtExit(cars[0], 6)).toBe(false);
  });
  it("prevents a vehicle from jumping over an intervening blocker", () => {
    const blocked = [
      { id: "moving", x: 0, y: 0, length: 2, axis: "horizontal" as const },
      { id: "wall", x: 2, y: 0, length: 2, axis: "vertical" as const }
    ];
    expect(canSlideVehicle(blocked[0], 3, blocked, 6)).toBe(false);
  });
  it("finds a solution for the tutorial puzzle", () => {
    const solution = solvePuzzle(cars, 6);
    expect(solution).not.toBeNull();
    expect(solution?.length).toBeGreaterThan(0);
    let state = cars.map(vehicle => ({ ...vehicle }));
    for (const move of solution ?? []) {
      const moving = state.find(vehicle => vehicle.id === move.vehicleId);
      expect(moving).toBeDefined();
      expect(canSlideVehicle(moving!, move.to, state, 6)).toBe(true);
      state = state.map(vehicle => vehicle.id === move.vehicleId
        ? { ...vehicle, x: vehicle.axis === "horizontal" ? move.to : vehicle.x, y: vehicle.axis === "vertical" ? move.to : vehicle.y }
        : { ...vehicle });
    }
    expect(isTargetAtExit(state.find(vehicle => vehicle.target)!, 6)).toBe(true);
  });
  it("validates the tutorial board", () => expect(validatePuzzle(cars, 6)).toEqual([]));
  it("reports invalid overlapping boards", () => {
    const invalid = [...cars, { id: "overlap", x: 1, y: 2, length: 2, axis: "horizontal" as const }];
    expect(validatePuzzle(invalid, 6).length).toBeGreaterThan(0);
  });
});
