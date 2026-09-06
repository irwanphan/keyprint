import * as vscode from 'vscode';
import { compactCount, handsLine, hasHandPrint } from '../stats/derive';
import { StatsSnapshot } from '../stats/types';

export class StatusBarController implements vscode.Disposable {
  private readonly item: vscode.StatusBarItem;

  constructor() {
    this.item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 90);
    this.item.show();
  }

  render(snapshot: StatsSnapshot, enabled: boolean): void {
    if (!enabled) {
      this.item.text = 'KeyPrint  off';
      this.item.tooltip = 'KeyPrint is off — click to turn on';
      this.item.command = 'keyprint.toggle';
      return;
    }

    this.item.command = 'keyprint.showCredits';
    const today = snapshot.today;
    if (!hasHandPrint(today)) {
      this.item.text = 'KeyPrint  —';
      this.item.tooltip = 'No hand print yet today — click for credits';
      return;
    }

    this.item.text =
      today.edited === 0
        ? `KeyPrint  ${compactCount(today.typed)}`
        : `KeyPrint  ${compactCount(today.typed)} · ${compactCount(today.edited)}`;

    this.item.tooltip = [
      `Today  ${handsLine(today)}`,
      `This week  ${handsLine(snapshot.week)}`,
      snapshot.streak > 0
        ? `${snapshot.streak} day${snapshot.streak === 1 ? '' : 's'} with a hand or edit`
        : 'No hand or edit streak',
      'Click for credits · Command Palette: Toggle On/Off',
    ].join('\n');
  }

  dispose(): void {
    this.item.dispose();
  }
}
