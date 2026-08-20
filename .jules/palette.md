## 2026-08-03 - Immediate visual feedback for quick action buttons

**Learning:** When user actions in data-dense dashboards trigger background state changes (like adding a product to an active order in Sell tab), lack of immediate inline feedback makes users double-click or feel uncertain if the action registered.
**Action:** Always complement state callbacks with temporary inline success indicators (e.g. 1.5s "Added ✓" state with checkmark icon and ARIA labels) on action buttons to confirm success instantly without requiring page scrolls.
