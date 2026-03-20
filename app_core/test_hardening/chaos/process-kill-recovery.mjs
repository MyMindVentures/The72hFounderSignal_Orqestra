#!/usr/bin/env node

/**

 * API failure / crash recovery: restart backend and verify persisted blueprint state reloads.

 */

import { spawn } from 'child_process';

import fs from 'fs';

import http from 'http';

import os from 'os';

import path from 'path';

import { fileURLToPath } from 'url';



const __dirname = path.dirname(fileURLToPath(import.meta.url));

const repoRoot = path.join(__dirname, '..', '..', '..');

const backendRoot = path.join(repoRoot, 'backend');

const distIndex = path.join(backendRoot, 'dist', 'index.js');



if (!fs.existsSync(distIndex)) {

  console.error('Run `cd backend && npm run build` before chaos');

  process.exit(1);

}



function req(port, method, p, body) {

  return new Promise((resolve, reject) => {

    const data = body ? JSON.stringify(body) : null;

    const r = http.request(

      { hostname: '127.0.0.1', port, path: p, method, headers: { 'Content-Type': 'application/json' } },

      (res) => {

        let buf = '';

        res.on('data', (c) => (buf += c));

        res.on('end', () => {

          try {

            resolve({ status: res.statusCode ?? 0, body: buf ? JSON.parse(buf) : null });

          } catch {

            resolve({ status: res.statusCode ?? 0, body: buf });

          }

        });

      }

    );

    r.on('error', reject);

    if (data) r.write(data);

    r.end();

  });

}



function killAndWait(proc) {

  return new Promise((resolve) => {

    const done = () => resolve();

    const t = setTimeout(done, 8000);

    proc.once('exit', () => {

      clearTimeout(t);

      done();

    });

    try {

      proc.kill('SIGTERM');

    } catch {

      clearTimeout(t);

      done();

    }

  });

}



function waitHealth(port, ms = 25000) {

  const t0 = Date.now();

  return new Promise((resolve, reject) => {

    const tick = () => {

      req(port, 'GET', '/api/health')

        .then((x) => {

          if (x.status === 200) resolve();

          else if (Date.now() - t0 > ms) reject(new Error('health timeout'));

          else setTimeout(tick, 150);

        })

        .catch(() => {

          if (Date.now() - t0 > ms) reject(new Error('health timeout'));

          else setTimeout(tick, 150);

        });

    };

    tick();

  });

}



async function main() {

  const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chaos-pkr-'));

  const port = 4300 + Math.floor(Math.random() * 150);



  let child = spawn(process.execPath, [distIndex], {

    cwd: backendRoot,

    env: { ...process.env, PORT: String(port), STATE_DIR: stateDir, NODE_ENV: 'production' },

    stdio: 'ignore'

  });



  try {

    await waitHealth(port);

    const pr = await req(port, 'POST', '/api/projects', { name: 'ChaosProj' });

    if (pr.status !== 201) throw new Error('project ' + pr.status);

    const pid = pr.body.project.id;

    const br = await req(port, 'POST', '/api/blueprints', {

      projectId: pid,

      name: 'ChaosBP',

      rawText: 'plan architecture'

    });

    if (br.status !== 201) throw new Error('blueprint ' + br.status);

    const bid = br.body.blueprint.id;

    await new Promise((r) => setTimeout(r, 1200));

    await killAndWait(child);



    child = spawn(process.execPath, [distIndex], {

      cwd: backendRoot,

      env: { ...process.env, PORT: String(port), STATE_DIR: stateDir, NODE_ENV: 'production' },

      stdio: 'ignore'

    });

    await waitHealth(port);



    const list = await req(port, 'GET', '/api/blueprints');

    const found = list.body?.blueprints?.some((b) => b.id === bid);

    if (!found) throw new Error('blueprint not found after restart');



    console.log('process-kill-recovery: persistence across restart OK');

  } finally {

    await killAndWait(child);

    try {

      fs.rmSync(stateDir, { recursive: true, force: true });

    } catch {

      /* ignore */

    }

  }

}



main().catch((e) => {

  console.error('process-kill-recovery:', e);

  process.exit(1);

});


