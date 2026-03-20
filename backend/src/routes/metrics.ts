import { Router } from 'express';
import { metricsStore } from '../observability/metricsStore';

export const metricsRouter = Router();

metricsRouter.get('/', (_req, res) => {
  res.json({ metrics: metricsStore.snapshot() });
});

