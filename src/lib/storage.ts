export const LS_KEYS = {
  days: 'cgpsc.days.v1',
  resources: 'cgpsc.resources.v1',
  firstDate: 'cgpsc.firstDate.v1',
  subjects: 'cgpsc.subjects.v1',
} as const;

export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function saveJSON<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}
