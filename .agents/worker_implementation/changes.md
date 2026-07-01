# Changes Made

This document details the modifications made to implement the Menu Engineering tab frontend component, backend Gemini endpoint, and integration.

## Backend Modifications

### 1. `server.ts`
- Added the `POST /api/gemini/menu-engineering-suggestions` endpoint.
- Structured it to:
  - Check for the existence of `GEMINI_API_KEY` using the `isRealGeminiKey` utility.
  - If a real key is present, it uses the `@google/genai` client, calling the `gemini-1.5-flash` model with `temperature: 0.3` and system instructions indicating the Jules persona.
  - Generates a structured JSON response matching the schema `{ recommendations: string, adjustments: Array<{ itemId, suggestedPrice, reason }> }`.
  - Integrates a fallback try-catch wrapper that defaults to simulation mode data if the API call fails or JSON parsing is unsuccessful.

## Frontend Modifications

### 1. `src/App.tsx`
- Imported `initialMenuEngineeringItems` from `./data` and `MenuEngineeringItem` from `./types`.
- Imported `MenuEngineeringTab` from `./components/MenuEngineeringTab`.
- Added the state `menuItems` initialized with `initialMenuEngineeringItems`.
- Registered `MenuEngineering` tab metadata in `allTabMeta` utilizing the `ChefHat` icon.
- Appended `MenuEngineering` to role permissions for `Admin` and `Manager` roles in `rolePermissions` so routing and sidebar display are handled dynamically.
- Rendered `<MenuEngineeringTab theme={theme} metallicTheme={metallicTheme} menuItems={menuItems} onUpdateMenuItems={setMenuItems} />` under case `MenuEngineering` in the `renderActiveView()` method.

### 2. `src/components/MenuEngineeringTab.tsx`
- Designed the new tab frontend component conforming to the "Nocturnal Amber" dark theme (deep `#131313` background, `#FFBF00` amber accents, input glowing borders, micro-animations on interactive elements) and supporting the light theme.
- Configured a Bento KPI grid displaying:
  - **Average Dish Profit Margin**: Weighted margin percentage of sales.
  - **Top Performer (Star)**: The highest sales volume Star-quadrant dish.
  - **Average Food Cost %**: Weighted COGS percentage of sales.
  - **Monthly Gross Profit**: Total sum of `margin * volume` across all active items.
- Designed a two-column layout (3fr 2fr):
  - **Left column**:
    - Menu Quadrant Performance Matrix (Scatter plot using Recharts). Plots `salesVolume` vs `marginPct`. Features dotted reference lines dividing the chart into Puzzles, Stars, Dogs, and Plowhorses. Added absolute quadrant labels overlaid behind the plot.
    - Profitability & Classification Table: Lists items with price, margin, food cost % (color-coded badges), sales volume (represented visually by filled stars), and quadrant classification (badges). Clicking a row sets it as selected.
  - **Right column**:
    - If an item is selected: Renders the **Ingredient Cost Breakdown Panel**, exposing inputs for selling price and individual ingredient costs. Updating values modifies state and propagates to parent state. Checks physical boundaries: if `price < totalCOGS`, displays a red pulsed `AlertTriangle` warning icon and message.
    - If no item is selected (or when requesting suggestions): Renders **Jules' Strategic Advice Panel**. Provides a button to fetch AI predictions from the Express suggestions endpoint. Integrates a loading spinner, parses markdown dynamically, and displays actionable suggestions as cards with "Accept" (updates price state) and "Dismiss" buttons.
