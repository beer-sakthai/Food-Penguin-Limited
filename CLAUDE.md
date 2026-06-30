# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Dev server: tsx runs server.ts, which mounts Vite in middleware mode + the /api routes on port 3000
npm run build    # vite build (frontend → dist/) + esbuild bundles server.ts → dist/server.cjs
npm start        # Production: node dist/server.cjs (serves dist/ statically + API; requires NODE_ENV=production)
npm run lint     # Type-check only: tsc --noEmit  (this is the only "test" — there is no test runner/suite)
npm run clean    # rm -rf dist server.js
```

There is **no test framework** configured. `npm run lint` (TypeScript type-checking) is the validation step. Don't suggest `npm test` or `npm run preview` (the README mentions preview but no such script exists).

**Always run via `npm run dev`, not `vite` directly.** The Express server in `server.ts` *is* the dev server (Vite runs as its middleware) and also hosts every `/api/gemini/*` endpoint. Running plain `vite` serves the UI but breaks all AI features.

## Architecture

This is a single-page React 19 + TypeScript + Vite operational dashboard for a sushi/food retail company, with an Express backend that proxies Google Gemini AI calls. Three architectural facts dominate the codebase and are not obvious from any single file:

### 1. `server.ts` is a combined dev-server + AI proxy
`server.ts` is the entry point for both dev and prod. It:
- In dev (`NODE_ENV !== production`): creates a Vite server in `middlewareMode` and mounts it, so the same process serves the SPA and the API.
- Exposes ~10 `POST /api/gemini/*` endpoints (strategic-advisor, low-latency-cmd, generate-marketing-image, analyze-dish-photo, search-trends, suggest-restock, shift-summary, capacity-quickfix, sustainability-report, finance-analysis). The frontend calls these by relative path (`fetch("/api/gemini/...")`); **the Gemini API key never reaches the client.**
- Uses one lazy shared `GoogleGenAI` client (`getAiClient()`).

**Simulation Mode is a first-class feature.** `isRealGeminiKey()` treats a key as valid only if it starts with `AIzaSy` (and isn't a known placeholder). When the key is missing/invalid, **and** as a `catch` fallback when any live Gemini call throws, every endpoint returns hard-coded mock responses (and mock SVGs for images). The app is fully functional with zero configuration. Preserve this pattern when adding endpoints: validate input → check `isRealGeminiKey` → live call wrapped in try/catch → simulated fallback.

### 2. `src/firebase.ts` is NOT Firebase — it's a localStorage emulator
Despite importing names like `auth`, `db`, `collection`, `onSnapshot`, `setDoc`, `signInWithPopup`, this module is a hand-written mock that reimplements the Firebase SDK surface on top of `localStorage`. Collections persist under `fs_<collectionName>` keys; cross-tab/live updates are simulated by dispatching `StorageEvent`s. The `firebase` npm dependency is installed but unused by this file. Any "database" work happens in the browser — there is no server-side persistence. `LoginScreen.tsx` writes a `localCurrentUser` entry to localStorage.

### 3. `src/App.tsx` (~200 KB) is the central orchestrator
Everything funnels through `App.tsx`: it holds the seed state (imported from `src/data.ts`), the `rolePermissions` RBAC map (Admin / Manager / Staff / User → allowed tab list), the active week/date-range scope, theme state, and renders one of the `src/components/*Tab.tsx` views. `src/data.ts` is the single source of seed/mock data (multi-week operational logs, orders, targets, etc.); `src/types.ts` holds the shared interfaces. Each tab in `src/components/` owns its own AI `fetch` calls to the relevant `/api/gemini/*` endpoint.

## Project Rules (from GEMINI.md)

`GEMINI.md` is this project's AI-guidance file and carries binding conventions. Key ones:

- **Manual AI refresh only.** Never add automatic/background polling or timer-driven AI calls — it would blow the free-tier quota. AI runs only on explicit user action (button click) or core tab switches.
- **Gold-liner UI.** Active inputs/selects use `focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500` plus a gold shadow glow; interactive elements use micro-animations like `hover:-translate-y-0.5` and `active:scale-[0.98]`. Match this when adding controls.
- **Boundary validation on bulk edits.** Bulk forecast/capacity changes must pre-simulate the result and show a `lucide-react` `AlertTriangle` warning when values breach hard limits (e.g. `>110%` or `<0%`) before applying.

### Project Rules (from .agents/AGENTS.md)

- **Three font sizes only.** `src/index.css` defines exactly three sizes via Tailwind's `@theme` (Detail `1.05rem`, Headline `1.5rem`, Number `2.5rem`), each mapped across multiple Tailwind scale tokens (e.g. `--font-size-xs` through `--font-size-base` all resolve to `1.05rem`). Don't introduce ad-hoc text sizes outside this scale.
- **Scratch files excluded from the build.** Root-level throwaway/scratch files (e.g. `scratch-selltab-original.tsx`) must stay out of TypeScript compilation — keep them listed in `tsconfig.json`'s `exclude`.

### Model-name caveat
The README and GEMINI.md state the project "strictly" uses `gemini-1.5-flash`. The actual code in `server.ts` is the source of truth and is mixed: most text endpoints use `gemini-1.5-flash`, but `analyze-dish-photo` uses `gemini-3.1-pro-preview` and image generation uses `gemini-3-1-flash-image-preview` / `gemini-3-pro-image-preview`. Several endpoints also carry stale `// Model: gemini-3.1-pro-preview` comments above code that actually calls `gemini-1.5-flash` — trust the `model:` string in the `generateContent` call, not the comment. When editing models, check `server.ts` directly rather than trusting the docs, and prefer flash unless the user says otherwise.

### Stitch MCP for UI work (from .agents/AGENTS.md)
When asked to design, build, or iterate on UI, prioritize the `StitchMCP` server tools (`generate_screen_from_text`, `create_project`, `create_design_system`, connects to stitch.withgoogle.com) over hand-coding a design from scratch, unless the user explicitly asks for manual coding.

## Deployment

`.github/workflows/deploy.yml` builds (`npm ci && npm run build`) and publishes `dist/` to GitHub Pages on every push to `main` (or manual `workflow_dispatch`). This is a static deploy of the Vite frontend only — it does not run `server.ts`, so on Pages the `/api/gemini/*` proxy doesn't exist and the app falls back to Simulation Mode entirely. Keep this in mind when changing build output paths or adding server-dependent features.

## Repo hygiene notes

- The root-level `.cjs` files (`modify_*.cjs`, `update_*.cjs`, `apply_animations_v4.cjs`, `repair.cjs`, `fix_ai.cjs`, etc.) and `.txt` files (`target.txt`, `replacement.txt`, `grep_inputs.txt`) are **one-off, throwaway patch/codegen scripts** that string-slice edits into source files. They are not part of the build and not maintained — don't treat them as reference, and don't run them. Edit source files directly with normal tools instead.
- Path alias `@` resolves to the project root (see `vite.config.ts`).
- HMR is gated by the `DISABLE_HMR` env var (used by AI Studio to prevent flicker during agent edits) — don't remove that logic.
- `GEMINI_API_KEY` is read from `.env` (see `.env.example`); `.env*` is gitignored except `.env.example`.
