import request from 'supertest';

import { createApp } from '../app';



describe('jobs and tasks routes', () => {

  it('GET /api/jobs/:id/tasks 404 when job missing', async () => {

    await request(createApp()).get('/api/jobs/missing/tasks').expect(404);

  });



  it('GET /api/jobs/:id/artifacts 404 when job missing', async () => {

    await request(createApp()).get('/api/jobs/missing/artifacts').expect(404);

  });



  it('GET /api/tasks/:id 404', async () => {

    await request(createApp()).get('/api/tasks/missing').expect(404);

  });

});


