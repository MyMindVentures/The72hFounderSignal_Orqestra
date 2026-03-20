import { spawnSync } from 'child_process';

import fs from 'fs';

import path from 'path';

import { repoRoot, testHardeningRoot } from '../paths.js';

function writeJunitFromVitest(
  vit: { numTotalTests?: number; numPassedTests?: number; numFailedTests?: number; success?: boolean },
  outFile: string
) {
  const tests = vit.numTotalTests ?? 0;
  const failures = vit.numFailedTests ?? 0;
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites name="vitest" tests="${tests}" failures="${failures}" errors="0" time="0">
  <testsuite name="backend" tests="${tests}" failures="${failures}" errors="0" time="0">
    <properties />
  </testsuite>
</testsuites>
`;
  fs.writeFileSync(outFile, xml, 'utf-8');
}

function main() {

  const backendRoot = path.join(repoRoot, 'backend');

  const outDir = path.join(testHardeningRoot, 'reports', 'artifacts');

  fs.mkdirSync(outDir, { recursive: true });



  const r = spawnSync('npm', ['test'], {
    cwd: backendRoot,
    encoding: 'utf-8',
    shell: true,
    env: { ...process.env, NODE_ENV: 'test' }
  });

  const vitestPath = path.join(backendRoot, 'reports', 'vitest-results.json');
  let vitestSummary: { numTotalTests?: number; numPassedTests?: number; numFailedTests?: number } | null = null;
  if (fs.existsSync(vitestPath)) {
    try {
      const vit = JSON.parse(fs.readFileSync(vitestPath, 'utf-8')) as {
        numTotalTests?: number;
        numPassedTests?: number;
        numFailedTests?: number;
      };
      vitestSummary = {
        numTotalTests: vit.numTotalTests,
        numPassedTests: vit.numPassedTests,
        numFailedTests: vit.numFailedTests
      };
      fs.copyFileSync(vitestPath, path.join(outDir, 'vitest-results.json'));
      writeJunitFromVitest(vit, path.join(outDir, 'junit.xml'));
    } catch {
      /* ignore parse */
    }
  }

  const payload = {
    phase: 'regression',
    ok: r.status === 0,
    exitCode: r.status,
    vitest: vitestSummary,
    stdout: (r.stdout ?? '').slice(-8000),
    stderr: (r.stderr ?? '').slice(-8000),
    at: new Date().toISOString()
  };

  fs.writeFileSync(path.join(outDir, 'phase_regression.json'), JSON.stringify(payload, null, 2), 'utf-8');

  if (!payload.ok) {

    console.error('Regression failed', payload.stderr || payload.stdout);

    process.exit(1);

  }

  console.log('Regression OK');

}



main();


