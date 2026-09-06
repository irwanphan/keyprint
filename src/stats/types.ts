export type Bucket = 'typed' | 'edited';

export type DayCounts = {
  typed: number;
  edited: number;
};

export type DaysMap = Record<string, DayCounts>;

export type StoredStats = {
  days: DaysMap;
};

export type StatsSnapshot = {
  today: DayCounts;
  week: DayCounts;
  streak: number;
  todayKey: string;
};
