import * as vscode from 'vscode';
import { EnabledStore } from './config/EnabledStore';
import { WarmRangeTracker } from './classify/WarmRangeTracker';
import { ChangeRouter } from './input/ChangeRouter';
import { UndoLedger } from './input/UndoLedger';
import { StatsService } from './stats/StatsService';
import { StatsStore } from './stats/StatsStore';
import { confirmReset, showCredits } from './ui/CreditsPanel';
import { StatusBarController } from './ui/StatusBarController';

export function activate(context: vscode.ExtensionContext): void {
  const enabledStore = new EnabledStore(context.globalState);
  const store = new StatsStore(context.globalState);
  const stats = new StatsService(store);
  const warmth = new WarmRangeTracker();
  const ledger = new UndoLedger();
  const statusBar = new StatusBarController();

  const refresh = (): void => {
    statusBar.render(stats.snapshot(), enabledStore.isEnabled());
  };
  refresh();

  const router = new ChangeRouter(stats, warmth, ledger, () => enabledStore.isEnabled(), refresh);

  context.subscriptions.push(
    statusBar,
    router.attach(),
    vscode.commands.registerCommand('keyprint.showCredits', () => {
      void showCredits(stats.snapshot());
    }),
    vscode.commands.registerCommand('keyprint.toggle', async () => {
      const next = !enabledStore.isEnabled();
      await enabledStore.setEnabled(next);
      refresh();
      vscode.window.setStatusBarMessage(next ? 'KeyPrint: on' : 'KeyPrint: off', 2000);
    }),
    vscode.commands.registerCommand('keyprint.resetStats', async () => {
      if (!(await confirmReset())) {
        return;
      }
      await stats.reset();
      refresh();
    })
  );
}

export function deactivate(): void {}
