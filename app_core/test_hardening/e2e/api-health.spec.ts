import { test, expect } from '@playwright/test';



test('GET /api/health', async ({ request }) => {

  const res = await request.get('/api/health');

  expect(res.ok()).toBeTruthy();

  const body = await res.json();

  expect(body.ok).toBe(true);

  expect(body.service).toContain('autonomous-platform-backend');

});



test('blueprint flow creates resources', async ({ request }) => {

  const pr = await request.post('/api/projects', { data: { name: 'E2E Project' } });

  expect(pr.ok()).toBeTruthy();

  const { project } = await pr.json();

  const br = await request.post('/api/blueprints', {

    data: {

      projectId: project.id,

      name: 'E2E BP',

      rawText: 'plan architecture'

    }

  });

  expect(br.status()).toBe(201);

  const j = await br.json();

  expect(j.blueprint).toBeDefined();

  expect(Array.isArray(j.jobs)).toBe(true);

});


