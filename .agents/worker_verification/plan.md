# Verification Plan

This plan details the steps to verify that the project builds and type-checks successfully after the Menu Engineering changes.

## Steps

1. **Static Analysis Check**:
   - Manually audit key files modified during Menu Engineering (`src/App.tsx`, `src/components/MenuEngineeringTab.tsx`, `server.ts`, etc.) to ensure import paths, types, and variables are correct and follow the styles defined in `AGENTS.md`.

2. **TypeScript Compilation Check (Lint)**:
   - Run `npm run lint` to execute `tsc --noEmit`.
   - Record the exact output, including any compilation errors or warnings.

3. **Production Build Check (Build)**:
   - Run `npm run build` to compile the Vite frontend and bundle `server.ts`.
   - Record the output and verify that it compiles without errors.

4. **Results Compilation**:
   - Save the exact command outputs to `verification_results.md`.
   - Update `BRIEFING.md` and `progress.md` with the final status.
   - Message the results back to the parent orchestrator.
