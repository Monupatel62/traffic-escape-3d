const STORAGE_KEY = "traffic-escape-3d-progress-v1";
const MAX_LEVEL_ID = 100;

export type GameProgress = {
  highestUnlockedLevel: number;
  completedLevels: number[];
};

const DEFAULT_PROGRESS: GameProgress = { highestUnlockedLevel: 1, completedLevels: [] };

function normalizeProgress(value: unknown): GameProgress {
  if (!value || typeof value !== "object") {
    return { ...DEFAULT_PROGRESS, completedLevels: [] };
  }

  const candidate = value as Partial<GameProgress>;
  const completedLevels = Array.isArray(candidate.completedLevels)
    ? [...new Set(candidate.completedLevels.filter(
      (id): id is number => Number.isInteger(id) && id >= 1 && id <= MAX_LEVEL_ID
    ))].sort((a, b) => a - b)
    : [];
  const requestedHighest = Number.isInteger(candidate.highestUnlockedLevel)
    ? candidate.highestUnlockedLevel!
    : 1;
  const highestUnlockedLevel = Math.min(
    MAX_LEVEL_ID,
    Math.max(1, requestedHighest, ...completedLevels.map(id => Math.min(MAX_LEVEL_ID, id + 1)))
  );

  return { highestUnlockedLevel, completedLevels };
}

export function loadProgress(): GameProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROGRESS, completedLevels: [] };
    return normalizeProgress(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_PROGRESS, completedLevels: [] };
  }
}

export function completeLevel(progress: GameProgress, levelId: number, nextAvailableLevelId?: number): GameProgress {
  const current = normalizeProgress(progress);
  if (!Number.isInteger(levelId) || levelId < 1 || levelId > MAX_LEVEL_ID) return current;

  const completedLevels = [...new Set([...current.completedLevels, levelId])].sort((a, b) => a - b);
  const requestedNext = nextAvailableLevelId ?? levelId + 1;
  const unlocked = Number.isInteger(requestedNext) && requestedNext > levelId && requestedNext <= MAX_LEVEL_ID
    ? requestedNext
    : Math.min(MAX_LEVEL_ID, levelId + 1);

  return {
    highestUnlockedLevel: Math.max(current.highestUnlockedLevel, unlocked),
    completedLevels
  };
}

export function saveProgress(progress: GameProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeProgress(progress)));
  } catch {
    // Private mode/storage quota: keep the current session playable.
  }
}
