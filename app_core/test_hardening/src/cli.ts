import { spawnSync } from 'child_process';

import fs from 'fs';

import path from 'path';

import { repoRoot, testHardeningRoot } from './paths.js';



const allowContinue = process.env.ALLOW_PHASE_CONTINUE === '1';



function runPhase(name: string, cmd: string, args: string[]) {

  const exe = cmd === 'npx' ? 'npx' : cmd;

  const r = spawnSync(exe, args, {
    cwd: testHardeningRoot,
    stdio: 'inherit',
    shell: true,
    env: process.env
  });

  const ok = r.status === 0;

  if (!ok && !allowContinue) {

    console.error(`Phase ${name} failed`);

    process.exit(r.status ?? 1);

  }

  if (!ok && allowContinue) {

    console.warn(`Phase ${name} failed (continuing due to ALLOW_PHASE_CONTINUE=1)`);

  }

  return ok;

}



function main() {

  const cmd = process.argv[2];

  if (cmd !== 'verify') {

    console.error('Usage: tsx src/cli.ts verify');

    process.exit(1);

  }



  const backendRoot = path.join(repoRoot, 'backend');

  const build = spawnSync('npm', ['run', 'build'], {
    cwd: backendRoot,
    stdio: 'inherit',
    shell: true
  });

  if (build.status !== 0) {
    console.error('Backend build failed', build.error ?? '', build.stderr?.toString?.() ?? '');
    process.exit(1);
  }



  runPhase('inventory', 'npx', ['tsx', 'src/inventory/generateInventory.ts']);

  runPhase('deps', 'npx', ['tsx', 'src/inventory/depsAudit.ts']);

  runPhase('smoke', 'npx', ['tsx', 'src/phases/smoke.ts']);

  runPhase('regression', 'npx', ['tsx', 'src/phases/regression.ts']);

  runPhase('deep', 'npx', ['tsx', 'src/phases/deep.ts']);

  runPhase('chaos', 'npx', ['tsx', 'src/phases/chaos.ts']);

  runPhase('e2e', 'npx', ['tsx', 'src/phases/e2e.ts']);



  const agg = spawnSync('npx', ['tsx', 'src/reports/aggregate.ts'], {
    cwd: testHardeningRoot,
    stdio: 'inherit',
    shell: true
  });

  if (agg.status !== 0) process.exit(agg.status ?? 1);

}



main();


