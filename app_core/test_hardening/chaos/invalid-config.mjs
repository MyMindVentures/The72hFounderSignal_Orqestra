#!/usr/bin/env node

/**

 * Invalid PORT / env: node should fail to listen when PORT is not a number (behavior depends on host).

 * We only assert that Number('abc') is NaN as a stand-in for misconfiguration detection.

 */

const port = Number(process.env.CHAOS_BAD_PORT ?? 'not-a-number');

if (Number.isFinite(port)) {

  console.error('Expected invalid port');

  process.exit(1);

}

console.log('invalid-config: non-numeric PORT detected (ok)');


