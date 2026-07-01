# Implementation Plan - Menu Engineering Tab

## 1. Overview
The Menu Engineering Tab is a dashboard for analyzing per-dish profitability, ingredient-level costing, and AI-powered price optimization.

## 2. Architecture & Design
### A. Data Layer (`src/types.ts` & `src/data.ts`)
- Define `IngredientCost` interface: `{ name: string; cost: number }`
- Define `MenuEngineeringItem` interface:
  - `id: string`
  - `name: string`
  - `category: string`
  - `price: number`
  - `salesVolume: number`
  - `ingredientCosts: IngredientCost[]`
  - `prepTime: number`
  - `allergens: string[]`
  - `status: 'active' | 'archived'`
- Initialize `initialMenuEngineeringItems` in `src/data.ts` mapped to the 5 existing recipes, using realistic cost/price/sales data.

### B. Backend API (`server.ts`)
- Route: `/api/gemini/menu-engineering-suggestions` (POST)
- Accepts `menuItems` array in request body.
- Uses `gemini-1.5-flash` model.
- Checks `process.env.GEMINI_API_KEY`. If invalid or missing, defaults to simulated response mode.
- System prompt instructs model to act as Jules, Chief AI Strategy Officer for Food Penguin Limited.
- Rationale focuses on margin recovery and cost controls.

### C. Sidebar Integration (`src/App.tsx`)
- Import `ChefHat` from `lucide-react`.
- Register the tab in `allTabMeta` as `MenuEngineering`.
- Enforce `rolePermissions` (Admin and Manager roles only).
- Switch rendering in `renderActiveView()` to return `<MenuEngineeringTab />`.

### D. Tab Component UI (`src/components/MenuEngineeringTab.tsx`)
- Premium layouts matching light/dark modes, with Nocturnal Amber theme for dark mode: deep #131313 backgrounds, #FFBF00 amber accents, gold liner borders on active states.
- Header toolbar: title and manual "Suggest Recommendations" trigger (calling Jules' AI suggestions).
- Bento KPI row (KPI cards): Glassmorphism cards for the 4 summary metrics (Average Dish Profit Margin, Top Performer (Star), Average Food Cost %, Monthly Gross Profit) using gold liner styles.
- Scatter Plot matrix using `recharts` to map items into Stars, Plowhorses, Puzzles, and Dogs.
- Profitability & Classification Table (Left column):
  - Displays selling price, total food cost, food cost %, popularity score, and matrix classification.
  - Color-coded food cost % indicators: Green (low food cost %, <30%), Amber (moderate, 30%-45%), Red (high, >45%).
  - Popularity ratings shown as colored badge or stars.
  - Clicking on a row selects that dish to view/edit details.
- Ingredient Cost Breakdown Panel (Right column, appears when a dish is selected):
  - Per-ingredient cost details (Sora/Outfit font, gold highlights).
  - Editable ingredient cost fields and selling price.
  - Editing input fields are styled with gold focus glow (`input-gold-glow`).
  - **Boundary checks**: Preemptively check if the selling price is less than total COGS. If it is, display the `AlertTriangle` warning icon in red next to the price/margin cell.
  - Compute total cost, contribution margin, food cost percentage, and classification dynamically.
- AI Suggestions Panel (Right column, appears when strategic advice is triggered):
  - Renders markdown returned from Jules.
  - Actionable suggestions list: each suggestion has a description, suggested price, green **Accept** and red **Dismiss** button.
  - Clicking Accept updates the price of the item in the dashboard state, dismissing the recommendation. Dismiss removes the suggestion card.
- Typography: Sora or Outfit font throughout, label-md for section headers, display-sm for KPI numbers.

## 3. Implementation Milestones & Steps
1. **Milestone 1**: Update data types in `src/types.ts` and add seed data in `src/data.ts`.
2. **Milestone 2**: Add Express route `/api/gemini/menu-engineering-suggestions` in `server.ts`.
3. **Milestone 3**: Add route permissions, sidebar configuration, and active view rendering in `src/App.tsx`.
4. **Milestone 4**: Create `src/components/MenuEngineeringTab.tsx` and implement full UI/UX.
5. **Milestone 5**: Run linting and build checks to ensure type safety and error-free compilation.
