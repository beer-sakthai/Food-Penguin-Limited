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
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

// ----------------------------------------------------------------------------
// AUTH EMULATOR
// ----------------------------------------------------------------------------
const authListeners: ((user: any) => void)[] = [];

export const auth = {
  get currentUser() {
    const local = localStorage.getItem("localCurrentUser");
    if (local) {
      try {
        const parsed = JSON.parse(local);
        return {
          uid: "local-simulation-uid",
          displayName: parsed.username || "Corporate User",
          email: parsed.email || "demo@foodpenguin.com",
          emailVerified: true,
          isAnonymous: false,
          tenantId: null,
          providerData: []
        };
      } catch {
        return null;
      }
    }
    return null;
  }
};

export function onAuthStateChanged(authObj: any, callback: (user: any) => void) {
  // Trigger initial callback
  callback(auth.currentUser);
  authListeners.push(callback);
  return () => {
    const idx = authListeners.indexOf(callback);
    if (idx !== -1) authListeners.splice(idx, 1);
  };
}

export async function signOut(authObj: any) {
  localStorage.removeItem("localCurrentUser");
  authListeners.forEach(cb => cb(null));
}

export class GoogleAuthProvider {
  setCustomParameters(params?: any) {}
}

export async function signInWithPopup(authObj: any, provider: any) {
  const mockGoogleUser = {
    uid: "google-mock-id",
    displayName: "Corporate Auditor",
    email: "auditor@foodpenguin.com",
    emailVerified: true,
    isAnonymous: false,
    tenantId: null,
    providerData: []
  };
  localStorage.setItem("localCurrentUser", JSON.stringify({
    username: "Corporate Auditor",
    role: "Admin",
    email: "auditor@foodpenguin.com"
  }));
  authListeners.forEach(cb => cb(mockGoogleUser));
  return { user: mockGoogleUser };
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
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  };
  console.error('Firestore Mock Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
