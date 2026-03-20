import { Artifact } from '../models';

const artifacts = new Map<string, Artifact>();

export const artifactsStore = {
  add(artifact: Artifact) {
    artifacts.set(artifact.id, artifact);
  },
  update(artifact: Artifact) {
    artifacts.set(artifact.id, artifact);
  },
  getById(id: string): Artifact | undefined {
    return artifacts.get(id);
  },
  getAll(): Artifact[] {
    return Array.from(artifacts.values());
  },
  getByJobId(jobId: string): Artifact[] {
    return Array.from(artifacts.values()).filter((a) => a.jobId === jobId);
  },
  getByTaskId(taskId: string): Artifact[] {
    return Array.from(artifacts.values()).filter((a) => a.taskId === taskId);
  }
};

export { artifacts };

