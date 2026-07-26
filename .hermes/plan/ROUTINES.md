# Food Penguin Limited — Autonomous Routines

## Overview

Three hourly Routines run autonomously to maintain dashboard health, detect UI drift, and capture design insights. Each fires on a fresh session and reports only actionable findings.

---

## 1. ui-watchdog-1h

**Trigger ID:** `trig_013UXDCuKZ3hMDwFANLcjGGT`  
**Schedule:** Every hour at minute 13 (UTC)  
**Session:** Fresh session per firing  
**Notifications:** Disabled (silent)

### Purpose
Health check for the FPL dashboard build and lint status.

### Responsibilities
1. Run `npm run lint` and verify no errors
2. Run `npm run build` and verify it succeeds
3. If either fails, diagnose the issue and attempt auto-fix
4. Document any fixes clearly
5. If all checks pass, exit silently (no message)

### Success Criteria
- Dashboard builds without errors
- Lint passes without warnings
- Any auto-fixes are committed with clear messages

---

## 2. design-refresh-1h

**Trigger ID:** `trig_019ydbWyYagwgg1HKbTBCSrs`  
**Schedule:** Every hour at minute 13 (UTC)  
**Session:** Fresh session per firing  
**Notifications:** Disabled (silent)

### Purpose
Detect UI drift and style inconsistencies in the codebase.

### Responsibilities
1. **Unused CSS** — Find class names in `src/index.css` never used in .tsx components
2. **Missing branch colors** — Verify Cork, Mahon, M&S colors consistent across `business.ts` BRANCH_META and `index.css`
3. **Hard-coded hex values** — Find literal hex colors in .tsx files that should use CSS variables (e.g., `#6366f1` → `var(--violet)`)
4. **Invalid Tailwind classes** — Detect non-existent Tailwind classes (e.g., `*-550/20`)

### Deliverable
For each finding, either:
- Create a micro-fix commit (if trivial: 1-2 lines)
- Append a bullet to `UI_IMPROVEMENTS.md` with issue, files, suggested fix

Exit silently if no findings.

---

## 3. ux-research-1h

**Trigger ID:** `trig_01CZgV3hWB6TAetUwbMFRkBa`  
**Schedule:** Every hour at minute 14 (UTC)  
**Session:** Fresh session per firing  
**Notifications:** Disabled (silent)

### Purpose
Extract design insights from professional dashboard references and capture actionable micro-improvements.

### Responsibilities
1. Pick one random reference from `popular-web-designs/templates/`
2. Extract one concrete micro-improvement applicable to FPL
3. Identify where it applies in the codebase
4. Explain why it matters
5. Append as a new dated entry to `LEARNING_JOURNAL.md`

### Entry Format
Match existing entries in `LEARNING_JOURNAL.md`:
- **Source:** Template name + principle
- **Micro-improvement:** Specific pattern to apply
- **Where to apply:** File paths + code locations
- **Why it matters:** Business/UX rationale
- **Reference snippet:** Quote from source

Exit silently if all reference snippets already captured.

---

## Implementation Notes

- All three Routines fire on fresh sessions with no external connectors
- Notifications disabled to keep dashboard clean (only actionable findings surface)
- Each Routine has staggered start times (minute 13, 13, 14) to avoid simultaneous firing
- Auto-fixes are committed directly; discoveries are logged to markdown files
- Intentionally silent unless meaningful action is taken

---

## Monitoring

Check routine status via Claude Code:
```bash
/routines list
```

To view a specific Routine's runs:
```bash
/routines status trig_013UXDCuKZ3hMDwFANLcjGGT
```

---

*Priority 5 implementation complete · 2026-07-26*
