# Test hardening orchestrator



Phased production-readiness validation for this monorepo (`backend/`, `mobile/`).



## Phases (strict order)



1. **Inventory** — `npm run run:inventory` → `inventory/COMPONENT_INVENTORY.json`, `FEATURE_INVENTORY_MATRIX.json`

2. **Deps audit** — `npm run run:deps-audit` → `reports/artifacts/deps_audit.json` (unused deps hint, `npm audit` summary)

3. **Smoke** — `npm run phase:smoke` (requires `backend` built: `npm run build` in `backend/`)

4. **Regression** — `npm run phase:regression` (backend Vitest; JSON at `backend/reports/vitest-results.json`, copied to `reports/artifacts/vitest-results.json`)

5. **Deep** — `npm run phase:deep` (docs consistency, dependency audit, mobile Jest)

6. **Chaos** — `npm run phase:chaos` (scripts in `chaos/`)

7. **E2E** — `npm run phase:e2e` (Playwright API + Expo web smoke; `npx playwright install chromium` on first run)

8. **Aggregate** — `npm run run:aggregate` → eight reports under `reports/`



Full pipeline:



```bash

cd app_core/test_hardening

npm install

npm run run:verify

```



Triage mode (continues after a failed phase — **not** for launch):



```bash

set ALLOW_PHASE_CONTINUE=1

npm run run:verify:partial

```



## Artifact paths



| Output | Path |

| ------ | ---- |

| Phase results | `reports/artifacts/phase_*.json` |

| Vitest JSON | `reports/artifacts/vitest-results.json` |

| Deps audit | `reports/artifacts/deps_audit.json` |

| Docs check | `reports/artifacts/docs_consistency.json` |

| Soak skip marker | `reports/artifacts/soak_skipped.json` |

| Eight reports | `reports/*.md`, `FULL_TEST_MATRIX.json` |



## Environment



| Variable | Purpose |

| -------- | ------- |

| `ALLOW_PHASE_CONTINUE` | `1` = do not stop orchestrator on first failed phase |

| `ENFORCE_ROLLBACK_GATE` | `1` = require `reports/artifacts/rollback_proof.json` for launch gate |

| `STATE_DIR` | Backend persistence dir (used by backend processes) |

| `E2E_PORT` | Backend port for Playwright (API suite default **4020**, web suite default **4010** unless set) |

| `GITHUB_SHA` / `CI_COMMIT_SHA` | Commit surfaced in `TEST_EXECUTION_SUMMARY` and matrix |



## Backend tests (parallelism)



Vitest uses a **single fork** and serial files (`backend/vitest.config.ts`) so in-memory stores stay isolated. Do not run multiple backends on the same `STATE_DIR`.



## Defects & repair loop



1. **Detect** — failing phase or manual entry in `defects/defects.jsonl`  

2. **Classify** — P0–P3, module, `detectedInPhase`  

3. **Trace** — `rootCause`, link `testCaseIds` to `FULL_TEST_MATRIX.json` traceability  

4. **Fix** — code change, `fixCommit` optional  

5. **Revalidate** — re-run the failing phase + full `run:verify` for release candidates  

6. **Close** — only in `verified` → `closed` after regression green; validate with `npm run validate:defects`



Append JSON lines to `defects/defects.jsonl` (see `defects/schema.json`). Statuses: `open` → `in_progress` → `fixed` → `verified` → `closed`.



## Docker



```bash

docker compose -f app_core/test_hardening/docker/docker-compose.yml up --build

```



Optional Postgres profile: `docker compose -f app_core/test_hardening/docker/docker-compose.yml --profile db up`



## Windows vs Linux



Chaos and Playwright are most reliable in **Linux CI**. Smoke starts a real Node process on an ephemeral `STATE_DIR`.



## Reports



`BROKEN_FEATURES_REPORT.md`, `CRITICAL_FAILURES_REPORT.md`, `FULL_TEST_MATRIX.md` (+ `.json`), `FEATURE_HEALTH_SCORECARD.md`, `SERVICE_HEALTH_SCORECARD.md`, `REMEDIATION_QUEUE.md`, `LAUNCH_BLOCKERS_REPORT.md`, `TEST_EXECUTION_SUMMARY.md`.





