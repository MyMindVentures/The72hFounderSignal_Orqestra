# Playwright E2E

## API suite (`playwright.config.ts`)

Specs in this folder (except `web/`) hit the **backend HTTP API** (same contracts as [`mobile/src/lib/api.ts`](../../../mobile/src/lib/api.ts)). The config starts the compiled backend via `webServer`.

- **Env**: `BACKEND_URL` / `E2E_PORT` (default backend **4020**), `E2E_STATE_DIR` for isolation.

## Expo web suite (`web/playwright.web.config.ts`)

Browser tests against **Expo web** (Metro). Playwright starts:

1. Compiled backend (`backend/dist`) with `EXPO_PUBLIC_API_BASE_URL` pointing at it.
2. `npx expo start --web --localhost` with `RCT_METRO_PORT` (default **8095**), `CI=1`, `EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:<E2E_PORT>`.

Run locally:

```bash
cd app_core/test_hardening
npm run e2e:playwright:web
```

Override ports: `E2E_PORT=4000 EXPO_WEB_PORT=8095`.

## Docker

`docker compose -f ../docker/docker-compose.yml up` then align `EXPO_PUBLIC_API_BASE_URL` with the published host/port.

Artifacts: Playwright output under `test-results/` when tests fail.


