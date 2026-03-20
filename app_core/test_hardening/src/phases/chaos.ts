import { spawnSync } from 'child_process';

import fs from 'fs';

import path from 'path';

import { testHardeningRoot } from '../paths.js';



function main() {

  const chaosDir = path.join(testHardeningRoot, 'chaos');

  const outDir = path.join(testHardeningRoot, 'reports', 'artifacts');

  fs.mkdirSync(outDir, { recursive: true });



  const scripts = [
    'persistence-chaos.mjs',
    'persistence-readonly.mjs',
    'invalid-config.mjs',
    'process-kill-recovery.mjs',
    'postgres-outage-placeholder.mjs',
    'process-kill-placeholder.mjs',
    'soak-placeholder.mjs'
  ];



  const runs: { script: string; status: number; stderr: string }[] = [];

  for (const s of scripts) {

    const full = path.join(chaosDir, s);

    if (!fs.existsSync(full)) {

      runs.push({ script: s, status: 1, stderr: 'missing' });

      continue;

    }

    const r = spawnSync(process.execPath, [full], {
      cwd: testHardeningRoot,
      encoding: 'utf-8',
      shell: false,
      env: process.env
    });

    runs.push({ script: s, status: r.status ?? 1, stderr: (r.stderr ?? '').slice(-1500) });

  }



  const ok = runs.every((x) => x.status === 0);

  fs.writeFileSync(

    path.join(outDir, 'phase_chaos.json'),

    JSON.stringify({ phase: 'chaos', ok, runs, at: new Date().toISOString() }, null, 2),

    'utf-8'

  );



  if (!ok) {

    console.error('Chaos phase failed', runs);

    process.exit(1);

  }

  console.log('Chaos OK');

}



main();


