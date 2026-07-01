# BRIEFING — 2026-07-01T20:13:12+01:00

## Mission
Orchestrate the implementation of the Menu Engineering tab on the Food Penguin Limited dashboard.

## 🔒 My Identity
- Archetype: teamwork_preview_orchestrator
- Roles: orchestrator, user_liaison, human_reporter, successor
- Working directory: c:\Users\beern\Food-Penguin-Limited\.agents\orchestrator
- Original parent: parent
- Original parent conversation ID: d3743b79-18a5-41e0-abea-65f11d23d38e

## 🔒 My Workflow
- **Pattern**: Project
- **Scope document**: c:\Users\beern\Food-Penguin-Limited\PROJECT.md
1. **Decompose**: Decompose the task into milestones.
2. **Dispatch & Execute**:
   - **Delegate (sub-orchestrator)**: When an item is too large, spawn a sub-orchestrator for it.
3. **On failure** (in this order):
   - Retry: nudge stuck agent or re-send task
   - Replace: spawn fresh agent with partial progress
   - Skip: proceed without (only if non-critical)
   - Redistribute: split stuck agent's remaining work
   - Redesign: re-partition decomposition
   - Escalate: report to parent (sub-orchestrators only, last resort)
4. **Succession**: Self-succeed at 16 spawns, write handoff.md, spawn successor.
- **Work items**:
  1. Explore current codebase and plan [pending]
  2. Implement Menu Cost Data Model [pending]
  3. Implement Menu Engineering Tab UI [pending]
  4. Implement AI Price Optimization [pending]
  5. E2E Verification [pending]
- **Current phase**: 1
- **Current focus**: Explore current codebase and plan

## 🔒 Key Constraints
- Use gemini-1.5-flash for AI features, manually triggered only (no background loops or auto-polling).
- Apply unified "gold liner" styling (focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500) and custom gold shadow glow, micro-animations on interactive elements.
- Validate changes via `npm run lint` and `npm run build`.
- Never reuse a subagent after it has delivered its handoff — always spawn fresh.
- Never write, modify, or create source code files directly.
- Never run build/test commands yourself — require workers to do so.

## Current Parent
- Conversation ID: d3743b79-18a5-41e0-abea-65f11d23d38e
- Updated: not yet

## Key Decisions Made
- Initializing planning and briefing.

## Team Roster
| Agent | Type | Work Item | Status | Conv ID |
|-------|------|-----------|--------|---------|
| cc25e1a2-5100-41ac-b03b-fe6086fe838e | teamwork_preview_explorer | Explore codebase and plan | completed | cc25e1a2-5100-41ac-b03b-fe6086fe838e |
| bbfc5f48-ed24-4110-a7e4-614a7b3e66dd | teamwork_preview_worker | Implement data types and seed data | completed | bbfc5f48-ed24-4110-a7e4-614a7b3e66dd |
| cf9ca26e-42e7-4ce6-875e-10a926468a87 | teamwork_preview_explorer | Query and download Stitch screens | completed | cf9ca26e-42e7-4ce6-875e-10a926468a87 |
| 47f60f65-aaab-4edd-afbb-4e8d969f0bb8 | teamwork_preview_worker | Implement Menu Engineering UI/Backend | completed | 47f60f65-aaab-4edd-afbb-4e8d969f0bb8 |
| ef808931-e987-4327-8ced-61efd200d763 | teamwork_preview_worker | Verify build and lint checks | completed | ef808931-e987-4327-8ced-61efd200d763 |
| f3992089-096f-42db-9328-7a26c6c1fc59 | teamwork_preview_worker | Execute lint and build commands | completed | f3992089-096f-42db-9328-7a26c6c1fc59 |
| f314bb10-9ab4-457e-8e5f-0c71ec50b1c9 | teamwork_preview_worker | Run build and lint verification | completed | f314bb10-9ab4-457e-8e5f-0c71ec50b1c9 |

## Succession Status
- Succession required: no
- Spawn count: 7 / 16
- Pending subagents: none
- Predecessor: none
- Successor: not yet spawned

## Active Timers
- Heartbeat cron: none (killed on completion)
- Safety timer: none
- On succession: kill all timers before spawning successor
- On context truncation: run `manage_task(Action="list")` — re-create if missing

## Artifact Index
- c:\Users\beern\Food-Penguin-Limited\.agents\orchestrator\ORIGINAL_REQUEST.md — Verbatim user request record
- c:\Users\beern\Food-Penguin-Limited\.agents\orchestrator\progress.md — Liveness heartbeat and detailed checklist
- c:\Users\beern\Food-Penguin-Limited\.agents\orchestrator\plan.md — Architecture, design, and steps
- c:\Users\beern\Food-Penguin-Limited\.agents\orchestrator\context.md — Context tracking
