import request from 'supertest';

import { createApp } from '../app';



describe('runs and environments', () => {

  it('GET /api/runs lists', async () => {

    const res = await request(createApp()).get('/api/runs').expect(200);

    expect(Array.isArray(res.body.runs)).toBe(true);

  });



  it('GET /api/runs/:id 404', async () => {

    await request(createApp()).get('/api/runs/missing').expect(404);

  });



  it('GET /api/environments lists defaults', async () => {

    const res = await request(createApp()).get('/api/environments').expect(200);

    expect(Array.isArray(res.body.environments)).toBe(true);

    expect(res.body.environments.some((e: { id: string }) => e.id === 'dev')).toBe(true);

  });



  it('GET /api/environments/:id', async () => {

    const res = await request(createApp()).get('/api/environments/dev').expect(200);

    expect(res.body.environment.id).toBe('dev');

  });



  it('GET /api/environments/:id 404', async () => {

    await request(createApp()).get('/api/environments/unknown-env').expect(404);

  });

});


