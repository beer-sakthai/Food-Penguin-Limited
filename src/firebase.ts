// ============================================================================
// LOCAL STORAGE FLUID REPLICA OF DATABASE (OFFLINE RESILIENT EMULATOR)
// This file completely decouples the application from cloud-hosted Firebase dependencies
// while preserving 100% of its data persistence and tab synchronizations.
// ============================================================================

const STORAGE_CRYPTO_VERSION = "v1";
const STORAGE_CRYPTO_PASSPHRASE = "foodpenguin-local-emulator-key";

async function getCryptoKey(): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passphraseKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(STORAGE_CRYPTO_PASSPHRASE),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode("foodpenguin-local-storage-salt"),
      iterations: 100000,
      hash: "SHA-256",
    },
    passphraseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

async function encryptForStorage(plainText: string): Promise<string> {
  const key = await getCryptoKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plainText);
  const cipherBuffer = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);
  const ivBase64 = btoa(String.fromCharCode(...iv));
  const cipherBase64 = btoa(String.fromCharCode(...new Uint8Array(cipherBuffer)));
  return `${STORAGE_CRYPTO_VERSION}:${ivBase64}:${cipherBase64}`;
}

async function decryptFromStorage(payload: string): Promise<string | null> {
  try {
    const [version, ivBase64, cipherBase64] = payload.split(":");
    if (version !== STORAGE_CRYPTO_VERSION || !ivBase64 || !cipherBase64) {
      return null;
    }

    const key = await getCryptoKey();
    const iv = Uint8Array.from(atob(ivBase64), (c) => c.charCodeAt(0));
    const cipherBytes = Uint8Array.from(atob(cipherBase64), (c) => c.charCodeAt(0));
    const plainBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      cipherBytes
    );
    return new TextDecoder().decode(plainBuffer);
  } catch (_) {
    return null;
  }
}

async function loadCollectionItems(colName: string): Promise<any[]> {
  const localData = localStorage.getItem(`fs_${colName}`);
  if (!localData) return [];

  const decrypted = await decryptFromStorage(localData);
  if (decrypted) {
    return JSON.parse(decrypted);
  }

  // Backward compatibility for previously stored plaintext JSON.
  return JSON.parse(localData);
}

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
  const items = await loadCollectionItems(colName);
  return {
    empty: items.length === 0,
    forEach: (cb: (doc: any) => void) => {
      items.forEach((item: any) => {
        cb({ data: () => item });
      });
    }
  };
}

export function onSnapshot(collectionRef: any, onNext: (snapshot: any) => void, onError?: (err: any) => void) {
  const colName = collectionRef.path;
  const update = async () => {
    try {
      const items = await loadCollectionItems(colName);
      onNext({
        empty: items.length === 0,
        forEach: (cb: (doc: any) => void) => {
          items.forEach((item: any) => {
            cb({ data: () => item });
          });
        }
      });
    } catch (err) {
      if (onError) onError(err);
    }
  };

  // Run initially
  void update();

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
  let items = await loadCollectionItems(colName);
  
  const idx = items.findIndex((i: any) => i.id === docId);
  if (idx !== -1) {
    items[idx] = { ...items[idx], ...data };
  } else {
    items.push({ id: docId, ...data });
  }
  
  const encryptedPayload = await encryptForStorage(JSON.stringify(items));
  localStorage.setItem(`fs_${colName}`, encryptedPayload);
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
