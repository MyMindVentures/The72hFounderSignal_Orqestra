import { v4 as uuidv4 } from 'uuid';
import { Job } from '../models';
import { PipelineAction, PipelineProvider, PipelineResult } from './pipelineProvider';

function shouldFail(job: Job, hints: string[]) {
  const lower = job.normalizedText.toLowerCase();
  return hints.some((h) => lower.includes(h));
}

function hintsForAction(action: PipelineAction) {
  switch (action) {
    case 'deploy':
      return ['fail-deploy', 'deploy fail', 'deployment failure'];
    case 'rollback':
      return ['fail-rollback', 'rollback fail'];
    case 'build':
      return ['fail-build', 'build fail', 'coding fail'];
    case 'release':
      return ['fail-release', 'release fail'];
  }
}

export class MockPipelineProvider implements PipelineProvider {
  trigger(action: PipelineAction, ctx: { job: Job; environment: string | null; description?: string }): PipelineResult {
    const pipelineRunId = uuidv4();
    const failing = shouldFail(ctx.job, hintsForAction(action));

    if (action === 'deploy') {
      return {
        ok: !failing,
        pipelineRunId,
        summary: !failing ? 'CI/CD deploy pipeline completed successfully.' : 'CI/CD deploy pipeline failed.'
      };
    }

    if (action === 'rollback') {
      return {
        ok: !failing,
        pipelineRunId,
        summary: !failing ? 'Rollback pipeline completed successfully.' : 'Rollback pipeline failed.'
      };
    }

    if (action === 'build') {
      return {
        ok: !failing,
        pipelineRunId,
        summary: !failing ? 'Build pipeline completed successfully.' : 'Build pipeline failed.'
      };
    }

    return {
      ok: !failing,
      pipelineRunId,
      summary: !failing ? 'Release publishing pipeline completed successfully.' : 'Release publishing pipeline failed.'
    };
  }
}

