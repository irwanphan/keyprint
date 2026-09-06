import { RETENTION_DAYS } from '../config/thresholds';
import { DayCounts, DaysMap } from './types';

export const emptyCounts = (): DayCounts => ({
  typed: 0,
  edited: 0,
});

export function addCounts(a: DayCounts, b: DayCounts): DayCounts {
  return {
    typed: a.typed + b.typed,
    edited: a.edited + b.edited,
  };
}

export function localDateKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function shiftDateKey(key: string, days: number): string {
  const [y, m, d] = key.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return localDateKey(dt);
}

export function lastDateKeys(todayKey: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => shiftDateKey(todayKey, -i));
}

export function normalizeDay(raw: Partial<DayCounts> | undefined): DayCounts {
  return {
    typed: Math.max(0, raw?.typed ?? 0),
    edited: Math.max(0, raw?.edited ?? 0),
  };
}

export function pruneDays(days: DaysMap, todayKey: string): DaysMap {
  const keep = new Set(lastDateKeys(todayKey, RETENTION_DAYS));
  const next: DaysMap = {};
  for (const key of keep) {
    if (days[key]) {
      next[key] = normalizeDay(days[key]);
    }
  }
  return next;
}

export function weekCounts(days: DaysMap, todayKey: string): DayCounts {
  return lastDateKeys(todayKey, RETENTION_DAYS).reduce(
    (sum, key) => addCounts(sum, days[key] ?? emptyCounts()),
    emptyCounts()
  );
}

export function compactCount(n: number): string {
  if (n < 1000) {
    return String(n);
  }
  if (n < 10_000) {
    return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  }
  return `${Math.round(n / 1000)}k`;
}

export function handsLine(counts: DayCounts): string {
  if (counts.edited === 0) {
    return `typed ${compactCount(counts.typed)}`;
  }
  return `typed ${compactCount(counts.typed)} · edited ${compactCount(counts.edited)}`;
}

/** Consecutive local days with a hand or edit. Today without signal does not break the run. */
export function handStreak(days: DaysMap, todayKey: string): number {
  const keys = lastDateKeys(todayKey, RETENTION_DAYS);
  const today = days[todayKey];
  const start = !today || today.typed + today.edited === 0 ? 1 : 0;
  let n = 0;
  for (let i = start; i < keys.length; i++) {
    const bucket = days[keys[i]];
    if (bucket && bucket.typed + bucket.edited > 0) {
      n += 1;
    } else {
      break;
    }
  }
  return n;
}

export function hasHandPrint(counts: DayCounts): boolean {
  return counts.typed + counts.edited > 0;
}
