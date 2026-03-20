import { Router } from 'express';
import { runsStore } from '../stores/runsStore';

export const runRouter = Router();

runRouter.get('/', (_req, res) => {
  res.json({ runs: runsStore.getAll() });
});

runRouter.get('/:id', (req, res) => {
  const run = runsStore.getById(req.params.id);
  if (!run) {
    return res.status(404).json({ error: 'Run not found' });
  }
  res.json({ run });
});

