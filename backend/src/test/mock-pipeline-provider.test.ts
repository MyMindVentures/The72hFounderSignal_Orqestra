import { describe, it, expect } from 'vitest';

import { MockPipelineProvider } from '../cicd/mockPipelineProvider';

import type { Job } from '../models';



function job(text: string): Job {

  const now = new Date().toISOString();

  return {

    id: 'j',

    blueprintId: 'b',

    lineNumber: 1,

    rawText: text,

    normalizedText: text,

    inferredType: 'backend',

    dependencies: [],

    priority: 1,

    environment: null,

    status: 'running',

    createdAt: now,

    updatedAt: now

  };

}



describe('MockPipelineProvider', () => {

  const p = new MockPipelineProvider();



  it('build ok', () => {

    const r = p.trigger('build', { job: job('ok'), environment: null });

    expect(r.ok).toBe(true);

    expect(r.pipelineRunId).toBeDefined();

  });



  it('build fails when fail-build hint', () => {

    const r = p.trigger('build', { job: job('fail-build please'), environment: null });

    expect(r.ok).toBe(false);

  });



  it('deploy ok', () => {

    expect(p.trigger('deploy', { job: job('deploy'), environment: 'dev' }).ok).toBe(true);

  });

});


