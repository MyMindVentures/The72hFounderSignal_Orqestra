import request from 'supertest';

import { createApp } from '../app';



describe('audit and metrics', () => {

  it('GET /api/audit-events', async () => {

    const res = await request(createApp()).get('/api/audit-events').expect(200);

    expect(Array.isArray(res.body.auditEvents)).toBe(true);

  });



  it('GET /api/audit-events/:id 404', async () => {

    await request(createApp()).get('/api/audit-events/missing').expect(404);

  });



  it('GET /api/metrics snapshot', async () => {

    const res = await request(createApp()).get('/api/metrics').expect(200);

    expect(res.body.metrics).toBeDefined();

    expect(typeof res.body.metrics.jobsCompleted).toBe('number');

  });

});


