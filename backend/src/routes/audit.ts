import { Router } from 'express';
import { auditStore } from '../stores/auditStore';

export const auditRouter = Router();

auditRouter.get('/', (_req, res) => {
  res.json({ auditEvents: auditStore.getAll() });
});

auditRouter.get('/:id', (req, res) => {
  const event = auditStore.getById(req.params.id);
  if (!event) {
    return res.status(404).json({ error: 'Audit event not found' });
  }
  res.json({ auditEvent: event });
});

