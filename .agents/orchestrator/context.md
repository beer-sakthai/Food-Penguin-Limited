# Context

## Files to be Modified
- `src/types.ts`: To declare the new interfaces `IngredientCost` and `MenuEngineeringItem`.
- `src/data.ts`: To export the new seed data `initialMenuEngineeringItems`.
- `src/App.tsx`: To register the `MenuEngineering` tab in `allTabMeta`, configure `rolePermissions`, and import and render the `MenuEngineeringTab` component.
- `server.ts`: To add the `/api/gemini/menu-engineering-suggestions` endpoint.

## Files to be Created
- `src/components/MenuEngineeringTab.tsx`: The primary dashboard component for Menu Engineering.

## Key Code Structures
- `Recipe` (existing type in `src/types.ts`)
- `allTabMeta` (existing array in `src/App.tsx`)
- `rolePermissions` (existing object in `src/App.tsx`)
- Express app configuration and existing `/api/gemini` routes in `server.ts`.

## Reference Materials
- `c:\Users\beern\Food-Penguin-Limited\.agents\orchestrator\stitch_main_screen_code.html` (Main screen layout reference)
- `c:\Users\beern\Food-Penguin-Limited\.agents\orchestrator\stitch_detail_screen_code.html` (Ingredient detail layout reference)
- `c:\Users\beern\Food-Penguin-Limited\.agents\orchestrator\stitch_main_screen.json` (Main screen metadata)
- `c:\Users\beern\Food-Penguin-Limited\.agents\orchestrator\stitch_detail_screen.json` (Detail screen metadata)
