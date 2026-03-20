import path from 'path';

import { fileURLToPath } from 'url';

import { defineConfig } from '@playwright/test';



const here = path.dirname(fileURLToPath(import.meta.url));

const repoRoot = path.join(here, '..', '..', '..');

const backendDist = path.join(repoRoot, 'backend', 'dist', 'index.js');



const ciStrict = ['1', 'true', 'yes'].includes(String(process.env.CI ?? '').toLowerCase());

const reuseServer = !ciStrict;



/** Avoid colliding with a dev backend on 4000 when CI forces a fresh server. */
const e2ePort = process.env.E2E_PORT ?? '4020';

const backendBase = process.env.BACKEND_URL ?? `http://127.0.0.1:${e2ePort}`;



export default defineConfig({

  testDir: path.join(here),

  testIgnore: ['**/web/**'],

  timeout: 60_000,

  use: {

    baseURL: backendBase,

    trace: 'on-first-retry'

  },

  webServer: {
    command: `node "${backendDist}"`,
    cwd: path.join(repoRoot, 'backend'),
    env: {
      ...process.env,
      PORT: e2ePort,
      NODE_ENV: 'test',
      STATE_DIR: process.env.E2E_STATE_DIR ?? path.join(repoRoot, 'backend', '.state-e2e')
    },
    url: `${backendBase.replace(/\/$/, '')}/api/health`,
    reuseExistingServer: reuseServer,
    timeout: 120_000
  }

});


