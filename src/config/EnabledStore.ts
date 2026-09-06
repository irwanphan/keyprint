import * as vscode from 'vscode';
import { ENABLED_KEY } from './thresholds';

export class EnabledStore {
  constructor(private readonly state: vscode.Memento) {}

  isEnabled(): boolean {
    return this.state.get<boolean>(ENABLED_KEY, true);
  }

  async setEnabled(value: boolean): Promise<void> {
    await this.state.update(ENABLED_KEY, value);
  }
}
