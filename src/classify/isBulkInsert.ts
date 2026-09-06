import { BULK_MIN_CHARS } from '../config/thresholds';

/**
 * Block insert vs keystroke.
 * Enter (`\n`) stays a keystroke. Multi-line paste / tab / agent is a block.
 */
export function isBulkInsert(text: string): boolean {
  if (text.length >= BULK_MIN_CHARS) {
    return true;
  }
  if (!text.includes('\n')) {
    return false;
  }
  return text.replace(/\r?\n/g, '').length > 0;
}
