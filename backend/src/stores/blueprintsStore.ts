import { Blueprint } from '../models';

const blueprints = new Map<string, Blueprint>();

export const blueprintsStore = {
  add(blueprint: Blueprint) {
    blueprints.set(blueprint.id, blueprint);
  },
  update(blueprint: Blueprint) {
    blueprints.set(blueprint.id, blueprint);
  },
  getById(id: string): Blueprint | undefined {
    return blueprints.get(id);
  },
  getAll(): Blueprint[] {
    return Array.from(blueprints.values());
  }
};

export { blueprints };

