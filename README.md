# Food Penguin Limited - Corporate Dashboard

A comprehensive, unified corporate dashboard built for Food Penguin Limited. This project is a modern React single-page application using Tailwind CSS, providing deep operational insights, role-based access control, data visualizations, and embedded AI analytics for efficient restaurant management.

## 🌟 Key Functional Modules & Features

* **Role-Based Access Control (RBAC):** Distinct permission levels and module access configurations for Admin, Manager, and Staff roles.
* **Dynamic Day/Night Mode:** Full application-wide support for Day (Light) and Night (Dark) mode themes, completely customizing the user interface aesthetics based on preference.
* **Intelligent Dashboarding & Visualizations:** Interactive analytics powered by `recharts` providing visual overviews seamlessly.
  * **Unified Overview (Strategic Center):** Real-time production status indicators, calendar-scoped throughput tracking, Irish standard regulatory clock indicators, and deep operational audits.
    * **Weekly Production Comparison Bar Chart [NEW]:** A robust dual-axis visual comparison of `Production Made` versus `Production Targets` across each day of the calendar week (Monday to Sunday).
    * **Audit Calendar Date-Range Selector [NEW]:** A header-integrated dropdown selecting between various active, historic (Week 24), and forecast (Week 26) weeks. Changing the selection dynamically recalculates general dashboard throughput, COGS, waste stats, and the production bars.
    * **Fluid Page Transition System [NEW]:** Integrated powered motion fade-ins (`motion/react`) smoothly displaying metrics, cards, and Recharts structures on database queries or week changes instead of standard snapping.
    * **Predictive Weekly Capacity Card [NEW]:** A sidebar component featuring advanced predictive logic. It processes rolling daily production rates and week-over-week trend momentum of the active calendar week to project capacity loads for the next 7 days, visualised with an amber-striped extension bar and a custom dashed boundary pointer. Includes an interactive dropdown button to reveal day-by-day projected rates with miniature progress graphs, **one-click CSV data export & professional styled PDF summary report downloads** for executive reporting, an **interactive sort menu** to instantly filter by date chronological sequence or peak Bottleneck Intensity, a customizable **dynamic Bottleneck Threshold slider** (defaulting to 90%) to visually isolate and alert managers of specific high-risk bottleneck days, inline **micro-SVG sparklines with delta comparisons** to visualize exact chronological capacity trends, and a **Data View smoothing filter selector** (Raw vs 3-Day Moving Average) to instantly filter out high-frequency daily variance or peak production spikes. Also features a **Bulk Capacity Override system** with multi-select checkboxes and a range slider that validates constraints (>110% or <0%) using warning indicators before applying adjustments to AI forecasts.
  * **Branch Product Module:** Track active POS sales, transaction ledgers, margins, barcodes, and revenue bar charts. Includes multi-select checkboxes and bulk actions like 'Print Labels' and 'Hide from POS' for enhanced workflow.
  * **Resource Allocation Module [NEW]:** Manage and track inter-branch inventory transfers. Features multi-branch distribution tracking, bulk status updates, and visual transfer histories.
  * **Production Module [UPDATED]:** Kitchen throughput monitoring, task queuing, recipe formulation, and chef workflows. Now includes hourly efficiency volume vs target tracking and an embedded AI Culinary Auditor for dish quality compliance.
  * **Menu Engineering Module [NEW]:** An advanced analytics tab for optimizing menu profitability. Features an interactive 2x2 scatter plot that classifies menu items into Stars, Plowhorses, Puzzles, and Dogs based on sales volume and profit margin. Includes an on-demand AI suggestion engine ("Jules") that analyzes the data and provides actionable recommendations for price adjustments to maximize revenue and recover costs.
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

* **Framework:** React 19 + TypeScript + Vite
* **Styling:** Tailwind CSS (responsive layouts, modern bento UI, custom semantic colors)
* **Animations:** `motion/react` for elegant hardware-accelerated interface slide & fade effects
* **Icons:** `lucide-react`
* **Charts:** `recharts` for highly customized Area, Pie, and Bar charts
* **Date Handling:** Native JS with streamlined date utilities

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
   cd food-penguin
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

### Development Server

To start the local development server:

```bash
npm run dev
```

The application will bind to `0.0.0.0` on `PORT` when provided, otherwise port `3000`.

### Production Build

To create a production-ready build:

```bash
npm run build
```

Then you can run the generated `dist/` server bundle with:

```bash
npm run start
```

You can also build and start in one step with:

```bash
npm run preview
```

### Testing and Checks

Run the non-visual behavior test suite with:

```bash
npm test
```

The suite uses Node's built-in test runner through `tsx` for TypeScript files. It covers extracted dashboard calculation helpers, local Firebase emulator validation and snapshot behavior, and Express API route behavior with mocked AI responses.

### AI API Configuration

Gemini-powered features are served through the Express backend under `/api/gemini/*`, so API keys stay server-side. Copy `.env.example` to `.env` and set:

```bash
GEMINI_API_KEY="your_google_ai_studio_key"
```

Without `GEMINI_API_KEY`, the dashboard still builds and loads, but AI actions return a configuration error from the API.

## 📂 Project Structure

* `/src/components/` - Features a modular layout with separate tabs (`OverviewTab.tsx`, `SellTab.tsx`, `TargetTab.tsx`, `ProductionTab.tsx`, `WasteTab.tsx`, `HoursTab.tsx`).
* `/src/App.tsx` - Main orchestration entry point handling states, user roles, calendar date-range scopes, and unified navigation.
* `/src/types.ts` - Centralized TypeScript interfaces for metrics, models, targets, etc.
* `/src/data.ts` - Local data engines, multi-week data maps, and default state providers context.
* `/src/index.css` - Global Tailwind CSS and specific font asset integrations.

## 📄 License

This project is licensed under the MIT License.
