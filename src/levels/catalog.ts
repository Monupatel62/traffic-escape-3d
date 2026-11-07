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


const extraLevelTitles = [
  "Morning Detour", "Two Lane Trouble", "Bus Stop Block", "Side Street Jam",
  "Rush Hour Start", "Narrow Passage", "City Crossing", "Traffic Stack",
  "Market Street", "Double Queue", "Road Works", "Central Junction",
  "Evening Bottleneck", "Last City Exit"
];

const extraLevels: LevelDefinition[] = extraLevelTitles.map((title, index) => {
  const id = index + 7;
  const blockerCount = 1 + (index % 3);
  const firstColumn = index % 2 === 0 ? 2 : 3;
  const blockerRow = 1;
  const blockers: PuzzleVehicle[] = Array.from({ length: blockerCount }, (_, blockerIndex) => ({
    id: `v${blockerIndex}`,
    x: firstColumn + blockerIndex,
    y: blockerRow,
    length: 2,
    axis: "vertical"
  }));
  return {
    id,
    world: 1,
    title,
    difficulty: blockerCount === 1 ? "Easy" : blockerCount === 2 ? "Normal" : "Hard",
    gridSize: 6,
    vehicles: [
      { id: "red", x: 0, y: 2, length: 2, axis: "horizontal", target: true },
      ...blockers,
      { id: "v7", x: Math.floor(index / 3) % 3 * 2, y: 5, length: 2, axis: "horizontal" }
    ]
  };
});



const busyRoadTitles = [
  "Four Way Stop",
  "Double Merge",
  "Depot Crossing",
  "Lane Pressure",
  "Bus Lane Jam",
  "Signal Shuffle",
  "Bridge Approach",
  "Side Road Snarl",
  "Metro Traffic",
  "Corner Bottleneck",
  "Market Junction",
  "Tunnel Queue",
  "Crosswalk Rush",
  "Overpass Hold",
  "Ring Road",
  "City Centre",
  "Peak Hour",
  "Last Junction",
  "Heavy Traffic",
  "Busy Roads Finale"
];

// World 2 uses denser target-lane blockers and extra parked traffic to raise the puzzle load.
const busyRoadLevels: LevelDefinition[] = busyRoadTitles.map((title, index) => {
  const id = index + 21;
  const blockerCount = 2 + (index % 2);
  const firstColumn = 2 + (index % (5 - blockerCount));
  const blockerRow = index % 4 < 2 ? 1 : 2;
  const blockerLength = Math.floor(index / 4) % 2 === 0 ? 2 : 3;
  const blockers: PuzzleVehicle[] = Array.from({ length: blockerCount }, (_, blockerIndex) => ({
    id: `v${blockerIndex}`,
    x: firstColumn + blockerIndex,
    y: blockerRow,
    length: blockerLength,
    axis: "vertical"
  }));
  const topCarX = (index % 3) * 2;
  const bottomCarX = (Math.floor(index / 2) % 3) * 2;
  return {
    id,
    world: 2,
    title,
    difficulty: index % 5 === 4 ? "Hard" : index % 3 === 0 ? "Normal" : "Hard",
    gridSize: 6,
    vehicles: [
      { id: "red", x: 0, y: 2, length: 2, axis: "horizontal", target: true },
      ...blockers,
      { id: "v7", x: topCarX, y: 0, length: 2, axis: "horizontal" },
      { id: "v8", x: bottomCarX, y: 5, length: 2, axis: "horizontal" }
    ]
  };
});


const highwayRushTitles = [
  "Expressway Entry",
  "Three Lane Merge",
  "Ramp Rush",
  "Fast Lane Block",
  "Toll Booth Jam",
  "Highway Weave",
  "Overtake Queue",
  "Climbing Ramp",
  "Service Road",
  "Speedway Snarl",
  "Exit 12",
  "Flyover Flow",
  "Truck Convoy",
  "Lane Closure",
  "Night Drive",
  "Interchange",
  "Long Haul",
  "Last Exit",
  "Highway Knot",
  "Rush Hour Escape"
];

// World 3 adds up to four movable blockers across the target lane.
const highwayRushLevels: LevelDefinition[] = highwayRushTitles.map((title, index) => {
  const id = index + 41;
  const blockerCount = 1 + (index % 4);
  const firstColumn = (index * 3 + Math.floor(index / 4)) % 4;
  const blockerGroup = Math.floor(index / 4);
  const blockerRow = [0, 1, 2, 0, 1][blockerGroup];
  const blockerLength = blockerRow === 0 ? 3 : Math.floor(index / 8) % 2 === 0 ? 3 : 2;
  const blockers: PuzzleVehicle[] = Array.from({ length: blockerCount }, (_, blockerIndex) => ({
    id: `v${blockerIndex}`,
    x: 2 + ((firstColumn + blockerIndex) % 4),
    y: blockerRow,
    length: blockerLength,
    axis: "vertical"
  }));
  return {
    id,
    world: 3,
    title,
    difficulty: blockerCount <= 2 ? "Normal" : "Hard",
    gridSize: 6,
    vehicles: [
      { id: "red", x: 0, y: 2, length: 2, axis: "horizontal", target: true },
      ...blockers
    ]
  };
});


const downtownTitles = [
  "Downtown Arrival",
  "One Way Avenue",
  "Parking Tower",
  "Cross Street",
  "Office District",
  "Taxi Stand",
  "Central Plaza",
  "Underpass",
  "Mall Entrance",
  "City Loop",
  "Late Commute",
  "Four Corners",
  "Station Road",
  "Narrow Boulevard",
  "Civic Centre",
  "Parking Exit",
  "Business Quarter",
  "Last Intersection",
  "Downtown Rush",
  "Midnight Gridlock"
];

// World 4 varies blocker lanes, starting columns, and vehicle lengths.
const downtownLevels: LevelDefinition[] = downtownTitles.map((title, index) => {
  const id = index + 61;
  const blockerCount = 1 + (index % 4);
  const group = Math.floor(index / 4);
  const firstColumn = (index * 3 + group) % 4;
  const blockerRow = [0, 1, 2, 1, 2][group];
  const blockerLength = blockerRow === 0 ? 3 : group % 2 === 0 ? 2 : 3;
  const blockers: PuzzleVehicle[] = Array.from({ length: blockerCount }, (_, blockerIndex) => ({
    id: `v${blockerIndex}`,
    x: 2 + ((firstColumn + blockerIndex) % 4),
    y: blockerRow,
    length: blockerLength,
    axis: "vertical"
  }));
  return {
    id,
    world: 4,
    title,
    difficulty: blockerCount <= 2 ? "Normal" : "Hard",
    gridSize: 6,
    vehicles: [
      { id: "red", x: 0, y: 2, length: 2, axis: "horizontal", target: true },
      ...blockers
    ]
  };
});


const ultimateTrafficTitles = [
  "Final Approach",
  "Six Lane Standstill",
  "Airport Boulevard",
  "Crossfire Junction",
  "Heavy Haul",
  "Last Light",
  "Mega Interchange",
  "Citywide Lockup",
  "Convoy Crossing",
  "Exit Strategy",
  "Nightmare Merge",
  "Terminal Traffic",
  "Double Decker",
  "Rush Hour Run",
  "The Long Detour",
  "Last Chance Lane",
  "Ultimate Grid",
  "Grand Central Jam",
  "Final Countdown",
  "Ultimate Traffic"
];

// World 5 uses four blocker counts across five lane/length patterns.
const ultimateTrafficLevels: LevelDefinition[] = ultimateTrafficTitles.map((title, index) => {
  const id = index + 81;
  const blockerCount = 1 + (index % 4);
  const group = Math.floor(index / 4);
  const firstColumn = (index * 3 + group * 2) % 4;
  const blockerRow = [0, 1, 2, 1, 1][group];
  const blockerLength = blockerRow === 0 ? 3 : group % 2 === 0 ? 2 : 3;
  const blockers: PuzzleVehicle[] = Array.from({ length: blockerCount }, (_, blockerIndex) => ({
    id: `v${blockerIndex}`,
    x: 2 + ((firstColumn + blockerIndex) % 4),
    y: blockerRow,
    length: blockerLength,
    axis: "vertical"
  }));
  return {
    id,
    world: 5,
    title,
    difficulty: blockerCount === 1 ? "Normal" : "Hard",
    gridSize: 6,
    vehicles: [
      { id: "red", x: 0, y: 2, length: 2, axis: "horizontal", target: true },
      ...blockers
    ]
  };
});

export const LEVELS: LevelDefinition[] = [
  { id: 1, world: 1, title: "First Escape", difficulty: "Easy", gridSize: 6, vehicles: tutorialVehicles },
  { id: 2, world: 1, title: "One Block Away", difficulty: "Easy", gridSize: 6, vehicles: levelTwoVehicles },
  { id: 3, world: 1, title: "Double Trouble", difficulty: "Normal", gridSize: 6, vehicles: levelThreeVehicles },
  { id: 4, world: 1, title: "Cross Traffic", difficulty: "Normal", gridSize: 6, vehicles: levelFourVehicles },
  { id: 5, world: 1, title: "Lane Switch", difficulty: "Hard", gridSize: 6, vehicles: levelFiveVehicles },
  { id: 6, world: 1, title: "Gridlock", difficulty: "Hard", gridSize: 6, vehicles: levelSixVehicles },
  ...extraLevels,
  ...busyRoadLevels,
  ...highwayRushLevels,
  ...downtownLevels,
  ...ultimateTrafficLevels
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
