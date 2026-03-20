import request from 'supertest';

import { createApp } from '../app';



describe('global error handler', () => {

  it('returns 500 JSON for thrown errors', async () => {

    const res = await request(createApp()).get('/api/__error_test').expect(500);

    expect(res.body.error).toBe('Internal server error');

  });

});


