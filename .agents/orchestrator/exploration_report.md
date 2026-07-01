# Menu Engineering Tab Implementation Plan & Exploration Report

This report outlines the codebase architecture and details the implementation plan for the **Menu Engineering** dashboard tab in Food Penguin Limited.

---

## Executive Summary
This document provides a blueprint for integrating a "Menu Engineering" tab. The tab will utilize a 2x2 scatter matrix quadrant (Stars, Plowhorses, Puzzles, Dogs) to classify menu items based on profitability and popularity. It incorporates manual AI suggestions from Jules using a new Express endpoint backed by the `gemini-1.5-flash` model, ensuring compliance with cost control, styling conventions, and validation constraints.

---

## Section 1: Frontend Router and Tab Structure (`src/App.tsx`)

Our exploration of `src/App.tsx` and `src/components/Sidebar.tsx` shows how tabs are structured, registered, and displayed.

### 1. Tab Registration (`allTabMeta`)
Tabs are declared in the `allTabMeta` array in `src/App.tsx` (lines 1836–1907). It contains objects mapping an `id` to a `label` and an SVG `icon` (imported from `lucide-react`).
```typescript
// src/App.tsx, Lines 1836-1907 (current structure)
const allTabMeta = [
  {
    id: "Overview",
    label: "Dashboard",
    icon: <LayoutDashboard className="w-4 h-4" />,
  },
  ...
  {
    id: "Reports",
    label: "Reports Hub",
    icon: <FileSpreadsheet className="w-4 h-4" />,
  },
];
```

### 2. Role Permissions Enforcement (`rolePermissions`)
Permissions are defined via a hardcoded map `rolePermissions` in `src/App.tsx` (lines 105–166). The variable `tabMeta` filters out restricted views based on the user's role:
```typescript
// src/App.tsx, Lines 105-108 & 1909-1911
const rolePermissions: Record<"Admin" | "Manager" | "Staff" | "User", string[]> = {
  Admin: [ "Overview", "Branch_MS", ..., "Reports" ],
  Manager: [ "Overview", "Branch_MS", ..., "Reports" ],
  Staff: [ "Overview", "Branch_MS", ..., "Reports" ],
  User: [ "Overview", "Advisor", "Realtime", "DataAnalyst" ],
};

const tabMeta = allTabMeta.filter((tab) =>
  rolePermissions[userRole].includes(tab.id),
);
```
Additionally, `src/App.tsx` enforces this filter on role-change in a `useEffect` hook (lines 1914–1918):
```typescript
useEffect(() => {
  if (!rolePermissions[userRole].includes(activeTab)) {
    setActiveTab("Overview");
  }
}, [userRole, activeTab]);
```

### 3. Sidebar Rendering
The `<Sidebar />` component (imported from `./components/Sidebar`) is mounted in `App.tsx` at line 2145:
```typescript
<Sidebar
  activeTab={activeTab}
  setActiveTab={setActiveTab}
  tabMeta={tabMeta}
  ...
/>
```
Inside `src/components/Sidebar.tsx` (lines 104–133), sidebar links are generated dynamically by looping through the filtered `tabMeta` array:
```typescript
{tabMeta.map((tab) => {
  const isActive = activeTab === tab.id;
  return (
    <button key={tab.id} onClick={() => { setActiveTab(tab.id); setIsMobileMenuOpen(false); }} className={...}>
      ...
      <span>{tab.label}</span>
    </button>
  );
})}
```

### 4. Active Tab Content Selection (`renderActiveView`)
The active view is rendered dynamically based on `activeTab` inside the `renderActiveView()` function in `src/App.tsx` (lines 1933–2070):
```typescript
const renderActiveView = () => {
  switch (activeTab) {
    case "Overview":
      ...
    case "Production":
      return (
        <ProductionTab
          recipes={recipes}
          tasks={tasks}
          ...
        />
      );
    ...
    default:
      return <OverviewTab ... />;
  }
};
```

### Recommendation for Integration
To register the new **Menu Engineering** tab:
1. Import `ChefHat` or `TrendingUp` or `BarChart3` icon in `src/App.tsx`.
2. Add a new tab descriptor to `allTabMeta`:
   ```typescript
   {
     id: "MenuEngineering",
     label: "Menu Engineering",
     icon: <ChefHat className="w-4 h-4" />,
   }
   ```
3. Add `"MenuEngineering"` to the permissions list in `rolePermissions` for `Admin` and `Manager` roles.
4. Add a new case in `renderActiveView()` to render `<MenuEngineeringTab />`:
   ```typescript
   case "MenuEngineering":
     return (
       <MenuEngineeringTab
         theme={theme}
         recipes={recipes}
       />
     );
   ```

---

## Section 2: Data Structures and Extended Types (`src/types.ts` & `src/data.ts`)

### 1. Existing Recipe Structure
Currently, `Recipe` is defined in `src/types.ts` (lines 38–46) and initialized in `src/data.ts` (lines 52–58) as:
```typescript
// src/types.ts
export interface Recipe {
  id: string;
  name: string;
  category: string;
  status: 'active' | 'archived';
  prepTime: number;
  ingredients: string[];
  allergens: string[];
}

// src/data.ts
export const initialRecipes: Recipe[] = [
  { id: 'R-1', name: 'Tokyo Dragon Roll', category: 'Sushi Rolls', status: 'active', prepTime: 8, ingredients: ['Eel Fish', 'Shrimp Tempura', 'Fresh Avocado', 'Cucumber strip', 'Sweet Eel Glaze', 'Nori Seaweed'], allergens: ['Fish', 'Gluten', 'Sulphites'] },
  { id: 'R-2', name: 'Kyoto Salmon Sashimi Platter', category: 'Sashimi & Platters', status: 'active', prepTime: 12, ingredients: ['Atlantic Salmon Fillet', 'White Daikon Radish ruff', 'Fresh Shiso leaves', 'Artisanal Wasabi paste', 'Soy Sauce'], allergens: ['Fish', 'Soya', 'Gluten'] },
  ...
];
```

### 2. Proposing Extended Types for Menu Engineering
To implement the Menu Engineering tab, we need ingredient-level costs, sales prices, volumes, margins, and popularity scores. We propose the following interface extensions inside `src/types.ts`:

```typescript
export interface IngredientCost {
  name: string;
  cost: number;
}

export interface MenuEngineeringItem {
  id: string;
  name: string;
  category: string;
  price: number;              // Unit Selling Price
  salesVolume: number;        // Units sold in a given timeframe (e.g. 30 days)
  ingredientCosts: IngredientCost[];
  prepTime: number;           // Carried over from Recipe
  allergens: string[];        // Carried over from Recipe
  status: 'active' | 'archived';
}
```

We can compute the following derived values dynamically in React to preserve state responsiveness:
* **Total Cost of Goods Sold (COGS)**: $\sum (\text{Ingredient Costs})$
* **Unit Profit Margin (€)**: $\text{Price} - \text{COGS}$
* **Profit Margin Percentage (%)**: $(\text{Unit Profit Margin} / \text{Price}) \times 100$
* **Total Profit Contribution (€)**: $\text{Unit Profit Margin} \times \text{Sales Volume}$
* **Popularity Index**: Classification based on whether item sales volume is $\ge$ average volume (or $70\%$ of average volume standard).
* **Menu Engineering Matrix Classification**:
  * **Star**: High Volume, High Margin ($\ge$ average volume threshold and $\ge$ average margin percentage threshold).
  * **Plowhorse**: High Volume, Low Margin.
  * **Puzzle**: Low Volume, High Margin.
  * **Dog**: Low Volume, Low Margin.

### 3. Proposed Seed Data
We propose initializing a new seed array `initialMenuEngineeringItems` in `src/data.ts` to map exactly to the 5 baseline recipes:

```typescript
export const initialMenuEngineeringItems: MenuEngineeringItem[] = [
  {
    id: 'R-1',
    name: 'Tokyo Dragon Roll',
    category: 'Sushi Rolls',
    price: 18.00,
    salesVolume: 450,
    ingredientCosts: [
      { name: 'Eel Fish', cost: 3.50 },
      { name: 'Shrimp Tempura', cost: 2.00 },
      { name: 'Fresh Avocado', cost: 0.80 },
      { name: 'Cucumber strip', cost: 0.20 },
      { name: 'Sweet Eel Glaze', cost: 0.30 },
      { name: 'Nori Seaweed', cost: 0.20 }
    ],
    prepTime: 8,
    allergens: ['Fish', 'Gluten', 'Sulphites'],
    status: 'active'
  },
  {
    id: 'R-2',
    name: 'Kyoto Salmon Sashimi Platter',
    category: 'Sashimi & Platters',
    price: 24.00,
    salesVolume: 180,
    ingredientCosts: [
      { name: 'Atlantic Salmon Fillet', cost: 9.50 },
      { name: 'White Daikon Radish ruff', cost: 0.40 },
      { name: 'Fresh Shiso leaves', cost: 0.60 },
      { name: 'Artisanal Wasabi paste', cost: 0.50 },
      { name: 'Soy Sauce', cost: 0.20 }
    ],
    prepTime: 12,
    allergens: ['Fish', 'Soya', 'Gluten'],
    status: 'active'
  },
  {
    id: 'R-3',
    name: 'Spicy Bluefin Tuna Roll',
    category: 'Sushi Rolls',
    price: 14.50,
    salesVolume: 520,
    ingredientCosts: [
      { name: 'Spicy Minced Tuna', cost: 5.80 },
      { name: 'Crispy Cucumber', cost: 0.20 },
      { name: 'Kyoto Spicy Mayo', cost: 0.45 },
      { name: 'Toasted Sesame seeds', cost: 0.10 },
      { name: 'Sushi Grains', cost: 0.45 }
    ],
    prepTime: 4,
    allergens: ['Fish', 'Eggs', 'Sesame'],
    status: 'active'
  },
  {
    id: 'R-4',
    name: 'California Roll Classic',
    category: 'Sushi Rolls',
    price: 12.00,
    salesVolume: 600,
    ingredientCosts: [
      { name: 'Snow Crab Stick', cost: 2.50 },
      { name: 'Avocado slice', cost: 0.80 },
      { name: 'Fresh Cucumber', cost: 0.20 },
      { name: 'Premium Sushi Rice', cost: 0.50 },
      { name: 'Nori Sheets', cost: 0.20 }
    ],
    prepTime: 15,
    allergens: ['Crustaceans', 'Gluten'],
    status: 'active'
  },
  {
    id: 'R-5',
    name: 'Volcano Baked Scallop Roll',
    category: 'Specialty Rolls',
    price: 16.50,
    salesVolume: 90,
    ingredientCosts: [
      { name: 'Spicy Crab Mix', cost: 3.00 },
      { name: 'Chopped Sea Scallops', cost: 5.00 },
      { name: 'Creamy Spicy Mayo', cost: 0.40 },
      { name: 'Sweet Soy Reduction', cost: 0.30 },
      { name: 'Masago Fish Roe', cost: 0.80 }
    ],
    prepTime: 6,
    allergens: ['Molluscs', 'Eggs', 'Fish', 'Soya'],
    status: 'active'
  }
];
```

With these values, the thresholds will be:
* **Average Volume**: $(450 + 180 + 520 + 600 + 90) / 5 = 368$ units.
* **Average Margin Percentage**: $(61.1\% + 53.3\% + 51.7\% + 65.0\% + 42.4\%) / 5 = 54.7\%$.
* Placements:
  * **Tokyo Dragon Roll**: Margin $61.1\%$ (High), Vol $450$ (High) $\rightarrow$ **Star**
  * **California Roll Classic**: Margin $65.0\%$ (High), Vol $600$ (High) $\rightarrow$ **Star**
  * **Spicy Bluefin Tuna Roll**: Margin $51.7\%$ (Low), Vol $520$ (High) $\rightarrow$ **Plowhorse**
  * **Kyoto Salmon Sashimi Platter**: Margin $53.3\%$ (Low), Vol $180$ (Low) $\rightarrow$ **Puzzle** (or border Puzzle; unit profit is €12.80, which is the highest absolute profit, so we can classify it by unit margin or percentage margin. Let's stick to percentage margin or unit margin as our classification basis. Percentage margin is standard).
  * **Volcano Baked Scallop Roll**: Margin $42.4\%$ (Low), Vol $90$ (Low) $\rightarrow$ **Dog**

---

## Section 3: Backend Express Architecture & AI Integration (`server.ts`)

The Express server (`server.ts`) serves both static production assets and acts as a gateway for Gemini API requests.

### 1. Current API Call Pattern
The backend implements endpoints like `/api/gemini/strategic-advisor` and `/api/gemini/suggest-restock` using the following patterns:
* Express POST route parsing JSON.
* A check function `isRealGeminiKey` to see if a valid API key is set in `process.env.GEMINI_API_KEY`.
* If no key is set, it defaults to a local **Simulation Mode** returning structured fallback content.
* If a key is set, it initializes the `GoogleGenAI` client and calls the Gemini API.
* Model constraints enforce `gemini-1.5-flash` for general language requests to ensure cost-free execution.

### 2. Proposed Endpoint
We will create a new backend endpoint `/api/gemini/menu-engineering-suggestions` to supply AI advisory comments:

```typescript
// Proposed addition to server.ts

app.post("/api/gemini/menu-engineering-suggestions", async (req, res) => {
  try {
    const { menuItems } = req.body;
    if (!menuItems || !Array.isArray(menuItems)) {
      return res.status(400).json({ error: "menuItems array is required" });
    }

    const ai = getAiClient();
    
    // Simulate output if key is missing or invalid
    if (!isRealGeminiKey(process.env.GEMINI_API_KEY)) {
      return res.json({
        recommendations: "💡 [Simulation Mode] **Jules' Menu Insights:**\n\n" +
          "* **Tokyo Dragon Roll (Star):** Maintain current pricing. This item drives high margin and volume. Place it as a 'Chef's Recommendation' in the menu header.\n" +
          "* **Spicy Bluefin Tuna Roll (Plowhorse):** Popular but low margin. Consider reducing the tuna portion size slightly (by 5g) or adjusting the price to €15.20 to recover margins without dropping sales volume.\n" +
          "* **Kyoto Salmon Sashimi Platter (Puzzle):** High margin but low volume. Run a weekday promotion ('Sashimi Tuesdays') or pair it with sake/green tea to stimulate order frequency.\n" +
          "* **Volcano Baked Scallop Roll (Dog):** Low margin and volume. Replace or phase out. Alternatively, swap scallops for baked cod to lower the ingredient cost and raise the margin."
      });
    }

    try {
      const summaryText = menuItems.map(item => {
        const cogs = item.ingredientCosts.reduce((sum: number, ing: any) => sum + ing.cost, 0);
        const margin = item.price - cogs;
        const marginPct = ((margin / item.price) * 100).toFixed(1);
        return `- ${item.name} (${item.category}): Price €${item.price.toFixed(2)}, Cost €${cogs.toFixed(2)}, Margin €${margin.toFixed(2)} (${marginPct}%), Volume ${item.salesVolume} units`;
      }).join("\n");

      const prompt = `You are Jules, the Chief AI Strategy Officer for 'Food Penguin Limited', an elite ocean-to-table food corporation.
Analyze the following menu performance data of our premium dishes:
${summaryText}

Classify each item based on its sales volume and profit margin percentage. Detail actionable strategic recommendations for:
1. Stars (High popularity, High profitability) - How to promote or maintain them.
2. Plowhorses (High popularity, Low profitability) - How to recover margins (e.g. portion size, small price hikes, ingredient swaps).
3. Puzzles (Low popularity, High profitability) - How to boost sales volume.
4. Dogs (Low popularity, Low profitability) - Re-evaluating or phasing them out.

Keep your response extremely concise, motivating, and tailored to retail kitchen operations. Provide 3-4 clear bullet points with bold headers.`;

      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash", // Strictly adheres to free-tier model constraint
        contents: prompt,
        config: {
          systemInstruction: "You are Jules, the Chief AI Strategy Officer for 'Food Penguin Limited'. You focus on margin recovery, cost control, and procurement efficiency."
        }
      });

      res.json({
        recommendations: response.text || "No recommendations generated."
      });
    } catch (apiErr: any) {
      console.log("Menu Engineering suggestions falling back to simulation due to key failure.");
      res.json({
        recommendations: "💡 [Simulation Mode - Fallback] **Jules' Menu Insights:**\n\n* **Spicy Bluefin Tuna Roll (Plowhorse):** Swap premium tuna with standard loins or raise price slightly to shift it to Star.\n* **Kyoto Salmon Sashimi Platter (Puzzle):** Bundle with drinks to raise volume.\n* **Volcano Baked Scallop Roll (Dog):** Replace scallops with a lower-cost seafood option."
      });
    }
  } catch (err: any) {
    console.error("Menu Engineering AI error: ", err);
    res.status(500).json({ error: err.message || "Failed to calculate menu engineering insights." });
  }
});
```

---

## Section 4: CSS Styles, Layout & Typography Compliance (`src/index.css`)

### 1. Typography Hierarchy Enforced
The `@theme` settings in `src/index.css` (lines 4–20) map all font sizes to three specific dashboard sizes:
* **Detail Text** (14px): Maps to `--font-size-xs` and `--font-size-sm`.
* **Headline / Normal Labels** (18px): Maps to `--font-size-base`, `--font-size-lg`, `--font-size-xl`, and `--font-size-2xl`.
* **Numbers / Key Metrics** (32px): Maps to `--font-size-3xl` through `--font-size-8xl`.

*Action Check:* We must ONLY use tailwind size utility classes (`text-xs`, `text-sm` for details; `text-base`, `text-lg` for headlines; `text-3xl`, `text-4xl` for key numbers) when building the `MenuEngineeringTab` to avoid breaking this three-tier system.

### 2. Styling Tokens and Constraints
* **Light / Dark Theme Support**: All containers must support light mode and dark mode. For background containers, we should use conditional styling using the `isLight` state. E.g.
  * Card Background: `isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'`
  * Base Background: `isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800'`
* **Glow & Border styling**: All box panels should use the `.gold-liner-box` class, or dynamically select based on the metallic theme context `getBoxLinerClass()` from `App.tsx` (lines 415-421):
  ```typescript
  const getBoxLinerClass = (forceGold: boolean = false) => {
    if (forceGold) return "gold-liner-box";
    if (metallicTheme === "silver") return "silver-liner-box";
    if (metallicTheme === "copper") return "copper-liner-box";
    if (metallicTheme === "crystal") return "crystal-liner-box";
    return "gold-liner-box";
  };
  ```
* **Inputs & Focus Indicators**: All input fields for modifying prices or ingredient costs must use the `.input-gold-glow` class (applies transition and `focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500`).
* **Micro-Animations**: All interactive items (buttons, tables rows, toggle cards) must use `.btn-interactive` or equivalent animation modifiers (`hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] transition-all`).

---

## Section 5: Step-by-Step Implementation Recommendations

To implement this tab cleanly, follow these 6 steps:

### Step 1: Update Types (`src/types.ts`)
Add the `IngredientCost` and `MenuEngineeringItem` interfaces, or extend the existing `Recipe` interface to hold the menu engineering properties.

### Step 2: Add Seed Data (`src/data.ts`)
Create the baseline array `initialMenuEngineeringItems` containing ingredient breakdowns, prices, and sales volumes matching the 5 recipes in `initialRecipes`.

### Step 3: Register the Tab in `src/App.tsx`
Add `MenuEngineering` to `allTabMeta` (starts on line 1836), update `rolePermissions` to allow `Admin` and `Manager` roles access, and mount `<MenuEngineeringTab />` in `renderActiveView()`.

### Step 4: Create the Component `src/components/MenuEngineeringTab.tsx`
Create this component containing:
1. **Header Toolbar**: Title, selected branch display, and a "Suggest Recommendations" button (with `BrainCircuit` or `Sparkles` icon) which calls the new API.
2. **Key metrics cards** (using `.gold-liner-box`):
   * Average Item Price (Headline size)
   * Average Margin % (Headline size)
   * Total Monthly Profit (Headline size)
3. **Menu Quadrant Scatter Chart**:
   * Implement a Recharts `<ScatterChart>` with `<ReferenceLine>` for average volume (X-axis) and average margin (Y-axis) to divide the screen into Stars, Plowhorses, Puzzles, and Dogs.
   * Provide a tooltip that shows the item's name, volume, and margin.
4. **Editable Item List & Boundaries Checker**:
   * A table showing each menu item, its price, ingredient costs, computed margin, and category classification.
   * When an item is expanded or edited, render input boxes styled with `input-gold-glow`.
   * **Boundary checks**: Validate that inputs are valid numbers. If Price is less than the total COGS, display the `AlertTriangle` warning icon next to the margin cell.
5. **AI Suggestions Panel**:
   * Render the markdown response returned by Jules in a scrollable, gold-border container when the manual "AI Engineering Advice" button is clicked.

### Step 5: Add Backend Endpoint to `server.ts`
Implement the POST endpoint `/api/gemini/menu-engineering-suggestions` in `server.ts` using `gemini-1.5-flash` with a structured system instruction and local simulation mode fallback.

### Step 6: Build & Verify
Validate the implementation matches coding rules:
```bash
npm run lint
npm run build
```
Verify the tab looks pixel-perfect in both Light and Dark modes.

---

## Verification Method

1. **Type Checks**: Run `npm run lint` (`tsc --noEmit`) to verify that the types are correctly aligned.
2. **Build Success**: Run `npm run build` to verify Vite assets package cleanly and `server.ts` bundles correctly into `dist/server.cjs`.
3. **Tab Accessibility**: Log in as `Admin` and check if "Menu Engineering" is visible in the sidebar. Log in as `User` and check if it is correctly hidden.
4. **Interactive Simulation**: Edit an ingredient cost or a selling price in the table. Ensure the Scatter Chart adjusts instantly and the classification adjusts dynamically (e.g. from Plowhorse to Star when price increases).
5. **AI Interaction**: Verify the API endpoint handles requests and responds with simulated insights if `GEMINI_API_KEY` is not present, and authentic insights when present.
