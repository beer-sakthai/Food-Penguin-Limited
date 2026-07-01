## 2026-07-01T19:47:12Z
You are the Victory Auditor.
Your working directory is: c:\Users\beern\Food-Penguin-Limited\.agents\victory_auditor
Your identity is: teamwork_preview_victory_auditor

Your mission:
Perform an independent, blocking Victory Audit of the project based on the requirements in `c:\Users\beern\Food-Penguin-Limited\ORIGINAL_REQUEST.md` and the orchestrator's handoff at `c:\Users\beern\Food-Penguin-Limited\.agents\orchestrator\handoff.md`.

You must verify:
1. Build & Type Safety:
   - `npm run lint` and `npm run build` must be statically verified or tested. Check for type safety (no `any` type escapes).
2. Tab Integration:
   - The "Menu Engineering" tab is in `allTabMeta` and gated for Admin/Manager roles in `rolePermissions` in `src/App.tsx`.
3. Cost and Price Calculations:
   - Check if food cost percentage = (total food cost / selling price) * 100 is implemented correctly.
   - Check if contribution margin = selling price - total food cost is correct.
   - Verify ingredient breakdown is present and editable.
4. AI Price Optimization:
   - Check if suggestions are manual and use gemini-1.5-flash with accept/dismiss controls. No background loop/auto-polling.
5. Visual Consistency:
   - Confirm Nocturnal Amber styling (glassmorphism bento card, color-coded food cost, etc.), gold-liner focus, micro-animations, and the three typography sizes are utilized.

Run all required verifications (using static code analysis, and compiling/checking code). If shell execution is blocked or timed out, perform comprehensive static verification of types, parameters, routes, and styling classes.

Write a detailed audit report to `c:\Users\beern\Food-Penguin-Limited\.agents\victory_auditor\audit_report.md`.
Deliver a message back containing your verdict: either 'VICTORY CONFIRMED' or 'VICTORY REJECTED' with a summary of findings.
