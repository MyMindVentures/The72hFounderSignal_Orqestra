/**

 * Workflow-adjacent blueprint behavior: job types and dependency edges (see workflowEngine + blueprints route).

 */

import request from 'supertest';

import { createApp } from '../app';

import { MAX_PHASE_ATTEMPTS, MAX_TEST_ATTEMPTS } from '../engine/workflowEngine';



describe('workflow + blueprint integration', () => {

  it('exposes attempt limit constants used by the engine', () => {

    expect(MAX_TEST_ATTEMPTS).toBeGreaterThan(0);

    expect(MAX_PHASE_ATTEMPTS).toBeGreaterThan(0);

  });



  it('creates planning + backend jobs with inferred types', async () => {

    const app = createApp();

    const pr = await request(app).post('/api/projects').send({ name: 'WF' }).expect(201);

    const res = await request(app)

      .post('/api/blueprints')

      .send({

        projectId: pr.body.project.id,

        name: 'WF BP',

        rawText: 'plan system\nbackend service'

      })

      .expect(201);

    const types = (res.body.jobs as { inferredType: string }[]).map((j) => j.inferredType);

    expect(types).toContain('planning');

    expect(types).toContain('backend');

  });

});


