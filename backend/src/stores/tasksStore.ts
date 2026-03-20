import { Task } from '../models';

const tasks = new Map<string, Task>();

export const tasksStore = {
  add(task: Task) {
    tasks.set(task.id, task);
  },
  update(task: Task) {
    tasks.set(task.id, task);
  },
  getById(id: string): Task | undefined {
    return tasks.get(id);
  },
  getAll(): Task[] {
    return Array.from(tasks.values());
  },
  getByJobId(jobId: string): Task[] {
    return Array.from(tasks.values()).filter((t) => t.jobId === jobId);
  }
};

export { tasks };

