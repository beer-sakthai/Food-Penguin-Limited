# Food Penguin Limited

Food Penguin Limited is a React + TypeScript + Vite dashboard with an Express API layer for operational reporting, branch planning, and manual AI-assisted workflows.

## Current status

This repository is best understood as a **rich internal demo / prototype**:
- UI flows are polished and feature-heavy
- most business data is seeded locally from `/home/runner/work/Food-Penguin-Limited/Food-Penguin-Limited/src/data.ts`
- there is no persistent database or production auth system in this repo

## What the app includes

- Overview dashboard with KPI cards, branch-level metrics, and weekly production/capacity analysis
- Branch product views for Marks & Spencer and Tesco branches
- Production, waste, hours, target, planning, and studio tabs
- CSV/PDF export flows for capacity reporting
- Manual AI utilities for shift summaries, strategy prompts, trend lookup, restock suggestions, image generation, and dish-photo analysis

## Architecture

### Frontend
- `/home/runner/work/Food-Penguin-Limited/Food-Penguin-Limited/src/App.tsx` orchestrates shell-level state and navigation
- `/home/runner/work/Food-Penguin-Limited/Food-Penguin-Limited/src/components/` contains the feature tabs and charts
- `/home/runner/work/Food-Penguin-Limited/Food-Penguin-Limited/src/lib/` contains shared app helpers for branch/catalog and capacity-report logic
- `/home/runner/work/Food-Penguin-Limited/Food-Penguin-Limited/src/data.ts` holds seeded demo data
- `/home/runner/work/Food-Penguin-Limited/Food-Penguin-Limited/src/types.ts` defines shared domain types

### Backend
- `/home/runner/work/Food-Penguin-Limited/Food-Penguin-Limited/server.ts` boots the Express server and Vite middleware
- `/home/runner/work/Food-Penguin-Limited/Food-Penguin-Limited/server/geminiRoutes.ts` contains the AI/image API endpoints

## AI model constraints used in this repo

- Language tasks use `gemini-1.5-flash`
- Image generation uses `imagen-3.0-generate-001`
- AI actions are **manual/on-demand**; there should be no automatic background AI polling loop
- When `GEMINI_API_KEY` is absent, the API returns simulation/fallback responses so the demo still works

## Scripts

```bash
npm install
npm run dev
npm run lint
npm run build
npm run start
```

## Environment

Use `/home/runner/work/Food-Penguin-Limited/Food-Penguin-Limited/.env.example` as the starting point.

## Notes

- The development server runs through `tsx server.ts`
- The production build outputs the frontend bundle and `dist/server.cjs`
- There is currently no dedicated automated test suite in the repository; validation is primarily via type-checking and production builds
