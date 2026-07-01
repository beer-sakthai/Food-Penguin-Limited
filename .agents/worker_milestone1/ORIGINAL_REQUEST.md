## 2026-07-01T19:15:49Z
You are the Data and Seed Data Implementer. Your working directory is: c:\Users\beern\Food-Penguin-Limited\.agents\worker_milestone1.
Your task is to implement the types and seed data for the Menu Engineering feature.

Specifically:
1. Edit `src/types.ts` to add and export two new interfaces:
   - `IngredientCost` with properties `name` (string) and `cost` (number).
   - `MenuEngineeringItem` with properties `id` (string), `name` (string), `category` (string), `price` (number), `salesVolume` (number), `ingredientCosts` (`IngredientCost[]`), `prepTime` (number), `allergens` (`string[]`), and `status` ('active' | 'archived').
   Do not modify the existing `Recipe` interface.
2. Edit `src/data.ts` to add and export `initialMenuEngineeringItems` of type `MenuEngineeringItem[]` with realistic values for the 5 recipes in `initialRecipes`:
   - R-1: Tokyo Dragon Roll (price: 18.00, salesVolume: 450, ingredients costs: Eel Fish 3.50, Shrimp Tempura 2.00, Fresh Avocado 0.80, Cucumber strip 0.20, Sweet Eel Glaze 0.30, Nori Seaweed 0.20)
   - R-2: Kyoto Salmon Sashimi Platter (price: 24.00, salesVolume: 180, ingredients costs: Atlantic Salmon Fillet 9.50, White Daikon Radish ruff 0.40, Fresh Shiso leaves 0.60, Artisanal Wasabi paste 0.50, Soy Sauce 0.20)
   - R-3: Spicy Bluefin Tuna Roll (price: 14.50, salesVolume: 520, ingredients costs: Spicy Minced Tuna 5.80, Crispy Cucumber 0.20, Kyoto Spicy Mayo 0.45, Toasted Sesame seeds 0.10, Sushi Grains 0.45)
   - R-4: California Roll Classic (price: 12.00, salesVolume: 600, ingredients costs: Snow Crab Stick 2.50, Avocado slice 0.80, Fresh Cucumber 0.20, Premium Sushi Rice 0.50, Nori Sheets 0.20)
   - R-5: Volcano Baked Scallop Roll (price: 16.50, salesVolume: 90, ingredients costs: Spicy Crab Mix 3.00, Chopped Sea Scallops 5.00, Creamy Spicy Mayo 0.40, Sweet Soy Reduction 0.30, Masago Fish Roe 0.80)
3. Ensure the project still compiles and check types by running `npm run lint` and `npm run build`. If there are any compilation issues, resolve them.
4. Document your changes, commands executed, and output in `c:\Users\beern\Food-Penguin-Limited\.agents\worker_milestone1\changes.md` and write a handoff report in `c:\Users\beern\Food-Penguin-Limited\.agents\worker_milestone1\handoff.md`.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
