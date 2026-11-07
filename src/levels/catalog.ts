import { validatePuzzle, solvePuzzle, type PuzzleVehicle } from "../game/rules";

export type LevelDefinition = {
  id: number;
  world: number;
  title: string;
  difficulty: "Easy" | "Normal" | "Hard";
  gridSize: number;
  vehicles: PuzzleVehicle[];
};

const tutorialVehicles: PuzzleVehicle[] = [
  { id: "red", x: 0, y: 2, length: 2, axis: "horizontal", target: true },
  { id: "blue", x: 2, y: 0, length: 2, axis: "vertical" },
  { id: "green", x: 4, y: 0, length: 3, axis: "vertical" },
  { id: "yellow", x: 0, y: 1, length: 2, axis: "horizontal" },
  { id: "purple", x: 3, y: 3, length: 2, axis: "vertical" },
  { id: "orange", x: 1, y: 5, length: 2, axis: "horizontal" }
];

const levelTwoVehicles: PuzzleVehicle[] = [
  { id: "red", x: 0, y: 2, length: 2, axis: "horizontal", target: true },
  { id: "blue", x: 2, y: 2, length: 2, axis: "vertical" },
  { id: "green", x: 0, y: 0, length: 2, axis: "horizontal" },
  { id: "yellow", x: 5, y: 0, length: 2, axis: "vertical" },
  { id: "purple", x: 3, y: 4, length: 2, axis: "horizontal" }
];

const levelThreeVehicles: PuzzleVehicle[] = [
  { id: "red", x: 0, y: 2, length: 2, axis: "horizontal", target: true },
  { id: "blue", x: 2, y: 2, length: 2, axis: "vertical" },
  { id: "green", x: 4, y: 2, length: 2, axis: "vertical" },
  { id: "yellow", x: 0, y: 0, length: 2, axis: "horizontal" },
  { id: "purple", x: 3, y: 4, length: 2, axis: "horizontal" },
  { id: "orange", x: 0, y: 5, length: 2, axis: "horizontal" }
];


const levelFourVehicles: PuzzleVehicle[] = [
  { id: "red", x: 0, y: 2, length: 2, axis: "horizontal", target: true },
  { id: "v0", x: 2, y: 4, length: 3, axis: "horizontal" },
  { id: "v1", x: 3, y: 1, length: 2, axis: "vertical" },
  { id: "v2", x: 1, y: 0, length: 2, axis: "vertical" },
  { id: "v3", x: 2, y: 3, length: 2, axis: "horizontal" },
  { id: "v4", x: 0, y: 4, length: 2, axis: "vertical" },
  { id: "v5", x: 5, y: 0, length: 2, axis: "vertical" },
  { id: "v6", x: 5, y: 4, length: 2, axis: "vertical" },
  { id: "v7", x: 4, y: 1, length: 2, axis: "vertical" }
];

const levelFiveVehicles: PuzzleVehicle[] = [
  { id: "red", x: 0, y: 2, length: 2, axis: "horizontal", target: true },
  { id: "v0", x: 4, y: 5, length: 2, axis: "horizontal" },
  { id: "v1", x: 1, y: 3, length: 3, axis: "vertical" },
  { id: "v2", x: 3, y: 3, length: 2, axis: "horizontal" },
  { id: "v3", x: 4, y: 1, length: 2, axis: "vertical" },
  { id: "v4", x: 5, y: 0, length: 3, axis: "vertical" },
  { id: "v5", x: 2, y: 1, length: 2, axis: "vertical" },
  { id: "v6", x: 4, y: 4, length: 2, axis: "horizontal" }
];

const levelSixVehicles: PuzzleVehicle[] = [
  { id: "red", x: 0, y: 2, length: 2, axis: "horizontal", target: true },
  { id: "v0", x: 0, y: 4, length: 3, axis: "horizontal" },
  { id: "v1", x: 4, y: 3, length: 2, axis: "horizontal" },
  { id: "v2", x: 3, y: 3, length: 3, axis: "vertical" },
  { id: "v3", x: 4, y: 0, length: 3, axis: "vertical" },
  { id: "v4", x: 2, y: 2, length: 2, axis: "vertical" }
];

export const LEVELS: LevelDefinition[] = [
  { id: 1, world: 1, title: "First Escape", difficulty: "Easy", gridSize: 6, vehicles: tutorialVehicles },
  { id: 2, world: 1, title: "One Block Away", difficulty: "Easy", gridSize: 6, vehicles: levelTwoVehicles },
  { id: 3, world: 1, title: "Double Trouble", difficulty: "Normal", gridSize: 6, vehicles: levelThreeVehicles },
  { id: 4, world: 1, title: "Cross Traffic", difficulty: "Normal", gridSize: 6, vehicles: levelFourVehicles },
  { id: 5, world: 1, title: "Lane Switch", difficulty: "Hard", gridSize: 6, vehicles: levelFiveVehicles },
  { id: 6, world: 1, title: "Gridlock", difficulty: "Hard", gridSize: 6, vehicles: levelSixVehicles }
];

export function getLevel(levelId: number): LevelDefinition | undefined {
  return LEVELS.find(level => level.id === levelId);
}

export function validateLevelCatalog(levels: LevelDefinition[] = LEVELS): string[] {
  const errors: string[] = [];
  const ids = new Set<number>();
  for (const level of levels) {
    if (!Number.isInteger(level.id) || level.id < 1 || ids.has(level.id)) errors.push(`Level ID ${level.id} is invalid or duplicated.`);
    ids.add(level.id);
    errors.push(...validatePuzzle(level.vehicles, level.gridSize).map(error => `Level ${level.id}: ${error}`));
    if (!solvePuzzle(level.vehicles, level.gridSize)) errors.push(`Level ${level.id}: no solution found.`);
  }
  return errors;
}
