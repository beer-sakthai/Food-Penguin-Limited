# Security Audit Report

**Date:** 2026-07-01T21:05:00+01:00  
**Auditor:** Security Auditor Agent  
**Scope:** This report details an application-level security audit of `src/App.tsx` and `server.ts` against the twelve hostile payloads defined in `security_spec.md`. The audit focuses on identifying the presence or absence of application-level input validation, distinct from database-level security rules.

---

## Executive Summary

The application's security posture regarding input validation is mixed. There are strong defenses against ID poisoning, where the application consistently generates and controls document IDs for new records. However, there is a systemic absence of application-level validation for data integrity, such as checking for negative numbers, validating data types, or stripping unknown fields from objects before they are sent to the database.

The application currently relies almost entirely on the backend Firestore security rules to enforce data invariants. While the spec asserts these rules are robust, the lack of a defense-in-depth approach at the application layer (both frontend and backend) exposes a significant risk. Malformed data can be processed by the application logic, potentially leading to unexpected UI behavior, corrupted state, or flawed metric calculations, even if the data is ultimately rejected by Firestore.

**Recommendation:** Implement comprehensive, application-level validation for all data creation and update handlers (`handleAdd*`, `handleUpdate*`) to ensure data integrity before it reaches the persistence layer. This includes type checking, range checking (e.g., for non-negative values), and sanitizing objects to remove extraneous properties.

---

## "Dirty Dozen" Payload Analysis

### 1. SalesOrder - Out-of-bounds Amount

- **Finding:** **DEFENSE ABSENT**
- **Analysis:** The `handleAddOrder` function in `src/App.tsx` directly uses the `amount` from the `newOrder` object to update state without checking if it is a positive number. A negative amount would be processed and used in calculations.

### 2. SalesOrder - Shadow Ghost Field Injection

- **Finding:** **DEFENSE ABSENT**
- **Analysis:** The `handleAddOrder` function uses the object spread syntax (`...newOrder`) when creating a new order. This allows any extra properties, like `ghost_admin_override`, to be included in the final object sent to the database.

  ```typescript
  // src/App.tsx
  const fullOrder = {
    ...newOrder, // Allows injection of arbitrary fields
    id: orderId,
    timestamp: timestampStr,
    branch: selectedBranch,
  };
  ```

### 3. SalesOrder - ID Poisoning with massive junk string

- **Finding:** **DEFENSE PRESENT**
- **Analysis:** The application generates its own `orderId` within the `handleAddOrder` function, ignoring any ID that might be passed in the input object. This effectively prevents ID poisoning for new orders.

  ```typescript
  // src/App.tsx
  const orderId = `FP-${Math.floor(1000 + Math.random() * 9000)}`;
  const fullOrder = {
    ...newOrder,
    id: orderId, // Overwrites any incoming ID
    //...
  };
  ```

### 4. ProductionTask - Invalid Status Type

- **Finding:** **DEFENSE ABSENT**
- **Analysis:** The `handleAddTask` function in `src/App.tsx` does not validate the types of the incoming `newTask` object's properties. A boolean `status` or string `quantity` would be passed through to the state and database.

### 5. ProductionTask - Incomplete Required Keys

- **Finding:** **DEFENSE ABSENT**
- **Analysis:** The `handleAddTask` function does not check for the presence of required fields like `status`. An object missing this key would be processed, potentially causing runtime errors or data corruption.

### 6. WasteRecord - Impossible Negative Cost

- **Finding:** **DEFENSE ABSENT**
- **Analysis:** The `handleAddWaste` function in `src/App.tsx` directly uses `newWaste.cost` and `newWaste.weight` without validating that they are non-negative values.

### 7. WasteRecord - Oversized Reason Field

- **Finding:** **DEFENSE ABSENT**
- **Analysis:** There is no application-level validation in `handleAddWaste` to check the length of the `reason` field. An oversized string would be passed through.

### 8. CompanyTarget - Missing Category

- **Finding:** **DEFENSE ABSENT**
- **Analysis:** The `handleAddTarget` function in `src/App.tsx` does not verify that the `newTarget` object contains all required fields, such as `category`.

### 9. CompanyTarget - Target and Current Value Misformat

- **Finding:** **DEFENSE ABSENT**
- **Analysis:** The `handleAddTarget` function does not perform type checking. If `targetValue` or `currentValue` were passed as arrays instead of numbers, it would likely lead to `NaN` results in calculations and UI rendering issues.

### 10. EmployeeHour - Scheduled Hours Overflow

- **Finding:** **DEFENSE ABSENT**
- **Analysis:** The `handleToggleClockStatus` function in `src/App.tsx` does not validate the `scheduledHours` property. While this specific function doesn't create new employee records, no other part of the application appears to validate this field upon creation.

### 11. InventoryItem - Negative Quantity

- **Finding:** **DEFENSE ABSENT**
- **Analysis:** The `handleOrderRestock` function in `src/App.tsx` resets inventory levels to positive, hardcoded values. However, there is no corresponding handler for creating or updating inventory that validates `currentQty` to prevent it from being set to a negative number through other means.

### 12. Unmapped Collection Spoofing

- **Finding:** **DEFENSE PRESENT**
- **Analysis:** The application's frontend code in `src/App.tsx` and backend code in `server.ts` only contain logic to interact with a predefined set of collections (`orders`, `tasks`, `waste`, etc.) and API endpoints (`/api/gemini/*`). There is no generic, dynamic code that would allow a user to specify an arbitrary collection path like `/malicious_admin_backdoor/1` for a write operation.
