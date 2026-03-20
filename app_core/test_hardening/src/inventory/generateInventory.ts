import fs from 'fs';

import path from 'path';

import { repoRoot, testHardeningRoot } from '../paths.js';



type ComponentEntry = {

  id: string;

  kind: string;

  path: string;

  notes?: string;

};



function listFilesRecursive(dir: string, suffix: string, out: string[] = []): string[] {

  if (!fs.existsSync(dir)) return out;

  for (const name of fs.readdirSync(dir)) {

    const full = path.join(dir, name);

    const st = fs.statSync(full);

    if (st.isDirectory()) {

      if (name === 'node_modules' || name === 'dist' || name === '.git') continue;

      listFilesRecursive(full, suffix, out);

    } else if (full.endsWith(suffix)) {

      out.push(full);

    }

  }

  return out;

}



function main() {

  const backendRoutes = path.join(repoRoot, 'backend', 'src', 'routes');

  const routeFiles = fs.existsSync(backendRoutes)

    ? fs.readdirSync(backendRoutes).filter((f) => f.endsWith('.ts'))

    : [];



  const backendComponents: ComponentEntry[] = [

    { id: 'api-router', kind: 'router', path: 'backend/src/routes.ts' },

    { id: 'workflow-engine', kind: 'service', path: 'backend/src/engine/workflowEngine.ts' },

    { id: 'json-persistence', kind: 'persistence', path: 'backend/src/persistence/jsonPersistence.ts' },

    { id: 'sse-hub', kind: 'realtime', path: 'backend/src/realtime/sseHub.ts' },

    { id: 'agent-task-queue', kind: 'queue', path: 'backend/src/queue/agentTaskQueue.ts' },

    { id: 'cicd-mock', kind: 'integration', path: 'backend/src/cicd/mockPipelineProvider.ts' },

    { id: 'metrics-store', kind: 'observability', path: 'backend/src/observability/metricsStore.ts' }

  ];



  for (const f of routeFiles) {

    backendComponents.push({

      id: `route-${f.replace('.ts', '')}`,

      kind: 'route',

      path: `backend/src/routes/${f}`

    });

  }



  const mobileScreens = listFilesRecursive(path.join(repoRoot, 'mobile', 'src', 'screens'), '.tsx');

  const mobileComponents: ComponentEntry[] = [

    { id: 'mobile-app', kind: 'ui', path: 'mobile/src/App.tsx' },

    { id: 'mobile-api-client', kind: 'client', path: 'mobile/src/lib/api.ts' }

  ];

  for (const p of mobileScreens) {

    const rel = path.relative(repoRoot, p).split(path.sep).join('/');

    mobileComponents.push({

      id: `screen-${path.basename(p, '.tsx')}`,

      kind: 'screen',

      path: rel

    });

  }



  const inventory = {

    generatedAt: new Date().toISOString(),

    repoRoot: repoRoot.replace(/\\/g, '/'),

    backend: backendComponents,

    mobile: mobileComponents,

    docs: [

      { id: 'readme-root', path: 'README.md' },

      { id: 'build-prompt', path: 'BuildPrompt.md' },

      { id: 'backend-readme', path: 'backend/README.md', notes: 'may be missing; docs check flags' }

    ]

  };



  const outDir = path.join(testHardeningRoot, 'inventory');

  fs.mkdirSync(outDir, { recursive: true });

  fs.writeFileSync(path.join(outDir, 'COMPONENT_INVENTORY.json'), JSON.stringify(inventory, null, 2), 'utf-8');



  const criticalModules = [

    'blueprints',

    'workflow-engine',

    'admin',

    'stream',

    'json-persistence',

    'mobile-api-client',

    'dashboard'

  ];



  const matrix = {

    generatedAt: new Date().toISOString(),

    features: [

      {

        id: 'feat-blueprint-upload',

        name: 'Blueprint upload & job creation',

        type: 'workflow',

        criticality: 'P0',
        severity: 'P0',
        lastRun: null,

        moduleIds: ['route-blueprints', 'workflow-engine'],

        health: 'unknown',
        lastVerifiedCommit: null,
        testCoverage: 'integration',

        notes: 'Core orchestration path'

      },

      {

        id: 'feat-admin-control',

        name: 'Admin pause/resume/cancel/priority',

        type: 'route',

        criticality: 'P0',
        severity: 'P0',
        lastRun: null,

        moduleIds: ['route-admin'],

        health: 'unknown',
        lastVerifiedCommit: null,

        testCoverage: 'integration',

        notes: 'Header x-role; not production auth'

      },

      {

        id: 'feat-realtime-sse',

        name: 'SSE stream',

        type: 'realtime',

        criticality: 'P1',

        moduleIds: ['route-stream', 'sse-hub'],

        health: 'unknown',
        lastVerifiedCommit: null,
        testCoverage: 'integration',

        notes: ''

      },

      {

        id: 'feat-persistence',

        name: 'JSON state persistence',

        type: 'persistence',

        criticality: 'P0',
        severity: 'P0',
        lastRun: null,

        moduleIds: ['json-persistence'],

        health: 'unknown',
        lastVerifiedCommit: null,

        testCoverage: 'integration',

        notes: 'pg dependency unused; DB gap'

      },

      {

        id: 'feat-mobile-dashboard',

        name: 'Mobile Control Center UI',

        type: 'ui',

        criticality: 'P1',

        moduleIds: ['screen-DashboardScreen', 'mobile-api-client'],

        health: 'unknown',

        testCoverage: 'component+e2e',

        notes: ''

      },

      {

        id: 'feat-cicd',

        name: 'CI/CD pipeline integration',

        type: 'integration',

        criticality: 'P2',
        severity: 'P2',
        lastRun: null,

        moduleIds: ['cicd-mock'],

        health: 'unknown',
        lastVerifiedCommit: null,

        testCoverage: 'unit',

        notes: 'Mock provider only until real provider'

      }

    ],

    criticalModuleHints: criticalModules

  };



  fs.writeFileSync(path.join(outDir, 'FEATURE_INVENTORY_MATRIX.json'), JSON.stringify(matrix, null, 2), 'utf-8');

  console.log('Wrote inventory/', 'COMPONENT_INVENTORY.json', 'FEATURE_INVENTORY_MATRIX.json');

}



main();


