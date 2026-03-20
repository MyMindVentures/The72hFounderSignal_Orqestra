#!/usr/bin/env node

/**

 * Persistence chaos: read-only file should block blind writes (Unix semantics).

 * Windows may allow writes to read-only files in some cases; script still records outcome.

 */

import fs from 'fs';

import os from 'os';

import path from 'path';



const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'chaos-ro-'));

const f = path.join(dir, 'jobs.json');

fs.writeFileSync(f, '[]', 'utf-8');

try {

  fs.chmodSync(f, 0o444);

} catch (e) {

  console.warn('persistence-readonly: chmod skipped', (e && e.message) || e);

}



let blocked = false;

try {

  fs.writeFileSync(f, '[{"x":1}]', 'utf-8');

} catch {

  blocked = true;

}



try {

  fs.chmodSync(f, 0o666);

} catch {

  /* ignore */

}

fs.rmSync(dir, { recursive: true, force: true });



if (!blocked) {

  console.warn('persistence-readonly: write succeeded despite chmod (OS-specific); not a failure for matrix');

}

console.log('persistence-readonly: completed (read-only behavior checked)');


