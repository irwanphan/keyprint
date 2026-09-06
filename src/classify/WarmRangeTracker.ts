import * as vscode from 'vscode';
import { WARM_MS } from '../config/thresholds';

type WarmRange = {
  uri: string;
  startLine: number;
  endLine: number;
  expiresAt: number;
};

/** Tight line ranges from recent block inserts. Sliding 15-minute warmth. */
export class WarmRangeTracker {
  private ranges: WarmRange[] = [];

  markAccepted(uri: vscode.Uri, startLine: number, endLine: number, now = Date.now()): void {
    this.purge(now);
    this.ranges.push({
      uri: uri.toString(),
      startLine,
      endLine: Math.max(startLine, endLine),
      expiresAt: now + WARM_MS,
    });
  }

  isWarm(uri: vscode.Uri, startLine: number, endLine: number, now = Date.now()): boolean {
    this.purge(now);
    const id = uri.toString();
    return this.ranges.some(
      (r) =>
        r.uri === id &&
        r.expiresAt > now &&
        startLine <= r.endLine &&
        endLine >= r.startLine
    );
  }

  touch(uri: vscode.Uri, startLine: number, endLine: number, now = Date.now()): void {
    this.purge(now);
    const id = uri.toString();
    for (const r of this.ranges) {
      if (r.uri !== id || r.expiresAt <= now) {
        continue;
      }
      if (startLine <= r.endLine && endLine >= r.startLine) {
        r.expiresAt = now + WARM_MS;
        r.startLine = Math.min(r.startLine, startLine);
        r.endLine = Math.max(r.endLine, endLine);
      }
    }
  }

  private purge(now: number): void {
    this.ranges = this.ranges.filter((r) => r.expiresAt > now);
  }
}
