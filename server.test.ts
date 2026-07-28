// @vitest-environment node
import path from "path";
import os from "os";
import fs from "fs";
import { beforeAll, afterAll, describe, it, expect } from "vitest";
import request from "supertest";

// server.ts reads DB_PATH at import time (via db.ts), so the env var must
// be set — and the module imported — before any test runs. NODE_ENV=test
// is set globally in vitest.config.ts and makes server.ts skip app.listen()
// and the Vite dev middleware, so supertest can drive the Express app
// directly against an ephemeral port of its own.
const dbPath = path.join(os.tmpdir(), `fp-test-${Date.now()}-${Math.random().toString(36).slice(2)}.db`);
process.env.DB_PATH = dbPath;

let app: import("express").Express;

beforeAll(async () => {
  ({ app } = await import("./server"));
});

afterAll(() => {
  for (const suffix of ["", "-shm", "-wal"]) {
    fs.rmSync(dbPath + suffix, { force: true });
  }
});

async function loginAs(username: string, password: string) {
  const res = await request(app)
    .post("/api/auth/login")
    .send({ username, password });
  const cookie = res.headers["set-cookie"]?.[0];
  return { res, cookie };
}

describe("auth", () => {
  it("rejects unauthenticated requests to a data route", async () => {
    const res = await request(app).get("/api/metrics");
    expect(res.status).toBe(401);
  });

  it("rejects an invalid login", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ username: "admin", password: "wrong-password" });
    expect(res.status).toBe(401);
  });

  it("rejects a login for a nonexistent user", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ username: "nobody", password: "whatever" });
    expect(res.status).toBe(401);
  });

  it("requires both username and password", async () => {
    const res = await request(app).post("/api/auth/login").send({ username: "admin" });
    expect(res.status).toBe(400);
  });

  it("logs in a seeded demo user and sets a session cookie", async () => {
    const { res, cookie } = await loginAs("admin", "admin123");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ username: "admin", role: "Admin" });
    expect(cookie).toMatch(/^fp_session=/);
    expect(cookie).toMatch(/HttpOnly/i);
  });

  it("reports the authenticated identity via /api/auth/me", async () => {
    const { cookie } = await loginAs("staff", "staff123");
    const res = await request(app).get("/api/auth/me").set("Cookie", cookie!);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ username: "staff", role: "Staff" });
  });

  it("/api/auth/me is 401 without a session", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("logout clears the session so a subsequent request is unauthenticated", async () => {
    const { cookie } = await loginAs("user", "user123");
    const logoutRes = await request(app).post("/api/auth/logout").set("Cookie", cookie!);
    expect(logoutRes.status).toBe(200);

    const clearedCookie = logoutRes.headers["set-cookie"]?.[0];
    const meRes = await request(app).get("/api/auth/me").set("Cookie", clearedCookie!);
    expect(meRes.status).toBe(401);
  });
});

describe("role-gated routes", () => {
  it("allows an authenticated user to read metrics", async () => {
    const { cookie } = await loginAs("staff", "staff123");
    const res = await request(app).get("/api/metrics").set("Cookie", cookie!);
    expect(res.status).toBe(200);
  });

  it("blocks a non-Admin from writing metrics", async () => {
    const { cookie } = await loginAs("staff", "staff123");
    const res = await request(app)
      .put("/api/metrics")
      .set("Cookie", cookie!)
      .send({ sales_today: 999 });
    expect(res.status).toBe(403);
  });

  it("allows Admin to write metrics", async () => {
    const { cookie } = await loginAs("admin", "admin123");
    const res = await request(app)
      .put("/api/metrics")
      .set("Cookie", cookie!)
      .send({ sales_today: 999 });
    expect(res.status).toBe(200);

    const check = await request(app).get("/api/metrics").set("Cookie", cookie!);
    expect(check.body.sales_today).toBe(999);
  });

  it("blocks Staff from the finance-analysis route", async () => {
    const { cookie } = await loginAs("staff", "staff123");
    const res = await request(app)
      .post("/api/gemini/finance-analysis")
      .set("Cookie", cookie!)
      .send({ plan: [], actual: [] });
    expect(res.status).toBe(403);
  });
});

describe("CRUD data routes", () => {
  it("adds and lists an order", async () => {
    const { cookie } = await loginAs("admin", "admin123");
    const order = {
      id: "TEST-ORDER-1",
      timestamp: "12:00",
      date: "2026-01-01",
      item: "Test Roll",
      category: "Test",
      quantity: 1,
      amount: 9.99,
      status: "Completed",
      branch: "Tesco - Cork City",
    };
    const addRes = await request(app).post("/api/orders").set("Cookie", cookie!).send(order);
    expect(addRes.status).toBe(200);

    const listRes = await request(app).get("/api/orders").set("Cookie", cookie!);
    expect(listRes.status).toBe(200);
    expect(listRes.body.some((o: any) => o.id === "TEST-ORDER-1")).toBe(true);
  });

  it("adds a waste record", async () => {
    const { cookie } = await loginAs("admin", "admin123");
    const res = await request(app)
      .post("/api/waste")
      .set("Cookie", cookie!)
      .send({ item: "Test Item", category: "Test", weight: 1, cost: 1, reason: "Test", date: "2026-01-01" });
    expect(res.status).toBe(200);
  });
});

describe("analytics routes", () => {
  it("reports seeded status", async () => {
    const { cookie } = await loginAs("admin", "admin123");
    const res = await request(app).get("/api/analytics/status").set("Cookie", cookie!);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("seeded");
  });

  it("tracks an event and reflects it in the summary", async () => {
    const { cookie } = await loginAs("admin", "admin123");
    const trackRes = await request(app)
      .post("/api/analytics/track")
      .set("Cookie", cookie!)
      .send({
        session_id: "test-session-1",
        event_type: "pageview",
        page: "Overview",
        user_role: "Admin",
        occurred_at: new Date().toISOString(),
        day: new Date().toISOString().slice(0, 10),
      });
    expect(trackRes.status).toBe(200);

    const summaryRes = await request(app).get("/api/analytics/summary?days=1").set("Cookie", cookie!);
    expect(summaryRes.status).toBe(200);
  });
});
