import { Router } from 'express';

import { readFileSync } from 'fs';

import { join } from 'path';



export const healthRouter = Router();



healthRouter.get('/', (_req, res) => {

  let version = '0.0.0';

  try {

    const pkg = JSON.parse(readFileSync(join(__dirname, '../../package.json'), 'utf-8')) as { version?: string };

    version = pkg.version ?? version;

  } catch {

    // ignore

  }

  res.json({

    ok: true,

    service: 'autonomous-platform-backend',

    version,

    commit: process.env.GIT_COMMIT ?? process.env.GITHUB_SHA ?? null,

    timestamp: new Date().toISOString()

  });

});


