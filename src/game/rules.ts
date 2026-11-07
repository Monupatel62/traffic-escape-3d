export type VehicleAxis = "horizontal" | "vertical";
export type PuzzleVehicle = {
  id: string;
  x: number;
  y: number;
  length: number;
  axis: VehicleAxis;
  target?: boolean;
};
export type PuzzleMove = { vehicleId: string; to: number };

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
  } else if (x !== vehicle.x || y < 0 || y + vehicle.length > gridSize) return false;

  for (const other of vehicles) {
    if (other.id === vehicle.id) continue;
    for (let i = 0; i < other.length; i++) {
      const ox = other.axis === "horizontal" ? other.x + i : other.x;
      const oy = other.axis === "vertical" ? other.y + i : other.y;
      for (let j = 0; j < vehicle.length; j++) {
        const vx = vehicle.axis === "horizontal" ? x + j : x;
        const vy = vehicle.axis === "vertical" ? y + j : y;
        if (ox === vx && oy === vy) return false;
      }
    }
  }
  return true;
}

/** Checks every cell between the current and requested position. Vehicles cannot jump over blockers. */
export function canSlideVehicle(
  vehicle: PuzzleVehicle,
  to: number,
  vehicles: PuzzleVehicle[],
  gridSize: number
): boolean {
  if (!Number.isInteger(to)) return false;
  const from = vehicle.axis === "horizontal" ? vehicle.x : vehicle.y;
  if (to === from) return true;
  const direction = Math.sign(to - from);
  for (let position = from + direction; direction > 0 ? position <= to : position >= to; position += direction) {
    const x = vehicle.axis === "horizontal" ? position : vehicle.x;
    const y = vehicle.axis === "vertical" ? position : vehicle.y;
    if (!canPlaceVehicle(vehicle, x, y, vehicles, gridSize)) return false;
  }
  return true;
}

export function isTargetAtExit(vehicle: PuzzleVehicle, gridSize: number): boolean {
  return vehicle.target === true && vehicle.axis === "horizontal" && vehicle.x + vehicle.length === gridSize;
}

function stateKey(vehicles: PuzzleVehicle[]): string {
  return vehicles.map(v => v.axis === "horizontal" ? v.x : v.y).join(",");
}

/** Breadth-first solver. Each legal one-cell slide is one search edge. */
export function solvePuzzle(
  initial: PuzzleVehicle[],
  gridSize: number,
  maxVisited = 100_000
): PuzzleMove[] | null {
  const targetIndex = initial.findIndex(v => v.target);
  if (targetIndex < 0) return null;
  const start = initial.map(v => ({ ...v }));
  const queue: Array<{ vehicles: PuzzleVehicle[]; path: PuzzleMove[] }> = [{ vehicles: start, path: [] }];
  const visited = new Set([stateKey(start)]);
  let cursor = 0;

  while (cursor < queue.length && visited.size <= maxVisited) {
    const current = queue[cursor++];
    const target = current.vehicles[targetIndex];
    if (isTargetAtExit(target, gridSize)) return current.path;

    for (let index = 0; index < current.vehicles.length; index++) {
      const vehicle = current.vehicles[index];
      const from = vehicle.axis === "horizontal" ? vehicle.x : vehicle.y;
      for (const to of [from - 1, from + 1]) {
        if (!canSlideVehicle(vehicle, to, current.vehicles, gridSize)) continue;
        const nextVehicles = current.vehicles.map((v, i) => i === index
          ? { ...v, x: v.axis === "horizontal" ? to : v.x, y: v.axis === "vertical" ? to : v.y }
          : { ...v });
        const key = stateKey(nextVehicles);
        if (visited.has(key)) continue;
        visited.add(key);
        queue.push({ vehicles: nextVehicles, path: [...current.path, { vehicleId: vehicle.id, to }] });
      }
    }
  }
  return null;
}

export function validatePuzzle(vehicles: PuzzleVehicle[], gridSize: number): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const targets = vehicles.filter(v => v.target);
  if (targets.length !== 1) errors.push("A puzzle must have exactly one target vehicle.");
  for (const v of vehicles) {
    if (!v.id || ids.has(v.id)) errors.push("Vehicle IDs must be unique and non-empty.");
    ids.add(v.id);
    if (!Number.isInteger(v.length) || v.length < 2 || v.length > gridSize) errors.push(`Vehicle ${v.id} has an invalid length.`);
    if (!canPlaceVehicle(v, v.x, v.y, vehicles.filter(other => other.id !== v.id), gridSize)) errors.push(`Vehicle ${v.id} has an invalid position or overlaps another vehicle.`);
  }
  if (targets[0] && (targets[0].axis !== "horizontal" || targets[0].y < 0 || targets[0].y >= gridSize)) {
    errors.push("The target vehicle must be horizontal and inside the board.");
  }
  return errors;
}
