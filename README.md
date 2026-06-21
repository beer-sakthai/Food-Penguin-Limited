# Food Penguin Limited

Food Penguin Limited is an operations intelligence platform designed to help food businesses improve visibility, planning, and decision-making across production and branch performance.

Built with React, TypeScript, Vite, and Express, the product combines operational dashboards, branch-level reporting, planning workflows, and AI-assisted tools in a single experience.

## Product overview

Food Penguin Limited is positioned as a modern internal platform for food operations teams that need faster insight into performance, capacity, waste, labor, and planning.

The current repository represents a strong product prototype with polished workflows and interactive reporting experiences. Much of the business data is currently seeded locally for demonstration and iteration purposes, and the platform does not yet include a persistent database or production-ready authentication layer.

## Core capabilities

- **Executive dashboard** for KPI visibility, weekly production trends, and branch performance monitoring
- **Branch reporting views** for operational analysis across locations such as Marks & Spencer and Tesco branches
- **Planning workflows** covering production, waste, labor hours, targets, and capacity management
- **Export tooling** for generating CSV and PDF operational reports
- **AI-assisted workflows** for shift summaries, strategy prompts, trend exploration, restock suggestions, image generation, and dish-photo analysis

## Why this product matters

Food businesses often operate across fragmented spreadsheets, disconnected reporting, and manual planning processes. Food Penguin Limited aims to consolidate these workflows into a single operational layer that helps teams:

- make faster data-informed decisions
- improve branch and production visibility
- reduce waste and planning inefficiencies
- support managers with practical AI-assisted tools

## Platform architecture

### Frontend
- `src/App.tsx` manages application-level state and navigation
- `src/components/` contains dashboards, tabs, visualizations, and feature modules
- `src/lib/` contains shared business logic for branch, catalog, and capacity-report workflows
- `src/data.ts` contains seeded demo data
- `src/types.ts` defines shared product and domain types

### Backend
- `server.ts` starts the Express server and Vite middleware
- `server/geminiRoutes.ts` contains AI and image-related API endpoints

## AI features

The repository includes manual, on-demand AI workflows for operational assistance.

- Language tasks use `gemini-1.5-flash`
- Image generation uses `imagen-3.0-generate-001`
- AI functionality is user-triggered rather than background automated
- If `GEMINI_API_KEY` is not configured, the API provides fallback or simulated responses so the product demo remains usable

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

### 3. Configure environment variables
Use `.env.example` as the starting point.

```bash
cp .env.example .env
```

Add your environment values as needed, including `GEMINI_API_KEY` if you want live AI responses instead of simulated fallback behavior.

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

## Production build

```bash
npm run build
npm run start
```

## Development notes

- The development server runs through `tsx server.ts`
- The production build outputs the frontend bundle and `dist/server.cjs`
- There is currently no dedicated automated test suite in the repository; validation is primarily handled through linting, type-checking, and production builds

## Roadmap direction

As a product foundation, this repository is well suited for future expansion into:

- persistent data storage and analytics history
- role-based authentication and access control
- production-ready integrations with operational systems
- more advanced forecasting and AI-assisted planning workflows
