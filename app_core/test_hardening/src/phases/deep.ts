import { spawnSync } from 'child_process';

import fs from 'fs';

import path from 'path';

import { repoRoot, testHardeningRoot } from '../paths.js';



function main() {

  const outDir = path.join(testHardeningRoot, 'reports', 'artifacts');

  fs.mkdirSync(outDir, { recursive: true });



  const docs = spawnSync('npx', ['tsx', 'src/inventory/docsConsistency.ts'], {
    cwd: testHardeningRoot,
    encoding: 'utf-8',
    shell: true,
    env: process.env
  });

  const deps = spawnSync('npx', ['tsx', 'src/inventory/depsAudit.ts'], {
    cwd: testHardeningRoot,
    encoding: 'utf-8',
    shell: true,
    env: process.env
  });



  const mobileRoot = path.join(repoRoot, 'mobile');
  const mobileTest = spawnSync('npm', ['test'], {
    cwd: mobileRoot,
    encoding: 'utf-8',
    shell: true
  });

  const ok = docs.status === 0 && deps.status === 0 && mobileTest.status === 0;

  const payload = {
    phase: 'deep',
    ok,
    docs: { status: docs.status, stderr: (docs.stderr ?? '').slice(-2000) },
    deps: { status: deps.status, stderr: (deps.stderr ?? '').slice(-2000) },
    mobileTests: { status: mobileTest.status, stderr: (mobileTest.stderr ?? '').slice(-2000) },

    at: new Date().toISOString()

  };

  fs.writeFileSync(path.join(outDir, 'phase_deep.json'), JSON.stringify(payload, null, 2), 'utf-8');



  if (!ok) {

    console.error('Deep validation failed', payload);

    process.exit(1);

  }

  console.log('Deep validation OK');

}



main();


