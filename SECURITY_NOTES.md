# Security Notes — Food-Penguin-Limited

## Current Status

| Severity | Count | Packages | Can fix? |
|----------|:-----:|----------|:--------:|
| Critical | 1 | protobufjs (via @google/genai + onnxruntime-web) | ❌ Upstream pinned |
| High | 3 | protobufjs | ❌ Upstream pinned |

## Fixed (from 12 reported by Dependabot)

| Vulnerability | Fix |
|-------------|-----|
| sharp (4 CVEs) | Override to 0.35.0 ✅ |
| onnxruntime-web | Override to 1.21.0+ ✅ |
| @xenova/transformers | Pinned via package.json ✅ |

## Remaining Risk

The 4 remaining vulnerabilities are in `protobufjs`, pinned by:
- `@google/genai` (Gemini API) — needs their release
- `onnxruntime-web` (via `@xenova/transformers`) — needs their release

**Acceptable risk:** These are server-side dependencies not directly exposed to users. No action until upstream releases fixes.
