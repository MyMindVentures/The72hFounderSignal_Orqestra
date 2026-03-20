# SERVICE_HEALTH_SCORECARD



| Service | Notes |

| ------- | ----- |

| API | Express /api routes |

| Workflow | workflowEngine + agentTaskQueue |

| Realtime | SSE /api/stream |

| Persistence | JSON files (STATE_DIR); PostgreSQL not wired |

| CI/CD | MockPipelineProvider |

| Phases (this run) | smoke=true, regression=true, deep=true, chaos=true, e2e=true |

