export const API_BASE_URL =
  // Expo injects EXPO_PUBLIC_* vars at build time.
  // eslint-disable-next-line no-undef
  (typeof process !== 'undefined' && process.env && process.env.EXPO_PUBLIC_API_BASE_URL) ||
  'http://10.0.2.2:4000';

export type BlueprintStatus = 'draft' | 'running' | 'completed' | 'failed' | 'cancelled';
export type JobStatus =
  | 'pending'
  | 'planning'
  | 'queued'
  | 'running'
  | 'blocked'
  | 'retrying'
  | 'failed'
  | 'completed'
  | 'cancelled';

export type Job = {
  id: string;
  blueprintId: string;
  executionRunId?: string;
  lineNumber: number;
  rawText: string;
  normalizedText: string;
  inferredType: string;
  dependencies: string[];
  priority: number;
  environment: string | null;
  status: JobStatus;
  workflowPhase?: string;
  lastError?: string;
};

export type Blueprint = {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  rawText: string;
  status: BlueprintStatus;
  updatedAt: string;
};

export type Project = {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

export type AgentInstance = {
  id: string;
  agentType: string;
  status: string;
  capabilities?: string[];
  currentTaskId?: string;
  lastHeartbeat?: string;
};

export type Task = {
  id: string;
  jobId: string;
  agentType: string;
  description: string;
  status: string;
  attemptCount: number;
  createdAt?: string;
  updatedAt?: string;
};

export type Artifact = {
  id: string;
  jobId: string;
  taskId: string;
  type: string;
  storageLocation?: string;
  metadata: { summary?: string; ok?: boolean; [k: string]: unknown };
  createdAt: string;
};

export type ExecutionRun = {
  id: string;
  projectId: string;
  blueprintId: string;
  status: 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
};

export type AuditEvent = {
  id: string;
  actor: 'agent' | 'user' | 'system';
  actorId?: string;
  eventType: string;
  payload: Record<string, unknown>;
  relatedEntity: { type: 'project' | 'blueprint' | 'job' | 'task' | 'run' | 'agent'; id: string };
  createdAt: string;
};

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {})
    },
    ...init
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function createBlueprint(params: {
  projectId: string;
  name: string;
  rawText: string;
  environment?: string;
  priority?: number;
}) {
  return apiFetch<{ blueprint: Blueprint; jobs: Job[] }>('/api/blueprints', {
    method: 'POST',
    body: JSON.stringify({
      projectId: params.projectId,
      name: params.name,
      rawText: params.rawText,
      environment: params.environment,
      priority: params.priority
    })
  });
}

export async function getBlueprint(blueprintId: string) {
  return apiFetch<{ blueprint: Blueprint; jobs: Job[] }>(`/api/blueprints/${blueprintId}`);
}

export async function getProjects() {
  return apiFetch<{ projects: Project[] }>('/api/projects');
}

export async function getBlueprints() {
  return apiFetch<{ blueprints: Blueprint[] }>('/api/blueprints');
}

export async function getAgents() {
  return apiFetch<{ agents: AgentInstance[] }>('/api/agents');
}

export async function getJobs() {
  return apiFetch<{ jobs: Job[] }>('/api/jobs');
}

export async function getTasks() {
  return apiFetch<{ tasks: Task[] }>('/api/tasks');
}

export async function getJobTasks(jobId: string) {
  return apiFetch<{ tasks: Task[] }>(`/api/jobs/${jobId}/tasks`);
}

export async function getJobArtifacts(jobId: string) {
  return apiFetch<{ artifacts: Artifact[] }>(`/api/jobs/${jobId}/artifacts`);
}

export async function getJob(jobId: string) {
  return apiFetch<{ job: Job }>(`/api/jobs/${jobId}`);
}

export async function getEnvironments() {
  return apiFetch<{ environments: { id: string; name: string }[] }>('/api/environments');
}

export async function getAuditEvents() {
  return apiFetch<{ auditEvents: AuditEvent[] }>('/api/audit-events');
}

export async function getRuns() {
  return apiFetch<{ runs: ExecutionRun[] }>('/api/runs');
}

export async function adminPauseBlueprint(blueprintId: string) {
  return apiFetch<{ ok: boolean }>(`/api/admin/blueprints/${blueprintId}/pause`, {
    method: 'POST',
    headers: { 'x-role': 'admin' }
  });
}

export async function adminResumeBlueprint(blueprintId: string) {
  return apiFetch<{ ok: boolean }>(`/api/admin/blueprints/${blueprintId}/resume`, {
    method: 'POST',
    headers: { 'x-role': 'admin' }
  });
}

export async function adminCancelBlueprint(blueprintId: string) {
  return apiFetch<{ ok: boolean }>(`/api/admin/blueprints/${blueprintId}/cancel`, {
    method: 'POST',
    headers: { 'x-role': 'admin' }
  });
}

export async function adminSetRunEnvironment(runId: string, environmentId: string) {
  return apiFetch<{ ok: boolean }>(`/api/admin/runs/${runId}/environment`, {
    method: 'POST',
    headers: { 'x-role': 'admin' },
    body: JSON.stringify({ environmentId })
  });
}

export async function adminSetJobPriority(jobId: string, priority: number) {
  return apiFetch<{ ok: boolean }>(`/api/admin/jobs/${jobId}/priority`, {
    method: 'POST',
    headers: { 'x-role': 'admin' },
    body: JSON.stringify({ priority })
  });
}

