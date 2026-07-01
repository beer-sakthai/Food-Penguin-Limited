# Technical Documentation: Menu Engineering Feature

This document provides a technical overview of the "Menu Engineering" feature for the Food Penguin Limited dashboard. It is intended for new developers to understand the architecture, data models, and key integration points.

---

## 1. Frontend Integration

The Menu Engineering tab is integrated into the main React application shell, `src/App.tsx`. Its registration and rendering follow the established pattern for all dashboard modules.

### Tab Registration

A new entry is added to the `allTabMeta` array in `src/App.tsx`. This object defines the tab's ID, display label, and its icon from `lucide-react`.

```typescript
// src/App.tsx
const allTabMeta = [
  // ... other tabs
  {
    id: "MenuEngineering",
    label: "Menu Engineering",
    icon: <ChefHat className="w-4 h-4" />,
  },
  // ... other tabs
];
```

### Role-Based Access Control (RBAC)

Access to the tab is restricted to specific user roles. The `"MenuEngineering"` ID is added to the permission arrays for `Admin` and `Manager` roles within the `rolePermissions` object in `src/App.tsx`.

```typescript
// src/App.tsx
const rolePermissions: Record<"Admin" | "Manager" | "Staff" | "User", string[]> = {
  Admin: [
    // ...
    "MenuEngineering",
    // ...
  ],
  Manager: [
    // ...
    "MenuEngineering",
    // ...
  ],
  // ... other roles
};
```

### View Rendering

The `renderActiveView` function in `src/App.tsx` uses a `switch` statement to determine which component to display based on the `activeTab` state. A new `case` has been added to render the `<MenuEngineeringTab />` component.

```typescript
// src/App.tsx
const renderActiveView = () => {
  switch (activeTab) {
    // ... other cases
    case "MenuEngineering":
      return (
        <MenuEngineeringTab
          theme={theme}
          metallicTheme={metallicTheme}
          menuItems={menuItems}
          onUpdateMenuItems={setMenuItems}
        />
      );
    // ... other cases
  }
};
```

---

## 2. Data Models

To support the feature, two new data structures were introduced in `src/types.ts` to model menu items with detailed cost and sales data.

### `IngredientCost`

Represents the cost of a single ingredient within a recipe.

```typescript
// src/types.ts
export interface IngredientCost {
  name: string;
  cost: number;
}
```

### `MenuEngineeringItem`

This is the core data model for the feature. It extends the basic `Recipe` concept with financial and sales metrics, such as selling price, sales volume, and a detailed breakdown of ingredient costs.

```typescript
// src/types.ts
export interface MenuEngineeringItem {
  id: string;
  name: string;
  category: string;
  price: number;
  salesVolume: number;
  ingredientCosts: IngredientCost[];
  prepTime: number;
  allergens: string[];
  status: 'active' | 'archived';
}
```

---

## 3. Backend API

The feature includes an AI-powered suggestion engine, which is accessed via a dedicated backend endpoint in `server.ts`.

### `POST /api/gemini/menu-engineering-suggestions`

This endpoint receives the current list of `MenuEngineeringItem` objects and uses the Gemini 1.5 Flash model to provide strategic advice.

**Functionality:**

- **Analysis**: The AI analyzes the profitability (margin) and popularity (sales volume) of each item to classify them into standard menu engineering categories (Stars, Plowhorses, Puzzles, Dogs).
- **Recommendations**: It returns a structured JSON object containing:
  - `recommendations`: A markdown-formatted string with high-level strategic advice.
  - `adjustments`: An array of specific, actionable price changes for individual items, including the `itemId`, a `suggestedPrice`, and the `reason` for the change.
- **Simulation Mode**: If a valid `GEMINI_API_KEY` is not configured in the environment, the endpoint returns a hardcoded, simulated response. This ensures the frontend remains functional for development and demonstration purposes without requiring a live API key.

---

## 4. Styling Conventions

The UI for the Menu Engineering tab adheres to the project's established design system to ensure a consistent look and feel.

- **Typography**: The component uses the project's three-tier typography system (Detail, Headline, Number) defined in `src/index.css`.
- **Containers**: All panels and cards use the `.gold-liner-box` class, which provides a consistent border and shadow treatment that adapts to the selected metallic theme (Gold, Silver, Copper).
- **Interactive Elements**: Inputs for editing prices or costs are styled with the `.input-gold-glow` class, which provides a standardized focus and transition effect. Buttons and other interactive elements use `btn-interactive` and associated `hover`/`active` utility classes for micro-animations.
- **Theming**: The component is fully compatible with both light and dark modes, using conditional classes based on the `isLight` prop passed down from `App.tsx`.
