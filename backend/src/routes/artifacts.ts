import { Router } from 'express';
import { artifactsStore } from '../stores/artifactsStore';

export const artifactRouter = Router();

artifactRouter.get('/', (_req, res) => {
  res.json({ artifacts: artifactsStore.getAll() });
});

artifactRouter.get('/:id', (req, res) => {
  const artifact = artifactsStore.getById(req.params.id);
  if (!artifact) {
    return res.status(404).json({ error: 'Artifact not found' });
  }
  res.json({ artifact });
});

