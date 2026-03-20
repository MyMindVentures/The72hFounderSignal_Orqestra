import request from 'supertest';

import { createApp } from '../app';



describe('agents and artifacts', () => {

  it('GET /api/agents returns array', async () => {

    const res = await request(createApp()).get('/api/agents').expect(200);

    expect(Array.isArray(res.body.agents)).toBe(true);

  });



  it('GET /api/agents/:id 404', async () => {

    await request(createApp()).get('/api/agents/missing').expect(404);

  });



  it('GET /api/artifacts returns array', async () => {

    const res = await request(createApp()).get('/api/artifacts').expect(200);

    expect(Array.isArray(res.body.artifacts)).toBe(true);

  });



  it('GET /api/artifacts/:id 404', async () => {

    await request(createApp()).get('/api/artifacts/missing').expect(404);

  });

});


