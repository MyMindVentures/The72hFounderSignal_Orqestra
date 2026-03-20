import { spawnSync } from 'child_process';

import fs from 'fs';

import path from 'path';

import { testHardeningRoot } from '../paths.js';



function main() {

  const outDir = path.join(testHardeningRoot, 'reports', 'artifacts');

  fs.mkdirSync(outDir, { recursive: true });



  const env = { ...process.env };

  const api = spawnSync('npx', ['playwright', 'test', '-c', 'e2e/playwright.config.ts'], {
    cwd: testHardeningRoot,
    encoding: 'utf-8',
    shell: true,
    env
  });

  const web = spawnSync('npx', ['playwright', 'test', '-c', 'e2e/web/playwright.web.config.ts'], {
    cwd: testHardeningRoot,
    encoding: 'utf-8',
    shell: true,
    env
  });

  const ok = api.status === 0 && web.status === 0;

  const stderr = [api.stderr ?? '', web.stderr ?? ''].join('\n--- web ---\n').slice(-8000);

  const payload = {

    phase: 'e2e',

    ok,

    exitCode: ok ? 0 : (web.status ?? api.status ?? 1),

    stderr,

    at: new Date().toISOString()

  };

  fs.writeFileSync(path.join(outDir, 'phase_e2e.json'), JSON.stringify(payload, null, 2), 'utf-8');



  if (!payload.ok) {

    console.error('E2E failed', { apiExit: api.status, webExit: web.status, stderr: payload.stderr });

    process.exit(1);

  }

  console.log('E2E OK');

}



main();


