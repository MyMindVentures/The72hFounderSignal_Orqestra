import request from 'supertest';

import { createApp } from '../app';



describe('security baseline', () => {

  it('sets security-related headers via helmet', async () => {

    const res = await request(createApp()).get('/api/health').expect(200);

    expect(res.headers['x-content-type-options']).toBeDefined();

  });



  it('admin cannot bypass without header', async () => {

    const app = createApp();

    const pr = await request(app).post('/api/projects').send({ name: 'S' }).expect(201);

    const br = await request(app)

      .post('/api/blueprints')

      .send({ projectId: pr.body.project.id, name: 'B', rawText: 'x' })

      .expect(201);

    await request(app).post(`/api/admin/blueprints/${br.body.blueprint.id}/pause`).expect(403);

  });

});


