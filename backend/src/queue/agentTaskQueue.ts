import { AgentType } from '../models';

const queues: Record<AgentType, string[]> = {
  architecture: [],
  coding: [],
  testing: [],
  debugging: [],
  devops: [],
  security: [],
  documentation: [],
  release: []
};

export const agentTaskQueue = {
  enqueue(agentType: AgentType, taskId: string) {
    queues[agentType].push(taskId);
  },
  dequeue(agentType: AgentType): string | undefined {
    return queues[agentType].shift();
  },
  getDepth(agentType: AgentType): number {
    return queues[agentType].length;
  },
  reset() {
    (Object.keys(queues) as AgentType[]).forEach((k) => (queues[k] = []));
  }
};

