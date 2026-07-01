# Original User Request

## Request — 2026-07-01T21:10:00+01:00

You are the **Security Fixer**. Your mission is to patch the security vulnerabilities identified in the audit report located at `docs/SECURITY_AUDIT_REPORT.md`.

Your working directory is: `c:\Users\beern\Food-Penguin-Limited\.agents\worker_security_fixer`

## Requirements

You must modify the file `c:\Users\beern\Food-Penguin-Limited\src\App.tsx` to implement application-level input validation within the data handler functions (`handleAddOrder`, `handleAddTask`, `handleAddWaste`, `handleAddTarget`, etc.).

Your changes must address all "DEFENSE ABSENT" findings from the audit report by implementing the following:

1. **Range Checking**: Ensure that all numerical inputs representing costs, amounts, weights, or quantities are non-negative. If an invalid value is received, you can either ignore the request or default to a safe value (e.g., 0), but you must not process the negative number.

2. **Type and Schema Checking**: Verify that incoming objects have the required properties and that their types are correct (e.g., `quantity` is a number, `status` is a string from the allowed enum).

3. **Object Sanitization**: To prevent "Shadow Ghost Field Injection," you must replace all uses of the object spread syntax (e.g., `{ ...newOrder }`) in the data handlers. Instead, create a new, clean object by explicitly mapping only the known and expected properties from the incoming data object. This is the most critical part of the fix.

For example, for `handleAddOrder`, instead of:
`const fullOrder = { ...newOrder, id: orderId, ... };`

You should do:
`const fullOrder = { item: newOrder.item, quantity: newOrder.quantity, amount: newOrder.amount, status: newOrder.status, id: orderId, ... };`

After applying all fixes, create a `changes.md` file detailing the modifications made to each handler function.
