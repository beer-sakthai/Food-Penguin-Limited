# Handoff Report: Menu Engineering Tab Exploration

## 1. Observation
We observed the following files and code locations:
* **Tab Registration in `src/App.tsx`**:
  * Line 1836–1907: `allTabMeta` registers all sidebar tabs:
    ```typescript
    const allTabMeta = [
      {
        id: "Overview",
        label: "Dashboard",
        icon: <LayoutDashboard className="w-4 h-4" />,
      },
      ...
    ```
  * Line 1909–1911: `tabMeta` filters permissions dynamically:
    ```typescript
    const tabMeta = allTabMeta.filter((tab) =>
      rolePermissions[userRole].includes(tab.id),
    );
    ```
  * Line 105–166: `rolePermissions` restricts tabs based on `Admin`, `Manager`, `Staff`, `User`.
  * Line 1933–2070: `renderActiveView()` executes switch/case statements to mount components.
* **Component Structures in `src/components/`**:
  * `Sidebar.tsx` (lines 104–133) renders tab options:
    ```typescript
    {tabMeta.map((tab) => {
      const isActive = activeTab === tab.id;
      return (
        <button className={...} key={tab.id} onClick={() => { setActiveTab(tab.id); setIsMobileMenuOpen(false); }}>
          ...
        </button>
      );
    })}
    ```
  * `PlanningTab.tsx` (lines 61-95) executes `fetch` requests to `/api/gemini/suggest-restock` and handles parsing and rendering of AI summaries.
* **Data Types in `src/types.ts` & `src/data.ts`**:
  * `src/types.ts` lines 38-46: `Recipe` interface.
  * `src/data.ts` lines 52-58: `initialRecipes` with 5 items.
* **Express entrypoint in `server.ts`**:
  * Endpoint definitions (like `/api/gemini/suggest-restock` at line 294) parse payload, inspect `isRealGeminiKey(process.env.GEMINI_API_KEY)`, and invoke the Gemini client with model `"gemini-1.5-flash"` or run simulated fallbacks.
* **Styling tokens in `src/index.css`**:
  * Line 4–20: `@theme` configures standard typography sizes mapping into Detail, Headline, and Numbers.
  * Line 153–279: Custom styles for container classes like `.gold-liner-box` and focus rings like `.input-gold-glow`.

## 2. Logic Chain
1. To introduce a new tab, it must be added to `allTabMeta` in `src/App.tsx`, whitelisted in `rolePermissions` for authorized roles, and mapped to a component in `renderActiveView()`.
2. To compute margins and Menu Engineering categories dynamically, the core type of menu items (extending `Recipe`) must include selling prices, ingredient cost breakdowns, and sales volumes.
3. The Express backend handles LLM interaction and includes local simulation fallback. A new endpoint `/api/gemini/menu-engineering-suggestions` using `gemini-1.5-flash` (strictly following model rules) must be added to handle manual recommendations request payloads.
4. CSS styling rules require using consolidated text sizes from `@theme`, gold borders/liners (`gold-liner-box`), focus glow (`input-gold-glow`), and hover transitions (`btn-interactive`) to guarantee interface consistency.

## 3. Caveats
* No live database sync checks were run, but the Firestore sync listener is active in `App.tsx` and can be utilized for items if needed.
* ScatterChart components require `recharts` to render properly. It is verified as a dependency in `package.json`, but visual sizing must be kept minimal (height constrained in index.css overrides) to fit on one screen.

## 4. Conclusion
We have verified all entry points and styled tokens. The proposed implementation is fully structured and scoped, and is written in the report `c:\Users\beern\Food-Penguin-Limited\.agents\orchestrator\exploration_report.md`.

## 5. Verification Method
Verify that the exploration report exists at `c:\Users\beern\Food-Penguin-Limited\.agents\orchestrator\exploration_report.md`. Run type-check and bundler builds to verify environment health:
```bash
npm run lint
npm run build
```
