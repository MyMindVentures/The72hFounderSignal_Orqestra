# Premium dark mobile app — execution tasks

Source: Plan Mode artifact `premium_dark_mobile_spec_f36621cd` (deliverables 1–5 + YAML todos).  
**104** atomic tasks; check off as completed.

**Legend:** `Deps` = prerequisite task IDs (must complete first).

---

## C-SPEC — Authoritative spec (`MOBILE_APP_SYSTEM_SPEC.md`)

| ID | Task | Deps |
|----|------|------|
| T-001 | Create `mobile/docs/MOBILE_APP_SYSTEM_SPEC.md` stub (title, scope) | — |
| T-002 | Document principles section (dark-only, no Material/generic, soft/glow, one accent per screen) | T-001 |
| T-003 | Document Tamagui token contract (colors, radii, spacing 8/16/24, Inter, max 2 sizes/section) | T-001 |
| T-004 | Document layout rules (edge-to-edge, safe area, collapsible headers, no web columns) | T-001 |
| T-005 | Document expo-router navigation model (groups, 5 tabs, stacks, auth routes, no hamburger) | T-001 |
| T-006 | Document screen inventory (route → purpose → accent → stack children) | T-005 |
| T-007 | Document component contracts (props, a11y, allowed tokens) for full component list | T-003 |
| T-008 | Document motion rules (180–320ms, cap 400ms, springs, banned jitter) | T-001 |
| T-009 | Document state boundaries (Query, Zustand, RHF+Zod, MMKV, optimistic rules) | T-001 |
| T-010 | Document UX behaviors (skeletons, PTR, haptics, inline errors, empty states) | T-001 |
| T-011 | Document observability & CI (Sentry, EAS, GitHub Actions, Maestro strategy) | T-001 |
| T-012 | Document legacy Control Center IA placement (`src/screens` migration) | T-005, T-006 |
| T-013 | Document TS strict escape hatches (`skipLibCheck` / version alignment if needed) | T-001 |

---

## C-TOOL — Bootstrap & configuration

| ID | Task | Deps |
|----|------|------|
| T-014 | Install UI deps: Tamagui, `@tamagui/babel-plugin`, Reanimated, RNGH, `react-native-safe-area-context` | — |
| T-015 | Install state deps: `@tanstack/react-query`, zustand, RHF, zod, `react-native-mmkv`, `sentry-expo`, `expo-haptics`, `expo-local-authentication` | T-014 |
| T-016 | Select BottomSheet approach (`@gorhom/bottom-sheet` vs Tamagui Sheet) and record decision | T-014 |
| T-017 | Install chosen BottomSheet package | T-016 |
| T-018 | Verify `npm test` / jest-expo + RTL after dependency changes | T-014, T-015 |
| T-019 | Document local Maestro CLI usage (short note in `mobile/docs` or README) | T-018 |
| T-020 | Enable strict TypeScript (`strict`, `noImplicitOverride`; optional `noUncheckedIndexedAccess`) | T-015 |
| T-021 | Point app entry at expo-router (`main` / `expo-router/entry`) | T-014 |
| T-022 | Add `app.config.ts` for Sentry + EAS Update + env-based DSN + runtime version | T-015 |
| T-023 | Configure Babel: `@tamagui/babel-plugin`; `react-native-reanimated/plugin` last | T-014 |
| T-024 | Configure Metro for Tamagui | T-023 |
| T-025 | Create `tamagui.config.ts` — tokens + **single dark theme only** | T-014 |
| T-026 | Load Inter 400/500/600/700 via `expo-font` | T-025 |
| T-027 | Map Inter into Tamagui `fonts` | T-026 |
| T-028 | Initialize `sentry-expo` in bootstrap (guarded when DSN missing) | T-015, T-022 |
| T-029 | Create `QueryClient` module with defaults | T-015 |
| T-030 | Create `app/` directory + minimal `app/_layout.tsx` shell | T-021 |
| T-031 | Implement full `app/_layout.tsx` provider tree (GHRV, SafeArea, Tamagui dark, QueryClient, Sentry) | T-025, T-027, T-029, T-030 |
| T-032 | Remove duplicate `GestureHandlerRootView` from `index.js` if wrapped in root layout | T-031 |
| T-033 | Remove legacy `NavigationContainer` / stack from `src/App.tsx` (or remove file) | T-031 |

---

## C-MOTION — Animation system

| ID | Task | Deps |
|----|------|------|
| T-034 | Create `motion.ts` (durations 180–320ms, cap 400ms, easing, spring presets) | T-025 |
| T-035 | Implement fade / slide / scale / spring helpers | T-034 |
| T-036 | Polish tab + stack transitions (subtle, no jitter) (**run after** T-086) | T-035, T-086 |
| T-037 | Implement AI voice orb idle pulse + gesture stub (Reanimated) (**run after** T-090) | T-035, T-090 |

_Task IDs are not execution order: complete **T-086** before **T-036**; complete **T-090** before **T-037**._

---

## C-UI — Component library (26)

| ID | Task | Deps |
|----|------|------|
| T-038 | Implement `AppScreen` | T-025 |
| T-039 | Implement `GradientBackground` | T-025 |
| T-040 | Implement `SafeAreaLayout` | T-025 |
| T-041 | Implement `GlassCard` | T-025 |
| T-042 | Implement `Section` | T-025 |
| T-043 | Implement `CollapsibleSection` | T-025, T-035 |
| T-044 | Implement `BottomSheet` | T-017, T-025 |
| T-045 | Implement `SlidePanel` | T-025, T-035 |
| T-046 | Implement `TextField` | T-025 |
| T-047 | Implement `SearchField` | T-025 |
| T-048 | Implement `OTPField` | T-025 |
| T-049 | Implement `SelectSheet` | T-044 |
| T-050 | Implement `PrimaryButton` | T-025, T-035 |
| T-051 | Implement `SecondaryButton` | T-025, T-035 |
| T-052 | Implement `IconButton` | T-025, T-035 |
| T-053 | Implement `FAB` | T-025, T-035 |
| T-054 | Implement `FeatureCard` | T-025 |
| T-055 | Implement `StatCard` | T-025 |
| T-056 | Implement `ListRow` | T-025 |
| T-057 | Implement `MediaCard` | T-025 |
| T-058 | Implement `BottomTabBar` (styled, tokens) | T-025 |
| T-059 | Implement `Header` | T-025 |
| T-060 | Implement `LargeTitleHeader` | T-025 |
| T-061 | Implement `SkeletonLoader` | T-025 |
| T-062 | Implement `EmptyState` | T-025 |
| T-063 | Implement `LoadingState` (skeleton-first; no spinners for content) | T-025 |

---

## C-STATE — Client state, forms, API

| ID | Task | Deps |
|----|------|------|
| T-064 | Create MMKV singleton + typed key constants | T-015 |
| T-065 | Create Zustand session slice | T-064 |
| T-066 | Create Zustand UI chrome slice | T-064 |
| T-067 | Create Zustand feature-flag slice | T-064 |
| T-068 | Define Zod schemas for auth (and shared error messages) | T-020 |
| T-069 | Wire `react-hook-form` on auth screens using `TextField` (**run after** T-079–T-083) | T-046, T-068, T-079, T-080, T-081, T-082, T-083 |
| T-070 | Extend API client + add placeholder React Query hooks | T-029 |
| T-071 | Implement one optimistic mutation with rollback | T-070 |
| T-072 | Add pull-to-refresh on list screens (pattern) | T-038, T-056 |
| T-073 | Create centralized haptics helper | T-015 |
| T-074 | Implement optional biometric flow + settings stub | T-015, T-080, T-091 |

---

## C-NAV — Routes & shells

| ID | Task | Deps |
|----|------|------|
| T-075 | Persist routing flags in MMKV (`onboarding`, `session`) and read on boot | T-064, T-065 |
| T-076 | Implement animated splash route (gradient, orb, glow, 1200–2000ms fade) | T-031, T-034 |
| T-077 | Implement root redirect: splash → onboarding? → auth? → `(app)` | T-031, T-075, T-076 |
| T-078 | Create `app/(auth)/_layout.tsx` stack | T-031 |
| T-079 | Create `welcome` screen | T-078 |
| T-080 | Create `sign-in` screen (keyboard-safe) | T-078 |
| T-081 | Create `sign-up` screen | T-078 |
| T-082 | Create `forgot-password` screen | T-078 |
| T-083 | Create `otp-verify` screen | T-078 |
| T-084 | Create `app/(onboarding)/_layout.tsx` | T-031 |
| T-085 | Implement 3-step onboarding pager + skip + CTAs | T-084, T-075 |
| T-086 | Create `app/(app)/(tabs)/_layout.tsx` — 5 tabs, custom tab bar, haptics | T-031, T-058, T-073 |
| T-087 | Create home tab stack + index | T-086 |
| T-088 | Create explore tab stack (search + detail routes) | T-086 |
| T-089 | Create activity tab stack + index | T-086 |
| T-090 | Create AI tab stack + voice orb screen | T-086, T-037 |
| T-091 | Create profile tab stack (profile + settings routes) | T-086 |
| T-092 | Apply stack options: visible back, large title where needed, no hamburger | T-087–T-091 |

---

## C-SCREEN — Core screen composition

| ID | Task | Deps |
|----|------|------|
| T-093 | Compose Home tab UI using system components only | T-087, T-038–T-063 |
| T-094 | Compose Explore / search + Detail UIs | T-088, T-047 |
| T-095 | Compose Activity / saved UI | T-089 |
| T-096 | Compose Profile + Settings UIs | T-091 |

### Orqestra Manual Execution (domain tabs + agent cards)
- Add `ManualExecutionScreen` route/screen (separate from the existing `DashboardScreen`).
- Implement domain tabs (planning, architecture, backend, frontend, infrastructure, testing, QA, security, repair, release, documentation, monitoring) using `SegmentedTabs`.
- Implement agent card grid/list per tab (agent tile schema: `agentName`, `role`, `currentStatus`, `supportedTaskType`, `lastRunResult`, `elapsedTime`, `retryCount`, `lastArtifact`, `executionAvailability`, `disabledReason`).
- Add primary CTA on each card to start manual execution (disabled when eligibility validation returns not-eligible).
- Add per-agent task preset selection UI (either in the card or inside the task detail bottom sheet).
- Build task detail bottom sheet/modal launched from the card CTA (show `selectedAgent`, `taskPreset`, `targetScope`, `dependencies`, `environment`, `riskLevel`, `policyConstraints`, `expectedOutputs`).
- Implement confirmation flows for destructive/high-risk presets (rollback, environment reprovisioning, production deployment validation) inside the bottom sheet.
- Add per-card run history section (recent executions + outcomes) in the card or as a secondary sheet/tab.
- Wire live state updates into the UI (cards update from SSE task/run events; reflect states: queued, validating, retrying, blocked, executing, failed, completed, rolled_back).
- Add UI-level safeguards: prevent duplicate clicks when a run is already queued/executing for the same card/preset.
- Add frontend tests for rendering + state transitions (mock eligibility responses and mocked SSE events).

---

## C-MIG — Legacy migration & tests

| ID | Task | Deps |
|----|------|------|
| T-097 | Migrate legacy Control Center screens into new routes per spec T-012 | T-093–T-096, T-012 |
| T-098 | Delete obsolete navigator code paths after migration | T-097 |
| T-099 | Update Jest / RTL tests for new paths and imports | T-097 |

---

## C-OPS — DevOps

| ID | Task | Deps |
|----|------|------|
| T-100 | Add `eas.json` (development, preview, production) | T-022 |
| T-101 | Document EAS Update channels + runtime version policy | T-100 |
| T-102 | Configure Sentry source maps upload for EAS builds | T-028, T-100 |
| T-103 | Add GitHub Actions workflow: `npm ci`, `tsc --noEmit`, `jest --ci` | T-020, T-018 |
| T-104 | Add `maestro/` smoke flows + optional CI / nightly job | T-019, T-103 |

### Backend: Manual agent execution endpoints + orchestration
- Extend backend data model with first-class manual execution entities (`AgentRun`) and preset definitions (`TaskPreset`) including statuses suitable for the UI.
- Add stores for manual execution state (agent runs + task presets) and ensure they integrate with persistence/hydration in `jsonPersistence.ts`.
- Add new backend router `backend/src/routes/manual.ts` and register it in `backend/src/routes.ts`.
- Implement backend endpoints:
  - `listExecutableAgents`
  - `listTaskPresets`
  - `validateExecution`
  - `startManualRun`
  - `fetchRunHistory`
- Implement eligibility/policy validation:
  - gate by environment readiness (environment exists, allowed actions include the preset action),
  - gate by agent availability/busy constraints (no conflicting in-flight run),
  - enforce retry limits (retry count/attempt boundaries),
  - check dependency graph conflicts (prevent conflicting manual actions),
  - return UI-friendly `disabledReason` and `policyDecision`.
- Implement `startManualRun` orchestration integration:
  - create the `AgentRun`,
  - create/enqueue the appropriate underlying agent tasks via the existing workflow engine/task lifecycle,
  - attribute tasks/events back to the `AgentRun` so SSE can correlate updates.
- Add SSE live updates for manual execution:
  - broadcast `agentRun.updated` and `agentRun.finalized` transitions (and keep the existing `task.*` events flowing),
  - update card states using the existing SSE parsing approach in the mobile app.
- Add audit logging fields for manual triggers (triggeredBy, triggeredAt, reason, policyDecision, affectedScope, resultingArtifacts) in the same audit pipeline used by autonomous execution.
- Add backend tests for validate/start/persistence and for SSE emission of manual-run events.

---

## Checklist (copy for issue trackers)

- [x] T-001
- [x] T-002
- [x] T-003
- [x] T-004
- [x] T-005
- [x] T-006
- [x] T-007
- [x] T-008
- [x] T-009
- [x] T-010
- [x] T-011
- [x] T-012
- [x] T-013
- [x] T-014
- [x] T-015
- [x] T-016
- [x] T-017
- [x] T-018
- [x] T-019
- [x] T-020
- [x] T-021
- [x] T-022
- [x] T-023
- [x] T-024
- [x] T-025
- [x] T-026
- [x] T-027
- [x] T-028
- [x] T-029
- [x] T-030
- [x] T-031
- [x] T-032
- [x] T-033
- [x] T-034
- [x] T-035
- [ ] T-036
- [ ] T-037
- [x] T-038
- [x] T-039
- [x] T-040
- [x] T-041
- [x] T-042
- [x] T-043
- [x] T-044
- [x] T-045
- [x] T-046
- [x] T-047
- [ ] T-048
- [ ] T-049
- [ ] T-050
- [ ] T-051
- [ ] T-052
- [ ] T-053
- [ ] T-054
- [ ] T-055
- [ ] T-056
- [ ] T-057
- [ ] T-058
- [ ] T-059
- [ ] T-060
- [ ] T-061
- [ ] T-062
- [ ] T-063
- [ ] T-064
- [ ] T-065
- [ ] T-066
- [ ] T-067
- [ ] T-068
- [ ] T-069
- [ ] T-070
- [ ] T-071
- [ ] T-072
- [ ] T-073
- [ ] T-074
- [ ] T-075
- [ ] T-076
- [ ] T-077
- [ ] T-078
- [ ] T-079
- [ ] T-080
- [ ] T-081
- [ ] T-082
- [ ] T-083
- [ ] T-084
- [ ] T-085
- [ ] T-086
- [ ] T-087
- [ ] T-088
- [ ] T-089
- [ ] T-090
- [ ] T-091
- [ ] T-092
- [ ] T-093
- [ ] T-094
- [ ] T-095
- [ ] T-096
- [ ] T-097
- [ ] T-098
- [ ] T-099
- [ ] T-100
- [ ] T-101
- [ ] T-102
- [ ] T-103
- [ ] T-104

---

## Parallel work (after prerequisites)

- **T-002–T-011** can run in parallel once **T-001** exists (single-file merge: prefer one branch).
- **T-038–T-057** (components through `MediaCard`) parallelizable in **PG-UI** after **T-025**.
- **T-079–T-083** parallelizable after **T-078** once shells exist.

## Critical path (short)

`T-014 → T-015 → T-020 → T-021 → T-023–T-025 → T-026–T-027 → T-031 → T-058 → T-086 → T-093+`
