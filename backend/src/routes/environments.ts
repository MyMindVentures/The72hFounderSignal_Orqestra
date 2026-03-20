import { Router } from 'express';
import { seedDefaultEnvironments, environmentsStore } from '../stores/environmentsStore';

export const environmentRouter = Router();

seedDefaultEnvironments();

environmentRouter.get('/', (_req, res) => {
  res.json({ environments: environmentsStore.getAll() });
});

environmentRouter.get('/:id', (req, res) => {
  const env = environmentsStore.getById(req.params.id);
  if (!env) {
    return res.status(404).json({ error: 'Environment not found' });
  }
  res.json({ environment: env });
});

