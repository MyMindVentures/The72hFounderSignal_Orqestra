# Maestro CLI (Smoke Tests)

This repo uses Maestro for end-to-end UI smoke tests to catch regressions in navigation, onboarding, and tab transitions.

## Prerequisites
- Maestro test flows will live under `mobile/maestro/` (added as part of `T-104`).

## Run smoke tests
Once the `maestro/` folder exists:

```sh
npx maestro test "maestro/**/*.yaml"
```

### Example: run only iOS flows
```sh
npx maestro test "maestro/**/ios/**/*.yaml"
```

## Notes
- Maestro is optional; CI/nightly execution may be configured later.
- Use Maestro to validate that the premium navigation rules (5-tab structure, stack push/back visibility, splash/onboarding redirect) still hold after changes.

