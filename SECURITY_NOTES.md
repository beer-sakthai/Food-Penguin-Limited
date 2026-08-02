# Security Notes — Food-Penguin-Limited

## Current Status

`npm audit` reports **0 vulnerabilities** across production and dev dependencies.

Automated dependency hygiene:
- `.github/workflows/ci.yml` runs `npm audit --omit=dev --audit-level=high` on every push and PR.
- `.github/dependabot.yml` schedules weekly npm and GitHub Actions update PRs.

## Fixed

| Vulnerability | Fix |
|-------------|-----|
| sharp (4 CVEs) | `overrides.sharp` pinned to `0.35.0` |
| onnxruntime-web (via @xenova/transformers) | `overrides.onnxruntime-web` set to `^1.27.0` |
| protobufjs (1 critical, 3 high) | `overrides.protobufjs` set to `^7.6.5` |
| onnx-proto | `overrides.onnx-proto` set to `>=1.16.0` |

The `overrides` block in `package.json` forces the fixed versions transitively even though `@google/genai` and `onnxruntime-web` had older pins upstream.

## Re-verification

```
npm ci
npm audit
npm ls protobufjs --all
```

Expected: `protobufjs@7.6.5 overridden` at every location and `0 vulnerabilities` reported.
