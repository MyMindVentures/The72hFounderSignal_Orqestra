import { agentTaskQueue } from '../queue/agentTaskQueue';

import { resetAllStores } from '../stores/resetAllStores';

import { hydrateAll } from '../persistence/jsonPersistence';



describe('agentTaskQueue', () => {

  it('enqueue dequeue reset', () => {

    resetAllStores();

    hydrateAll();

    agentTaskQueue.reset();

    agentTaskQueue.enqueue('architecture', 't1');

    agentTaskQueue.enqueue('architecture', 't2');

    expect(agentTaskQueue.getDepth('architecture')).toBe(2);

    expect(agentTaskQueue.dequeue('architecture')).toBe('t1');

    expect(agentTaskQueue.dequeue('architecture')).toBe('t2');

    agentTaskQueue.reset();

    expect(agentTaskQueue.getDepth('architecture')).toBe(0);

  });

});


