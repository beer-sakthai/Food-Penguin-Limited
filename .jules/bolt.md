## 2026-06-21 - Isolate clock re-renders
**Learning:** Having a high-frequency state (like a clock) at the root level triggers full-tree re-renders in React, which is extremely expensive for complex dashboards.
**Action:** Always move high-frequency updates to leaf components and use memoization for large sibling components.
