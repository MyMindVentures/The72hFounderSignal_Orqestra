import { Request, Response, Router } from 'express';
import { blueprintsStore } from '../stores/blueprintsStore';
import { jobsStore } from '../stores/jobsStore';
import { runsStore } from '../stores/runsStore';
import { schedulePersistAll } from '../persistence/jsonPersistence';
import { broadcastSseEvent } from '../realtime/sseHub';
import { environmentsStore } from '../stores/environmentsStore';
import { v4 as uuidv4 } from 'uuid';

export const adminRouter = Router();

function getRole(req: { header: (name: string) => string | undefined }) {
  return req.header('x-role') ?? 'viewer';
}

function requireAdmin(req: Request, res: Response) {
  const role = getRole(req);
  if (role !== 'admin') {
    res.status(403).json({ error: 'Forbidden: admin role required' });
    return false;
  }
  return true;
}

adminRouter.post('/blueprints/:blueprintId/pause', (req, res) => {
  if (!requireAdmin(req, res)) return;

  const blueprint = blueprintsStore.getById(req.params.blueprintId);
  if (!blueprint) return res.status(404).json({ error: 'Blueprint not found' });

  const jobs = jobsStore.getByBlueprintId(blueprint.id);
  const runId = jobs.find((j) => j.executionRunId)?.executionRunId;
  if (!runId) return res.status(404).json({ error: 'Run not found' });

  const run = runsStore.getById(runId);
  if (!run) return res.status(404).json({ error: 'Run not found' });

  runsStore.update({ ...run, status: 'paused', updatedAt: new Date().toISOString() });
  broadcastSseEvent({ event: 'run.updated', data: { runId, status: 'paused' } });
  schedulePersistAll();

  return res.json({ ok: true });
});

adminRouter.post('/blueprints/:blueprintId/resume', (req, res) => {
  if (!requireAdmin(req, res)) return;

  const blueprint = blueprintsStore.getById(req.params.blueprintId);
  if (!blueprint) return res.status(404).json({ error: 'Blueprint not found' });

  const jobs = jobsStore.getByBlueprintId(blueprint.id);
  const runId = jobs.find((j) => j.executionRunId)?.executionRunId;
  if (!runId) return res.status(404).json({ error: 'Run not found' });

  const run = runsStore.getById(runId);
  if (!run) return res.status(404).json({ error: 'Run not found' });

  runsStore.update({ ...run, status: 'running', updatedAt: new Date().toISOString() });
  broadcastSseEvent({ event: 'run.updated', data: { runId, status: 'running' } });
  schedulePersistAll();

  return res.json({ ok: true });
});

adminRouter.post('/blueprints/:blueprintId/cancel', (req, res) => {
  if (!requireAdmin(req, res)) return;

  const blueprint = blueprintsStore.getById(req.params.blueprintId);
  if (!blueprint) return res.status(404).json({ error: 'Blueprint not found' });

  const jobs = jobsStore.getByBlueprintId(blueprint.id);
  const runId = jobs.find((j) => j.executionRunId)?.executionRunId;
  if (!runId) return res.status(404).json({ error: 'Run not found' });

  const run = runsStore.getById(runId);
  if (!run) return res.status(404).json({ error: 'Run not found' });

  const now = new Date().toISOString();
  runsStore.update({ ...run, status: 'cancelled', updatedAt: now });
  blueprintsStore.update({ ...blueprint, status: 'cancelled', updatedAt: now });

  for (const job of jobs) {
    jobsStore.update({ ...job, status: 'cancelled', workflowPhase: 'cancelled', updatedAt: now });
  }

  broadcastSseEvent({ event: 'run.updated', data: { runId, status: 'cancelled' } });
  broadcastSseEvent({ event: 'blueprint.updated', data: { blueprintId: blueprint.id, status: 'cancelled' } });
  schedulePersistAll();

  // Audit event placeholder.
  schedulePersistAll();
  void uuidv4();

  return res.json({ ok: true });
});

adminRouter.post('/jobs/:jobId/priority', (req, res) => {
  if (!requireAdmin(req, res)) return;

  const { priority } = req.body ?? {};
  if (typeof priority !== 'number' || !Number.isFinite(priority)) return res.status(400).json({ error: 'priority must be a number' });

  const job = jobsStore.getById(req.params.jobId);
  if (!job) return res.status(404).json({ error: 'Job not found' });

  const now = new Date().toISOString();
  jobsStore.update({ ...job, priority, updatedAt: now });
  broadcastSseEvent({ event: 'job.updated', data: { jobId: job.id, priority } });
  schedulePersistAll();
  return res.json({ ok: true });
});

adminRouter.post('/runs/:runId/environment', (req, res) => {
  if (!requireAdmin(req, res)) return;

  const { environmentId } = req.body ?? {};
  if (typeof environmentId !== 'string') return res.status(400).json({ error: 'environmentId must be a string' });

  const env = environmentsStore.getById(environmentId);
  if (!env) return res.status(400).json({ error: 'Unknown environmentId' });

  const run = runsStore.getById(req.params.runId);
  if (!run) return res.status(404).json({ error: 'Run not found' });

  const now = new Date().toISOString();
  const allJobs = jobsStore.getAll().filter((j) => j.executionRunId === run.id);
  for (const job of allJobs) {
    jobsStore.update({ ...job, environment: environmentId, updatedAt: now });
  }

  broadcastSseEvent({ event: 'run.updated', data: { runId: run.id, environmentId } });
  schedulePersistAll();
  return res.json({ ok: true });
});

