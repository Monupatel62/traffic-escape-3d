import type { PuzzleVehicle } from "./rules";

export type VehicleWorldPosition = { x: number; z: number };

/** Maps grid-cell coordinates to the center of a vehicle in the Three.js board. */
export function vehicleWorldPosition(vehicle: PuzzleVehicle): VehicleWorldPosition {
  if (vehicle.axis === "horizontal") {
    return { x: vehicle.x + vehicle.length / 2 - 3, z: vehicle.y - 2.5 };
  }
  return { x: vehicle.x - 2.5, z: vehicle.y + vehicle.length / 2 - 3 };
}

/** Converts a world-space lane coordinate back to the vehicle's grid start cell. */
export function worldAxisToGridStart(coordinate: number, pointerOffset: number, length: number): number {
  return Math.round(coordinate - pointerOffset + 3 - length / 2);
}
