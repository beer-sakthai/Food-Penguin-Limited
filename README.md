# Food Penguin Limited - Corporate Dashboard

A comprehensive, unified corporate dashboard built for Food Penguin Limited. This project is a modern React single-page application using Tailwind CSS, providing deep operational insights, role-based access control, data visualizations, and embedded AI analytics for efficient restaurant management.

## 🌟 Key Functional Modules & Features

* **Role-Based Access Control (RBAC):** Distinct permission levels and module access configurations for Admin, Manager, and Staff roles.
* **Dynamic Day/Night Mode:** Full application-wide support for Day (Light) and Night (Dark) mode themes.
* **Quiet Professional UI Shell:** Single flat sidebar navigation, compact tab list, branch/role/theme controls moved to the top header. No grouped nav sections or dead decorative states.
* **Self-Hosted Analytics:** Tracks tab switching, role, and branch usage locally via a lightweight SQLite-backed analytics layer (`/api/analytics`).
* **Intelligent Dashboarding & Visualizations:** Interactive analytics powered by `recharts`.
  * **Unified Overview (Strategic Center):** Real-time production status indicators, calendar-scoped throughput tracking, Irish standard regulatory clock indicators, and deep operational audits.
    * **Weekly Production Comparison Bar Chart [NEW]:** A robust dual-axis visual comparison of `Production Made` versus `Production Targets` across each day of the calendar week (Monday to Sunday).
    * **Audit Calendar Date-Range Selector [NEW]:** A header-integrated dropdown selecting between various active, historic (Week 24), and forecast (Week 26) weeks. Changing the selection dynamically recalculates general dashboard throughput, COGS, waste stats, and the production bars.
    * **Fluid Page Transition System [NEW]:** Integrated powered motion fade-ins (`motion/react`) smoothly displaying metrics, cards, and Recharts structures on database queries or week changes instead of standard snapping.
    * **Predictive Weekly Capacity Card [NEW]:** A sidebar component featuring advanced predictive logic. It processes rolling daily production rates and week-over-week trend momentum of the active calendar week to project capacity loads for the next 7 days, visualised with an amber-striped extension bar and a custom dashed boundary pointer. Includes an interactive dropdown button to reveal day-by-day projected rates with miniature progress graphs, **one-click CSV data export & professional styled PDF summary report downloads** for executive reporting, an **interactive sort menu** to instantly filter by date chronological sequence or peak Bottleneck Intensity, a customizable **dynamic Bottleneck Threshold slider** (defaulting to 90%) to visually isolate and alert managers of specific high-risk bottleneck days, inline **micro-SVG sparklines with delta comparisons** to visualize exact chronological capacity trends, and a **Data View smoothing filter selector** (Raw vs 3-Day Moving Average) to instantly filter out high-frequency daily variance or peak production spikes. Also features a **Bulk Capacity Override system** with multi-select checkboxes and a range slider that validates constraints (>110% or <0%) using warning indicators before applying adjustments to AI forecasts.
  * **Branch Product Module:** Track active POS sales, transaction ledgers, margins, barcodes, and revenue bar charts. Includes multi-select checkboxes and bulk actions like 'Print Labels' and 'Hide from POS' for enhanced workflow.
  * **Resource Allocation Module [NEW]:** Manage and track inter-branch inventory transfers. Features multi-branch distribution tracking, bulk status updates, and visual transfer histories.
  * **Production Module [UPDATED]:** Kitchen throughput monitoring, task queuing, recipe formulation, and chef workflows. Now includes hourly efficiency volume vs target tracking and an embedded AI Culinary Auditor for dish quality compliance.
  * **Waste Module [UPDATED]:** Financial leakage tracking with interactive pie chart distributions. Allows staff to log waste events by weight/value with specific reasons (Expired, Overproduced) and includes an AI Action Strategy generator to propose preservation and repurposing techniques.
  * **Hours Module:** Workforce scheduling, clocked-in time tracking, planned hour comparison vs logged times and variance tracking analysis.
  * **Target Module:** Corporate-wide milestone tracking, completion bar charts, progress validations, and AI-optimized targets.
  * **Energy Module [NEW]:** Real-time sustainability reporting visualizing oven energy consumption vs production volume to hit ESG compliance KPIs.
  * **Suppliers Module [NEW]:** Organized directory of authorized vendors (Tazaki, BUNZL, Asia Market, VS Direct), offering quick text search for specific ingredients, packaging materials, and labeling.
  * **Finance Module [NEW]:** Interactive P&L audit comparing the Target Plan (COG 30%, Staff 20%, etc.) vs Actual Use, highlighting structural variance and margin erosion.
  * **Studio Module [NEW]:** High-end AI Operations Studio featuring:
    * **Ad Generator:** Dynamically generate ultra-realistic food production imagery and marketing material with varied aspect ratios (Powered by Imagen 3.0), downloading, and direct output previews.
    * **Plating & Quality Dish Auditor:** Upload or drag & drop food images so the AI can run a culinary audit on presentation, freshness markers, trim waste estimates, and margin improvements.
* **Embedded AI Integrations (Powered by Jules - Google AI):**
  * **Deep Strategic Advisor:** Built-in multi-layered logic solver managed by Jules, Google's advanced operational AI. (Powered by Gemini 1.5 Flash).
  * **AI Banner Illustrator:** Automated marketing asset generation with specific focal points and aspect ratios (Powered by Imagen 3.0).
  * **Waste Investigator & Recipe Generator:** Automated photo-based insights and production aids.
  * **Financial Margin & P&L Auditor:** Structural variance analysis between expected cost limits and actual expenses.
  * **Sustainability ESG Analyst:** Provides actionable adjustments for peak energy draw against kitchen throughput.
  * **Real-time Shift Summary & Analytics:** Manually generated AI insights against live operation data, kept strictly on-demand to respect API quota limits.

## 🛠 Tech Stack

* **Framework:** React 18 + TypeScript + Vite
* **Backend:** Node + better-sqlite3 (local SQLite database)
* **Styling:** Tailwind CSS (warm cream + terracotta palette, flat bordered cards)
* **Animations:** `motion/react` for hardware-accelerated transitions
* **Icons:** `lucide-react`
* **Charts:** `recharts`
* **Date Handling:** Native JS utilities

## 🚀 Getting Started

### Prerequisites

* Node.js (v18+ recommended)
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

The application binds to `0.0.0.0:3000` by default.

### Production Build

```bash
npm run build
npm run preview
```

## 📂 Project Structure

* `/src/components/` - Tab view components (`OverviewTab.tsx`, `SellTab.tsx`, etc.).
* `/src/App.tsx` - Main shell, state orchestration, RBAC, and navigation.
* `/src/hooks/useAnalytics.ts` - Self-hosted analytics tracker.
* `/src/types.ts` - Centralized TypeScript interfaces.
* `/src/data.ts` - Default state and sample data.
* `/src/db.ts` - SQLite schema and queries.
* `/src/server.ts` - Express-style API server.
* `/src/index.css` - Global Tailwind tokens and CSS variables.

## 📝 Changelog

- **2026-07-24** — Rebuilt app shell: flat sidebar, compact nav, header controls, removed dead metallic theme state.
- **2026-07-24** — Added self-hosted analytics layer (SQLite + REST + React tracker + Analytics tab).
- **2026-07-24** — Density cut pass: ~70% UI element reduction across all tabs with warm cream/terracotta palette.

## 📄 License

This project is licensed under the MIT License.
