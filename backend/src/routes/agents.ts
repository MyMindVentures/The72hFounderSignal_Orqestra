import { Router } from 'express';
import { agentsStore } from '../stores/agentsStore';

export const agentRouter = Router();

agentRouter.get('/', (_req, res) => {
  res.json({ agents: agentsStore.getAll() });
});

agentRouter.get('/:id', (req, res) => {
  const agent = agentsStore.getById(req.params.id);
  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }
  res.json({ agent });
});

