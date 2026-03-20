import request from 'supertest';

import { createApp } from '../app';



describe('admin routes', () => {

  async function blueprintWithRun() {

    const app = createApp();

    const pr = await request(app).post('/api/projects').send({ name: 'A' }).expect(201);

    const projectId = pr.body.project.id as string;

    const br = await request(app)

      .post('/api/blueprints')

      .send({ projectId, name: 'B', rawText: 'plan only' })

      .expect(201);

    const blueprintId = br.body.blueprint.id as string;

    const jobId = br.body.jobs[0].id as string;

    return { app, blueprintId, jobId };

  }



  it('403 pause without admin role', async () => {

    const { app, blueprintId } = await blueprintWithRun();

    await request(app).post(`/api/admin/blueprints/${blueprintId}/pause`).expect(403);

  });



  it('pause with admin role', async () => {

    const { app, blueprintId } = await blueprintWithRun();

    await request(app)

      .post(`/api/admin/blueprints/${blueprintId}/pause`)

      .set('x-role', 'admin')

      .expect(200);

  });



  it('priority with admin', async () => {

    const { app, jobId } = await blueprintWithRun();

    await request(app)

      .post(`/api/admin/jobs/${jobId}/priority`)

      .set('x-role', 'admin')

      .send({ priority: 9 })

      .expect(200);

  });



  it('priority 400 bad body', async () => {

    const { app, jobId } = await blueprintWithRun();

    await request(app)

      .post(`/api/admin/jobs/${jobId}/priority`)

      .set('x-role', 'admin')

      .send({ priority: 'x' })

      .expect(400);

  });



  it('environment with admin', async () => {

    const { app, blueprintId } = await blueprintWithRun();

    const runs = await request(app).get('/api/runs').expect(200);

    const runId = runs.body.runs.find((r: { blueprintId: string }) => r.blueprintId === blueprintId)?.id;

    expect(runId).toBeDefined();

    await request(app)

      .post(`/api/admin/runs/${runId}/environment`)

      .set('x-role', 'admin')

      .send({ environmentId: 'stage' })

      .expect(200);

  });

});


