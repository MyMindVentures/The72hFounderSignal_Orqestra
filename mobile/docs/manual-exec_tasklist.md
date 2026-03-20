## Manual Agent Execution — Decomposed Task List

Source of truth: Plan Mode output `c:\Users\De Vlieger Kevin\.cursor\plans\manual-exec_f78cf495.plan.md`.

Note: Tasks are atomic, testable, and preserve traceability to the plan sections/components.

---

### Component A: Frontend implementation plan (mobile)

#### A1) New screen + navigation

##### FE-001

* **Task ID:** FE-001
* **Parent Task ID:** —
* **Source Plan Reference:** Frontend > “New screen + navigation” > Add `ManualExecutionScreen` route/screen
* **Task Name:** Add `ManualExecutionScreen` route/screen
* **Action Verb:** Add
* **Description:** Create the `ManualExecutionScreen` page component that will host domain tabs, agent cards, and run history.  
* **Domain Tag:** frontend
* **Dependencies:** none
* **Execution Order:** 1
* **Parallelizable:** No
* **Estimate:** Medium
* **Expected Outcome:** A navigable (compilable) screen component exists with empty placeholder content.
* **Acceptance Criteria:**
  * Screen compiles; exports correctly.
  * Renders without runtime errors.

##### FE-002

* **Task ID:** FE-002
* **Parent Task ID:** FE-001
* **Source Plan Reference:** Frontend > “New screen + navigation” > Update stack in `mobile/src/App.tsx`
* **Task Name:** Update navigation stack for manual screen
* **Action Verb:** Update
* **Description:** Register `ManualExecutionScreen` in `mobile/src/App.tsx` so it can be reached like other screens.
* **Domain Tag:** frontend
* **Dependencies:** FE-001
* **Execution Order:** 2
* **Parallelizable:** No
* **Estimate:** Small
* **Expected Outcome:** App navigation recognizes the new route.
* **Acceptance Criteria:**
  * TypeScript compiles.
  * Navigation route name/type matches `RootStackParamList`.

#### A2) Domain tabs + agent cards UI

##### FE-003

* **Task ID:** FE-003
* **Parent Task ID:** FE-001
* **Source Plan Reference:** Frontend > “Domain tabs + agent cards UI” > Implement domain tabs using `SegmentedTabs`
* **Task Name:** Implement manual domain tabs UI
* **Action Verb:** Implement
* **Description:** Implement tab state for the 12 domains and render tab headers using existing `mobile/src/components/SegmentedTabs.tsx`.
* **Domain Tag:** design
* **Dependencies:** FE-001
* **Execution Order:** 3
* **Parallelizable:** Yes
* **Estimate:** Small
* **Expected Outcome:** Users can switch domains and the screen updates which cards are shown.
* **Acceptance Criteria:**
  * Tab switch triggers UI re-render.
  * Each domain is selectable.
  * No visual/runtime errors.

##### FE-004

* **Task ID:** FE-004
* **Parent Task ID:** FE-001
* **Source Plan Reference:** Frontend > “Domain tabs + agent cards UI” > Add card schema fields
* **Task Name:** Define agent card schema/types
* **Action Verb:** Define
* **Description:** Define TypeScript types for the card schema: `agentName`, `role`, `currentStatus`, `supportedTaskType`, `lastRunResult`, `elapsedTime`, `retryCount`, `lastArtifact`, `executionAvailability`, `disabledReason`.
* **Domain Tag:** frontend
* **Dependencies:** FE-003
* **Execution Order:** 4
* **Parallelizable:** Yes
* **Estimate:** Small
* **Expected Outcome:** Strongly typed UI data model for agent cards.
* **Acceptance Criteria:** No TS errors; card component uses these types; fields are present in state mapping.

##### FE-005

* **Task ID:** FE-005
* **Parent Task ID:** FE-004
* **Source Plan Reference:** Frontend > “Domain tabs + agent cards UI” > Add card grid/list and “executable agents” as cards
* **Task Name:** Render executable agent cards per domain
* **Action Verb:** Render
* **Description:** Implement a per-domain list/grid that maps executable agents to card UI.
* **Domain Tag:** frontend
* **Dependencies:** FE-003, FE-004
* **Execution Order:** 5
* **Parallelizable:** Yes
* **Estimate:** Medium
* **Expected Outcome:** Cards appear for each domain with correct fields bound.
* **Acceptance Criteria:** Given mock agent data, UI renders one card per agent; each card shows expected schema fields.

##### FE-006

* **Task ID:** FE-006
* **Parent Task ID:** FE-005
* **Source Plan Reference:** Frontend > “Domain tabs + agent cards UI” > Cards support primary CTA disabled when not eligible
* **Task Name:** Implement agent card primary execution CTA (enabled/disabled)
* **Action Verb:** Implement
* **Description:** Add the primary CTA button on each card and wire it to open the task detail flow; disable CTA when `disabledReason` is set.
* **Domain Tag:** frontend
* **Dependencies:** FE-005
* **Execution Order:** 6
* **Parallelizable:** Yes
* **Estimate:** Medium
* **Expected Outcome:** Card CTA correctly reflects eligibility state.
* **Acceptance Criteria:**
  * When card state has `disabledReason`, CTA is disabled and displays correct reasoning.
  * When eligible, CTA triggers the expected handler.

##### FE-007

* **Task ID:** FE-007
* **Parent Task ID:** FE-005
* **Source Plan Reference:** Frontend > “Domain tabs + agent cards UI” > “Run history” section per card
* **Task Name:** Implement per-card run history section
* **Action Verb:** Implement
* **Description:** Add UI to display recent executions/outcomes for each agent card.
* **Domain Tag:** design
* **Dependencies:** FE-005
* **Execution Order:** 7
* **Parallelizable:** Yes
* **Estimate:** Medium
* **Expected Outcome:** Cards show recent outcomes.
* **Acceptance Criteria:** With mock run history, UI lists most recent entries; empty state is handled.

#### A3) Task detail sheet/modal + confirmation

##### FE-008

* **Task ID:** FE-008
* **Parent Task ID:** FE-006
* **Source Plan Reference:** Frontend > “Task detail sheet/modal + confirmation” > Build bottom-sheet UI using existing `BottomSheet`
* **Task Name:** Implement task detail bottom sheet UI shell
* **Action Verb:** Implement
* **Description:** Create the bottom sheet component that can display task preset details and execution metadata for the selected card.
* **Domain Tag:** frontend
* **Dependencies:** FE-006
* **Execution Order:** 8
* **Parallelizable:** Yes
* **Estimate:** Medium
* **Expected Outcome:** Bottom sheet opens and renders selected preset/task detail fields.
* **Acceptance Criteria:**
  * Bottom sheet opens/closes reliably.
  * Fields render: `selectedAgent`, `taskPreset`, `targetScope`, `dependencies`, `environment`, `riskLevel`, `policyConstraints`, `expectedOutputs`.

##### FE-009

* **Task ID:** FE-009
* **Parent Task ID:** FE-008
* **Source Plan Reference:** Frontend > “Task detail sheet/modal + confirmation” > Confirmation step for destructive/high-risk presets
* **Task Name:** Implement confirmation flow for high-risk presets
* **Action Verb:** Implement
* **Description:** Add a confirmation step inside the bottom sheet for destructive/high-risk presets (rollback, reprovision, production validation) before calling `startManualRun`.
* **Domain Tag:** security
* **Dependencies:** FE-008
* **Execution Order:** 9
* **Parallelizable:** Yes
* **Estimate:** Medium
* **Expected Outcome:** High-risk executions require explicit confirmation.
* **Acceptance Criteria:**
  * Confirm button must be clicked to proceed.
  * Cancellation returns to detail view.
  * No start call happens without confirmation.

##### FE-010

* **Task ID:** FE-010
* **Parent Task ID:** FE-008
* **Source Plan Reference:** Frontend > “Task detail sheet/modal + confirmation” > Fetch/prepare preset details or use provided preset data
* **Task Name:** Load selected preset details for task detail sheet
* **Action Verb:** Load
* **Description:** Implement logic to fetch/prepare preset details needed for the bottom sheet (using preset data from `listTaskPresets` or a preset already associated to the card).
* **Domain Tag:** frontend
* **Dependencies:** FE-008
* **Execution Order:** 10
* **Parallelizable:** Yes
* **Estimate:** Small
* **Expected Outcome:** Bottom sheet receives complete preset/environment/policy constraint fields.
* **Acceptance Criteria:** Bottom sheet renders without missing required fields; preset selection correctly populates the detail view.

#### A4) Eligibility validation + start flow

##### FE-011

* **Task ID:** FE-011
* **Parent Task ID:** FE-001
* **Source Plan Reference:** Frontend > “Eligibility validation + start flow” > Call `validateExecution` and compute disabled state
* **Task Name:** Implement per-domain eligibility validation state wiring
* **Action Verb:** Implement
* **Description:** Call `validateExecution` to compute eligibility for each card/preset and map results to `executionAvailability` + `disabledReason`.
* **Domain Tag:** frontend
* **Dependencies:** FE-005, FE-006
* **Execution Order:** 11
* **Parallelizable:** Yes
* **Estimate:** Large
* **Expected Outcome:** Cards show correct disabled/enabled states based on eligibility results.
* **Acceptance Criteria:** For eligible cases CTA is enabled; for ineligible cases CTA is disabled and shows returned `disabledReason`.

##### FE-012

* **Task ID:** FE-012
* **Parent Task ID:** FE-011
* **Source Plan Reference:** Frontend > “Eligibility validation + start flow” > On confirm call `startManualRun` and optimistically set queued/executing
* **Task Name:** Implement `startManualRun` trigger from confirmed flow
* **Action Verb:** Implement
* **Description:** On bottom sheet confirmation, call `startManualRun` and optimistically transition the card into a queued/executing-like state while awaiting SSE.
* **Domain Tag:** frontend
* **Dependencies:** FE-009, FE-011
* **Execution Order:** 12
* **Parallelizable:** No
* **Estimate:** Medium
* **Expected Outcome:** Manual run start is triggered and UI reflects in-progress state.
* **Acceptance Criteria:** Confirm triggers exactly one start request; during optimistic state CTA is disabled or guarded to prevent double-start.

##### FE-013

* **Task ID:** FE-013
* **Parent Task ID:** FE-012
* **Source Plan Reference:** Frontend > “Eligibility validation + start flow” > Optimistically set card status queued/executing
* **Task Name:** Implement UI safeguards against duplicate manual starts
* **Action Verb:** Guard
* **Description:** Prevent duplicate submissions for the same card/preset while a run is already queued/executing/validating.
* **Domain Tag:** security
* **Dependencies:** FE-012
* **Execution Order:** 13
* **Parallelizable:** No
* **Estimate:** Small
* **Expected Outcome:** Reduced risk of accidental double triggers.
* **Acceptance Criteria:** Rapid repeated presses do not create multiple start calls; UI state remains consistent.

#### A5) Live updates via SSE

##### FE-014

* **Task ID:** FE-014
* **Parent Task ID:** FE-001
* **Source Plan Reference:** Frontend > “Live updates via SSE” > Extend `ManualExecutionScreen` to listen for `agentRun.updated`, `agentRun.finalized`
* **Task Name:** Implement SSE subscription for manual run events
* **Action Verb:** Implement
* **Description:** Subscribe to `/api/stream` SSE events and handle `agentRun.updated` and `agentRun.finalized` for updating card state and run history.
* **Domain Tag:** frontend
* **Dependencies:** FE-001
* **Execution Order:** 14
* **Parallelizable:** Yes
* **Estimate:** Large
* **Expected Outcome:** Cards update live as manual runs progress.
* **Acceptance Criteria:** When SSE mock events arrive, the correct card updates `currentStatus`, `retryCount`, and `lastRunResult`/history.

##### FE-015

* **Task ID:** FE-015
* **Parent Task ID:** FE-014
* **Source Plan Reference:** Frontend > “Live updates via SSE” > Keep card UI driven by `task.created/started/updated` where helpful
* **Task Name:** Correlate task lifecycle events to manual card updates
* **Action Verb:** Correlate
* **Description:** Use existing task lifecycle events (`task.created/started/updated` where present) to enrich card UI.
* **Domain Tag:** data
* **Dependencies:** FE-014
* **Execution Order:** 15
* **Parallelizable:** Yes
* **Estimate:** Medium
* **Expected Outcome:** Card UI reflects underlying task progress when available.
* **Acceptance Criteria:** If `task.updated` indicates completion/failure for a manual task, card updates accordingly.

##### FE-016

* **Task ID:** FE-016
* **Parent Task ID:** FE-001
* **Source Plan Reference:** Frontend > “Live updates via SSE” > Update each card’s state + lastRunResult + retryCount
* **Task Name:** Implement run history reconciliation from SSE
* **Action Verb:** Implement
* **Description:** Reconcile run history entries as `agentRun.finalized` fires and ensure last outcome fields match final state.
* **Domain Tag:** frontend
* **Dependencies:** FE-014
* **Execution Order:** 16
* **Parallelizable:** No
* **Estimate:** Medium
* **Expected Outcome:** Card shows accurate latest outcomes after run finalization.
* **Acceptance Criteria:** After finalized event, last outcome fields match SSE payload; history list updates without duplicates.

#### A6) Frontend API client + tests

##### FE-017

* **Task ID:** FE-017
* **Parent Task ID:** FE-001
* **Source Plan Reference:** Frontend > “Files to touch” > `mobile/src/lib/api.ts` add manual endpoints
* **Task Name:** Extend API client with manual execution endpoints
* **Action Verb:** Extend
* **Description:** Add client methods for: `listExecutableAgents`, `listTaskPresets`, `validateExecution`, `startManualRun`, `fetchRunHistory`.
* **Domain Tag:** frontend
* **Dependencies:** FE-001
* **Execution Order:** 17
* **Parallelizable:** Yes
* **Estimate:** Medium
* **Expected Outcome:** Typed functions exist for all five manual endpoints.
* **Acceptance Criteria:** Functions call correct URL paths/methods; payload types validated; compile.

##### FE-018

* **Task ID:** FE-018
* **Parent Task ID:** FE-016
* **Source Plan Reference:** Frontend > “6. Tests (Frontend)” > Add Jest tests for UI flows
* **Task Name:** Add Jest tests for manual execution UI flows
* **Action Verb:** Add
* **Description:** Implement Jest/RTL tests covering domain tab rendering, card disabled state from eligibility validation, bottom sheet content, confirmation gating, and card state transitions from mocked SSE events.
* **Domain Tag:** QA
* **Dependencies:** FE-011, FE-009, FE-014
* **Execution Order:** 18
* **Parallelizable:** No
* **Estimate:** Large
* **Expected Outcome:** CI-testable coverage of manual UI behavior.
* **Acceptance Criteria:** All specified cases pass; tests deterministically simulate API responses and SSE events.

---

### Component B: Backend implementation plan (server)

#### B1) Add new backend types, stores, and persistence

##### BE-001

* **Task ID:** BE-001
* **Parent Task ID:** —
* **Source Plan Reference:** Backend > “1. Add new backend types, stores, and persistence” > Extend `backend/src/models.ts`
* **Task Name:** Define `AgentRun` and `TaskPreset` backend models
* **Action Verb:** Define
* **Description:** Add `AgentRun` and `TaskPreset` types, including statuses and preset/policy constraints needed by the UI + audit payloads. Include optional lightweight decision/policy record types.
* **Domain Tag:** backend
* **Dependencies:** none
* **Execution Order:** 1
* **Parallelizable:** No
* **Estimate:** Large
* **Expected Outcome:** Shared model types exist for manual execution end-to-end.
* **Acceptance Criteria:** TypeScript compiles; types cover all fields required by endpoints and SSE payloads.

##### BE-002

* **Task ID:** BE-002
* **Parent Task ID:** BE-001
* **Source Plan Reference:** Backend > “1. Add new backend types, stores, and persistence” > Add stores
* **Task Name:** Create `agentRunsStore` and `taskPresetsStore`
* **Action Verb:** Create
* **Description:** Implement in-memory stores for `AgentRun` and `TaskPreset` with CRUD/query helpers needed by endpoints (listing, history queries).
* **Domain Tag:** backend
* **Dependencies:** BE-001
* **Execution Order:** 2
* **Parallelizable:** Yes
* **Estimate:** Medium
* **Expected Outcome:** Endpoint implementations can read/write manual execution state.
* **Acceptance Criteria:** Stores expose required get/add/update methods; unit-testable helpers.

##### BE-003

* **Task ID:** BE-003
* **Parent Task ID:** BE-002
* **Source Plan Reference:** Backend > “1. Add new backend types, stores, and persistence” > Update persistence/hydration
* **Task Name:** Persist + hydrate manual execution stores
* **Action Verb:** Update
* **Description:** Modify `backend/src/persistence/jsonPersistence.ts` to include new JSON files for manual stores and hydrate them on startup.
* **Domain Tag:** backend
* **Dependencies:** BE-002
* **Execution Order:** 3
* **Parallelizable:** Yes
* **Estimate:** Medium
* **Expected Outcome:** Manual runs survive restart and are queryable.
* **Acceptance Criteria:** Hydration restores stores correctly; persistence writes include AgentRuns and TaskPresets.

##### BE-004

* **Task ID:** BE-004
* **Parent Task ID:** BE-002
* **Source Plan Reference:** Backend > “2. Manual execution routes” + plan’s “Full preset list” implication
* **Task Name:** Seed default `TaskPreset` records
* **Action Verb:** Seed
* **Description:** Populate `taskPresetsStore` with the specified preset set and map each preset to the correct agent domain/type and action semantics.
* **Domain Tag:** data
* **Dependencies:** BE-002, BE-001
* **Execution Order:** 4
* **Parallelizable:** Yes
* **Estimate:** Medium
* **Expected Outcome:** `listTaskPresets` returns meaningful data for the UI.
* **Acceptance Criteria:** At least the preset categories are present; each preset includes required fields for UI and validation.

---

#### B2) Manual execution routes (new API surface)

##### BE-005

* **Task ID:** BE-005
* **Parent Task ID:** BE-001
* **Source Plan Reference:** Backend > “2. Manual execution routes” > Add `backend/src/routes/manual.ts`
* **Task Name:** Add manual router module skeleton
* **Action Verb:** Add
* **Description:** Create `backend/src/routes/manual.ts` with Express router setup and placeholders for the five endpoints.
* **Domain Tag:** backend
* **Dependencies:** none
* **Execution Order:** 5
* **Parallelizable:** Yes
* **Estimate:** Small
* **Expected Outcome:** New router module is registered and compiles.
* **Acceptance Criteria:** Router exports correctly; no route path conflicts.

##### BE-006

* **Task ID:** BE-006
* **Parent Task ID:** BE-005
* **Source Plan Reference:** Backend > “2. Manual execution routes” > register in `backend/src/routes.ts`
* **Task Name:** Register manual router in API routes
* **Action Verb:** Register
* **Description:** Add the manual router to `backend/src/routes.ts` under `/api/manual`.
* **Domain Tag:** backend
* **Dependencies:** BE-005
* **Execution Order:** 6
* **Parallelizable:** No
* **Estimate:** Small
* **Expected Outcome:** Manual endpoints are reachable at `/api/manual/*`.
* **Acceptance Criteria:** One endpoint returns expected JSON schema (even if internals mocked).

##### BE-007

* **Task ID:** BE-007
* **Parent Task ID:** BE-002
* **Source Plan Reference:** Backend > “2. Manual execution routes” > `GET /api/manual/executable-agents`
* **Task Name:** Implement listExecutableAgents endpoint
* **Action Verb:** Implement
* **Description:** Implement `GET /api/manual/executable-agents` to return the executable agents list needed for UI tabs/cards.
* **Domain Tag:** backend
* **Dependencies:** BE-002, BE-006
* **Execution Order:** 7
* **Parallelizable:** Yes
* **Estimate:** Medium
* **Expected Outcome:** UI can render agent cards list per domain.
* **Acceptance Criteria:** Response contains consistent agent fields; empty states handled.

##### BE-008

* **Task ID:** BE-008
* **Parent Task ID:** BE-006
* **Source Plan Reference:** Backend > “2. Manual execution routes” > `GET /api/manual/task-presets`
* **Task Name:** Implement listTaskPresets endpoint
* **Action Verb:** Implement
* **Description:** Implement `GET /api/manual/task-presets` to return task preset definitions used by detail sheet and validation logic.
* **Domain Tag:** backend
* **Dependencies:** BE-002, BE-006
* **Execution Order:** 8
* **Parallelizable:** Yes
* **Estimate:** Medium
* **Expected Outcome:** UI can populate preset options/details.
* **Acceptance Criteria:** Response includes all seeded presets; schema matches frontend expectations.

##### BE-009

* **Task ID:** BE-009
* **Parent Task ID:** BE-006
* **Source Plan Reference:** Backend > “2. Manual execution routes” > `POST /api/manual/validate-execution`
* **Task Name:** Implement validateExecution endpoint
* **Action Verb:** Implement
* **Description:** Implement `POST /api/manual/validate-execution` returning `eligible`, optional `disabledReason?`, optional `policyDecision?`, and computed run plan.
* **Domain Tag:** backend
* **Dependencies:** BE-006, BE-001, BE-002
* **Execution Order:** 9
* **Parallelizable:** No
* **Estimate:** Large
* **Expected Outcome:** Backend provides eligibility decisions for UI card disabled states.
* **Acceptance Criteria:** Invalid cases set `eligible=false` with a non-empty `disabledReason`; valid cases set `eligible=true`.

##### BE-010

* **Task ID:** BE-010
* **Parent Task ID:** BE-009
* **Source Plan Reference:** Backend > “3. Policy/eligibility engine” > Environment readiness eligibility checks
* **Task Name:** Implement environment readiness eligibility checks
* **Action Verb:** Implement
* **Description:** Implement checks: environment exists and allowed actions include the preset/task action; include credentials placeholder logic via `secretsRef` presence/format.
* **Domain Tag:** security
* **Dependencies:** BE-009
* **Execution Order:** 10
* **Parallelizable:** Yes
* **Estimate:** Medium
* **Expected Outcome:** Eligibility correctly fails when environment/credentials missing or unpermitted.
* **Acceptance Criteria:** If environment unknown or allowed actions don’t match, `eligible=false` and `disabledReason` indicates category.

##### BE-011

* **Task ID:** BE-011
* **Parent Task ID:** BE-009
* **Source Plan Reference:** Backend > “3. Policy/eligibility engine” > Agent availability/busy constraints
* **Task Name:** Implement agent availability / busy constraints
* **Action Verb:** Implement
* **Description:** Implement checks so eligibility fails when agent is busy or conflicts exist.
* **Domain Tag:** backend
* **Dependencies:** BE-009
* **Execution Order:** 11
* **Parallelizable:** Yes
* **Estimate:** Medium
* **Expected Outcome:** UI disables actions when agent is unavailable.
* **Acceptance Criteria:** For busy/conflict cases return deterministic `disabledReason`.

##### BE-012

* **Task ID:** BE-012
* **Parent Task ID:** BE-009
* **Source Plan Reference:** Backend > “3. Policy/eligibility engine” > Retry limits rules
* **Task Name:** Implement retry limit eligibility checks
* **Action Verb:** Implement
* **Description:** Implement retry limit checks based on preset/run retry count and attempt boundaries.
* **Domain Tag:** backend
* **Dependencies:** BE-009
* **Execution Order:** 12
* **Parallelizable:** Yes
* **Estimate:** Medium
* **Expected Outcome:** Eligibility prevents exceeding allowed retries.
* **Acceptance Criteria:** At/beyond retry limit yields `eligible=false`.

##### BE-013

* **Task ID:** BE-013
* **Parent Task ID:** BE-009
* **Source Plan Reference:** Backend > “3. Policy/eligibility engine” > Dependency conflicts
* **Task Name:** Implement dependency/target-scope conflict checks
* **Action Verb:** Implement
* **Description:** Implement “no conflicting active manual runs affecting the same target scope” checks.
* **Domain Tag:** backend
* **Dependencies:** BE-009
* **Execution Order:** 13
* **Parallelizable:** Yes
* **Estimate:** Large
* **Expected Outcome:** Prevents conflicting manual actions concurrently.
* **Acceptance Criteria:** Conflicts fail eligibility with deterministic `disabledReason`.

##### BE-014

* **Task ID:** BE-014
* **Parent Task ID:** BE-009
* **Source Plan Reference:** Backend > “3. Policy/eligibility engine” > Return UI-friendly results + computed run plan
* **Task Name:** Return computed run plan and policyDecision
* **Action Verb:** Return
* **Description:** Ensure validateExecution returns `eligible`, `disabledReason?`, `policyDecision?`, plus computed run plan used by UI/start flow.
* **Domain Tag:** backend
* **Dependencies:** BE-010, BE-011, BE-012, BE-013
* **Execution Order:** 14
* **Parallelizable:** No
* **Estimate:** Small
* **Expected Outcome:** Frontend can interpret eligibility consistently.
* **Acceptance Criteria:** Schema stable; fields absent/present exactly as defined.

##### BE-015

* **Task ID:** BE-015
* **Parent Task ID:** BE-006
* **Source Plan Reference:** Backend > “2. Manual execution routes” > `POST /api/manual/start-manual-run`
* **Task Name:** Implement startManualRun endpoint
* **Action Verb:** Implement
* **Description:** Create `AgentRun`, create/enqueue underlying tasks via workflow lifecycle, and attribute events back to the `AgentRun`.
* **Domain Tag:** backend
* **Dependencies:** BE-006, BE-001, BE-002, BE-009
* **Execution Order:** 15
* **Parallelizable:** No
* **Estimate:** Large
* **Expected Outcome:** Manual runs can be started and progress through orchestration pipeline.
* **Acceptance Criteria:** AgentRun persisted; related tasks/jobs created/enqueued; response usable for history/SSE correlation.

##### BE-016

* **Task ID:** BE-016
* **Parent Task ID:** BE-015
* **Source Plan Reference:** Backend > “4. Orchestration integration” > Ensure attribution via `agentRunId` on tasks/jobs
* **Task Name:** Add manual attribution field to tasks (and jobs if needed)
* **Action Verb:** Add
* **Description:** Add optional `agentRunId` to task/job models so SSE correlation can happen.
* **Domain Tag:** data
* **Dependencies:** BE-015
* **Execution Order:** 16
* **Parallelizable:** No
* **Estimate:** Medium
* **Expected Outcome:** Manual-task lifecycle correlated back to AgentRun.
* **Acceptance Criteria:** Tasks/jobs created during startManualRun carry `agentRunId`.

##### BE-017

* **Task ID:** BE-017
* **Parent Task ID:** BE-015
* **Source Plan Reference:** Backend > “4. Orchestration integration” > Update `executeTask()` behavior for manual tasks
* **Task Name:** Update orchestration to avoid unintended follow-on chains
* **Action Verb:** Update
* **Description:** Modify workflow engine so manual preset execution completes safely without unintended follow-on chains (or implement preset-defined chaining rules).
* **Domain Tag:** backend
* **Dependencies:** BE-015, BE-016
* **Execution Order:** 17
* **Parallelizable:** No
* **Estimate:** Large
* **Expected Outcome:** Manual preset execution behaves safely and predictably.
* **Acceptance Criteria:** At least one preset: expected tasks created; completion does not spawn unexpected additional workflow tasks beyond preset.

##### BE-018

* **Task ID:** BE-018
* **Parent Task ID:** BE-006
* **Source Plan Reference:** Backend > “2. Manual execution routes” > `GET /api/manual/run-history`
* **Task Name:** Implement fetchRunHistory endpoint
* **Action Verb:** Implement
* **Description:** Return recent AgentRuns for UI cards (by agent + scope).
* **Domain Tag:** backend
* **Dependencies:** BE-002, BE-006, BE-015
* **Execution Order:** 18
* **Parallelizable:** Yes
* **Estimate:** Medium
* **Expected Outcome:** UI can show card run history.
* **Acceptance Criteria:** Filtering correct; stable ordering most recent first.

---

#### B3) SSE events + audit logging

##### BE-019

* **Task ID:** BE-019
* **Parent Task ID:** BE-017
* **Source Plan Reference:** Backend > “5. SSE events + audit logging” > Broadcast `agentRun.updated/finalized`
* **Task Name:** Broadcast `agentRun.updated` SSE events
* **Action Verb:** Broadcast
* **Description:** Emit SSE events for manual AgentRun status transitions.
* **Domain Tag:** backend
* **Dependencies:** BE-015, BE-016
* **Execution Order:** 19
* **Parallelizable:** No
* **Estimate:** Large
* **Expected Outcome:** Mobile client receives live manual-run state updates.
* **Acceptance Criteria:** SSE messages include event name `agentRun.updated` with run identifier + new status.

##### BE-020

* **Task ID:** BE-020
* **Parent Task ID:** BE-019
* **Source Plan Reference:** Backend > “5. SSE events + audit logging” > Broadcast `agentRun.finalized`
* **Task Name:** Broadcast `agentRun.finalized` SSE events
* **Action Verb:** Broadcast
* **Description:** Emit finalized event when AgentRun reaches terminal state.
* **Domain Tag:** backend
* **Dependencies:** BE-019
* **Execution Order:** 20
* **Parallelizable:** No
* **Estimate:** Medium
* **Expected Outcome:** UI refresh can rely on a terminal event.
* **Acceptance Criteria:** Exactly one finalized SSE event per manual run.

##### BE-021

* **Task ID:** BE-021
* **Parent Task ID:** BE-017
* **Source Plan Reference:** Backend > “5. SSE events + audit logging” > Add audit log entries with manual trigger metadata/policyDecision
* **Task Name:** Extend audit logging for manual trigger decisions
* **Action Verb:** Extend
* **Description:** Include manual-trigger metadata keys in audit entries created during validate/start.
* **Domain Tag:** security
* **Dependencies:** BE-015, BE-009, BE-019
* **Execution Order:** 21
* **Parallelizable:** Yes
* **Estimate:** Medium
* **Expected Outcome:** Manual actions are auditable with policy context.
* **Acceptance Criteria:** Audit entries contain required manual metadata keys.

---

#### B4) Tests

##### BE-022

* **Task ID:** BE-022
* **Parent Task ID:** —
* **Source Plan Reference:** Backend > “6. Tests (Backend)” > validateExecution policy gating
* **Task Name:** Add vitest coverage for validateExecution gating
* **Action Verb:** Add
* **Description:** Test environment allowedActions, retry limits, and agent busy constraints.
* **Domain Tag:** QA
* **Dependencies:** BE-009, BE-010, BE-011, BE-012
* **Execution Order:** 22
* **Parallelizable:** Yes
* **Estimate:** Medium
* **Expected Outcome:** Deterministic validateExecution results.
* **Acceptance Criteria:** Tests assert `eligible` and `disabledReason/policyDecision` match expectations.

##### BE-023

* **Task ID:** BE-023
* **Parent Task ID:** —
* **Source Plan Reference:** Backend > “6. Tests (Backend)” > startManualRun persistence
* **Task Name:** Add vitest coverage for startManualRun persistence
* **Action Verb:** Add
* **Description:** Ensure AgentRun created/persisted and tasks/jobs created/enqueued with attribution.
* **Domain Tag:** QA
* **Dependencies:** BE-015, BE-016, BE-003
* **Execution Order:** 23
* **Parallelizable:** Yes
* **Estimate:** Large
* **Expected Outcome:** Manual runs persist across hydration cycles.
* **Acceptance Criteria:** After simulated persistence/hydration, AgentRun and attributed tasks exist.

##### BE-024

* **Task ID:** BE-024
* **Parent Task ID:** —
* **Source Plan Reference:** Backend > “6. Tests (Backend)” > SSE emission for manual-run events
* **Task Name:** Add vitest coverage for manual-run SSE emission
* **Action Verb:** Add
* **Description:** Extend SSE tests to verify `agentRun.updated` and `agentRun.finalized` emissions.
* **Domain Tag:** QA
* **Dependencies:** BE-019, BE-020
* **Execution Order:** 24
* **Parallelizable:** No
* **Estimate:** Medium
* **Expected Outcome:** SSE events validated for manual execution.
* **Acceptance Criteria:** SSE test observes expected event names and payload fields.

---

### Component C: Next milestone sequencing (layered delivery)

* **Task ID:** M-SEQ-001
* **Parent Task ID:** —
* **Source Plan Reference:** Next milestone approach > Layer 1–5
* **Task Name:** Sequence manual execution delivery by milestone layers
* **Action Verb:** Sequence
* **Description:** Proceed in order: (1) UI skeleton with mock API, (2) backend endpoints + deterministic eligibility, (3) startManualRun -> AgentRun creation + SSE, (4) persistence + run history, (5) full preset list + confirmations + comprehensive tests.
* **Domain Tag:** infra
* **Dependencies:** FE-001, BE-006
* **Execution Order:** 25
* **Parallelizable:** Yes
* **Estimate:** Small
* **Expected Outcome:** Development order matches the plan’s MVP layers.
* **Acceptance Criteria:** Layer slices have passing tests or explicitly mocked tests for layer 1.

---

### Coverage Validation (against original Plan Mode output)

- Frontend: new screen + navigation, domain tabs, agent cards schema + CTA/disabledReason, task detail bottom sheet + confirmation, eligibility validate + optimistic start, SSE manual events + task correlation, API client methods, and frontend tests are covered by FE-001..FE-018.
- Backend: models/stores/persistence, manual router + five endpoints, minimal policy/eligibility engine, orchestration integration with AgentRun attribution, SSE events + audit logging fields, and backend tests are covered by BE-001..BE-024.
- Next milestone layers are covered by M-SEQ-001.

