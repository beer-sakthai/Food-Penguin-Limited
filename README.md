# Food Penguin Limited - Corporate Dashboard

A comprehensive, unified corporate dashboard built for Food Penguin Limited. This project is a modern React single-page application using Tailwind CSS, providing deep operational insights, role-based access control, data visualizations, and embedded AI analytics for efficient restaurant management.

## 🌟 Features

* **Role-Based Access Control (RBAC):** Distinct permission levels and module access configurations for Admin, Manager, and Staff roles.
* **Intelligent Dashboarding & Visualizations:** Interactive analytics powered by `recharts` providing visual overviews seamlessly.
  * **Sell Module:** Track active POS sales, transaction ledgers, margins, and revenue bar charts.
  * **Production Module:** Kitchen throughput monitoring, task queuing, recipe formulation, and chef workflows.
  * **Waste Module:** Financial leakage tracking with interactive pie chart distributions and safety allowance thresholds.
  * **Hours Module:** Workforce scheduling, clocked-in time tracking versus scheduled hours, and visual utilization rates.
  * **Target Module:** Corporate-wide milestone tracking, completion bar charts, progress validations, and AI-optimized targets.
* **Embedded AI Integrations:**
  * **Deep Strategic Advisor:** Built-in multi-layered logic solver using advanced reasoning.
  * **AI Banner Illustrator:** Automated marketing asset generation with specific focal points and aspect ratios.
  * **Waste Investigator & Recipe Generator:** Automated photo-based insights and production aids.

## 🛠 Tech Stack

* **Framework:** React 18 + TypeScript + Vite
* **Styling:** Tailwind CSS (responsive layouts, modern bento UI, custom semantic colors)
* **Icons:** `lucide-react`
* **Charts:** `recharts` for highly customized Area, Pie, and Bar charts.
* **Date Handling:** Native JS with streamlined date utilities.

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

The application will bind to `0.0.0.0` at port `3000` locally.

### Production Build

To create a production-ready build:

```bash
npm run build
```

Then you can preview the generated `dist/` directory with `npm run preview`.

## 📂 Project Structure

* `/src/components/` - Features a modular layout with separate tabs (`OverviewTab.tsx`, `SellTab.tsx`, `TargetTab.tsx`, `ProductionTab.tsx`, `WasteTab.tsx`, `HoursTab.tsx`).
* `/src/App.tsx` - Main orchestration entry point handling states, user roles, and unified navigation.
* `/src/types.ts` - Centralized TypeScript interfaces for metrics, models, targets, etc.
* `/src/data.ts` - Local data engines and default state providers context.
* `/src/index.css` - Global Tailwind CSS and specific font asset integrations.

## 📄 License

This project is licensed under the MIT License.
