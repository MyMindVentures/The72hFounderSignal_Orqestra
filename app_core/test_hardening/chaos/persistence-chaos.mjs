#!/usr/bin/env node

/**

 * Persistence chaos: corrupt JSON must not parse silently (same class of failure as hydrateAll).

 */

import fs from 'fs';

import os from 'os';

import path from 'path';



const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'chaos-persist-'));

const f = path.join(dir, 'jobs.json');

fs.writeFileSync(f, '{not-json', 'utf-8');

try {

  JSON.parse(fs.readFileSync(f, 'utf-8'));

  console.error('Expected JSON.parse to throw');

  process.exit(1);

} catch {

  console.log('persistence-chaos: corrupt JSON rejected (ok)');

} finally {

  fs.rmSync(dir, { recursive: true, force: true });

}


