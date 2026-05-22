import type { DayState, DayStats } from '../types';

export function dayStatsFromState(state: DayState | undefined, totalSubjects: number): DayStats {
  const checked = state?.checked ?? {};
  const done = Object.values(checked).filter(Boolean).length;
  const ratio = totalSubjects ? done / totalSubjects : 0;
  const noteCount = Object.values(state?.notes ?? {})
    .filter((n) => n?.did?.trim() || n?.plan?.trim()).length;
  return { done, total: totalSubjects, ratio, noteCount };
}
