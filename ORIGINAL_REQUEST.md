# Original User Request

## Initial Request — 2026-07-01T19:12:50Z

Add a new **Menu Engineering** tab to the existing Food Penguin Limited React dashboard. This is a production-quality operational tool for analyzing per-dish profitability, ingredient-level costing, and AI-powered price optimization suggestions across the sushi menu.

Working directory: c:\Users\beern\Food-Penguin-Limited
Integrity mode: development

## Context — Existing Codebase

This is a **React 19 + Vite + TypeScript** dashboard with an Express backend. Key facts the team must follow:

- **Source code** is in `src/`. The main app file is `src/App.tsx` (~4750 lines) which owns all state, tab routing via `activeTab`, and renders a `<Sidebar>` that takes a `tabMeta` array of `{ id, label, icon }`.
- **Existing tabs** are registered in the `allTabMeta` array (~line 1836) and gated by `rolePermissions` (~line 105). The new tab must be added to both.
- **Existing `Recipe` interface** in `src/types.ts` has: `id, name, category, status, prepTime, ingredients, allergens`. The team should **not modify** this interface — instead, create a new extended type or a separate `MenuItem` interface that references or extends the recipe data.
- **Seed data** in `src/data.ts` has 5 recipes (`initialRecipes`). The team can add new seed data for menu engineering (costs, prices, popularity scores, sales volumes) without modifying existing data exports.
- **Styling**: Tailwind-first with shared theme tokens in `src/index.css`. Three font sizes: Detail (1.05rem), Headline (1.5rem), Number (2.5rem). Gold-liner focus style on inputs. Micro-animations on hover/active states. Must support both light and dark modes.
- **AI model constraint**: This project uses **`gemini-1.5-flash`** only. AI calls must be triggered manually by button click — no auto-polling or background loops.
- **Dev commands**: `npm run dev` (port 3000), `npm run build`, `npm run lint` (tsc --noEmit).
- **Icons**: Use `lucide-react` for all icons (already installed).

## Requirements

### R1. Menu Engineering Tab Component

Create a new `MenuEngineeringTab.tsx` component in `src/components/` that displays a comprehensive menu profitability dashboard. It should show each menu item with its ingredient-level cost breakdown, selling price, food cost percentage, contribution margin, and popularity/sales volume. The tab must be wired into the sidebar navigation (added to `allTabMeta` and `rolePermissions` for Admin and Manager roles) and render when selected.

### R2. AI-Powered Price Optimization

Add a manually-triggered AI price optimization feature (button click, not auto-polling) using the `gemini-1.5-flash` model. When triggered, it should analyze the current menu data and return suggested price adjustments with rationale for each dish — considering food cost percentage targets, competitive positioning, and margin improvement opportunities. Display suggestions in a clear, actionable format with accept/dismiss controls per suggestion.

### R3. Recipe Cost Data Model

Create a data layer for menu engineering that maps to the existing 5 recipes. Each menu item needs: ingredient quantities and unit costs, total food cost, selling price, food cost percentage, contribution margin (selling price minus food cost), and a popularity score or weekly sales volume. This data should be realistic for a sushi restaurant and stored as seed data alongside existing data patterns.

### R4. Visual Design Consistency

The tab must match the existing dashboard aesthetic: dark/light mode support, gold-liner focus styles, Tailwind utility classes, lucide-react icons, and the three-size typography system. Include micro-animations on interactive elements (hover, active states). The layout should feel premium and production-ready, not a basic table dump.

## Acceptance Criteria

### Build & Type Safety
- [ ] `npm run lint` passes with zero new errors
- [ ] `npm run build` completes successfully
- [ ] No new TypeScript `any` types introduced (explicit typing throughout)

### Tab Integration
- [ ] The "Menu Engineering" tab appears in the sidebar for Admin and Manager roles
- [ ] Clicking the tab renders the `MenuEngineeringTab` component
- [ ] The tab does not appear for Staff or User roles
- [ ] Navigating away and back preserves no stale state issues

### Data & Calculations
- [ ] All 5 existing recipes are represented with realistic cost/price data
- [ ] Food cost percentage = (total food cost / selling price) × 100, verified correct for each item
- [ ] Contribution margin = selling price − total food cost, verified correct for each item
- [ ] At least one item has ingredient-level cost breakdown visible in the UI

### AI Price Optimization
- [ ] A "Get AI Suggestions" button exists and is the only way to trigger AI analysis
- [ ] AI suggestions display per-dish price recommendations with reasoning text
- [ ] Each suggestion has accept/dismiss controls
- [ ] No automatic/background AI polling exists anywhere in the new code

### Visual & UX
- [ ] Tab renders correctly in both light and dark mode
- [ ] Gold-liner focus styles applied to any input/interactive elements
- [ ] Micro-animations present on hover/active states of cards or rows
- [ ] Typography uses only the three defined sizes (Detail, Headline, Number)
- [ ] No visual regressions to existing tabs (build still works, other tabs unaffected)

## Follow-up — 2026-07-01T19:18:22Z

IMPORTANT UPDATE — The user wants you to use Stitch UI designs as reference for the Menu Engineering tab's visual design.

Two Stitch screens have been generated in the Food Penguin Design System project (project ID: 4538700503095029004):

1. **Main Dashboard Screen** (screen ID: 4a97d9b258694e0198735f7ae2262cbe) — "Food Penguin - Menu Engineering"
   - Screenshot: https://lh3.googleusercontent.com/aida/AP1WRLv_lNjGXxkGy5CbKBSZ614qK4NS09vh0RhuwUTrHK_bOBQKh09GvrgGJGUfTfWGNAuHxJvTty8pbUNZfBfnUM6IDfQaKeZWQg24GQmXVlRWhMtapawtqmSynvXxMRVF8PHQwwUZg_mIwiUv5WHjuIFcxb9HRckf9ysh3QU8s1sxY8gVxC96_RuKYwtSmwMS7InNgqRzNrQM3qHRM1-O-wDveLufSGpxT8REJwwq4lEVtjPlvbBTRfYY0yE
   - HTML code available at the downloadUrl in the screen data

2. **Ingredient Detail Screen** (screen ID: d2c9f9f8968549ecb2a3c89f5125bceb) — "Food Penguin - Menu Engineering Detail"  
   - Screenshot: https://lh3.googleusercontent.com/aida/AP1WRLujbziSxxKMQ-uphxSvgQuHf0FOlaCWfa9NIDUDaR9RPPh1kEfOSWwt7jygHagK6z_yzqm-ChTrdpYZU6NHQSzQt_YO1TkaYcYETlG_mPCDBMjDIsqLQCxF8moci_P7YIw9IuGZkqQ5x6cRlo2kOQoh1ZN_pfsY2s7LcffZHbsx4Vnrv3dmcfR_Tqccs_708wwq3mWwk6Lp4MNruGnwTfZHmNEdJFVCRU8CjqtBVepQbCW2z9Gtk9s96x4
   - HTML code available at the downloadUrl in the screen data

Key design decisions from the Stitch designs to follow:
- **Nocturnal Amber dark mode**: Deep #131313 backgrounds, #FFBF00 amber accents, gold liner borders on active states
- **Bento KPI row**: Glassmorphism cards for the 4 summary metrics  
- **Profitability table**: Color-coded food cost % indicators (green/amber/red), popularity ratings
- **Ingredient breakdown panel**: Per-ingredient cost details with gram-level precision
- **Typography**: Sora font throughout, label-md for section headers, display-sm for KPI numbers

Please match the Stitch-generated designs as closely as possible when implementing the React component. The designs use the "Nocturnal Amber" design system which matches the dashboard's dark mode aesthetic.

