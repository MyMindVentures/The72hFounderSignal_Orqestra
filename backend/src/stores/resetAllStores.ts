import { agentTaskQueue } from '../queue/agentTaskQueue';

import { metricsStore } from '../observability/metricsStore';

import { resetSseClients } from '../realtime/sseHub';

import { resetEnvironmentsForTests } from './environmentsStore';

import { jobs } from './jobsStore';

import { tasks } from './tasksStore';

import { artifacts } from './artifactsStore';

import { agents } from './agentsStore';

import { auditEvents } from './auditStore';

import { runs } from './runsStore';

import { blueprints } from './blueprintsStore';

import { resetProjectsMap } from '../routes/projects';



/**

 * Clears all in-memory stores used by the API and workflow engine.

 * Call before integration tests; set STATE_DIR to a temp directory before hydrateAll.

 */

export function resetAllStores() {

  jobs.clear();

  tasks.clear();

  artifacts.clear();

  agents.clear();

  auditEvents.clear();

  runs.clear();

  blueprints.clear();

  metricsStore.reset();

  agentTaskQueue.reset();

  resetSseClients();

  resetEnvironmentsForTests();

  resetProjectsMap();

}


