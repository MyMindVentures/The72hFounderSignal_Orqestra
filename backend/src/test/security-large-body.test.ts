import request from 'supertest';

import { createApp } from '../app';



describe('JSON body size limit', () => {

  it('rejects payloads over express json limit (~2mb)', async () => {

    const app = createApp();

    const big = { name: 'x'.repeat(3 * 1024 * 1024) };

    const res = await request(app).post('/api/projects').send(big);

    expect(res.status).toBe(413);

  });

});


