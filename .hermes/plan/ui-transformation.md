# Food Penguin Limited — UI/UX Transformation Plan

## Goal

Turn the existing FPL dashboard into a **high-class, professional, model-grade** operational cockpit with:

- **Branch-aware living color system** — the entire UI "charges" to the selected branch palette.
- **Solution view** — a clean, decision-first executive summary mode.
- **Front-page transformation** — landing/entry experience that looks premium.
- **Mouse-effort interactions** — hover reveals, magnetic buttons, cursor-following glow, kinetic charts.
- **Professional polish** — refined spacing, typography, glass surfaces, motion, and accessibility.

---

## 1. Branch Color Charging System

### Palette

| Branch | Primary | Glow | Surface | Text-on-accent |
|---|---|---|---|---|
| Cork | `#22c55e` | `rgba(34,197,94,0.35)` | `rgba(34,197,94,0.08)` | `#052e16` |
| Mahon | `#3b82f6` | `rgba(59,130,246,0.35)` | `rgba(59,130,246,0.08)` | `#082f49` |
| M&S | `#e8bf66` | `rgba(232,191,102,0.35)` | `rgba(232,191,102,0.08)` | `#451a03` |
| All / default | `#6366f1` (indigo) | `rgba(99,102,241,0.30)` | `rgba(99,102,241,0.06)` | `#ffffff` |

### Implementation

- Drive a CSS variable set from `App.tsx` based on `selectedBranch`.
- All components read `--branch-primary`, `--branch-glow`, `--branch-surface`, `--branch-text`.
- Animate transitions with CSS `transition: --branch-primary 0.4s ease` (or fallback via `style` + Framer Motion).
- Apply to: header, active tab, KPI icon badges, buttons, chart accents, progress bars, focus rings, scrollbars.

### Extra: "Charge" indicator

- A subtle radial pulse behind the branch selector when metrics are healthy.
- If health score drops below 70, shift glow to amber/red independent of branch.

---

## 2. Solution View (Executive Summary Mode)

A new toggle/mode that collapses noise and surfaces only **decisions**:

### Layout

- Full-width hero strip: **"What should I do today?"**
- Three action cards ranked by impact:
  1. **Fix now** — red border, e.g. waste >12% or COGS >35%.
  2. **Watch** — amber border, e.g. production trailing target.
  3. **Maintain** — branch-colored border, metrics on target.
- One-line summary per branch.
- Quick buttons: *Log waste*, *Adjust production*, *View detailed analytics*.

### Components

- `SolutionView.tsx` — new top-level mode.
- Add to `App.tsx` render switch.
- Reuses the same KPI data but presents it as **answer-first**.

---

## 3. Front-Page Transformation

### Current state

The app opens straight to the dashboard. For a premium product feel, add an optional **entry/loading screen** and a cleaner first paint.

### Plan

- **Splash / brand moment** on cold load:
  - Animated Food Penguin wordmark.
  - Branch-colored ring pulse.
  - Tagline: *"Premium sushi. Precision operations."*
- **Landing choice** (configurable): branch selector as the first interactive element, so the user sets context before seeing the dashboard.
- Once selected, animate transition into dashboard.

### Implementation

- `SplashScreen.tsx` with Framer Motion.
- Store "seen splash" in `sessionStorage` so it doesn't repeat within the same browser session.

---

## 4. Mouse-Effort Interactions

These add "high-class" tactile feel without hurting performance.

### Interactions

| Element | Interaction |
|---|---|
| Header / cards | Subtle tilt or lift on hover (`transform: translateY(-2px)`, shadow deepen) |
| Buttons | Magnetic pull toward cursor within 20px radius |
| KPI cards | Cursor-following gradient glow on the border |
| Charts | Hover crosshair + tooltip with branch-colored cursor line |
| Sidebar tabs | Pill slides behind active item; hover previews a faint glow |
| Data tables | Row highlight follows mouse with a soft gradient |
| Branch selector | On open, options cascade in with stagger |

### Implementation

- Custom CSS-only where possible (radial gradient updated via `onMouseMove` throttled to RAF).
- Use `framer-motion` for layout animations.
- Keep effects disabled for `prefers-reduced-motion`.

---

## 5. Professional Look & Model Grade

### Typography

- Use a tighter scale:
  - Headings: `font-weight: 600`, tighter letter-spacing.
  - Numbers/KPIs: tabular figures, `font-variant-numeric: tabular-nums`.
  - Labels: `font-size: 11px`, `letter-spacing: 0.05em`, uppercase.

### Surfaces

- Deep dark base (`#0b0f19`), layered panels with subtle borders.
- Glass effect on modals/dropdowns: `backdrop-blur`, `bg-opacity`.
- Consistent 12/16/20/24 spacing grid.

### Iconography

- Upgrade to crisp `lucide-react` icons, unified size (20px), branch-colored active state.

### Charts

- Remove chart grid clutter; keep only essential reference lines.
- Use branch primary for the main series, muted gray for comparisons.
- Add rounded caps and gradients under lines.

### Accessibility

- Ensure all color-coded info also has text/icon redundancy.
- Maintain WCAG 4.5:1 contrast.

---

## 6. Cron Jobs (1-Minute Help Loop)

Set up autonomous 1-minute cron jobs that:

1. **ui-watchdog-1m**: check that the FPL dashboard lint/build stays green; if broken, notify Beer and attempt auto-fix.
2. **design-refresh-1m**: scan the repo for UI drift (unused CSS, missing branch colors, hard-coded hex values) and open micro-fixes or append to `UI_IMPROVEMENTS.md`.
3. **ux-research-1m**: read one small snippet from a professional dashboard reference (stored locally) and append a concrete improvement idea to `LEARNING_JOURNAL.md`.

These run silently and only deliver on actionable findings.

---

## 7. Phased Implementation

### Phase 1 — Design Tokens & Global Shell

- [ ] Centralize branch color CSS variables in `App.tsx`.
- [ ] Refactor sidebar, header, and tab active states to use variables.
- [ ] Add smooth color transition across the app.

### Phase 2 — Analytics Tab Polish

- [ ] Apply branch color charging to existing Analytics tab.
- [ ] Add mouse-glow KPI cards.
- [ ] Reduce chart grid noise.

### Phase 3 — Solution View

- [ ] Build `SolutionView.tsx`.
- [ ] Wire into `App.tsx` as a top-level mode.

### Phase 4 — Front Page

- [ ] Build `SplashScreen.tsx`.
- [ ] Add branch-first landing flow.

### Phase 5 — Micro-Interactions

- [ ] Magnetic buttons.
- [ ] Cursor-following card glows.
- [ ] Staggered dropdown animations.

### Phase 6 — Cron Jobs & Verification

- [ ] Create 1-minute cron jobs.
- [ ] Run lint/build/deploy cycle.
- [ ] Capture lessons in `LEARNING_JOURNAL.md`.

---

## Verification

Each phase must pass:

1. `npm run lint`
2. `npm run build`
3. `npm audit` (remain 0 vulnerabilities)
4. Browser smoke test on Vercel

---

*Plan created by Saksee · Master of Web.*
