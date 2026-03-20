type MetricKey =
  | 'jobsCompleted'
  | 'jobsFailed'
  | 'tasksCompleted'
  | 'tasksFailed'
  | 'phaseRetries'
  | 'tasksEnqueued';

const metrics: Record<MetricKey, number> = {
  jobsCompleted: 0,
  jobsFailed: 0,
  tasksCompleted: 0,
  tasksFailed: 0,
  phaseRetries: 0,
  tasksEnqueued: 0
};

export const metricsStore = {
  inc(key: MetricKey, by = 1) {
    metrics[key] += by;
  },
  snapshot() {
    return { ...metrics };
  },
  reset() {
    (Object.keys(metrics) as MetricKey[]).forEach((k) => {
      metrics[k] = 0;
    });
  }
};

