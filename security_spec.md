# Food Penguin Limited - Firestore Security Specification

This specification documents the data invariants, hostile attack payloads (the "Dirty Dozen"), and validation criteria to secure our Cloud Firestore database.

## 1. Data Invariants

- **Authentication & Identity**: Every transaction or modification must be initiated by an authenticated member. No anonymous or public writes are allowed.
- **Strict Verification**: Any state modification (create, update, delete) requires the user's email to be verified (`email_verified == true`).
- **Id Integrity**: Collection document IDs must match alphanumeric and safe hyphens/underscores regex.
- **Value Limits**: Numbers representing quantities, amounts, weight, cost, and hours scheduled must be positive.
- **Schema Completeness**: Documents must contain required properties and conform to structural type checks.

---

## 2. The "Dirty Dozen" Hostile Payloads

Below are twelve malicious payloads representing different attack vectors (e.g., privilege escalation, injection, format tampering, size overflow).

### 1. SalesOrder - Out-of-bounds Amount (Denial of Wallet)
- **Target Collection**: `/orders/FP-9999`
- **Violation**: Negative transaction value.
- **Payload**:
  ```json
  {
    "id": "FP-9999",
    "item": "Premium Sushi Platter",
    "quantity": 1,
    "amount": -15000.00,
    "branch": "Marks & Spencer - Cork City"
  }
  ```

### 2. SalesOrder - Shadow Ghost Field Injection
- **Target Collection**: `/orders/FP-9999`
- **Violation**: Attempting to inject extra properties not allowed by the schema.
- **Payload**:
  ```json
  {
    "id": "FP-9999",
    "item": "Premium Sushi Platter",
    "quantity": 1,
    "amount": 45.00,
    "branch": "Marks & Spencer - Cork City",
    "ghost_admin_override": true
  }
  ```

### 3. SalesOrder - ID Poisoning with massive junk string
- **Target Collection**: `/orders/VERY_LONG_STRING_THAT_EXCEEDS_128_CHARACTERS_FOR_DENIAL_OF_WALLET_ATTACK_AND_STORAGE_EXHAUSTION_STUFF_STUFF_STUFF_STUFF_STUFF_STUFF_STUFF`
- **Violation**: Massive ID to exploit index/path storage.
- **Payload**: Conforms to standard fields, but path variable check catches it.

### 4. ProductionTask - Invalid Status Type
- **Target Collection**: `/tasks/PT-999`
- **Violation**: Non-string status or invalid quantity.
- **Payload**:
  ```json
  {
    "id": "PT-999",
    "itemName": "Tokyo Dragon Roll",
    "status": true,
    "quantity": "five"
  }
  ```

### 5. ProductionTask - Incomplete Required Keys
- **Target Collection**: `/tasks/PT-999`
- **Violation**: Omitting required status field.
- **Payload**:
  ```json
  {
    "id": "PT-999",
    "itemName": "Tokyo Dragon Roll",
    "quantity": 5
  }
  ```

### 6. WasteRecord - Impossible Negative Cost
- **Target Collection**: `/waste/W-999`
- **Violation**: Negative weight and cost.
- **Payload**:
  ```json
  {
    "id": "W-999",
    "item": "Spoiled Tuna",
    "weight": -5.0,
    "cost": -120.00,
    "reason": "Spoiled"
  }
  ```

### 7. WasteRecord - Oversized Reason Field
- **Target Collection**: `/waste/W-999`
- **Violation**: `reason` exceeds length limits.
- **Payload**:
  ```json
  {
    "id": "W-999",
    "item": "Spoiled Tuna",
    "weight": 2.5,
    "cost": 50.00,
    "reason": "A very long text that repeats itself over and over to cause memory inflation and bypass simple storage expectations on standard logging pages so that we can verify rules block this. Lorem ipsum dolor sit amet, consectetur adipiscing elit..."
  }
  ```

### 8. CompanyTarget - Missing Category
- **Target Collection**: `/targets/T-999`
- **Violation**: Required category is missing.
- **Payload**:
  ```json
  {
    "id": "T-999",
    "name": "Revenue Target",
    "targetValue": 10000,
    "currentValue": 5000
  }
  ```

### 9. CompanyTarget - Target and Current Value Misformat
- **Target Collection**: `/targets/T-999`
- **Violation**: Values are array instead of number.
- **Payload**:
  ```json
  {
    "id": "T-999",
    "name": "Revenue Target",
    "targetValue": [10000],
    "currentValue": [5000],
    "category": "Sell"
  }
  ```

### 10. EmployeeHour - Scheduled Hours Overflow
- **Target Collection**: `/hours/E-999`
- **Violation**: Negative scheduled hours.
- **Payload**:
  ```json
  {
    "id": "E-999",
    "name": "Malicious Actor",
    "role": "Prep",
    "scheduledHours": -40
  }
  ```

### 11. InventoryItem - Negative Quantity
- **Target Collection**: `/inventory/I-999`
- **Violation**: Negative stock count.
- **Payload**:
  ```json
  {
    "id": "I-999",
    "name": "Avocado",
    "currentQty": -10,
    "reorderLevel": 50
  }
  ```

### 12. Unmapped Collection Spoofing
- **Target Collection**: `/malicious_admin_backdoor/1`
- **Violation**: Writing to unauthorized path.
- **Payload**: Any payload.

---

## 3. Test Assertion Outcomes

Our Firestore Security Rules are fully structured to guarantee that all of the above payloads return `PERMISSION_DENIED` automatically due to:
- strict `.keys()` matching
- strict type check helpers
- value boundaries (e.g. `>= 0`)
- ID size and string format restrictions
