## 2026-07-01T20:29:54Z

You are the Menu Engineering Developer. Your working directory is: c:\Users\beern\Food-Penguin-Limited\.agents\worker_implementation.
Your mission is to implement the Menu Engineering tab frontend component, wire it into the app sidebar navigation, and add the manual AI price suggestions endpoint on the Express server.

Specifically:
1. Reference the saved design HTML/CSS structures from Stitch designs in `.agents/orchestrator/stitch_main_screen_code.html` and `.agents/orchestrator/stitch_detail_screen_code.html` to implement the visual layout.
2. Implement backend endpoint in `server.ts`:
   - POST `/api/gemini/menu-engineering-suggestions`
   - Accepts `menuItems` array in body.
   - Calls `gemini-1.5-flash` model.
   - If `GEMINI_API_KEY` is not present, return simulation mode data.
   - Simulated output must return a JSON object with:
     - `recommendations`: markdown text from Jules.
     - `adjustments`: a JSON array of price suggestions (each with `itemId`, `suggestedPrice`, and `reason`).
   - For real Gemini client, prompt the model to return a JSON structure with these fields:
     `recommendations` (string narrative) and `adjustments` (array of itemId, suggestedPrice, reason). Specify temperature 0.3, system instruction "You are Jules, the Chief AI Strategy Officer for 'Food Penguin Limited'." Wrap call in try-catch falling back to simulation if parsing or API fails.
3. Wire tab into `src/App.tsx`:
   - Import `initialMenuEngineeringItems` and `MenuEngineeringItem`.
   - Import `MenuEngineeringTab` from `./components/MenuEngineeringTab`.
   - Add state: `const [menuItems, setMenuItems] = useState<MenuEngineeringItem[]>(initialMenuEngineeringItems);` at line 737 or similar.
   - Register `MenuEngineering` tab in `allTabMeta` (using the existing `ChefHat` icon).
   - Add `"MenuEngineering"` to the permissions list in `rolePermissions` for `Admin` and `Manager` roles.
   - Render `<MenuEngineeringTab theme={theme} metallicTheme={metallicTheme} menuItems={menuItems} onUpdateMenuItems={setMenuItems} />` under `case "MenuEngineering":` in `renderActiveView()`.
4. Create the component `src/components/MenuEngineeringTab.tsx`:
   - Follow the "Nocturnal Amber" dark mode styles: deep #131313 backgrounds, #FFBF00 amber accents, gold liner borders on active/focused states. Ensure it also supports light mode gracefully (using `theme === 'light'` or `isLight` to toggle standard light mode colors).
   - Bento KPI row showing 4 metrics:
     - Average Dish Profit Margin (weighted margin percentage of sales)
     - Top Performer (Star) (the Star dish with highest sales volume)
     - Average Food Cost % (weighted COGS percentage of sales)
     - Monthly Gross Profit (sum of (margin * volume) for all items)
   - Two-column workspace layout (3fr 2fr):
     - Left column:
       - Menu Quadrant Performance Matrix (Scatter plot using Recharts). Plot salesVolume (X-axis) vs margin percentage (Y-axis), with reference lines for average volume and average margin % dividing the plot into Puzzles, Stars, Dogs, Plowhorses. Add quadrant labels.
       - Profitability & Classification Table: table listing items, price, cost, food cost %, volume, classification. Row is selectable. Color-coded food cost % badges (green/amber/red). Classification badges. Volume represented as stars. Clicking a row sets it as selected.
     - Right column (detail view panel):
       - If an item is selected, render **Ingredient Cost Breakdown Panel**: shows dish meta, input for selling price, list of ingredients and input for each ingredient cost. Changes update the local state and parent state. Preemptive boundaries check: if Price < total COGS, display the `AlertTriangle` warning icon in red. "Back" button to clear selection.
       - If no item is selected (or if user clicks "Suggest Recommendations" in the header), render **Jules' Strategic Advice Panel**:
         - Button "Jules' Strategic Advice" in header fetches suggestions from the API.
         - Shows a loading spinner during request.
         - Renders markdown returned from Jules.
         - Shows actionable adjustment cards for the suggestions: shows item name, current price, suggested price, reasoning, and green "Accept" / red "Dismiss" buttons.
         - Clicking Accept updates the price of the item in the dashboard state, dismissing the card. Dismiss removes the card.
5. Verify the code:
   - Ensure all input fields use the `.input-gold-glow` class (applies yellow border focus ring and custom shadow glow).
   - Apply micro-animations on hover/active states of cards/rows.
   - Use only the three project-wide typography sizes.
   - Run type checks and build via `npm run lint` and `npm run build` to confirm everything compiles perfectly.
   - Document changes in `changes.md` and handoff in `handoff.md`.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
