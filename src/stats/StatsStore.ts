import * as vscode from 'vscode';
import { STORE_KEY } from '../config/thresholds';
import { localDateKey, pruneDays } from './derive';
import { DaysMap, StoredStats } from './types';

export class StatsStore {
  constructor(private readonly state: vscode.Memento) {}

  load(): DaysMap {
    const raw = this.state.get<StoredStats>(STORE_KEY);
    const days = raw?.days ?? {};
    return pruneDays(days, localDateKey());
  }

  async save(days: DaysMap): Promise<void> {
    const pruned = pruneDays(days, localDateKey());
    await this.state.update(STORE_KEY, { days: pruned } satisfies StoredStats);
  }

  async clear(): Promise<void> {
    await this.state.update(STORE_KEY, { days: {} } satisfies StoredStats);
  }
}
