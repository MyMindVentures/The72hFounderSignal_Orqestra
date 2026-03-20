import { Router } from 'express';
import { z } from 'zod';
import { Blueprint, Job } from '../models';
import { v4 as uuidv4 } from 'uuid';
import { jobsStore } from '../stores/jobsStore';
import { blueprintsStore } from '../stores/blueprintsStore';
import { runsStore } from '../stores/runsStore';

const createBlueprintSchema = z.object({
  projectId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  rawText: z.string().min(1),
  environment: z.string().optional(),
  priority: z.number().int().min(0).max(10).optional()
});

// In-memory store placeholder; replace with proper persistence.

export const blueprintRouter = Router();

blueprintRouter.post('/', (req, res) => {
  const parsed = createBlueprintSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
  }

  const { projectId, name, description, rawText, environment, priority = 5 } = parsed.data;
  const now = new Date().toISOString();
  const blueprintId = uuidv4();

  const blueprint: Blueprint = {
    id: blueprintId,
    projectId,
    name,
    description,
    rawText,
    status: 'running',
    createdAt: now,
    updatedAt: now
  };

  blueprintsStore.add(blueprint);

  const runId = uuidv4();
  runsStore.add({
    id: runId,
    projectId,
    blueprintId,
    status: 'running',
    createdAt: now,
    updatedAt: now
  });

  const lines = rawText.split(/\r?\n/);
  const createdJobs: Job[] = [];

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    const jobId = uuidv4();
    const job: Job = {
      id: jobId,
      blueprintId,
      lineNumber: index + 1,
      rawText: line,
      normalizedText: trimmed,
      inferredType: inferJobType(trimmed),
      dependencies: [],
      priority,
      environment: environment ?? null,
      status: 'pending',
      createdAt: now,
      updatedAt: now
    };
    job.executionRunId = runId;

    jobsStore.add(job);
    createdJobs.push(job);
  });

  // Minimal dependency inference from blueprint line references:
  // - "after line 3" or "depends on line 3" creates an edge to that job.
  const lineNumberToJobId = new Map<number, string>();
  createdJobs.forEach((j) => lineNumberToJobId.set(j.lineNumber, j.id));

  for (const job of createdJobs) {
    const lower = job.normalizedText.toLowerCase();
    const afterMatches = Array.from(lower.matchAll(/(?:after|depends on)\s+line\s+(\d+)/g));
    const deps = afterMatches
      .map((m) => (m[1] ? Number(m[1]) : null))
      .filter((n): n is number => typeof n === 'number' && Number.isFinite(n))
      .map((lineNo) => lineNumberToJobId.get(lineNo))
      .filter((id): id is string => typeof id === 'string');

    if (deps.length) {
      job.dependencies = deps;
      job.updatedAt = now;
      jobsStore.update(job);
    }
  }

  return res.status(201).json({
    blueprint,
    jobs: createdJobs
  });
});

blueprintRouter.get('/:id', (req, res) => {
  const blueprint = blueprintsStore.getById(req.params.id);
  if (!blueprint) {
    return res.status(404).json({ error: 'Blueprint not found' });
  }

  const relatedJobs = jobsStore.getAll().filter((j) => j.blueprintId === blueprint.id);
  return res.json({ blueprint, jobs: relatedJobs });
});

blueprintRouter.get('/', (_req, res) => {
  return res.json({ blueprints: blueprintsStore.getAll() });
});

function inferJobType(text: string) {
  const lower = text.toLowerCase();
  if (lower.includes('plan') || lower.includes('architecture')) return 'planning';
  if (lower.includes('frontend') || lower.includes('ui') || lower.includes('react')) return 'frontend';
  if (lower.includes('backend') || lower.includes('api') || lower.includes('service')) return 'backend';
  if (lower.includes('infra') || lower.includes('infrastructure') || lower.includes('terraform')) return 'infra';
  if (lower.includes('qa')) return 'QA';
  if (lower.includes('test')) return 'testing';
  if (lower.includes('debug')) return 'debugging';
  if (lower.includes('deploy') || lower.includes('release')) return 'deployment';
  if (lower.includes('monitor')) return 'monitoring';
  if (lower.includes('doc')) return 'documentation';
  return 'planning';
}

