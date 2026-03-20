import fs from 'fs';

import path from 'path';

import { testHardeningRoot } from '../paths.js';



type Defect = {

  id: string;

  module: string;

  severity: string;

  status: string;

  title: string;

};



function main() {

  const f = path.join(testHardeningRoot, 'defects', 'defects.jsonl');

  if (!fs.existsSync(f) || fs.readFileSync(f, 'utf-8').trim() === '') {

    console.log('No defects in ledger');

    return;

  }

  const lines = fs.readFileSync(f, 'utf-8').split('\n').filter(Boolean);

  for (const line of lines) {

    const d = JSON.parse(line) as Defect;

    if (!d.id || !d.module || !d.severity || !d.status || !d.title) {

      console.error('Invalid defect line:', line);

      process.exit(1);

    }

    if (d.status === 'closed' && !d.verifiedInPhase) {
      console.error(`Defect ${d.id}: closed status requires verifiedInPhase (re-test before closure)`);
      process.exit(1);
    }

  }

  console.log('Defect ledger OK:', lines.length, 'entries');

}



main();


