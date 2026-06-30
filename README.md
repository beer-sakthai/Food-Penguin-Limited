# Food Penguin Limited - Corporate Dashboard

A comprehensive, unified corporate dashboard built for Food Penguin Limited. This project is a modern React single-page application using Tailwind CSS, providing deep operational insights, role-based access control, data visualizations, and embedded AI analytics for efficient restaurant management.

## 🌟 Key Functional Modules & Features

* **Role-Based Access Control (RBAC):** Distinct permission levels and module access configurations for Admin, Manager, and Staff roles.
* **Dynamic Aesthetic Theme Profiles & Day/Night Mode:** Full application-wide support for Day (Light) and Night (Dark) mode themes, alongside **Bespoke Metallic Themes (Gold, Silver, and Copper)** that customize the user interface aesthetics, borders, and ambient glow highlights based on preference.
* **Intelligent Dashboarding & Visualizations:** Interactive analytics powered by `recharts` providing visual overviews seamlessly.
  * **Unified Overview (Strategic Center):** Real-time production status indicators, calendar-scoped throughput tracking, Irish standard regulatory clock indicators, and deep operational audits.
    * **Weekly Production Comparison Bar Chart:** A robust dual-axis visual comparison of `Production Made` versus `Production Targets` across each day of the calendar week (Monday to Sunday).
    * **Audit Calendar Date-Range Selector:** A header-integrated dropdown selecting between various active, historic (Week 24), and forecast (Week 26) weeks. Changing the selection dynamically recalculates general dashboard throughput, COGS, waste stats, and the production bars.
    * **Fluid Page Transition System:** Integrated powered motion fade-ins (`motion/react`) smoothly displaying metrics, cards, and Recharts structures on database queries or week changes instead of standard snapping.
    * **Predictive Weekly Capacity Card:** A sidebar component featuring advanced predictive logic. It processes rolling daily production rates and week-over-week trend momentum of the active calendar week to project capacity loads for the next 7 days, visualised with an amber-striped extension bar and a custom dashed boundary pointer. Includes an interactive dropdown button to reveal day-by-day projected rates with miniature progress graphs, **one-click CSV data export & professional styled PDF summary report downloads** for executive reporting, an **interactive sort menu** to instantly filter by date chronological sequence or peak Bottleneck Intensity, a customizable **dynamic Bottleneck Threshold slider** (defaulting to 90%) to visually isolate and alert managers of specific high-risk bottleneck days, inline **micro-SVG sparklines with delta comparisons** to visualize exact chronological capacity trends, and a **Data View smoothing filter selector** (Raw vs 3-Day Moving Average) to instantly filter out high-frequency daily variance or peak production spikes. Also features a **Bulk Capacity Override system** with multi-select checkboxes and a range slider that validates constraints (>110% or <0%) using warning indicators before applying adjustments to AI forecasts.
  * **Deep Strategic Advisor Module [NEW]:** A dedicated operations intelligence console powered by Jules, offering quick-recommend strategic presets (Sushi Chain Optimization, Staff & COG Margin Recovery, Green ESG Compliance), raw operational inputs, and real-time computation of reasoning pathways and corporate strategy responses.
  * **Restock & Capacity Planning Module [NEW]:** A dedicated tab integrating physical raw material inventory levels (with real-time critical and low-stock alerts) with AI-powered trend analysis:
    * **Procurement Search Grounding:** Real-time web-grounded wholesale trend and supply-chain bottleneck lookup.
    * **AI Restock Suggestion Engine:** Analyzes previous sales and waste volumes to automatically generate replenishment recommendations.
    * **Capacity Analytics & Variance:** In-depth kitchen/production capacity forecasting charts and visual tracking dashboards.
  * **Live Telemetry & Tele-monitoring [NEW]:** Dedicated real-time telemetry stream representing active virtual orders, production rates per hour relative to goals, system uptime tracking, equipment operational statuses, and a real-time system alerts log.
  * **Analytical Reports Hub Module [NEW]:** A comprehensive data extraction and auditing suite allowing managers to filter and generate dedicated reports across sales orders, targets, chef task workflows, financial leakages, labor hours, and planning. Integrates on-demand AI operational audits of each area.
  * **Branch Product Module:** Track active POS sales, transaction ledgers, margins, barcodes, and revenue bar charts. Includes multi-select checkboxes and bulk actions like 'Print Labels' and 'Hide from POS' for enhanced workflow.
  * **Resource Allocation Module:** Manage and track inter-branch inventory transfers. Features multi-branch distribution tracking, bulk status updates, and visual transfer histories.
  * **Production Module:** Kitchen throughput monitoring, task queuing, recipe formulation, and chef workflows. Now includes hourly efficiency volume vs target tracking and an embedded AI Culinary Auditor for dish quality compliance.
  * **Waste Module:** Financial leakage tracking with interactive pie chart distributions. Allows staff to log waste events by weight/value with specific reasons (Expired, Overproduced) and includes an AI Action Strategy generator to propose preservation and repurposing techniques.
  * **Hours Module:** Workforce scheduling, clocked-in time tracking, planned hour comparison vs logged times and variance tracking analysis.
  * **Target Module:** Corporate-wide milestone tracking, completion bar charts, progress validations, and AI-optimized targets.
  * **Energy Module:** Real-time sustainability reporting visualizing oven energy consumption vs production volume to hit ESG compliance KPIs.
  * **Suppliers Module:** Organized directory of authorized vendors (Tazaki, BUNZL, Asia Market, VS Direct), offering quick text search for specific ingredients, packaging materials, and labeling.
  * **Finance Module:** Interactive P&L audit comparing the Target Plan (COG 30%, Staff 20%, etc.) vs Actual Use, highlighting structural variance and margin erosion.
  * **Studio Module:** High-end AI Operations Studio featuring:
    * **Ad Generator:** Dynamically generate ultra-realistic food production imagery and marketing material with varied aspect ratios (Powered by Imagen 3.0), downloading, and direct output previews.
    * **Plating & Quality Dish Auditor:** Upload or drag & drop food images so the AI can run a culinary audit on presentation, freshness markers, trim waste estimates, and margin improvements.

---

## 🎨 Design Language & UI Specifications

The corporate visual style guide is built around premium visual feedback, tactile response, and strict validation checks:
* **"Gold Liner" Inputs:** Active interactive inputs, select menus, and form elements utilize a unified, high-contrast gold outline ring (`focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500`) paired with a custom amber shadow glow.
* **Tactile Micro-Animations:** Buttons, card containers, and bento cells include hardware-accelerated micro-interactions (such as `hover:-translate-y-0.5` and `active:scale-[0.98]`) for enhanced spatial navigation awareness.
* **Boundary Violation Shields:** Multi-select sliders or manual forecast modifications trigger real-time physical barrier checking. If settings violate physical constraints (e.g. settings `>110%` or `<0%`), the app dynamically prompts red-amber Warning Badges (`AlertTriangle` icons) to prevent erroneous overrides.

---

## 🧠 Embedded AI Integrations (Powered by Jules - Google AI)

This project allows **Jules (Google AI)** to serve as our AI Strategy Officer, providing operational strategy and executive summaries:
* **LLM Engine Constraints:** Strictly powered by **Gemini 1.5 Flash (`gemini-1.5-flash`)** for language and reasoning tasks to guarantee free-tier, high-speed execution. 
* **Vision & Multi-modal Auditor:** High-fidelity image assets generated using **`imagen-3.0-generate-001`**.
* **AI Feature Matrix:**
  * **Deep Strategic Advisor:** Dedicated solver providing logical breakdown paths, deep thinking summaries, and final operational recommendations.
  * **AI Banner Illustrator:** Automated marketing asset generation with specific focal points and aspect ratios (Powered by Imagen 3.0).
  * **Waste Investigator & Recipe Generator:** Automated photo-based insights and production aids.
  * **Financial Margin & P&L Auditor:** Structural variance analysis between expected cost limits and actual expenses.
  * **Sustainability ESG Analyst:** Provides actionable adjustments for peak energy draw against kitchen throughput.
  * **Real-time Shift Summary & Analytics:** Manually generated AI insights against live operation data.
* **Manual AI Refresh Constraint:** To operate safely within free-tier API quotas, the dashboard forbids automated background polling loops. All AI executions are triggered **strictly on-demand** via explicit button interactions or main category switches.

---

## 🛠 Tech Stack

* **Framework:** React 19 + TypeScript + Vite
* **Styling:** Tailwind CSS (responsive layouts, modern bento UI, custom semantic colors)
* **Animations:** `motion/react` for elegant hardware-accelerated interface slide & fade effects
* **Icons:** `lucide-react`
* **Charts:** `recharts` for highly customized Area, Pie, and Bar charts
* **Date Handling:** Native JS with streamlined date utilities

---

## 🚀 Getting Started

### Prerequisites

* Node.js (v18+ recommended)
* npm

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```bash
   cd food-penguin-limited
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Development Server

To start the local development server with tsx-bundled backend APIs:

```bash
npm run dev
```

The application will bind to `0.0.0.0` at port `3050` (or the configured standard container proxy port `3000`) locally.

### Production Build

To create a production-ready build:

```bash
npm run build
```

Then you can preview the generated `dist/` directory with `npm run preview`.

---

## 📂 Project Structure

* `/src/components/` - Features a modular layout with separate tab views:
  * `OverviewTab.tsx` - Strategic operations control center and KPI dashboards.
  * `AdvisorTab.tsx` - Core Strategy Solver & Preset Planner.
  * `RealtimeTab.tsx` - Live telemetry streams and systems logs.
  * `PlanningTab.tsx` - Restock inventories, trend search, and forecast overrides.
  * `SellTab.tsx` - POS sales tracking, barcode labels, and store inventories.
  * `TargetTab.tsx` - Goal completion bar-charts and milestone status trackers.
  * `ProductionTab.tsx` - Recipe formulations, task lines, and culinary QA audits.
  * `WasteTab.tsx` - Financial leakages and AI Action Strategy matrices.
  * `HoursTab.tsx` - Employee scheduling, clocked hours, and variances.
  * `ResourceAllocationTab.tsx` - Inter-branch product distribution logs.
  * `EnergyTab.tsx` - Sustainability carbon offsets and ESG indices.
  * `SuppliersTab.tsx` - Supplier ingredients directory and search filters.
  * `FinanceTab.tsx` - Target margins vs actual P&L structures.
  * `ReportsTab.tsx` - Executive CSV/PDF summary generation hub.
  * `StudioTab.tsx` - Imagen-powered marketing ad and plating quality auditor.
  * `CapacityAnalytics.tsx` & `CapacityVarianceChart.tsx` - Sub-modules analyzing capacity loads.
  * `LoginScreen.tsx` - Authentication screen for manager roles.
* `/src/App.tsx` - Main orchestration entry point handling states, user roles, calendar date-range scopes, and unified navigation.
* `/src/types.ts` - Centralized TypeScript interfaces for metrics, models, targets, etc.
* `/src/data.ts` - Local data engines, multi-week data maps, and default state providers context.
* `/src/index.css` - Global Tailwind CSS and specific font asset integrations.

---

## 📄 License

This project is licensed under the MIT License.
