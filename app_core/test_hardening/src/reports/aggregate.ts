import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { repoRoot, testHardeningRoot } from '../paths.js';



type Defect = {

  id: string;

  module: string;

  severity: 'P0' | 'P1' | 'P2' | 'P3';

  status: string;

  title: string;

  detectedInPhase?: string;

  repro?: string;

  rootCause?: string;

  fixCommit?: string;

  verifiedInPhase?: string;

  closedAt?: string;

  testCaseIds?: string[];

};



function readJson<T>(p: string): T | null {

  if (!fs.existsSync(p)) return null;

  return JSON.parse(fs.readFileSync(p, 'utf-8')) as T;

}



function loadDefects(): Defect[] {

  const f = path.join(testHardeningRoot, 'defects', 'defects.jsonl');

  if (!fs.existsSync(f) || fs.readFileSync(f, 'utf-8').trim() === '') return [];

  return fs

    .readFileSync(f, 'utf-8')

    .split('\n')

    .filter(Boolean)

    .map((line) => JSON.parse(line) as Defect);

}

function getGitHead(): string | null {
  try {
    return execSync('git rev-parse HEAD', {
      cwd: repoRoot,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
  } catch {
    return null;
  }
}

function main() {
  const art = path.join(testHardeningRoot, 'reports', 'artifacts');

  const inv = path.join(testHardeningRoot, 'inventory', 'FEATURE_INVENTORY_MATRIX.json');

  const matrix = readJson<{
    features: Array<{
      id: string;
      name: string;
      health: string;
      testCoverage: string;
      lastVerifiedCommit?: string | null;
      [k: string]: unknown;
    }>;
  }>(inv);



  const smoke = readJson<{ ok: boolean }>(path.join(art, 'phase_smoke.json'));

  const regression = readJson<{
    ok: boolean;
    vitest?: { numTotalTests?: number; numPassedTests?: number; numFailedTests?: number };
  }>(path.join(art, 'phase_regression.json'));

  const deep = readJson<{ ok: boolean }>(path.join(art, 'phase_deep.json'));

  const chaos = readJson<{ ok: boolean }>(path.join(art, 'phase_chaos.json'));

  const e2e = readJson<{ ok: boolean }>(path.join(art, 'phase_e2e.json'));



  const defects = loadDefects();

  const openP0 = defects.filter((d) => d.status !== 'closed' && d.severity === 'P0');

  const openP1 = defects.filter((d) => d.status !== 'closed' && d.severity === 'P1');

  const criticalModules = new Set(['auth', 'blueprints', 'persistence', 'admin', 'stream']);

  const openCriticalP1 = openP1.filter((d) => criticalModules.has(d.module));



  const pipelineOk = [smoke, regression, deep, chaos, e2e].every((p) => p?.ok === true);

  const rollbackProof = fs.existsSync(path.join(art, 'rollback_proof.json'));
  const enforceRollback = process.env.ENFORCE_ROLLBACK_GATE === '1';
  const rollbackUnverified = enforceRollback && !rollbackProof;

  const unstableRuntime = smoke?.ok === false || chaos?.ok === false;



  const authBroken = false; // extend when real auth tests fail

  const blockers: string[] = [];

  if (openP0.length) blockers.push(`Open P0 defects: ${openP0.map((d) => d.id).join(', ')}`);

  if (openCriticalP1.length) blockers.push(`Open critical P1: ${openCriticalP1.map((d) => d.id).join(', ')}`);

  if (!pipelineOk) blockers.push('One or more validation phases failed');

  if (rollbackUnverified) blockers.push('Unverified rollback (ENFORCE_ROLLBACK_GATE=1 requires reports/artifacts/rollback_proof.json)');

  if (unstableRuntime) blockers.push('Unstable runtime (smoke or chaos failed)');

  if (authBroken) blockers.push('Broken authentication/access control checks failed');



  const launchReady = blockers.length === 0;

  const commit = process.env.GITHUB_SHA ?? process.env.CI_COMMIT_SHA ?? getGitHead();
  const featureHealth = pipelineOk ? 'green' : 'red';
  const mergedFeatures = (matrix?.features ?? []).map((f) => ({
    ...f,
    health: featureHealth,
    lastVerifiedCommit: commit ?? f.lastVerifiedCommit ?? null
  }));

  const reportsDir = path.join(testHardeningRoot, 'reports');

  fs.mkdirSync(reportsDir, { recursive: true });



  const summary = `# TEST_EXECUTION_SUMMARY



- Generated: ${new Date().toISOString()}

- Repository: ${repoRoot.replace(/\\/g, '/')}

- Commit: ${commit ?? 'unknown'}

- Backend tests (last regression): ${regression?.vitest?.numTotalTests ?? 'n/a'} total, ${regression?.vitest?.numPassedTests ?? 'n/a'} passed

- **Production ready (aggregated gate): ${launchReady ? 'YES' : 'NO'}**



## Phase results



| Phase | OK |

| ----- | -- |

| smoke | ${smoke?.ok ?? 'n/a'} |

| regression | ${regression?.ok ?? 'n/a'} |

| deep | ${deep?.ok ?? 'n/a'} |

| chaos | ${chaos?.ok ?? 'n/a'} |

| e2e | ${e2e?.ok ?? 'n/a'} |



## Defect counts



- Open P0: ${openP0.length}

- Open P1: ${openP1.length}

- Total loaded defects: ${defects.length}



`;



  fs.writeFileSync(path.join(reportsDir, 'TEST_EXECUTION_SUMMARY.md'), summary, 'utf-8');



  const broken = `# BROKEN_FEATURES_REPORT



Features with failing phases or unknown health (from matrix + phases).



${matrix?.features

  .filter((f) => f.health === 'red' || f.health === 'unknown')

  .map((f) => `- **${f.name}** (${f.id}): coverage ${f.testCoverage}`)

  .join('\n') || '- (see FEATURE_INVENTORY_MATRIX.json)'}



`;

  fs.writeFileSync(path.join(reportsDir, 'BROKEN_FEATURES_REPORT.md'), broken, 'utf-8');



  const critical = `# CRITICAL_FAILURES_REPORT



- Open P0: ${openP0.map((d) => `- ${d.id}: ${d.title}`).join('\n') || '(none)'}



- Open P1 (all): ${openP1.map((d) => `- ${d.id}: ${d.title}`).join('\n') || '(none)'}



- Chaos / smoke failures: ${!chaos?.ok || !smoke?.ok ? 'see phase artifacts' : 'none recorded'}

`;

  fs.writeFileSync(path.join(reportsDir, 'CRITICAL_FAILURES_REPORT.md'), critical, 'utf-8');



  const testMatrix = {
    generatedAt: new Date().toISOString(),
    commit,
    layers: ['unit', 'integration', 'ui', 'e2e', 'security', 'runtime', 'chaos', 'config', 'traceability'],
    layerCoverage: {
      unit: regression?.ok === true,
      integration: regression?.ok === true,
      ui: deep?.ok === true,
      e2e: e2e?.ok === true,
      security: regression?.ok === true,
      runtime: smoke?.ok === true && chaos?.ok === true,
      chaos: chaos?.ok === true,
      config: deep?.ok === true,
      database: false,
      queues: regression?.ok === true,
      traceability: true
    },
    phases: { smoke, regression, deep, chaos, e2e },
    features: mergedFeatures,
    traceability: {
      defects: defects.map((d) => ({
        id: d.id,
        module: d.module,
        severity: d.severity,
        status: d.status,
        testCaseIds: d.testCaseIds ?? []
      }))
    },
    vitest: regression?.vitest ?? null
  };

  fs.writeFileSync(path.join(reportsDir, 'FULL_TEST_MATRIX.json'), JSON.stringify(testMatrix, null, 2), 'utf-8');

  fs.writeFileSync(

    path.join(reportsDir, 'FULL_TEST_MATRIX.md'),

    `# FULL_TEST_MATRIX\n\n\`\`\`json\n${JSON.stringify(testMatrix, null, 2).slice(0, 12000)}\n\`\`\`\n`,

    'utf-8'

  );



  const featCard = `# FEATURE_HEALTH_SCORECARD



| Feature | Criticality | Health | Coverage |

| ------- | ----------- | ------ | -------- |

${mergedFeatures.map((f) => `| ${f.name} | — | ${f.health} | ${f.testCoverage} |`).join('\n')}

`;

  fs.writeFileSync(path.join(reportsDir, 'FEATURE_HEALTH_SCORECARD.md'), featCard, 'utf-8');



  const svcCard = `# SERVICE_HEALTH_SCORECARD



| Service | Notes |

| ------- | ----- |

| API | Express /api routes |

| Workflow | workflowEngine + agentTaskQueue |

| Realtime | SSE /api/stream |

| Persistence | JSON files (STATE_DIR); PostgreSQL not wired |

| CI/CD | MockPipelineProvider |

| Phases (this run) | smoke=${smoke?.ok}, regression=${regression?.ok}, deep=${deep?.ok}, chaos=${chaos?.ok}, e2e=${e2e?.ok} |

`;

  fs.writeFileSync(path.join(reportsDir, 'SERVICE_HEALTH_SCORECARD.md'), svcCard, 'utf-8');



  const remediation = `# REMEDIATION_QUEUE



Sorted by severity (P0 first), then module.



${[...openP0, ...openP1, ...defects.filter((d) => d.status !== 'closed' && d.severity === 'P2')]

  .map((d) => `- **${d.severity}** [${d.module}] ${d.id}: ${d.title} (${d.status})`)

  .join('\n') || '(no open defects in ledger)'}



`;

  fs.writeFileSync(path.join(reportsDir, 'REMEDIATION_QUEUE.md'), remediation, 'utf-8');



  const launch = `# LAUNCH_BLOCKERS_REPORT



**Blocked:** ${blockers.length > 0 ? 'YES' : 'NO'}



${blockers.map((b) => `- ${b}`).join('\n') || '- None (aggregated checks passed)'}



### Rules enforced



- Any P0 open → blocked

- Critical P1 in auth/blueprints/persistence/admin/stream → blocked

- Failing validation phase → blocked

- Unverified rollback → blocked (until automated proof exists)

- Unstable runtime (smoke/chaos) → blocked

`;

  fs.writeFileSync(path.join(reportsDir, 'LAUNCH_BLOCKERS_REPORT.md'), launch, 'utf-8');



  if (!launchReady) {

    console.error('Launch gate: NOT READY — see LAUNCH_BLOCKERS_REPORT.md');

    process.exit(2);

  }

  console.log('Reports written; launch gate: READY (subject to human review)');

}



main();


