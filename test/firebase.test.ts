import test from "node:test";
import assert from "node:assert/strict";

class MemoryStorage {
  store = new Map<string, string>();
  getItem(key: string) { return this.store.get(key) ?? null; }
  setItem(key: string, value: string) { this.store.set(key, String(value)); }
  removeItem(key: string) { this.store.delete(key); }
  clear() { this.store.clear(); }
}

const listeners = new Map<string, Set<(event: any) => void>>();
(globalThis as any).localStorage = new MemoryStorage();
(globalThis as any).StorageEvent = class StorageEvent { key?: string; constructor(_type: string, init: any) { this.key = init?.key; } };
(globalThis as any).window = {
  addEventListener(type: string, cb: (event: any) => void) {
    if (!listeners.has(type)) listeners.set(type, new Set());
    listeners.get(type)!.add(cb);
  },
  removeEventListener(type: string, cb: (event: any) => void) {
    listeners.get(type)?.delete(cb);
  },
  dispatchEvent(event: any) {
    listeners.get("storage")?.forEach((cb) => cb(event));
  },
};

const firebase = await import("../src/firebase");

function signIn() {
  localStorage.setItem("localCurrentUser", JSON.stringify({ username: "Tester", role: "Admin", email: "tester@example.com" }));
}

function validOrder(overrides: Record<string, unknown> = {}) {
  return {
    id: "ORD-1",
    timestamp: "2026-07-12T10:00:00Z",
    item: "Tokyo Dragon Roll",
    category: "Sushi Rolls",
    quantity: 2,
    amount: 12.5,
    status: "Completed",
    ...overrides,
  };
}

test.beforeEach(() => localStorage.clear());

test("setDoc rejects writes without a signed-in verified local user", async () => {
  await assert.rejects(
    firebase.setDoc(firebase.doc(firebase.db, "orders", "ORD-1"), validOrder()),
    /PERMISSION_DENIED/,
  );
});

test("setDoc enforces document id consistency and safe collection schemas", async () => {
  signIn();
  await assert.rejects(
    firebase.setDoc(firebase.doc(firebase.db, "orders", "bad id"), validOrder({ id: "bad id" })),
    /PERMISSION_DENIED/,
  );
  await assert.rejects(
    firebase.setDoc(firebase.doc(firebase.db, "orders", "ORD-2"), validOrder({ id: "ORD-2", quantity: 1.5 })),
    /PERMISSION_DENIED/,
  );
  await assert.rejects(
    firebase.setDoc(firebase.doc(firebase.db, "unknown", "DOC-1"), { id: "DOC-1" }),
    /PERMISSION_DENIED/,
  );
});

test("setDoc stores local snapshots and onSnapshot receives updates", async () => {
  signIn();
  const snapshots: unknown[][] = [];
  const unsubscribe = firebase.onSnapshot(firebase.collection(firebase.db, "orders"), (snapshot: any) => {
    const rows: unknown[] = [];
    snapshot.forEach((doc: any) => rows.push(doc.data()));
    snapshots.push(rows);
  });

  await firebase.setDoc(firebase.doc(firebase.db, "orders", "ORD-1"), validOrder());
  assert.equal(JSON.parse(localStorage.getItem("fs_orders") || "[]").length, 1);
  assert.equal(snapshots.length, 2);
  assert.deepEqual((snapshots[1][0] as any).item, "Tokyo Dragon Roll");
  unsubscribe();
});
