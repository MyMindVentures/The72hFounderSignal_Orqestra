import { ExecutionRun } from '../models';

const runs = new Map<string, ExecutionRun>();

export const runsStore = {
  add(run: ExecutionRun) {
    runs.set(run.id, run);
  },
  update(run: ExecutionRun) {
    runs.set(run.id, run);
  },
  getById(id: string): ExecutionRun | undefined {
    return runs.get(id);
  },
  getAll(): ExecutionRun[] {
    return Array.from(runs.values());
  }
};

export { runs };

