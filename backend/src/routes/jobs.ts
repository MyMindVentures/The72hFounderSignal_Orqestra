import { Router } from 'express';
import { Job } from '../models';

// In a real implementation, these would be backed by the database.
import { jobsStore } from '../stores/jobsStore';
import { tasksStore } from '../stores/tasksStore';
import { artifactsStore } from '../stores/artifactsStore';

export const jobRouter = Router();

jobRouter.get('/', (_req, res) => {
  res.json({ jobs: jobsStore.getAll() });
});

jobRouter.get('/:id', (req, res) => {
  const job = jobsStore.getById(req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  res.json({ job });
});

jobRouter.get('/:id/tasks', (req, res) => {
  const job = jobsStore.getById(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  return res.json({ tasks: tasksStore.getByJobId(req.params.id) });
});

jobRouter.get('/:id/artifacts', (req, res) => {
  const job = jobsStore.getById(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  return res.json({ artifacts: artifactsStore.getByJobId(req.params.id) });
});

