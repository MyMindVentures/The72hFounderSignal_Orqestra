TASK: Build a modern mobile app for autonomous app building with a control center dashboard for agentic DevOps and software delivery agents.

CONTEXT: The target user is non-technical. The user uploads a plaintext blueprint where each line defines one job. The system interprets the blueprint, creates execution plans, assigns work to specialized agents, and presents progress through a monitoring dashboard without requiring user intervention.

STACK: Mobile app frontend, backend orchestration service, workflow engine, agent runtime, job queue, realtime status streaming, persistent storage, CI/CD integration, testing automation, observability.

BUILD:

* Create a mobile-first app with sleek, modern UI and high-clarity status visualization.
* Implement a Control Center dashboard as the primary screen.
* Show all agentic agents, active jobs, queues, build progress, test status, deployment status, incidents, and completion summaries.
* Accept blueprint upload as plain text, markdown, or structured text.
* Parse the blueprint so each line becomes an independent job unit.
* Add preprocessing to classify each job by type: planning, backend, frontend, infra, QA, testing, debugging, deployment, monitoring, documentation.
* Generate a dependency graph from blueprint lines when relationships are inferred.
* Create an orchestration layer that decomposes jobs into subtasks and assigns them to specialized agents.
* Implement specialized agents for architecture, coding, testing, debugging, DevOps, security review, documentation, and release management.
* Make agents collaborate through shared task state, artifacts, logs, and handoff contracts.
* Ensure the system defaults to autonomous execution with no required user actions after blueprint submission.
* Prevent interruption-based UX patterns; do not block execution waiting for user answers.
* Add automatic decision policies so agents resolve ambiguity using best-effort engineering defaults, internal planning, and iterative validation.
* Implement continuous execution loops for build, test, debug, retry, and deploy until completion criteria are met.
* Add background orchestration support for persistent long-running workflows.
* Persist all job states, artifacts, logs, and checkpoints so work resumes automatically after restarts.
* Add realtime updates to the dashboard via streaming or websocket-based status sync.
* Show per-agent status: idle, planning, coding, testing, blocked, retrying, failed, completed.
* Add drill-down views for every job with logs, artifacts, generated code summaries, test results, and failure diagnostics.
* Implement CI/CD pipeline integration for automated builds, tests, linting, static analysis, security scanning, packaging, and deployments.
* Add automated debugging loops that inspect failures, generate fixes, rerun tests, and continue until pass thresholds are met.
* Implement rollback, retry, and recovery flows for failed deployments or failed task branches.
* Add observability: traces, metrics, audit log, event timeline, error reporting.
* Add notification summaries only for status reporting, milestone completion, and critical failures; do not request manual execution from the user.
* Provide a final delivery view with generated app artifacts, deployment status, test coverage, defect summary, and release notes.
* Design the UI with card-based dashboards, agent tiles, progress rails, system health widgets, and mobile-native interactions.
* Add role-safe administrative controls for pause, resume, cancel, priority override, and environment selection.
* Support multi-project blueprint sessions and history.
* Add secure storage and environment isolation for repositories, secrets, pipelines, and deployment targets.

CONSTRAINTS:

* Mobile app must prioritize monitoring and control, not manual development workflows.
* User must not be asked to code, debug, configure pipelines, or answer implementation questions during execution.
* Each blueprint line must map to a discrete job tracked independently.
* Agents must operate autonomously using senior-level engineering defaults.
* System must continue execution continuously until build, test, and debugging objectives are satisfied.
* Execution must be resumable and fault-tolerant.
* Dashboard must expose transparent state, logs, and outcomes for every agent and job.
* UI must be modern, minimal, and production-grade.
* Support fully automated testing, debugging, and deployment loops.
* All autonomous actions must be logged and auditable.
* Prevent silent failure; surface blockers, retries, and recovery actions in the dashboard.
* Do not require synchronous user approval for normal agent operations.

OUTPUT: A production-ready specification for a mobile autonomous app-building platform where non-technical users upload a line-based blueprint, autonomous agents execute all engineering and DevOps work end-to-end, and the user monitors progress through a Control Center dashboard.