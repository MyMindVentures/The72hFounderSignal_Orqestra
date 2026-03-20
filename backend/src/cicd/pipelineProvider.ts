import { Job } from '../models';

export type PipelineAction = 'deploy' | 'rollback' | 'build' | 'release';

export interface PipelineResult {
  ok: boolean;
  pipelineRunId: string;
  summary: string;
}

export interface PipelineProvider {
  trigger(action: PipelineAction, ctx: { job: Job; environment: string | null; description?: string }): PipelineResult;
}

