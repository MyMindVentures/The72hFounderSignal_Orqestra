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

export type TaskStatus = 'pending' | 'planning' | 'running' | 'blocked' | 'retrying' | 'failed' | 'completed';

export type AgentRuntimeStatus =
  | 'idle'
  | 'planning'
  | 'coding'
  | 'testing'
  | 'blocked'
  | 'retrying'
  | 'failed'
  | 'completed';

export type JobType =
  | 'planning'
  | 'backend'
  | 'frontend'
  | 'infra'
  | 'QA'
  | 'testing'
  | 'debugging'
  | 'deployment'
  | 'monitoring'
  | 'documentation';

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Blueprint {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  rawText: string;
  status: BlueprintStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: string;
  blueprintId: string;
  executionRunId?: string;
  lineNumber: number;
  rawText: string;
  normalizedText: string;
  inferredType: JobType;
  dependencies: string[];
  priority: number;
  environment: string | null;
  status: JobStatus;
  workflowPhase?: string;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  jobId: string;
  agentType: string;
  description: string;
  status: TaskStatus;
  attemptCount: number;
  createdAt: string;
  updatedAt: string;
}

export type AgentType =
  | 'architecture'
  | 'coding'
  | 'testing'
  | 'debugging'
  | 'devops'
  | 'security'
  | 'documentation'
  | 'release';

export interface AgentInstance {
  id: string;
  agentType: AgentType;
  capabilities: string[];
  currentTaskId?: string;
  status: AgentRuntimeStatus;
  lastHeartbeat: string;
}

export interface Artifact {
  id: string;
  jobId: string;
  taskId: string;
  type: string;
  storageLocation: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface ExecutionRun {
  id: string;
  projectId: string;
  blueprintId: string;
  status: 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface Environment {
  id: string;
  name: string;
  isolationId: string;
  allowedActions: string[];
  deploymentTargets: string[];
  secretsRef: string;
}

export interface AuditEvent {
  id: string;
  actor: 'agent' | 'user' | 'system';
  actorId?: string;
  eventType: string;
  payload: Record<string, unknown>;
  relatedEntity: {
    type: 'project' | 'blueprint' | 'job' | 'task' | 'run' | 'agent';
    id: string;
  };
  createdAt: string;
}

