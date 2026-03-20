#!/usr/bin/env node

/**

 * Soak / sustained load against workflow engine is not automated in this repo.

 * Run extended tests in staging or use k6/Artillery against /api when ready.

 */

import fs from 'fs';

import path from 'path';

import { fileURLToPath } from 'url';



const __dirname = path.dirname(fileURLToPath(import.meta.url));

const root = path.join(__dirname, '..');

const outDir = path.join(root, 'reports', 'artifacts');

fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(

  path.join(outDir, 'soak_skipped.json'),

  JSON.stringify({ skipped: true, reason: 'soak harness not enabled; see chaos/soak-placeholder.mjs' }, null, 2),

  'utf-8'

);

console.log('soak-placeholder: recorded skip artifact');


