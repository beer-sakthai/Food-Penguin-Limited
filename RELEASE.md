# Release v1.0.0: Emperor's Launch

We are thrilled to announce the inaugural release of the **Food Penguin Limited Corporate Dashboard**, version 1.0.0! This comprehensive, unified dashboard is a modern web application designed for efficient restaurant and food-chain management, with a special focus on high-volume sushi operations.

## ✨ Key Features

* **Unified Corporate Dashboard**: A single-pane-of-glass view for all your sushi operations, from sales to production to waste management.
* **Multi-Branch Management**: Seamlessly switch between different restaurant locations to view and manage branch-specific data.
* **Role-Based Access Control (RBAC)**: Granular permissions for `Admin`, `Manager`, and `Staff` roles, ensuring users only see the modules relevant to their responsibilities.
* **Interactive Data Visualization**: Rich, interactive charts powered by `recharts` across all modules provide at-a-glance insights into your business performance.
* **Modular Tab-Based Interface**:
  * **Overview & KPI**: High-level metrics for all branches.
  * **Sell**: Track live POS sales, analyze revenue by category, and create new orders.
  * **Production**: Monitor kitchen throughput, manage recipes, and assign cooking tasks to chefs.
  * **Waste & Hours**: Log waste to minimize costs and track employee hours.
  * **Planning**: View inventory levels and manage re-stocking.
  * **Target**: Set and track company-wide goals.

## 🤖 Embedded AI Integrations (Powered by Google Gemini)

The dashboard leverages state-of-the-art AI to provide deep operational insights and automation:

1. **Strategic Executive Thinker** (`gemini-3.1-pro-preview`): Formulates deep, comprehensive, and hyper-optimized business strategies for high-volume sushi operations.
2. **Low-Latency Copilot** (`gemini-3.1-flash-lite`): Provides rapid, direct answers to assist itamae and floor leads with questions about sushi prep and service.
3. **Menu Illustrator & Banner Generator** (`gemini-2.5-flash-image`): Generates high-quality marketing images and banners with precise aspect ratio control.
4. **Kitchen Quality Dish Auditor** (`gemini-3.1-pro-preview`): Performs a rigorous culinary audit on dish photos, analyzing everything from neta slice cuts to shari density.
5. **Market Trend Search Grounding** (`gemini-3.5-flash`): Delivers business intelligence on market trends for seafood, rice, and other key ingredients using grounded search.

## 🛠️ Tech Stack

* **Framework**: React 18 with TypeScript, built with Vite
* **Backend**: Node.js with Express
* **Styling**: Tailwind CSS
* **AI**: Google Gemini API
* **Data Visualization**: `recharts`

## 🚀 Getting Started

1. Ensure you have Node.js (v18+) installed.
2. Create a `.env` file and add your `GEMINI_API_KEY`.
3. Run `npm install` to install dependencies.
4. Run `npm run dev` to start the development server.

---

This release marks a significant milestone for Food Penguin Limited, providing a powerful tool to streamline operations and drive profitability.
