import request from 'supertest';

import { createApp } from '../app';



describe('GET /api/health', () => {

  it('returns ok and version', async () => {

    const res = await request(createApp()).get('/api/health').expect(200);

    expect(res.body.ok).toBe(true);

    expect(res.body.service).toBe('autonomous-platform-backend');

    expect(res.body.version).toBeDefined();

    expect(res.body.timestamp).toBeDefined();

  });

});


