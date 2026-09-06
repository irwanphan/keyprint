/** A single change is a block insert (tab, agent, paste, snippet). */
export const BULK_MIN_CHARS = 40;

/** Ignore format-on-save / organize-imports style fan-out. */
export const MAX_CHANGES_PER_EVENT = 20;

/** Warm print: sliding window, tight range only. */
export const WARM_MS = 15 * 60 * 1000;

/** Keep today plus this many completed local days. */
export const RETENTION_DAYS = 7;

export const STORE_KEY = 'keyprint.days';

export const ENABLED_KEY = 'keyprint.enabled';
