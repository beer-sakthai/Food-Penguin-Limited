# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (Express + Vite HMR) on http://localhost:3000
npm run build    # Build frontend (Vite) + bundle server (esbuild) into dist/
npm run start    # Run the production build (node dist/server.cjs)
npm run lint     # Type-check only (tsc --noEmit — no test suite exists)
```

## Environment

Copy `.env.example` to `.env` and set `GEMINI_API_KEY`. Without it, all five AI endpoints return hard-coded simulation responses instead of calling the API — the app still functions fully in that mode.

## Architecture

The app is a single-page React dashboard served by an Express backend. Both run from `server.ts`:

- **Development**: `tsx server.ts` starts Express, which mounts Vite as middleware (SPA mode with HMR).
- **Production**: Vite output is served as static files from `dist/`.

### Data flow

All application state lives in `App.tsx` as `useState` hooks, seeded from `src/data.ts`. There is no external store or context. State is passed down to tab components as props, and mutations happen via handler functions (`handleAddOrder`, `handleUpdateTaskStatus`, etc.) defined in `App.tsx` and forwarded as props. Several handlers also reactively sync `CoreMetrics` and `CompanyTarget.currentValue` when records are added or task statuses change.

### Key files

| File | Role |
|---|---|
| `server.ts` | Express entry point + all 5 Gemini AI API routes |
| `src/App.tsx` | State hub, RBAC gating, navigation, renders active tab |
| `src/types.ts` | All TypeScript interfaces (`CoreMetrics`, `SalesOrder`, `ProductionTask`, etc.) |
| `src/data.ts` | Seed arrays for all initial state |
| `src/components/*.tsx` | One file per dashboard tab, purely presentational + local UI state |

### Tab components

Eight tabs, each a self-contained component: `OverviewTab`, `SellTab`, `TargetTab`, `ProductionTab`, `WasteTab`, `HoursTab`, `PlanningTab`, `RealtimeTab`.

### Role-based access (RBAC)

Defined in `App.tsx` as `rolePermissions`:

| Role | Tabs accessible |
|---|---|
| Admin | All 8 tabs |
| Manager | All except Sell |
| Staff | Overview, Sell, Production, Waste, Real-time |

### Backend AI routes (`server.ts`)

| Endpoint | Model | Purpose |
|---|---|---|
| `POST /api/gemini/strategic-advisor` | `gemini-3.1-pro-preview` (ThinkingLevel.HIGH) | Multi-layered strategic advice |
| `POST /api/gemini/low-latency-cmd` | `gemini-3.1-flash-lite` | Quick floor-lead responses |
| `POST /api/gemini/generate-marketing-image` | `gemini-2.5-flash-image` | Marketing banner generation |
| `POST /api/gemini/analyze-dish-photo` | `gemini-3.1-pro-preview` | Vision-based dish quality audit (accepts base64, max 12 MB) |
| `POST /api/gemini/search-trends` | `gemini-3.5-flash` | Google Search-grounded market research |

All routes check for a missing/placeholder key and return simulation fallback JSON — they never throw in that case.

### Path alias

`@/` resolves to the project root (configured in both `tsconfig.json` and `vite.config.ts`).
