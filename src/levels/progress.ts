const STORAGE_KEY = "traffic-escape-3d-progress-v1";

export type GameProgress = {
  highestUnlockedLevel: number;
  completedLevels: number[];
};

const DEFAULT_PROGRESS: GameProgress = { highestUnlockedLevel: 1, completedLevels: [] };

export function loadProgress(): GameProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROGRESS, completedLevels: [] };
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return { ...DEFAULT_PROGRESS, completedLevels: [] };
    const value = parsed as Partial<GameProgress>;
    const completedLevels = Array.isArray(value.completedLevels)
      ? [...new Set(value.completedLevels.filter((id): id is number => Number.isInteger(id) && id > 0))]
      : [];
    const highest = Number.isInteger(value.highestUnlockedLevel) && (value.highestUnlockedLevel ?? 0) > 0
      ? value.highestUnlockedLevel!
      : 1;
    return { highestUnlockedLevel: Math.max(1, highest, ...completedLevels.map(id => id + 1)), completedLevels };
  } catch {
    return { ...DEFAULT_PROGRESS, completedLevels: [] };
  }
}

export function completeLevel(progress: GameProgress, levelId: number): GameProgress {
  const completedLevels = [...new Set([...progress.completedLevels, levelId])].sort((a, b) => a - b);
  return { highestUnlockedLevel: Math.max(progress.highestUnlockedLevel, levelId + 1), completedLevels };
}

export function saveProgress(progress: GameProgress): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch { /* Private mode/storage quota: keep the current session playable. */ }
}
