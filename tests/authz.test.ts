import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { test } from "node:test";
import { requireRole } from "../server";

process.env.AUTH_TOKEN_SECRET = "test-auth-secret";

function token(role: "User" | "Staff" | "Manager" | "Admin") {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ sub: `${role.toLowerCase()}-1`, role })).toString("base64url");
  const signature = createHmac("sha256", process.env.AUTH_TOKEN_SECRET!).update(`${header}.${payload}`).digest("base64url");
  return `${header}.${payload}.${signature}`;
}

function runMiddleware(minimumRole: "User" | "Staff" | "Manager" | "Admin", authorization?: string) {
  let statusCode = 200;
  let body: unknown;
  let nextCalled = false;
  const req = { header: (name: string) => (name.toLowerCase() === "authorization" ? authorization : undefined) } as any;
  const res = {
    locals: {},
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(payload: unknown) {
      body = payload;
      return this;
    },
  } as any;

  requireRole(minimumRole)(req, res, () => {
    nextCalled = true;
  });

  return { statusCode, body, nextCalled, user: res.locals.user };
}

test("unauthenticated users are rejected", () => {
  const result = runMiddleware("User");
  assert.equal(result.statusCode, 401);
  assert.equal(result.nextCalled, false);
});

test("staff can access staff-protected routes", () => {
  const result = runMiddleware("Staff", `Bearer ${token("Staff")}`);
  assert.equal(result.statusCode, 200);
  assert.equal(result.nextCalled, true);
  assert.equal(result.user.role, "Staff");
});

test("manager can access manager-protected routes", () => {
  const result = runMiddleware("Manager", `Bearer ${token("Manager")}`);
  assert.equal(result.statusCode, 200);
  assert.equal(result.nextCalled, true);
  assert.equal(result.user.role, "Manager");
});

test("admin-only actions reject manager tokens and accept admin tokens", () => {
  const manager = runMiddleware("Admin", `Bearer ${token("Manager")}`);
  assert.equal(manager.statusCode, 403);
  assert.equal(manager.nextCalled, false);

  const admin = runMiddleware("Admin", `Bearer ${token("Admin")}`);
  assert.equal(admin.statusCode, 200);
  assert.equal(admin.nextCalled, true);
  assert.equal(admin.user.role, "Admin");
});
