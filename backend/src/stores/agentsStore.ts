import { AgentInstance } from '../models';

const agents = new Map<string, AgentInstance>();

export const agentsStore = {
  upsert(agent: AgentInstance) {
    agents.set(agent.id, agent);
  },
  getAll(): AgentInstance[] {
    return Array.from(agents.values());
  },
  getById(id: string): AgentInstance | undefined {
    return agents.get(id);
  },
  update(agentId: string, patch: Partial<AgentInstance>) {
    const current = agents.get(agentId);
    if (!current) return;
    agents.set(agentId, { ...current, ...patch });
  }
};

export { agents };

