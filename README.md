# Food Penguin Limited

Food Penguin Limited is a React + TypeScript + Vite dashboard with an Express API layer for operational reporting, branch planning, and manual AI-assisted workflows.

## What this project is

This repository is currently best understood as an internal demo or prototype. It includes a polished UI and several business-focused workflows, while most data is still seeded locally and there is no persistent database or production authentication system in this repo.

## Features

- Overview dashboard with KPI cards, branch metrics, and weekly production/capacity analysis
- Branch product views for Marks & Spencer and Tesco branches
- Production, waste, hours, target, planning, and studio tabs
- CSV and PDF export flows for capacity reporting
- Manual AI tools for shift summaries, strategy prompts, trend lookup, restock suggestions, image generation, and dish-photo analysis

## Architecture

### Frontend
- `src/App.tsx` manages app-level state and navigation
- `src/components/` contains feature tabs, dashboards, and charts
- `src/lib/` contains shared helpers for branch, catalog, and capacity-report logic
- `src/data.ts` contains seeded demo data
- `src/types.ts` defines shared domain types

### Backend
- `server.ts` starts the Express server and Vite middleware
- `server/geminiRoutes.ts` contains AI and image API endpoints

## AI behavior in this repo

- Language tasks use `gemini-1.5-flash`
- Image generation uses `imagen-3.0-generate-001`
- AI features are manual and on-demand only
- If `GEMINI_API_KEY` is not set, the API returns fallback or simulated responses so the demo can still run

## Installation

### Prerequisites
- Node.js
- npm

### 1. Clone the repository
```bash
git clone https://github.com/beer-sakthai/Food-Penguin-Limited.git
cd Food-Penguin-Limited
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Use `.env.example` as a starting point.

```bash
cp .env.example .env
```

Then add your environment values if needed, including `GEMINI_API_KEY` for live AI responses.

### 4. Start the development server
```bash
npm run dev
```

## Available scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## Build and run in production
```bash
npm run build
npm run start
```

## Notes

- The development server runs through `tsx server.ts`
- The production build outputs the frontend bundle and `dist/server.cjs`
- There is currently no dedicated automated test suite in the repository; validation is mainly done through linting, type-checking, and production builds
