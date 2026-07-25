# Food Penguin Limited — Learning Journal

| > Auto-generated micro-improvements captured by Saksee · Master of Web.
|
| ## 2026-07-25 — Branch-colour unification
|
| **Source:** Local dashboard code inspection (`src/index.css`, `src/business.ts`, `src/App.tsx`) plus PostHog design system (`popular-web-designs/templates/posthog.md`) principle of *one source of truth for brand tokens*.
|
| **Micro-improvement:**
| Consolidate all branch colour lookups into the canonical `BRANCH_META` metadata (or the matching CSS variables in `index.css`). Remove the hard-coded `getBranchColorMap()` duplicates in `App.tsx` so Cork, Mahon and M&S always render the same hex everywhere.
|
| **Where to apply:**
| - `src/App.tsx`: replace `getBranchColorMap()` with a lookup into `BRANCH_META` from `src/business.ts` (e.g. `BRANCH_META.find(b => b.id === branchId)?.colour`).
| - Keep `index.css` as the single visual-token layer (`--branch-cork: #22c55e`, `--branch-mahon: #3b82f6`, `--branch-ms: #e8bf66`) and apply the branch class (`branch-cork` / `branch-mahon` / `branch-ms`) to the dashboard root or branch selector.
| - Use the same tokens for KPI glows, chart series, tab underlines and location badges so theming stays coherent.
|
| **Why it matters:**
| A dashboard with inconsistent branch colours looks untrustworthy. One source of truth prevents silent drift (e.g. M&S currently shown as `#eab308` in one place and `#e8bf66` in another) and makes future re-theming trivial. This is a small data-hygiene change with large perceived-quality payoff.
|
| **Reference snippet:**
| > PostHog: "All interactive elements flash PostHog Orange (#F54E00) on hover — it's the hidden brand signature" (parallel principle: brand colours must be *consistent* before they can be *expressive*).
|
| ## 2026-07-25 — KPI card cursor-following glow

|**Source:** `Food-Penguin-Limited/.hermes/plan/ui-transformation.md` (Section 4: Mouse-Effort Interactions)

|**Micro-improvement:**
Add a subtle cursor-following gradient glow to the border of each KPI card in the Analytics tab.

|**Where to apply:**
|- Dashboard KPI cards in the Analytics view (`src/pages/analytics/` or equivalent card components).
|- Track `onMouseMove` on each card, update a CSS radial-gradient background behind the card border (or a pseudo-element border-image) positioned at `e.clientX - rect.left, e.clientY - rect.top`.
|- Color should read from the current branch CSS variable (`--branch-primary`) and glow with `rgba(var(--branch-rgb), 0.15)`.

|**Why it matters:**
This is a low-effort, high-perceived-quality interaction that makes the dashboard feel tactile and "model-grade" without cluttering the dark theme. It aligns with the branch-aware living color system already planned.

|**Reference snippet:**
|> "KPI cards — Cursor-following gradient glow on the border"

| ## 2026-07-25 — Real-time model download sparkline in ModelPanel
|
| **Source:** Local dashboard code inspection (`src/components/overview/ModelPanel.tsx`) plus PostHog principle of *inline context over separate reports*.
|
| **Micro-improvement:**
| Add a tiny sparkline under each Hugging Face model download count in the ModelPanel card that shows the recent download-velocity trend, computed by snapshotting the count each time the panel mounts/refetches and comparing it to the previous stored value in `localStorage`.
|
| **Where to apply:**
| - `src/components/overview/ModelPanel.tsx`: store a `{ [modelId]: { snapshots: { ts, value }[] } }` record under a `fpl-hf-model-trends` localStorage key.
| - On each fetch, append the new `{ ts: Date.now(), value: downloads }`, prune entries older than 14 days, then render a 24 px high SVG `<polyline>` or `<path>` under the model id.
| - Use the panel's existing accent colour (`text-[var(--accent)]`) for the sparkline stroke and a soft fill (`--accent-soft`) to keep it inside the dark theme.
| - Add `aria-hidden="true"` and a brief `title` attribute so the sparkline is decorative but screen-reader users still get the numeric delta.
|
| **Why it matters:**
| A raw download number is a vanity metric; a trend line tells Beer whether a SakThai model is gaining traction or stalling without leaving the dashboard. It also gives the "AI family" card the same data-density standard as the rest of the KPI grid.
|
| **Reference snippet:**
| > PostHog: "Dashboards should answer the next question before the user asks it" (parallel principle: show velocity, not just absolute value).

| ## 2026-07-25 — Semantic soft-badge styling for KPI status chips
|
| **Source:** `popular-web-designs/templates/kraken.md` (Component Stylings → Badges)
|
| **Micro-improvement:**
| Replace hard-coded solid status colours on dashboard badges with a translucent background + dark-text pairing: `rgba(20,158,97,0.16)` background and `#026b3f` text for positive states; equivalent red/amber variants for warning/error states.
|
| **Where to apply:**
| - KPI status chips in `src/App.tsx`, `src/pages/analytics/AnalyticsTab.tsx`, and any branch/health indicator components.
| - Use CSS variables so the pattern works across branch themes, e.g. `--badge-positive-bg: rgba(var(--ok-rgb), 0.16)` and `--badge-positive-text: var(--ok-dark)`.
| - Apply the same rule to the "branch active" indicator, the "trend up/down" delta badge, and the "Open / Closed" location pill.
| - Keep borders off or extremely subtle (1px `rgba(...,0.10)`); the soft background itself should provide containment.
|
| **Why it matters:**
| Solid-colour status badges compete with the dark theme and branch accent glows. The Kraken-style "wash of colour + dark text" pattern is calmer, stays readable in dark mode, and lets the branch accent remain the hero colour. It also scales naturally to red/amber warning states without clashing with branch-specific palettes.
|
| **Reference snippet:**
| > Kraken: "Success: `rgba(20,158,97,0.16)` bg, `#026b3f` text, 6px radius"
|
| ## 2026-07-25 — Vercel-style metric-card tabular numerals
|
| **Source:** `popular-web-designs/templates/vercel.md` (Typography Rules → `tnum` / Caption Tabular; Metric Cards section).
|
| **Micro-improvement:**
| Render dashboard KPI metric numbers with tabular figures (`font-variant-numeric: tabular-nums` or `font-feature-settings: "tnum"`) so columns of numbers don't jitter horizontally when values refresh or animate. Pair with a tight, scale-aware type scale: 32px/600 for the main KPI value, 12px/400 uppercase for the label, and 11px/500 for the delta badge.
|
| **Where to apply:**
| - All KPI cards in the Analytics view (`src/pages/analytics/` or equivalent card components), especially Revenue, Orders, Avg Basket, and any branch-comparison metrics.
| - Add a utility class `.tabular-nums` (or Tailwind `tabular-nums`) to the value `<span>` and any sparkline hover tooltip numbers.
| - Use a monospaced fallback (e.g. `ui-monospace, SFMono-Regular, Geist Mono`) for the value when available, or enable `tnum` on the existing sans stack.
| - Reserve `tnum` for live/refreshed numbers only; static body text should keep proportional spacing for readability.
|
| **Why it matters:**
| Dashboards that update live (the "model-grade" goal for Food-Penguin-Limited) look broken when the same digit width shifts on every poll. Tabular numerals keep the metric card grid visually stable and make branch-vs-branch comparisons easier to scan. It's a tiny CSS addition with a disproportionate "this is polished software" signal.
|
| **Reference snippet:**
| > Vercel: `"tnum" for tabular numerals on specific captions`; Metric Cards use Geist 48px weight 600 with tight tracking.

## 2026-07-25 — Branch-tinted layered card shadows

**Source:** `popular-web-designs/templates/stripe.md` (Shadow Colors: blue-tinted multi-layer shadows) and `popular-web-designs/templates/raycast.md` (macOS-style multi-layer inset/ambient shadows).

**Micro-improvement:**
Replace the flat, generic black `box-shadow` on KPI cards and chart containers with a branch-aware layered shadow. Use two or three stacked shadows: a tight branch-colour tint (`rgba(var(--branch-rgb), 0.20) 0px 4px 12px`), a soft ambient dark shadow (`rgba(0,0,0,0.25) 0px 8px 24px`), and an optional 1px inset white highlight (`rgba(255,255,255,0.05) 0px 1px 0px 0px inset`) on dark cards.

**Where to apply:**
- KPI cards in the Analytics view: add `.kpi-card` class that reads the active branch CSS variable (`--branch-rgb`) and composes the shadow stack.
- Chart panels and the branch-comparison chart wrapper: use the same shadow tokens so elevated surfaces feel cohesive.
- Branch selector pills / tabs: apply the inset highlight only on the selected pill to give it a pressed-glass look.

**Why it matters:**
Generic black shadows feel like Bootstrap; branch-tinted layered shadows make the dashboard feel like a single branded instrument. The tinted layer subtly reinforces which branch is active without adding more colour blocks, and the inset highlight adds the "premium dark UI" depth seen in Raycast. It's a tiny CSS change that lifts the perceived production value of every card.

**Reference snippet:**
> Stripe: "multi-layer, blue-tinted shadows ... the signature `rgba(50,50,93,0.25)` combined with `rgba(0,0,0,0.1)` creates shadows with a cool, almost atmospheric depth"
> Raycast: "multi-layer box-shadows with inset highlights that simulate physical depth, as if cards and buttons are actual pressed or raised glass elements on a dark desk"
|