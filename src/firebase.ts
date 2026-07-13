// ============================================================================
// LOCAL STORAGE FLUID REPLICA OF FIREBASE (OFFLINE RESILIENT EMULATOR)
// This file completely decouples the application from cloud-hosted Firebase dependencies
// while preserving 100% of its data persistence and tab synchronizations.
// ============================================================================

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
}

// ----------------------------------------------------------------------------
// FIRESTORE EMULATOR
// ----------------------------------------------------------------------------
export const db = {};

export function collection(dbObj: any, path: string) {
  return { path };
}

export function doc(dbObj: any, colPath: string, docId?: string) {
  return { colPath, docId };
}

export async function getDocs(collectionRef: any) {
  const colName = collectionRef.path;
  const localData = localStorage.getItem(`fs_${colName}`);
  if (localData) {
    const items = JSON.parse(localData);
    return {
      empty: items.length === 0,
      forEach: (cb: (doc: any) => void) => {
        items.forEach((item: any) => {
          cb({ data: () => item });
        });
      }
    };
  }
  return {
    empty: true,
    forEach: () => {}
  };
}

const legacySafeDocIdRegex = /^[a-zA-Z0-9-_]+$/;
const prefixedUuidDocIdRegex = /^[a-zA-Z0-9]+-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type SnapshotCallback = (snapshot: any) => void;
type SnapshotSubscriber = () => void;

const snapshotSubscribers = new Map<string, Set<SnapshotSubscriber>>();

function getLocalCollectionSnapshot(colName: string) {
  const localData = localStorage.getItem(`fs_${colName}`);
  const items = localData ? JSON.parse(localData) : [];

  return {
    empty: items.length === 0,
    forEach: (cb: (doc: any) => void) => {
      items.forEach((item: any) => {
        cb({ data: () => item });
      });
    }
  };
}

function notifySnapshotSubscribers(colName: string) {
  snapshotSubscribers.get(colName)?.forEach((subscriber) => subscriber());
}

export function onSnapshot(collectionRef: any, onNext: SnapshotCallback, onError?: (err: any) => void) {
  const colName = collectionRef.path;
  const update = () => {
    try {
      onNext(getLocalCollectionSnapshot(colName));
    } catch (err) {
      if (onError) {
        onError(err);
        return;
      }
      throw err;
    }
  };

  // Run initially
  update();

  if (!snapshotSubscribers.has(colName)) {
    snapshotSubscribers.set(colName, new Set());
  }
  snapshotSubscribers.get(colName)?.add(update);

  const handler = (e: StorageEvent) => {
    if (e.key === `fs_${colName}`) {
      update();
    }
  };
  window.addEventListener('storage', handler);

  return () => {
    window.removeEventListener('storage', handler);
    const collectionSubscribers = snapshotSubscribers.get(colName);
    collectionSubscribers?.delete(update);
    if (collectionSubscribers?.size === 0) {
      snapshotSubscribers.delete(colName);
    }
  };
}

function validateProposedDoc(colName: string, docId: string, proposed: any) {
  // 1. Id Integrity (alphanumeric plus safe hyphens/underscores for prefixed UUIDs, length limit of 128)
  if (typeof docId !== "string" || docId.length === 0 || docId.length > 128) {
    throw new Error("PERMISSION_DENIED");
  }
  if (!legacySafeDocIdRegex.test(docId) && !prefixedUuidDocIdRegex.test(docId)) {
    throw new Error("PERMISSION_DENIED");
  }

  // 2. Proposed document ID consistency check
  if (proposed.id !== undefined && proposed.id !== docId) {
    throw new Error("PERMISSION_DENIED");
  }

  // 3. Unmapped Collection Spoofing (only specific collections allowed)
  const allowedCols = ["orders", "tasks", "waste", "targets", "hours", "inventory"];
  if (!allowedCols.includes(colName)) {
    throw new Error("PERMISSION_DENIED");
  }

  const keys = Object.keys(proposed);

  if (colName === "orders") {
    // Required fields
    const required = ["id", "timestamp", "item", "category", "quantity", "amount", "status"];
    for (const req of required) {
      if (!(req in proposed) || proposed[req] === undefined || proposed[req] === null) {
        throw new Error("PERMISSION_DENIED");
      }
    }
    // Allowed fields (no shadow ghost fields)
    const allowed = ["id", "timestamp", "date", "item", "category", "quantity", "amount", "barcode", "status", "branch"];
    for (const key of keys) {
      if (!allowed.includes(key)) {
        throw new Error("PERMISSION_DENIED");
      }
    }
    // Value limits
    if (typeof proposed.quantity !== "number" || proposed.quantity <= 0 || !Number.isInteger(proposed.quantity)) {
      throw new Error("PERMISSION_DENIED");
    }
    if (typeof proposed.amount !== "number" || proposed.amount < 0) {
      throw new Error("PERMISSION_DENIED");
    }
    // Types & formats
    if (typeof proposed.id !== "string" || typeof proposed.timestamp !== "string" || typeof proposed.item !== "string" || typeof proposed.category !== "string") {
      throw new Error("PERMISSION_DENIED");
    }
    if (proposed.date !== undefined && typeof proposed.date !== "string") {
      throw new Error("PERMISSION_DENIED");
    }
    if (proposed.barcode !== undefined && typeof proposed.barcode !== "string") {
      throw new Error("PERMISSION_DENIED");
    }
    if (proposed.branch !== undefined && typeof proposed.branch !== "string") {
      throw new Error("PERMISSION_DENIED");
    }
    if (!["Completed", "Pending", "Refunded"].includes(proposed.status)) {
      throw new Error("PERMISSION_DENIED");
    }
  } else if (colName === "tasks") {
    // Required fields
    const required = ["id", "itemName", "assignedTo", "status", "quantity", "priority"];
    for (const req of required) {
      if (!(req in proposed) || proposed[req] === undefined || proposed[req] === null) {
        throw new Error("PERMISSION_DENIED");
      }
    }
    // Allowed fields (no shadow ghost fields)
    const allowed = ["id", "itemName", "assignedTo", "status", "quantity", "priority", "date"];
    for (const key of keys) {
      if (!allowed.includes(key)) {
        throw new Error("PERMISSION_DENIED");
      }
    }
    // Value limits & types
    if (typeof proposed.quantity !== "number" || proposed.quantity <= 0 || !Number.isInteger(proposed.quantity)) {
      throw new Error("PERMISSION_DENIED");
    }
    if (typeof proposed.id !== "string" || typeof proposed.itemName !== "string" || typeof proposed.assignedTo !== "string") {
      throw new Error("PERMISSION_DENIED");
    }
    if (!["In Queue", "Cooking", "Prepared", "Out for Delivery"].includes(proposed.status)) {
      throw new Error("PERMISSION_DENIED");
    }
    if (!["low", "medium", "high"].includes(proposed.priority)) {
      throw new Error("PERMISSION_DENIED");
    }
    if (proposed.date !== undefined && typeof proposed.date !== "string") {
      throw new Error("PERMISSION_DENIED");
    }
  } else if (colName === "waste") {
    // Required fields
    const required = ["id", "item", "category", "weight", "cost", "reason", "date"];
    for (const req of required) {
      if (!(req in proposed) || proposed[req] === undefined || proposed[req] === null) {
        throw new Error("PERMISSION_DENIED");
      }
    }
    // Allowed fields (no shadow ghost fields)
    const allowed = ["id", "item", "category", "weight", "cost", "reason", "date"];
    for (const key of keys) {
      if (!allowed.includes(key)) {
        throw new Error("PERMISSION_DENIED");
      }
    }
    // Value limits & types
    if (typeof proposed.weight !== "number" || proposed.weight < 0) {
      throw new Error("PERMISSION_DENIED");
    }
    if (typeof proposed.cost !== "number" || proposed.cost < 0) {
      throw new Error("PERMISSION_DENIED");
    }
    if (typeof proposed.id !== "string" || typeof proposed.item !== "string" || typeof proposed.category !== "string" || typeof proposed.date !== "string") {
      throw new Error("PERMISSION_DENIED");
    }
    if (!["Expired", "Overproduced", "Quality Issue", "Spill/Accident"].includes(proposed.reason)) {
      throw new Error("PERMISSION_DENIED");
    }
    // Length restriction for reason (oversized reason field verification)
    if (proposed.reason.length > 100) {
      throw new Error("PERMISSION_DENIED");
    }
  } else if (colName === "targets") {
    // Required fields
    const required = ["id", "name", "metric", "targetValue", "currentValue", "unit", "category", "deadline"];
    for (const req of required) {
      if (!(req in proposed) || proposed[req] === undefined || proposed[req] === null) {
        throw new Error("PERMISSION_DENIED");
      }
    }
    // Allowed fields (no shadow ghost fields)
    const allowed = ["id", "name", "metric", "targetValue", "currentValue", "unit", "category", "deadline", "date"];
    for (const key of keys) {
      if (!allowed.includes(key)) {
        throw new Error("PERMISSION_DENIED");
      }
    }
    // Value limits & types
    if (typeof proposed.targetValue !== "number" || proposed.targetValue < 0) {
      throw new Error("PERMISSION_DENIED");
    }
    if (typeof proposed.currentValue !== "number" || proposed.currentValue < 0) {
      throw new Error("PERMISSION_DENIED");
    }
    if (typeof proposed.id !== "string" || typeof proposed.name !== "string" || typeof proposed.metric !== "string" || typeof proposed.unit !== "string" || typeof proposed.deadline !== "string") {
      throw new Error("PERMISSION_DENIED");
    }
    if (!["Sell", "Production", "Waste", "Hours"].includes(proposed.category)) {
      throw new Error("PERMISSION_DENIED");
    }
    if (proposed.date !== undefined && typeof proposed.date !== "string") {
      throw new Error("PERMISSION_DENIED");
    }
  } else if (colName === "hours") {
    // Required fields
    const required = ["id", "name", "role", "status", "scheduledHours", "actualHours", "shiftStart", "shiftEnd"];
    for (const req of required) {
      if (!(req in proposed) || proposed[req] === undefined || proposed[req] === null) {
        throw new Error("PERMISSION_DENIED");
      }
    }
    // Allowed fields (no shadow ghost fields)
    const allowed = ["id", "name", "role", "status", "scheduledHours", "actualHours", "shiftStart", "shiftEnd", "date"];
    for (const key of keys) {
      if (!allowed.includes(key)) {
        throw new Error("PERMISSION_DENIED");
      }
    }
    // Value limits & types
    if (typeof proposed.scheduledHours !== "number" || proposed.scheduledHours < 0) {
      throw new Error("PERMISSION_DENIED");
    }
    if (typeof proposed.actualHours !== "number" || proposed.actualHours < 0) {
      throw new Error("PERMISSION_DENIED");
    }
    if (typeof proposed.id !== "string" || typeof proposed.name !== "string" || typeof proposed.role !== "string" || typeof proposed.shiftStart !== "string" || typeof proposed.shiftEnd !== "string") {
      throw new Error("PERMISSION_DENIED");
    }
    if (!["Clocked In", "Clocked Out"].includes(proposed.status)) {
      throw new Error("PERMISSION_DENIED");
    }
    if (proposed.date !== undefined && typeof proposed.date !== "string") {
      throw new Error("PERMISSION_DENIED");
    }
  } else if (colName === "inventory") {
    // Required fields
    const required = ["id", "name", "category", "stockLevel", "currentQty", "unit", "reorderLevel", "status"];
    for (const req of required) {
      if (!(req in proposed) || proposed[req] === undefined || proposed[req] === null) {
        throw new Error("PERMISSION_DENIED");
      }
    }
    // Allowed fields (no shadow ghost fields)
    const allowed = ["id", "name", "category", "stockLevel", "currentQty", "unit", "reorderLevel", "status"];
    for (const key of keys) {
      if (!allowed.includes(key)) {
        throw new Error("PERMISSION_DENIED");
      }
    }
    // Value limits & types
    if (typeof proposed.stockLevel !== "number" || proposed.stockLevel < 0) {
      throw new Error("PERMISSION_DENIED");
    }
    if (typeof proposed.currentQty !== "number" || proposed.currentQty < 0) {
      throw new Error("PERMISSION_DENIED");
    }
    if (typeof proposed.reorderLevel !== "number" || proposed.reorderLevel < 0) {
      throw new Error("PERMISSION_DENIED");
    }
    if (typeof proposed.id !== "string" || typeof proposed.name !== "string" || typeof proposed.category !== "string" || typeof proposed.unit !== "string") {
      throw new Error("PERMISSION_DENIED");
    }
    if (!["Healthy", "Low", "Critical"].includes(proposed.status)) {
      throw new Error("PERMISSION_DENIED");
    }
  }
}

export async function setDoc(docRef: any, data: any) {
  const colName = docRef.colPath;
  const docId = docRef.docId;
  
  try {
    const localData = localStorage.getItem(`fs_${colName}`);
    let items = localData ? JSON.parse(localData) : [];
    
    const idx = items.findIndex((i: any) => i.id === docId);
    const existingDoc = idx !== -1 ? items[idx] : {};
    const proposedDoc = { ...existingDoc, ...data, id: docId };

    // Enforce database security invariants and validations
    validateProposedDoc(colName, docId, proposedDoc);

    if (idx !== -1) {
      items[idx] = proposedDoc;
    } else {
      items.push(proposedDoc);
    }
    
    localStorage.setItem(`fs_${colName}`, JSON.stringify(items));
    notifySnapshotSubscribers(colName);
  } catch (err: any) {
    handleFirestoreError(err, OperationType.WRITE, `${colName}/${docId}`);
  }
}

export async function updateDoc(docRef: any, data: any) {
  return setDoc(docRef, data);
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errStr = error instanceof Error ? error.message : String(error);
  
  // Guard to prevent double-serializing an already JSON-stringified error object
  if (errStr.trim().startsWith('{') && errStr.includes('"error"') && errStr.includes('"operationType"')) {
    throw error;
  }

  const errInfo: FirestoreErrorInfo = {
    error: errStr,
    operationType,
    path
  };
  console.error('Firestore Mock Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
