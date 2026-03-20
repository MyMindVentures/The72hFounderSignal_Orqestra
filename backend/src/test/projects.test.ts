import request from 'supertest';

import { createApp } from '../app';



describe('projects routes', () => {

  it('POST /api/projects creates project', async () => {

    const res = await request(createApp())

      .post('/api/projects')

      .send({ name: 'P1', description: 'd' })

      .expect(201);

    expect(res.body.project.name).toBe('P1');

    expect(res.body.project.id).toBeDefined();

  });



  it('POST /api/projects 400 without name', async () => {

    await request(createApp()).post('/api/projects').send({}).expect(400);

  });



  it('GET /api/projects lists', async () => {

    const app = createApp();

    await request(app).post('/api/projects').send({ name: 'X' }).expect(201);

    const res = await request(app).get('/api/projects').expect(200);

    expect(Array.isArray(res.body.projects)).toBe(true);

    expect(res.body.projects.length).toBeGreaterThanOrEqual(1);

  });



  it('GET /api/projects/:id 404', async () => {

    await request(createApp()).get('/api/projects/nonexistent-id').expect(404);

  });

});


