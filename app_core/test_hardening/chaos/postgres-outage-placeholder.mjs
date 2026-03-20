#!/usr/bin/env node

/**

 * Postgres is not wired (see deps audit). When `pg` is integrated, stop the `postgres`

 * compose service and rerun persistence/API checks. Exit 0 = scenario acknowledged.

 */

console.log('postgres-outage-placeholder: no Postgres in runtime — see docker-compose.yml profile `db`');


