import { Router } from 'express';
import { blueprintRouter } from './routes/blueprints';
import { projectRouter } from './routes/projects';
import { jobRouter } from './routes/jobs';
import { taskRouter } from './routes/tasks';
import { agentRouter } from './routes/agents';
import { artifactRouter } from './routes/artifacts';
import { runRouter } from './routes/runs';
import { environmentRouter } from './routes/environments';
import { auditRouter } from './routes/audit';
import { streamRouter } from './routes/stream';
import { metricsRouter } from './routes/metrics';
import { adminRouter } from './routes/admin';
import { healthRouter } from './routes/health';

export const router = Router();

router.use('/health', healthRouter);
router.use('/projects', projectRouter);
router.use('/blueprints', blueprintRouter);
router.use('/jobs', jobRouter);
router.use('/tasks', taskRouter);
router.use('/agents', agentRouter);
router.use('/artifacts', artifactRouter);
router.use('/runs', runRouter);
router.use('/environments', environmentRouter);
router.use('/audit-events', auditRouter);
router.use('/stream', streamRouter);
router.use('/metrics', metricsRouter);
router.use('/admin', adminRouter);

// Used by Vitest to verify the global error handler (no silent failures).
if (process.env.NODE_ENV === 'test') {
  router.get('/__error_test', () => {
    throw new Error('boom');
  });
}

