export type VehicleAxis = "horizontal" | "vertical";
export type PuzzleVehicle = {
  id: string;
  x: number;
  y: number;
  length: number;
  axis: VehicleAxis;
  target?: boolean;
};

export function canPlaceVehicle(
  vehicle: PuzzleVehicle,
  x: number,
  y: number,
  vehicles: PuzzleVehicle[],
  gridSize: number
): boolean {
  if (!Number.isInteger(x) || !Number.isInteger(y) || !Number.isInteger(vehicle.length) || vehicle.length < 1) return false;

  if (vehicle.axis === "horizontal") {
    if (y !== vehicle.y || x < 0 || x + vehicle.length > gridSize) return false;
  } else if (x !== vehicle.x || y < 0 || y + vehicle.length > gridSize) {
    return false;
  }

  for (const other of vehicles) {
    if (other.id === vehicle.id) continue;
    for (let i = 0; i < other.length; i++) {
      const occupiedX = other.axis === "horizontal" ? other.x + i : other.x;
      const occupiedY = other.axis === "vertical" ? other.y + i : other.y;
      for (let j = 0; j < vehicle.length; j++) {
        const candidateX = vehicle.axis === "horizontal" ? x + j : x;
        const candidateY = vehicle.axis === "vertical" ? y + j : y;
        if (occupiedX === candidateX && occupiedY === candidateY) return false;
      }
    }
  }
  return true;
}

export function isTargetAtExit(vehicle: PuzzleVehicle, gridSize: number): boolean {
  return vehicle.target === true && vehicle.axis === "horizontal" && vehicle.x + vehicle.length === gridSize;
}
