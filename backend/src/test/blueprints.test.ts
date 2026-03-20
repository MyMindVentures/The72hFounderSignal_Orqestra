import request from 'supertest';

import { createApp } from '../app';



describe('blueprints routes', () => {

  async function projectId() {

    const app = createApp();

    const r = await request(app).post('/api/projects').send({ name: 'Proj' }).expect(201);

    return { app, projectId: r.body.project.id as string };

  }



  it('POST validates payload', async () => {

    const { app, projectId: pid } = await projectId();

    await request(app)

      .post('/api/blueprints')

      .send({ projectId: pid })

      .expect(400);

  });



  it('POST creates blueprint and jobs', async () => {

    const { app, projectId: pid } = await projectId();

    const res = await request(app)

      .post('/api/blueprints')

      .send({

        projectId: pid,

        name: 'B1',

        rawText: 'plan architecture\nbackend api',

        priority: 3

      })

      .expect(201);

    expect(res.body.blueprint.id).toBeDefined();

    expect(res.body.jobs.length).toBe(2);

  });



  it('GET /api/blueprints/:id', async () => {

    const { app, projectId: pid } = await projectId();

    const created = await request(app)

      .post('/api/blueprints')

      .send({ projectId: pid, name: 'B', rawText: 'line1' })

      .expect(201);

    const id = created.body.blueprint.id as string;

    const res = await request(app).get(`/api/blueprints/${id}`).expect(200);

    expect(res.body.blueprint.id).toBe(id);

    expect(Array.isArray(res.body.jobs)).toBe(true);

  });



  it('GET unknown blueprint 404', async () => {

    await request(createApp()).get('/api/blueprints/00000000-0000-0000-0000-000000000000').expect(404);

  });

  it('POST infers job dependency from "after line N"', async () => {
    const { app, projectId: pid } = await projectId();
    const res = await request(app)
      .post('/api/blueprints')
      .send({
        projectId: pid,
        name: 'Deps',
        rawText: 'plan architecture\nafter line 1 backend api service'
      })
      .expect(201);
    const jobs = res.body.jobs as { lineNumber: number; id: string; dependencies: string[] }[];
    expect(jobs.length).toBe(2);
    const j1 = jobs.find((j) => j.lineNumber === 1);
    const j2 = jobs.find((j) => j.lineNumber === 2);
    expect(j1).toBeDefined();
    expect(j2?.dependencies).toContain(j1!.id);
  });
});


