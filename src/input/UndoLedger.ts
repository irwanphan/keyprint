import { Bucket } from '../stats/types';

export type CountDelta = {
  bucket: Bucket;
  amount: number;
};

/** Last classified increments so Undo/Redo can reverse the mirror. */
export class UndoLedger {
  private applied: CountDelta[] = [];
  private undone: CountDelta[] = [];

  push(delta: CountDelta): void {
    this.applied.push(delta);
    this.undone = [];
    if (this.applied.length > 200) {
      this.applied.shift();
    }
  }

  undo(): CountDelta | undefined {
    const delta = this.applied.pop();
    if (delta) {
      this.undone.push(delta);
    }
    return delta;
  }

  redo(): CountDelta | undefined {
    const delta = this.undone.pop();
    if (delta) {
      this.applied.push(delta);
    }
    return delta;
  }
}
