import * as vscode from 'vscode';
import { handsLine } from '../stats/derive';
import { StatsSnapshot } from '../stats/types';

export async function showCredits(snapshot: StatsSnapshot): Promise<void> {
  const streak =
    snapshot.streak > 0
      ? `${snapshot.streak} day${snapshot.streak === 1 ? '' : 's'} with a hand or edit`
      : 'No hand or edit days in a row';

  const message = [
    `Today  ${handsLine(snapshot.today)}`,
    `This week  ${handsLine(snapshot.week)}`,
    streak,
  ].join('\n');

  await vscode.window.showInformationMessage(message, { modal: false });
}

export async function confirmReset(): Promise<boolean> {
  const choice = await vscode.window.showWarningMessage(
    'Reset KeyPrint local stats on this machine?',
    { modal: true },
    'Reset'
  );
  return choice === 'Reset';
}
