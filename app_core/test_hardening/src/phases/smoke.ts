import { spawn } from 'child_process';

import fs from 'fs';

import http from 'http';

import os from 'os';

import path from 'path';

import { repoRoot, testHardeningRoot } from '../paths.js';



function waitHealth(port: number, timeoutMs: number): Promise<void> {

  const started = Date.now();

  return new Promise((resolve, reject) => {

    const tryOnce = () => {

      const req = http.get(`http://127.0.0.1:${port}/api/health`, (res) => {

        res.resume();

        if (res.statusCode === 200) resolve();

        else if (Date.now() - started > timeoutMs) reject(new Error(`health status ${res.statusCode}`));

        else setTimeout(tryOnce, 200);

      });

      req.on('error', () => {

        if (Date.now() - started > timeoutMs) reject(new Error('health timeout'));

        else setTimeout(tryOnce, 200);

      });

    };

    tryOnce();

  });

}



function fetchSseHello(port: number): Promise<string> {

  return new Promise((resolve, reject) => {

    const t = setTimeout(() => reject(new Error('sse timeout')), 5000);

    http.get(`http://127.0.0.1:${port}/api/stream`, (res) => {

      let buf = '';

      res.on('data', (c: Buffer) => {

        buf += c.toString();

        if (buf.includes('hello')) {

          clearTimeout(t);

          res.destroy();

          resolve(buf);

        }

      });

      res.on('error', (e) => {

        clearTimeout(t);

        reject(e);

      });

    }).on('error', (e) => {

      clearTimeout(t);

      reject(e);

    });

  });

}



async function main() {

  const backendRoot = path.join(repoRoot, 'backend');

  const distIndex = path.join(backendRoot, 'dist', 'index.js');

  if (!fs.existsSync(distIndex)) {

    console.error('Smoke requires backend build: cd backend && npm run build');

    process.exit(1);

  }



  const port = 4100 + Math.floor(Math.random() * 200);

  const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'smoke-state-'));

  const outDir = path.join(testHardeningRoot, 'reports', 'artifacts');

  fs.mkdirSync(outDir, { recursive: true });



  const proc = spawn(process.execPath, [distIndex], {

    cwd: backendRoot,

    env: { ...process.env, PORT: String(port), STATE_DIR: stateDir, NODE_ENV: 'production' },

    stdio: 'pipe'

  });



  let stderr = '';

  proc.stderr?.on('data', (d) => {

    stderr += d.toString();

  });



  try {

    await waitHealth(port, 15000);

    const sse = await fetchSseHello(port);

    if (!sse.includes('hello')) throw new Error('SSE hello missing');



    const result = {

      phase: 'smoke',

      ok: true,

      port,

      at: new Date().toISOString(),

      checks: ['health', 'sse_hello']

    };

    fs.writeFileSync(path.join(outDir, 'phase_smoke.json'), JSON.stringify(result, null, 2), 'utf-8');

    console.log('Smoke OK', result);

  } catch (e) {

    const result = {

      phase: 'smoke',

      ok: false,

      error: e instanceof Error ? e.message : String(e),

      stderr: stderr.slice(-4000)

    };

    fs.writeFileSync(path.join(outDir, 'phase_smoke.json'), JSON.stringify(result, null, 2), 'utf-8');

    console.error('Smoke failed', result);

    process.exitCode = 1;

  } finally {

    proc.kill('SIGTERM');

    try {

      fs.rmSync(stateDir, { recursive: true, force: true });

    } catch {

      /* ignore */

    }

  }

}



main().catch((e) => {

  console.error(e);

  process.exit(1);

});


