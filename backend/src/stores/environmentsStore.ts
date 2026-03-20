import { Environment } from '../models';

const environments = new Map<string, Environment>();

export function resetEnvironmentsForTests() {
  environments.clear();
  seedDefaultEnvironments();
}

export function seedDefaultEnvironments() {
  if (environments.size > 0) return;
  const now = new Date().toISOString();
  // Note: secretsRef is a placeholder; in production use a secrets manager.
  const make = (id: string, name: string, isolationId: string, secretsRef: string, deploymentTargets: string[]) =>
    ({
      id,
      name,
      isolationId,
      allowedActions: ['build', 'test', 'deploy', 'rollback'],
      deploymentTargets,
      secretsRef
    }) as Environment;

  environments.set('dev', make('dev', 'Development', 'iso-dev-1', 'vault://dev/secrets', ['dev-cluster']));
  environments.set('stage', make('stage', 'Staging', 'iso-stage-1', 'vault://stage/secrets', ['stage-cluster']));
  environments.set('prod', make('prod', 'Production', 'iso-prod-1', 'vault://prod/secrets', ['prod-cluster']));
  void now;
}

export const environmentsStore = {
  add(env: Environment) {
    environments.set(env.id, env);
  },
  update(env: Environment) {
    environments.set(env.id, env);
  },
  getAll(): Environment[] {
    return Array.from(environments.values());
  },
  getById(id: string): Environment | undefined {
    return environments.get(id);
  }
};

export { environments };

