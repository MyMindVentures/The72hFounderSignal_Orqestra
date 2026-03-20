import { Job } from '../models';

const jobs = new Map<string, Job>();

export const jobsStore = {
  add(job: Job) {
    jobs.set(job.id, job);
  },
  update(job: Job) {
    jobs.set(job.id, job);
  },
  getAll(): Job[] {
    return Array.from(jobs.values());
  },
  getById(id: string): Job | undefined {
    return jobs.get(id);
  },
  getByBlueprintId(blueprintId: string): Job[] {
    return Array.from(jobs.values()).filter((j) => j.blueprintId === blueprintId);
  }
};

export { jobs };

