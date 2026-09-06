import * as vscode from 'vscode';
import { isBulkInsert } from '../classify/isBulkInsert';
import { WarmRangeTracker } from '../classify/WarmRangeTracker';
import { MAX_CHANGES_PER_EVENT } from '../config/thresholds';
import { StatsService } from '../stats/StatsService';
import { CountDelta, UndoLedger } from './UndoLedger';

const COUNTED_SCHEMES = new Set(['file', 'untitled']);

export class ChangeRouter {
  constructor(
    private readonly stats: StatsService,
    private readonly warmth: WarmRangeTracker,
    private readonly ledger: UndoLedger,
    private readonly isEnabled: () => boolean,
    private readonly onChange: () => void
  ) {}

  attach(): vscode.Disposable {
    return vscode.workspace.onDidChangeTextDocument((event) => {
      void this.handle(event);
    });
  }

  private async handle(event: vscode.TextDocumentChangeEvent): Promise<void> {
    if (!this.isEnabled()) {
      return;
    }
    if (!COUNTED_SCHEMES.has(event.document.uri.scheme)) {
      return;
    }
    if (event.reason === vscode.TextDocumentChangeReason.Undo) {
      await this.applyLedger(this.ledger.undo(), 'subtract');
      return;
    }
    if (event.reason === vscode.TextDocumentChangeReason.Redo) {
      await this.applyLedger(this.ledger.redo(), 'add');
      return;
    }
    if (event.contentChanges.length === 0 || event.contentChanges.length > MAX_CHANGES_PER_EVENT) {
      return;
    }

    for (const change of event.contentChanges) {
      const delta = this.classify(event.document.uri, change);
      if (!delta) {
        continue;
      }
      this.ledger.push(delta);
      await this.stats.add(delta.bucket, delta.amount);
    }
    this.onChange();
  }

  private classify(
    uri: vscode.Uri,
    change: vscode.TextDocumentContentChangeEvent
  ): CountDelta | undefined {
    const startLine = change.range.start.line;
    const insertedLines = (change.text.match(/\n/g) ?? []).length;
    const insertEndLine = startLine + insertedLines;
    const rangeEndLine = Math.max(change.range.end.line, insertEndLine);

    if (isBulkInsert(change.text)) {
      this.warmth.markAccepted(uri, startLine, insertEndLine);
      return undefined;
    }

    const amount = change.text.length + change.rangeLength;
    if (amount <= 0) {
      return undefined;
    }

    const warm = this.warmth.isWarm(uri, startLine, rangeEndLine);
    if (warm) {
      this.warmth.touch(uri, startLine, rangeEndLine);
    }
    return { bucket: warm ? 'edited' : 'typed', amount };
  }

  private async applyLedger(
    delta: CountDelta | undefined,
    op: 'add' | 'subtract'
  ): Promise<void> {
    if (!delta) {
      return;
    }
    if (op === 'add') {
      await this.stats.add(delta.bucket, delta.amount);
    } else {
      await this.stats.subtract(delta.bucket, delta.amount);
    }
    this.onChange();
  }
}
