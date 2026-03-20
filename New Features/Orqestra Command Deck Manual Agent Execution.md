TASK: Add manual agent execution to the Orqestra Control Center using tabbed domain navigation and card-based agent launch surfaces.

CONTEXT: Extend the existing mobile-first Control Center with a high-level manual execution layer for specialized DevOps agents. Reuse existing monitoring, governance, orchestration, observability, and execution control systems. Manual actions must complement existing pause/resume/cancel controls without exposing low-level pipeline or coding workflows.

STACK: Mobile Control Center UI; tabbed navigation; card-based dashboard; task detail sheet/modal; event-driven orchestration backend; agent execution API; autonomy/policy engine; audit/event logging; realtime event subscriptions.

BUILD:

* Add a new Control Center manual execution surface.
* Add tabbed navigation for agent domains: planning, architecture, backend, frontend, infrastructure, testing, QA, security, repair, release, documentation, monitoring.
* Render executable agents as cards within each tab.
* Reuse existing agent state models, orchestration contracts, and drill-down views where possible.
* Define agent card schema with: agentName, role, currentStatus, supportedTaskType, lastRunResult, elapsedTime, retryCount, lastArtifact, executionAvailability, disabledReason.
* Add primary CTA on each card to start manual execution.
* Restrict execution initiation to predefined agent-specific DevOps task contracts.
* Add per-agent task presets, including: deployment validation, rerun failed tests, rollback, provision preview environment, security scan, regenerate docs, health recheck, repair failed pipeline step.
* Add task detail sheet/modal launched from the card before execution.
* Show in task detail view: selectedAgent, taskPreset, targetScope, dependencies, environment, riskLevel, policyConstraints, expectedOutputs.
* Validate execution eligibility before enabling run against: autonomy policy, project state, dependency graph, credentials, environment readiness, agent availability, retry limits.
* Allow only policy-approved manual actions.
* Route manual runs through the same orchestration engine and event pipeline as autonomous runs.
* Persist manual runs as first-class entities linked to: Project, Session, Job, AgentRun, Event, Artifact, Decision.
* Add manual/autonomous run attribution in logs, timelines, analytics, and history.
* Add live execution state updates on cards: queued, executing, validating, retrying, blocked, failed, completed, rolled_back.
* Stream progress, logs, artifacts, and incident updates into existing drill-down and observability views.
* Add safeguards for mutually exclusive actions, duplicate runs, and dependency conflicts.
* Add confirmation flows for destructive or high-risk actions: rollback, environment reprovisioning, production deployment validation.
* Add audit logging fields: triggeredBy, triggeredAt, reason, policyDecision, affectedScope, resultingArtifacts.
* Add filter and sort controls for cards/tabs by status, domain, environment, and run availability.
* Add run history per agent card with recent executions and outcomes.
* Expose backend endpoints/service methods for: listExecutableAgents, listTaskPresets, validateExecution, startManualRun, subscribeToRunEvents, fetchRunHistory.
* Add explicit disabled states with reasons: blocked by policy, missing dependency, agent busy, environment unavailable, credentials missing, retry limit reached.
* Update Control Center information architecture so manual execution is adjacent to existing execution controls but does not become a step-by-step operator console.
* Add tests covering policy gating, UI state transitions, task triggering, run persistence, and realtime updates.

CONSTRAINTS:

* Keep interactions high-level; do not expose raw pipeline config, shell commands, or coding interfaces.
* Allow only predefined agent-specific DevOps task presets; no arbitrary free-form commands.
* Route all manual runs through orchestration; never invoke agents directly.
* Enforce autonomy policy engine rules, escalation boundaries, and environment protections.
* Preserve dependency graph integrity and block conflicting/manual duplicate actions.
* Distinguish manual runs from autonomous runs across UI, logs, analytics, and persistence.
* Preserve transparency, observability, resumability, and auditability.
* Require confirmation for destructive or high-risk actions.
* Block unrestricted production actions unless explicitly policy-approved.
* Keep UX mobile-first, dark-first, grid-based, high-contrast, and aligned with the Orqestra brand system.

OUTPUT: Deliver a Control Center manual agent execution feature with domain tabs and agent cards that let users launch policy-approved DevOps task presets, validate eligibility before execution, monitor live run state, and inspect logs, artifacts, history, and outcomes through the existing orchestration and observability stack.
