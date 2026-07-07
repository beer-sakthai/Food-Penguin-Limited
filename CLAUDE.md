# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ Known current-state issue

As of `main`, `src/App.tsx` (43 lines) and `server.ts` (5 lines) contain **only import statements — no component body, no `export default`, no route/server setup**. There is no `app.listen(...)` in `server.ts` and no `function App()`/JSX in `App.tsx`. This means the app does not currently build or run, and CI (`ci.yml` / `webpack.yml`) is failing on `main`. Docs like `README.md`, `AGENTS.md`, and `MENU_ENGINEERING.md` describe `App.tsx` as the "main orchestration entry point" with `allTabMeta`, `rolePermissions`, and `handleAdd*` handlers — that description reflects the *intended* architecture, not the current file contents. Check `git log -- src/App.tsx server.ts` for the last known-good revision before assuming these files are complete.

## Commands

- `npm run dev` — starts the Express/Vite dev server (`tsx server.ts`), binds `0.0.0.0:3000`.
- `npm run build` — builds the Vite frontend, then bundles `server.ts` to `dist/server.cjs` via esbuild.
- `npm run start` — runs the production bundle from `dist/server.cjs`.
- `npm run lint` — runs `tsc --noEmit`; this is the primary type-check/lint step (no ESLint configured).
- `npm run clean` — removes `dist/` and `server.js`.
- No test framework is configured. Validate changes with `npm run lint` and `npm run build`, and by exercising the affected tab at `http://localhost:3000/` in both light and dark mode.
- If `npm run build` fails due to a locked `dist/dev-server*.log`, stop the running dev server first.

## Architecture

This is a React 19 + TypeScript + Vite single-page dashboard originated from Google AI Studio (see the `AI Studio` / `DISABLE_HMR` comments in `vite.config.ts`), with an Express server (`server.ts`, run via `tsx`) that also proxies calls to the Gemini API (`@google/genai`).

- `src/main.tsx` mounts `<App />` from `src/App.tsx`.
- `src/App.tsx` is intended to own all top-level state: current user/role, active tab, selected branch, calendar week scope, and the `allTabMeta` / `rolePermissions` tables that drive the sidebar and RBAC (Admin/Manager/Staff/User). Each dashboard module is registered here and gated by role.
- `src/components/*Tab.tsx` — one component per dashboard module (Overview, Sell, Production, Waste, Hours, Target, Energy, Suppliers, Finance, Studio, MenuEngineering, ResourceAllocation, Planning, Reports, DataAnalyst, Advisor, Capacity*). New modules follow the same pattern: add a tab meta entry + role permission entry in `App.tsx`, then a component here.
- `src/design-system/` — shared primitives (`Button`, `Card`, `Badge`, `Input`, `Select`, `StatCard`), re-exported from `src/design-system/index.ts`. Prefer these over ad-hoc markup for new UI.
- `src/data.ts` — local seed/mock data generators and multi-week data maps used as the initial state for all modules (sales, targets, recipes, production tasks, waste, hours, inventory, alerts, menu items).
- `src/types.ts` — all shared TypeScript interfaces (`CoreMetrics`, `SalesOrder`, `CompanyTarget`, `Recipe`, `ProductionTask`, `WasteRecord`, `EmployeeHour`, `InventoryItem`, `RealtimeAlert`, `DailyOperationalLog`, `MenuEngineeringItem`, etc.).
- `src/firebase.ts` — **not real Firebase**. It's a `localStorage`-backed emulator that reimplements the Firebase Auth/Firestore surface (`auth`, `db`, `signOut`, `onAuthChange`, `setDoc`, `doc`, `getDocs`, `collectionDocs`, `handleFirestoreError`, `OperationType`) so the app persists data locally/offline while keeping Firebase-shaped call sites. Don't assume writes go to a real backend.
- `src/index.css` — Tailwind v4 `@theme` config. Enforces a **three-size typography system**: detail `14px`, label `18px`, number/key-metric `32px` (mapped onto Tailwind's `text-*` scale) — don't introduce ad-hoc font sizes.
- Root-level `modify_*.cjs`, `update_*.cjs`, `repair.cjs`, `fix_ai.cjs`, `add_finance_api.cjs`, `apply_animations_v4.cjs`, `replace_logic.cjs` are one-off maintenance scripts from prior automated edits, not part of the build. Prefer direct TS/CSS edits; only touch these if clearly relevant. `scratch-selltab-original.tsx` is a legacy scratch file excluded from `tsconfig.json`'s compilation scope — keep any new scratch files excluded the same way rather than adding them to the build.

## Project-specific conventions

- **AI model constraints**: text tasks strictly use `gemini-1.5-flash`; image generation uses `imagen-3.0-generate-001`. Don't upgrade to Pro or other models without explicit instruction.
- **Manual-only AI calls**: never add continuous/automatic background polling for AI insights (e.g. `fetchShiftSummary`) — all AI calls must be triggered by explicit user interaction (button click or tab switch) to respect free-tier quota limits.
- **Styling**: active inputs/forms use a consistent "gold liner" focus style (`focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500` plus a gold shadow glow); interactive elements use small hover/active micro-animations (e.g. `hover:-translate-y-0.5`, `active:scale-[0.98]`) via `motion/react`.
- **Bulk edits need boundary checks**: features that apply bulk numeric changes (e.g. capacity forecast overrides) must simulate the resulting state and surface a warning (`lucide-react`'s `AlertTriangle`) before applying if a hard physical boundary is exceeded (e.g. >110% or <0%).
- **Input validation gap**: per `SECURITY_AUDIT_REPORT.md`, handler functions (`handleAdd*`/`handleUpdate*` in `App.tsx`) generally spread incoming objects without type/range checks or stripping unknown fields — be deliberate about validating new inputs rather than assuming existing patterns already do so.

## Commit conventions

Recent history mostly follows Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`) with a concise summary; match that style.
