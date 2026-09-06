import { emptyCounts, handStreak, localDateKey, weekCounts } from './derive';
import { StatsStore } from './StatsStore';
import { Bucket, DayCounts, DaysMap, StatsSnapshot } from './types';

export class StatsService {
  private days: DaysMap;

  constructor(private readonly store: StatsStore) {
    this.days = store.load();
  }

  snapshot(): StatsSnapshot {
    const todayKey = localDateKey();
    const today = this.days[todayKey] ?? emptyCounts();
    const week = weekCounts(this.days, todayKey);
    return {
      today,
      week,
      streak: handStreak(this.days, todayKey),
      todayKey,
    };
  }

  async add(bucket: Bucket, amount: number): Promise<void> {
    if (amount <= 0) {
      return;
    }
    this.mutate(bucket, amount);
    await this.store.save(this.days);
  }

  async subtract(bucket: Bucket, amount: number): Promise<void> {
    if (amount <= 0) {
      return;
    }
    this.mutate(bucket, -amount);
    await this.store.save(this.days);
  }

  async reset(): Promise<void> {
    this.days = {};
    await this.store.clear();
  }

  private mutate(bucket: Bucket, delta: number): void {
    const key = localDateKey();
    const current = this.days[key] ?? emptyCounts();
    const next: DayCounts = {
      ...current,
      [bucket]: Math.max(0, current[bucket] + delta),
    };
    this.days = { ...this.days, [key]: next };
  }
}
