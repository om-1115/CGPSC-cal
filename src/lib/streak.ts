import type { DaysStore } from '../types';
import { dKey, addDays } from './dates';

export function computeStreak(days: DaysStore, today: Date): number {
  let n = 0;
  let cur = new Date(today);
  while (true) {
    const k = dKey(cur);
    const d = days[k];
    const any = d?.checked && Object.values(d.checked).some(Boolean);
    if (any) { n += 1; cur = addDays(cur, -1); } else break;
    if (n > 9999) break;
  }
  return n;
}
