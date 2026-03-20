# Autonomous platform backend



Express API for blueprint ingestion, job orchestration, workflow engine, SSE streaming, and JSON file persistence (`.state/` or `STATE_DIR`).



## Scripts



- `npm run dev` — development server (`PORT` defaults to 4000)

- `npm run build` — TypeScript compile to `dist/`

- `npm start` — run compiled server

- `npm test` — Vitest integration and unit tests (uses `STATE_DIR` temp dirs)



## Environment



| Variable   | Description |

| ---------- | ----------- |

| `PORT`     | HTTP port (default `4000`) |

| `STATE_DIR`| Absolute path for JSON persistence (default `./.state` under cwd) |

| `GIT_COMMIT` | Optional; surfaced on `/api/health` |



## API



Mounted under `/api` — see `src/routes.ts` for route list (`/health`, `/projects`, `/blueprints`, `/stream`, `/admin`, etc.).



Admin routes require header `x-role: admin` (demo auth only; not production-safe).


