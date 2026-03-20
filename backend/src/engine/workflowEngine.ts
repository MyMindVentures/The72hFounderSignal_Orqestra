import { v4 as uuidv4 } from 'uuid';
import {
  AgentInstance,
  AgentType,
  Artifact,
  Job,
  JobStatus,
  Task,
  TaskStatus
} from '../models';
import { jobsStore } from '../stores/jobsStore';
import { tasksStore } from '../stores/tasksStore';
import { agentsStore } from '../stores/agentsStore';
import { artifactsStore } from '../stores/artifactsStore';
import { auditStore } from '../stores/auditStore';
import { runsStore } from '../stores/runsStore';
import { blueprintsStore } from '../stores/blueprintsStore';
import { agentTaskQueue } from '../queue/agentTaskQueue';
import { broadcastSseEvent } from '../realtime/sseHub';
import { pipelineProvider } from '../cicd';
import { metricsStore } from '../observability/metricsStore';
import { schedulePersistAll } from '../persistence/jsonPersistence';

export const MAX_TEST_ATTEMPTS = 2; // attemptCount values allowed: 0..MAX_TEST_ATTEMPTS-1
export const MAX_PHASE_ATTEMPTS = 2; // attemptCount values allowed: 0..MAX_PHASE_ATTEMPTS-1 for non-test phases

function nowIso() {
  return new Date().toISOString();
}

function audit(params: {
  actor: 'agent' | 'user' | 'system';
  eventType: string;
  payload: Record<string, unknown>;
  relatedEntity: { type: 'project' | 'blueprint' | 'job' | 'task' | 'run' | 'agent'; id: string };
}) {
  const event = {
    id: uuidv4(),
    actor: params.actor,
    eventType: params.eventType,
    payload: params.payload,
    relatedEntity: params.relatedEntity,
    createdAt: nowIso()
  } as const;
  auditStore.add(event);
}

function getTestingAttemptMax(jobId: string) {
  const testingTasks = tasksStore.getByJobId(jobId).filter((t) => t.agentType === 'testing');
  if (testingTasks.length === 0) return null;
  return testingTasks.sort((a, b) => b.attemptCount - a.attemptCount)[0]?.attemptCount ?? null;
}

function dependenciesSatisfied(job: Job) {
  if (!job.dependencies?.length) return true;
  const deps = job.dependencies.map((id) => jobsStore.getById(id)).filter(Boolean) as Job[];
  if (deps.length !== job.dependencies.length) return false; // missing dependency => blocked
  return deps.every((d) => d.status === 'completed');
}

function runtimeStatusForAgent(agentType: AgentType) {
  switch (agentType) {
    case 'architecture':
      return 'planning';
    case 'coding':
      return 'coding';
    case 'testing':
      return 'testing';
    case 'debugging':
      return 'retrying';
    case 'devops':
      return 'testing';
    case 'security':
      return 'planning';
    case 'documentation':
      return 'planning';
    case 'release':
      return 'planning';
  }
}

function shouldFail(job: Job, failureHints: string[]) {
  const lower = job.normalizedText.toLowerCase();
  return failureHints.some((h) => lower.includes(h));
}

function createAgentIfMissing(agentType: AgentType) {
  const existing = agentsStore.getAll().find((a) => a.agentType === agentType);
  if (existing) return existing;

  const agent: AgentInstance = {
    id: `agent-${agentType}`,
    agentType,
    capabilities: [],
    status: 'idle',
    lastHeartbeat: nowIso()
  };
  agentsStore.upsert(agent);
  return agent;
}

function ensureAgents() {
  const agentTypes: AgentType[] = ['architecture', 'coding', 'testing', 'debugging', 'devops', 'security', 'documentation', 'release'];
  agentTypes.forEach(createAgentIfMissing);
}

function createTask(params: {
  job: Job;
  agentType: AgentType;
  description: string;
  attemptCount: number;
}) {
  const task: Task = {
    id: uuidv4(),
    jobId: params.job.id,
    agentType: params.agentType,
    description: params.description,
    status: 'pending',
    attemptCount: params.attemptCount,
    createdAt: nowIso(),
    updatedAt: nowIso()
  };
  tasksStore.add(task);
  schedulePersistAll();
  broadcastSseEvent({
    event: 'task.created',
    data: { taskId: task.id, jobId: task.jobId, agentType: task.agentType, attemptCount: task.attemptCount }
  });
  audit({
    actor: 'system',
    eventType: 'WorkflowEngine.enqueueTask',
    payload: { taskId: task.id, jobId: task.jobId, agentType: task.agentType, attemptCount: task.attemptCount },
    relatedEntity: { type: 'task', id: task.id }
  });
  return task;
}

function createArtifact(params: { job: Job; task: Task; type: string; summary: string; metadata?: Record<string, unknown> }) {
  const artifact: Artifact = {
    id: uuidv4(),
    jobId: params.job.id,
    taskId: params.task.id,
    type: params.type,
    storageLocation: `mem://artifact/${params.task.id}/${params.type}`,
    metadata: { summary: params.summary, ...(params.metadata ?? {}) },
    createdAt: nowIso()
  };
  artifactsStore.add(artifact);
  return artifact;
}

function updateJob(job: Job, patch: Partial<Job>) {
  const updated = { ...job, ...patch, updatedAt: nowIso() };
  jobsStore.update(updated);
  schedulePersistAll();
  if (patch.status === 'completed') metricsStore.inc('jobsCompleted');
  if (patch.status === 'failed') metricsStore.inc('jobsFailed');
  broadcastSseEvent({
    event: 'job.updated',
    data: { jobId: updated.id, blueprintId: updated.blueprintId, executionRunId: updated.executionRunId, status: updated.status, workflowPhase: updated.workflowPhase }
  });
  return updated;
}

function finalizeRunIfPossible(runId: string) {
  const run = runsStore.getById(runId);
  if (!run) return;

  const runJobs = jobsStore.getAll().filter((j) => j.executionRunId === runId);
  if (runJobs.length === 0) return;

  const allDone = runJobs.every((j) => j.status === 'completed' || j.status === 'failed' || j.status === 'cancelled');
  if (!allDone) return;

  const anyFailed = runJobs.some((j) => j.status === 'failed');
  const anyCancelled = runJobs.some((j) => j.status === 'cancelled');
  const newStatus: 'completed' | 'failed' | 'cancelled' = anyFailed ? 'failed' : anyCancelled ? 'cancelled' : 'completed';

  const updatedRun = { ...run, status: newStatus, updatedAt: nowIso() };
  runsStore.update(updatedRun);

  audit({
    actor: 'system',
    eventType: 'WorkflowEngine.finalizeRun',
    payload: { runId, status: newStatus },
    relatedEntity: { type: 'run', id: runId }
  });

  // Mirror on blueprint-level status.
  const blueprint = blueprintsStore.getById(run.blueprintId);
  if (blueprint) {
    const updatedBlueprint = { ...blueprint, status: newStatus, updatedAt: nowIso() } as typeof blueprint;
    blueprintsStore.update(updatedBlueprint);
  }

  broadcastSseEvent({ event: 'run.finalized', data: { runId, status: newStatus } });
  schedulePersistAll();
}

function executeTask(task: Task, agentType: AgentType) {
  const job = jobsStore.getById(task.jobId);
  if (!job) return { ok: false };

  const traceId = uuidv4();
  // Mark timestamps and execute simulated behavior.
  const lower = job.normalizedText.toLowerCase();
  let ok = true;
  let summary = '';
  let pipelineRunId: string | null = null;

  if (agentType === 'architecture') {
    ok = !shouldFail(job, ['fail-arch', 'architecture fail']);
    summary = ok ? 'Proposed architecture and interfaces.' : 'Architecture planning failed due to constraints.';
  } else if (agentType === 'coding') {
    const result = pipelineProvider.trigger('build', { job, environment: job.environment, description: task.description });
    ok = result.ok;
    summary = result.summary;
    pipelineRunId = result.pipelineRunId;
  } else if (agentType === 'testing') {
    ok = !shouldFail(job, ['fail-tests', 'tests fail', 'fail-test', 'test failure', 'failing tests']);
    summary = ok ? 'All test suites passed thresholds.' : 'Test failures detected; diagnostics collected.';
  } else if (agentType === 'debugging') {
    ok = !shouldFail(job, ['fail-debug', 'debug fail', 'cannot fix']);
    summary = ok ? 'Produced patch and verified fixes locally.' : 'Debugging could not produce an acceptable patch.';
  } else if (agentType === 'devops') {
    const isRollback = task.description.toLowerCase().includes('rollback');
    const action = isRollback ? 'rollback' : 'deploy';
    const result = pipelineProvider.trigger(action, { job, environment: job.environment, description: task.description });
    ok = result.ok;
    summary = result.summary;
    pipelineRunId = result.pipelineRunId;
  } else if (agentType === 'security') {
    ok = !shouldFail(job, ['fail-security', 'security fail']);
    summary = ok ? 'Static analysis and security checks succeeded.' : 'Security review found critical issues.';
  } else if (agentType === 'documentation') {
    ok = !shouldFail(job, ['fail-docs', 'docs fail']);
    summary = ok ? 'Generated user/developer documentation and release notes draft.' : 'Documentation generation failed.';
  } else if (agentType === 'release') {
    const result = pipelineProvider.trigger('release', { job, environment: job.environment, description: task.description });
    ok = result.ok;
    summary = result.summary;
    pipelineRunId = result.pipelineRunId;
  }

  const taskUpdated: Task = { ...task, status: ok ? 'completed' : 'failed', updatedAt: nowIso() };
  tasksStore.update(taskUpdated);
  schedulePersistAll();
  if (taskUpdated.status === 'completed') metricsStore.inc('tasksCompleted');
  if (taskUpdated.status === 'failed') metricsStore.inc('tasksFailed');
  broadcastSseEvent({
    event: 'task.updated',
    data: { taskId: taskUpdated.id, jobId: taskUpdated.jobId, agentType: taskUpdated.agentType, status: taskUpdated.status, attemptCount: taskUpdated.attemptCount }
  });

  const artifact = createArtifact({
    job,
    task: taskUpdated,
    type: 'logBundle',
    summary,
    metadata: { ok, traceId, pipelineRunId }
  });
  audit({
    actor: 'agent',
    eventType: 'WorkflowEngine.taskExecuted',
    payload: { taskId: taskUpdated.id, agentType, ok, artifactId: artifact.id, traceId, pipelineRunId },
    relatedEntity: { type: 'task', id: taskUpdated.id }
  });

  // Job state machine updates + next task creation.
  if (ok) {
    if (agentType === 'architecture') {
      if (job.inferredType === 'planning') {
        updateJob(job, { status: 'completed', workflowPhase: 'planning' });
        if (job.executionRunId) finalizeRunIfPossible(job.executionRunId);
      } else if (job.inferredType === 'backend' || job.inferredType === 'frontend' || job.inferredType === 'infra') {
        updateJob(job, { status: 'queued', workflowPhase: 'coding', lastError: undefined });
        createTask({ job, agentType: 'coding', description: 'Implement core components', attemptCount: 0 });
      } else if (job.inferredType === 'QA' || job.inferredType === 'testing') {
        updateJob(job, { status: 'queued', workflowPhase: 'testing', lastError: undefined });
        createTask({ job, agentType: 'testing', description: 'Generate and run test suites', attemptCount: 0 });
      } else if (job.inferredType === 'debugging') {
        updateJob(job, { status: 'queued', workflowPhase: 'debugging', lastError: undefined });
        createTask({ job, agentType: 'debugging', description: 'Inspect failures and propose fixes', attemptCount: 0 });
      } else if (job.inferredType === 'deployment' || job.inferredType === 'monitoring') {
        updateJob(job, { status: 'queued', workflowPhase: 'deployment', lastError: undefined });
        createTask({ job, agentType: 'devops', description: 'Prepare and deploy release candidate', attemptCount: 0 });
      } else if (job.inferredType === 'documentation') {
        updateJob(job, { status: 'queued', workflowPhase: 'documentation', lastError: undefined });
        createTask({ job, agentType: 'documentation', description: 'Generate documentation and release notes', attemptCount: 0 });
      } else {
        updateJob(job, { status: 'completed', workflowPhase: 'planning' });
        if (job.executionRunId) finalizeRunIfPossible(job.executionRunId);
      }
    } else if (agentType === 'coding') {
      updateJob(job, { status: 'running', workflowPhase: 'testing', lastError: undefined });
      const testingAttempt = 0;
      createTask({ job, agentType: 'testing', description: 'Run unit/integration tests', attemptCount: testingAttempt });
    } else if (agentType === 'testing') {
      // Always run security review after successful tests.
      updateJob(job, { status: 'queued', workflowPhase: 'security', lastError: undefined });
      createTask({ job, agentType: 'security', description: 'Run static analysis and security checks', attemptCount: 0 });
    } else if (agentType === 'debugging') {
      updateJob(job, { status: 'retrying', workflowPhase: 'testing', lastError: undefined });
      const maxTestingAttempt = getTestingAttemptMax(job.id);
      const nextAttempt = maxTestingAttempt === null ? 0 : maxTestingAttempt + 1;
      createTask({ job, agentType: 'testing', description: 'Re-run tests after fixes', attemptCount: nextAttempt });
    } else if (agentType === 'devops') {
      const isRollback = task.description.toLowerCase().includes('rollback');
      if (isRollback) {
        updateJob(job, { status: 'failed', workflowPhase: 'rollback', lastError: 'Deployment rolled back after failure' });
        if (job.executionRunId) finalizeRunIfPossible(job.executionRunId);
        return;
      }

      updateJob(job, { status: 'running', workflowPhase: 'verification', lastError: undefined });
      createTask({ job, agentType: 'testing', description: 'Deployment verification (smoke tests)', attemptCount: 0 });
    } else if (agentType === 'documentation') {
      updateJob(job, { status: 'completed', workflowPhase: 'documentation', lastError: undefined });
      if (job.executionRunId) finalizeRunIfPossible(job.executionRunId);
    } else if (agentType === 'release') {
      updateJob(job, { status: 'completed', workflowPhase: 'release', lastError: undefined });
      if (job.executionRunId) finalizeRunIfPossible(job.executionRunId);
    } else if (agentType === 'security') {
      const lower = job.normalizedText.toLowerCase();
      const wantsRelease =
        (job.inferredType === 'deployment' || job.inferredType === 'monitoring') &&
        (lower.includes('release') || lower.includes('publish'));

      if (wantsRelease) {
        updateJob(job, { status: 'queued', workflowPhase: 'release', lastError: undefined });
        createTask({ job, agentType: 'release', description: 'Assemble and publish release artifacts', attemptCount: 0 });
        return;
      }

      updateJob(job, { status: 'completed', workflowPhase: 'security', lastError: undefined });
      if (job.executionRunId) finalizeRunIfPossible(job.executionRunId);
    }
  } else {
    if (agentType === 'testing') {
      if (task.attemptCount >= MAX_TEST_ATTEMPTS - 1) {
        updateJob(job, { status: 'failed', workflowPhase: 'testing', lastError: summary });
        if (job.executionRunId) finalizeRunIfPossible(job.executionRunId);
      } else {
        updateJob(job, { status: 'retrying', workflowPhase: 'debugging', lastError: summary });
        audit({
          actor: 'system',
          eventType: 'WorkflowEngine.testingFailed_CreateDebugLoop',
          payload: { jobId: job.id, testingAttempt: task.attemptCount, maxTestAttempts: MAX_TEST_ATTEMPTS },
          relatedEntity: { type: 'job', id: job.id }
        });
        createTask({
          job,
          agentType: 'debugging',
          description: 'Fix failing tests and produce patch',
          attemptCount: task.attemptCount + 1
        });
      }
    } else if (agentType === 'coding' || agentType === 'devops') {
      if (task.attemptCount >= MAX_PHASE_ATTEMPTS - 1) {
        const isRollbackTask = task.description.toLowerCase().includes('rollback');
        const isDeploymentJob = job.inferredType === 'deployment' || job.inferredType === 'monitoring';

        // For deployment failures, attempt an automatic rollback before marking the job failed.
        if (agentType === 'devops' && isDeploymentJob && !isRollbackTask) {
          updateJob(job, { status: 'retrying', workflowPhase: 'rollback', lastError: summary });
          createTask({ job, agentType: 'devops', description: 'Rollback to last good deployment', attemptCount: 0 });
          return;
        }

        updateJob(job, { status: 'failed', workflowPhase: agentType, lastError: summary });
        if (job.executionRunId) finalizeRunIfPossible(job.executionRunId);
      } else {
        updateJob(job, { status: 'retrying', workflowPhase: agentType, lastError: summary });
        metricsStore.inc('phaseRetries');
        audit({
          actor: 'system',
          eventType: 'WorkflowEngine.phaseFailed_Retry',
          payload: { jobId: job.id, phase: agentType, attemptCount: task.attemptCount, maxPhaseAttempts: MAX_PHASE_ATTEMPTS },
          relatedEntity: { type: 'job', id: job.id }
        });
        createTask({
          job,
          agentType,
          description: agentType === 'coding' ? 'Retry build/code generation after failure' : 'Retry deployment after failure',
          attemptCount: task.attemptCount + 1
        });
      }
    } else {
      updateJob(job, { status: 'failed', workflowPhase: agentType, lastError: summary });
      if (job.executionRunId) finalizeRunIfPossible(job.executionRunId);
    }
  }
}

function assignPendingTasks() {
  const pendingTasks = tasksStore.getAll().filter((t) => t.status === 'pending');
  if (pendingTasks.length === 0) return;

  for (const task of pendingTasks) {
    const agent = agentsStore
      .getAll()
      .find((a) => a.agentType === task.agentType && a.status === 'idle');
    if (!agent) continue;
    // Mark as enqueued to prevent duplicate assignments.
    tasksStore.update({ ...task, status: 'planning', updatedAt: nowIso() });
    agentTaskQueue.enqueue(task.agentType as AgentType, task.id);
    metricsStore.inc('tasksEnqueued');
    broadcastSseEvent({
      event: 'task.enqueued',
      data: { taskId: task.id, jobId: task.jobId, agentType: task.agentType, queueDepth: agentTaskQueue.getDepth(task.agentType as AgentType) }
    });
    audit({
      actor: 'system',
      eventType: 'WorkflowEngine.enqueueToAgentWorker',
      payload: { taskId: task.id, agentId: agent.id, agentType: task.agentType },
      relatedEntity: { type: 'task', id: task.id }
    });
  }
}

function seedJobsForExecution() {
  const jobs = jobsStore.getAll();
  for (const job of jobs) {
    if (job.status !== 'pending' && job.status !== 'blocked') continue;

    const run = job.executionRunId ? runsStore.getById(job.executionRunId) : undefined;
    if (run && run.status !== 'running') continue;

    if (!dependenciesSatisfied(job)) {
      updateJob(job, { status: 'blocked', workflowPhase: 'waiting_for_dependencies' });
      continue;
    }

    // Transition to planning and create initial architecture task.
    updateJob(job, { status: 'planning', workflowPhase: 'planning', lastError: undefined });
    createTask({ job, agentType: 'architecture', description: 'Plan approach for this job', attemptCount: 0 });
  }
}

export function startWorkflowEngine() {
  ensureAgents();
  // After restart, rebuild the in-memory queues from persisted task states.
  agentTaskQueue.reset();
  const agentTypes: AgentType[] = ['architecture', 'coding', 'testing', 'debugging', 'devops', 'security', 'documentation', 'release'];
  for (const agent of agentsStore.getAll()) {
    agentsStore.update(agent.id, { status: 'idle', currentTaskId: undefined, lastHeartbeat: nowIso() });
  }
  for (const task of tasksStore.getAll()) {
    if (task.status === 'running') {
      tasksStore.update({ ...task, status: 'pending', updatedAt: nowIso() });
    } else if (task.status === 'planning') {
      agentTaskQueue.enqueue(task.agentType as AgentType, task.id);
    }
  }
  schedulePersistAll();

  audit({
    actor: 'system',
    eventType: 'WorkflowEngine.start',
    payload: {},
    relatedEntity: { type: 'run', id: 'engine' }
  });

  // Scheduler loop for autonomous execution (in-memory demo).
  setInterval(() => {
    try {
      seedJobsForExecution();
      assignPendingTasks();
    } catch (err) {
      audit({
        actor: 'system',
        eventType: 'WorkflowEngine.loopError',
        payload: { error: err instanceof Error ? err.message : String(err) },
        relatedEntity: { type: 'run', id: 'engine' }
      });
    }
  }, 750);

  // Worker loops per agent type (in-memory demo of durable workers).
  agentTypes.forEach((agentType) => {
    setInterval(() => {
      const agent = agentsStore.getAll().find((a) => a.agentType === agentType && a.status === 'idle');
      const taskId = agentTaskQueue.dequeue(agentType);
      if (!agent || !taskId) return;

      const task = tasksStore.getById(taskId);
      if (!task) return;

      const job = jobsStore.getById(task.jobId);
      const run = job?.executionRunId ? runsStore.getById(job.executionRunId) : undefined;
      if (run && run.status !== 'running') {
        // If paused, keep the task for later; if cancelled, drop it.
        if (run.status === 'paused') agentTaskQueue.enqueue(agentType, task.id);
        return;
      }

      agentsStore.update(agent.id, { status: runtimeStatusForAgent(agentType), currentTaskId: task.id, lastHeartbeat: nowIso() });
      tasksStore.update({ ...task, status: 'running', updatedAt: nowIso() });
      broadcastSseEvent({ event: 'task.started', data: { taskId, agentType, jobId: task.jobId } });

      executeTask(task, agentType);

      agentsStore.update(agent.id, { status: 'idle', currentTaskId: undefined, lastHeartbeat: nowIso() });
    }, 400);
  });
}

