# Food Penguin Limited - Corporate Dashboard

A comprehensive, unified corporate dashboard built for Food Penguin Limited. This project is a modern React single-page application using Tailwind CSS, providing deep operational insights, role-based access control, data visualizations, and embedded AI analytics for efficient restaurant management.

## 🌟 Key Functional Modules & Features

* **Role-Based Access Control (RBAC):** Distinct permission levels and module access configurations for Admin, Manager, and Staff roles.
* **Dynamic Day/Night Mode:** Full application-wide support for Day (Light) and Night (Dark) mode themes.
* **Quiet Professional UI Shell:** Single flat sidebar navigation, compact tab list, branch/role/theme controls moved to the top header. No grouped nav sections or dead decorative states.
* **Self-Hosted Analytics:** Tracks tab switching, role, and branch usage locally via a lightweight SQLite-backed analytics layer (`/api/analytics`).
* **Operational Dashboards:** Interactive analytics powered by `recharts`.
  * **Overview:** Production status, weekly throughput, waste summary, and capacity snapshot.
  * **Planning:** Inventory tracking and restock ordering.
  * **Production:** Kitchen task queue and recipe-based production list.
  * **Waste:** Waste logging with cost tracking.
  * **Hours:** Clocked workforce hours and scheduled-vs-logged comparison.
  * **Target:** Milestone progress and target tracking.
  * **Energy:** Energy-use snapshot against production volume.
  * **Suppliers:** Vendor directory and ingredient search.
  * **Finance:** P&L variance view (target vs actual cost ratios).
  * **Sell / Reports / Analytics:** Sales data, cross-tab reports, and self-hosted usage analytics.
* **Fluid Page Transitions:** Subtle `motion/react` fade transitions between tabs.

## 🛠 Tech Stack

* **Framework:** React 19 + TypeScript + Vite
* **Backend:** Node + better-sqlite3 (local SQLite database)
* **Styling:** Tailwind CSS (deep charcoal + muted teal palette, flat cards, icon-only sidebar)
* **Animations:** `motion/react` for subtle transitions
* **Icons:** `lucide-react`
* **Charts:** `recharts`
* **Date Handling:** Native JS utilities

## 🚀 Getting Started

### Prerequisites

* Node.js (v20+ recommended)
* npm or uv

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/beer-sakthai/Food-Penguin-Limited.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```

The application binds to `0.0.0.0:3000` by default (`server.ts`).

### Production Build

```bash
npm run build
npm run start
```

## 📂 Project Structure

* `/src/components/` - Tab view components (`OverviewTab.tsx`, `SellTab.tsx`, etc.).
* `/src/App.tsx` - Main shell, state orchestration, RBAC, and navigation.
* `/src/api.ts` - API client for SQLite backend endpoints.
* `/src/firebase.ts` - Firebase configuration (sync/data layer).
* `/src/hooks/useAnalytics.ts` - Self-hosted analytics tracker.
* `/src/main.tsx` - React root mount.
* `/src/types.ts` - Centralized TypeScript interfaces.
* `/src/data.ts` - Default state and sample data.
* `/src/db.ts` - SQLite schema and queries.
* `/src/server.ts` - Express-style API server.
* `/src/index.css` - Global Tailwind tokens and CSS variables.

## 📝 Changelog

- **2026-07-24** — New design: deep charcoal + teal palette, icon-only expanding sidebar, matching login screen.
- **2026-07-24** — Rebuilt app shell: flat sidebar, compact nav, header controls, removed dead metallic theme state.
- **2026-07-24** — Added self-hosted analytics layer (SQLite + REST + React tracker + Analytics tab).
- **2026-07-24** — Density cut pass: ~70% UI element reduction across all tabs.

## 📄 License

This project is licensed under the MIT License.
