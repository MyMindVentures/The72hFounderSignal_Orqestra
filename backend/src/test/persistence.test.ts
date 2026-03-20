import fs from 'fs';

import path from 'path';

import { describe, it, expect } from 'vitest';

import { hydrateAll, persistAll, flushPersistTimer, schedulePersistAll, getStateDir } from '../persistence/jsonPersistence';

import { jobsStore } from '../stores/jobsStore';

import { resetAllStores } from '../stores/resetAllStores';



describe('jsonPersistence', () => {

  it('persistAll + hydrateAll round-trip', () => {

    const dir = getStateDir();

    expect(fs.existsSync(path.join(dir, 'jobs.json'))).toBe(false);



    jobsStore.add({

      id: 'j1',

      blueprintId: 'b1',

      lineNumber: 1,

      rawText: 't',

      normalizedText: 't',

      inferredType: 'planning',

      dependencies: [],

      priority: 1,

      environment: null,

      status: 'pending',

      createdAt: new Date().toISOString(),

      updatedAt: new Date().toISOString()

    });

    persistAll();

    expect(fs.readFileSync(path.join(dir, 'jobs.json'), 'utf-8')).toContain('j1');

    resetAllStores();

    hydrateAll();

    expect(jobsStore.getById('j1')).toBeDefined();

  });



  it('flushPersistTimer writes after schedulePersistAll', () => {

    schedulePersistAll();

    flushPersistTimer();

    const dir = getStateDir();

    expect(fs.existsSync(path.join(dir, 'jobs.json'))).toBe(true);

  });



  it('hydrateAll throws on corrupt JSON', () => {

    const dir = getStateDir();

    fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(path.join(dir, 'jobs.json'), '{not json', 'utf-8');

    expect(() => hydrateAll()).toThrow();

  });

});


