import fs from 'fs';

import path from 'path';

import os from 'os';

import { afterEach, beforeEach } from 'vitest';

import { resetAllStores } from '../stores/resetAllStores';

import { hydrateAll } from '../persistence/jsonPersistence';



let prevStateDir: string | undefined;

let tmpDir: string | undefined;



beforeEach(() => {

  prevStateDir = process.env.STATE_DIR;

  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ap-backend-test-'));

  process.env.STATE_DIR = tmpDir;

  resetAllStores();

  hydrateAll();

});



afterEach(() => {

  if (tmpDir && fs.existsSync(tmpDir)) {

    fs.rmSync(tmpDir, { recursive: true, force: true });

  }

  tmpDir = undefined;

  if (prevStateDir === undefined) {

    delete process.env.STATE_DIR;

  } else {

    process.env.STATE_DIR = prevStateDir;

  }

  prevStateDir = undefined;

});


