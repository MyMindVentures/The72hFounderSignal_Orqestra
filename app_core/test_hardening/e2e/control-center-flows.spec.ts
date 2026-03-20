import { test, expect } from '@playwright/test';



/**

 * Control-center API flows (same contracts the mobile app uses via `lib/api`).

 */

test('project list and blueprint detail', async ({ request }) => {

  const pr = await request.post('/api/projects', { data: { name: 'E2E Flow' } });

  expect(pr.ok()).toBeTruthy();

  const { project } = await pr.json();

  const br = await request.post('/api/blueprints', {

    data: {

      projectId: project.id,

      name: 'Flow BP',

      rawText: 'backend api service'

    }

  });

  expect(br.status()).toBe(201);

  const { blueprint } = await br.json();



  const list = await request.get('/api/projects');

  expect(list.ok()).toBeTruthy();

  const body = await list.json();

  expect(body.projects.some((p: { id: string }) => p.id === project.id)).toBe(true);



  const bp = await request.get(`/api/blueprints/${blueprint.id}`);

  expect(bp.ok()).toBeTruthy();

  const detail = await bp.json();

  expect(detail.blueprint.id).toBe(blueprint.id);

  expect(Array.isArray(detail.jobs)).toBe(true);

});


