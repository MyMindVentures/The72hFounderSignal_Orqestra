## Autonomous Mobile App-Building Platform

This repository contains a reference implementation for a mobile-first **Control Center** that orchestrates autonomous software engineering and DevOps agents from a blueprint upload.

### Structure

- `backend/` – API gateway, orchestration service, core data models, and integrations.
- `mobile/` – Mobile Control Center app focused on monitoring, control, and status visualization.

### Getting Started

See [`backend/README.md`](backend/README.md) for API setup and [`mobile/README.md`](mobile/README.md) for the Expo app.

### Production readiness (test hardening)

Phased validation (smoke → regression → deep → chaos → E2E) and aggregated reports live under [`app_core/test_hardening/`](app_core/test_hardening/README.md). Run:

```bash
cd app_core/test_hardening && npm install && npm run run:verify
```

CI: [`.github/workflows/prod-readiness.yml`](.github/workflows/prod-readiness.yml).

