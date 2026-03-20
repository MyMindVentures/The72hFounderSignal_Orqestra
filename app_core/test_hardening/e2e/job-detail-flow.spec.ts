import { test, expect } from '@playwright/test';



/**

 * Job detail API contract (mobile JobDetailScreen uses job + tasks).

 */

test('job detail: GET job and nested tasks', async ({ request }) => {

  const pr = await request.post('/api/projects', { data: { name: 'JobDetail E2E' } });

  expect(pr.ok()).toBeTruthy();

  const { project } = await pr.json();

  const br = await request.post('/api/blueprints', {

    data: {

      projectId: project.id,

      name: 'BP',

      rawText: 'plan only'

    }

  });

  expect(br.status()).toBe(201);

  const { jobs } = await br.json();

  expect(jobs.length).toBeGreaterThan(0);

  const jobId = jobs[0].id as string;



  const jobRes = await request.get(`/api/jobs/${jobId}`);

  expect(jobRes.ok()).toBeTruthy();

  const jobBody = await jobRes.json();

  expect(jobBody.job.id).toBe(jobId);



  const tasksRes = await request.get(`/api/jobs/${jobId}/tasks`);

  expect(tasksRes.ok()).toBeTruthy();

  const tasksBody = await tasksRes.json();

  expect(Array.isArray(tasksBody.tasks)).toBe(true);

});


