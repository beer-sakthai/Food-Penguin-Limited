// ============================================================================
// LOCAL STORAGE FLUID REPLICA OF DATABASE (OFFLINE RESILIENT EMULATOR)
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
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

// ----------------------------------------------------------------------------
// DATABASE EMULATOR
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

export function onSnapshot(collectionRef: any, onNext: (snapshot: any) => void, onError?: (err: any) => void) {
  const colName = collectionRef.path;
  const update = () => {
    const localData = localStorage.getItem(`fs_${colName}`);
    const items = localData ? JSON.parse(localData) : [];
    onNext({
      empty: items.length === 0,
      forEach: (cb: (doc: any) => void) => {
        items.forEach((item: any) => {
          cb({ data: () => item });
        });
      }
    });
  };

  // Run initially
  update();

  const handler = (e: StorageEvent) => {
    if (e.key === `fs_${colName}`) {
      update();
    }
  };
  window.addEventListener('storage', handler);

  return () => {
    window.removeEventListener('storage', handler);
  };
}

export async function setDoc(docRef: any, data: any) {
  const colName = docRef.colPath;
  const docId = docRef.docId;
  const localData = localStorage.getItem(`fs_${colName}`);
  let items = localData ? JSON.parse(localData) : [];
  
  const idx = items.findIndex((i: any) => i.id === docId);
  if (idx !== -1) {
    items[idx] = { ...items[idx], ...data };
  } else {
    items.push({ id: docId, ...data });
  }
  
  localStorage.setItem(`fs_${colName}`, JSON.stringify(items));
  window.dispatchEvent(new StorageEvent('storage', { key: `fs_${colName}` }));
}

export async function updateDoc(docRef: any, data: any) {
  return setDoc(docRef, data);
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  let userId: string | undefined = undefined;
  let email: string | undefined = undefined;
  
  try {
    const local = localStorage.getItem("localCurrentUser");
    if (local) {
      const parsed = JSON.parse(local);
      userId = "local-simulation-uid";
      email = parsed.email || "demo@foodpenguin.com";
    }
  } catch (_) {}

  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId,
      email,
    },
    operationType,
    path
  };
  console.error('Database Mock Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
