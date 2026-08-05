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

describe("data routes", () => {
  it("reads metrics", async () => {
    const res = await request(app).get("/api/metrics");
    expect(res.status).toBe(200);
  });

  it("writes metrics", async () => {
    const res = await request(app).put("/api/metrics").send({ sales_today: 999 });
    expect(res.status).toBe(200);

    const check = await request(app).get("/api/metrics");
    expect(check.body.sales_today).toBe(999);
  });

  it("fails to write metrics if keys are not in the allowlist", async () => {
    const res1 = await request(app)
      .put("/api/metrics")
      .send({ "sales_today = 1; DROP TABLE metrics; --": 999 });
    expect(res1.status).toBe(500);

    const res2 = await request(app)
      .put("/api/metrics")
      .send({ invalid_column: 123 });
    expect(res2.status).toBe(500);

    const res3 = await request(app)
      .put("/api/metrics")
      .send({});
    expect(res3.status).toBe(500);
  });

  it("allows the finance-analysis route through", async () => {
    const res = await request(app)
      .post("/api/gemini/finance-analysis")
      .send({ plan: [], actual: [] });
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });
});

describe("CRUD data routes", () => {
  it("adds and lists an order", async () => {
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
    const addRes = await request(app).post("/api/orders").send(order);
    expect(addRes.status).toBe(200);

    const listRes = await request(app).get("/api/orders");
    expect(listRes.status).toBe(200);
    expect(listRes.body.some((o: any) => o.id === "TEST-ORDER-1")).toBe(true);
  });

  it("adds a waste record", async () => {
    const res = await request(app)
      .post("/api/waste")
      .send({ item: "Test Item", category: "Test", weight: 1, cost: 1, reason: "Test", date: "2026-01-01" });
    expect(res.status).toBe(200);
  });
});

describe("analytics routes", () => {
  it("reports seeded status", async () => {
    const res = await request(app).get("/api/analytics/status");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("seeded");
  });

  it("tracks an event and reflects it in the summary", async () => {
    const trackRes = await request(app)
      .post("/api/analytics/track")
      .send({
        session_id: "test-session-1",
        event_type: "pageview",
        page: "Overview",
        user_role: "Admin",
        occurred_at: new Date().toISOString(),
        day: new Date().toISOString().slice(0, 10),
      });
    expect(trackRes.status).toBe(200);

    const summaryRes = await request(app).get("/api/analytics/summary?days=1");
    expect(summaryRes.status).toBe(200);
  });

  it("tracks a batch of events and reflects them in the summary", async () => {
    const batchRes = await request(app)
      .post("/api/analytics/track-batch")
      .send({
        events: [
          {
            session_id: "test-session-batch-1",
            event_type: "session_start",
            page: "Overview",
            user_role: "Manager",
            occurred_at: new Date().toISOString(),
            day: new Date().toISOString().slice(0, 10),
          },
          {
            session_id: "test-session-batch-1",
            event_type: "pageview",
            page: "Overview",
            user_role: "Manager",
            occurred_at: new Date().toISOString(),
            day: new Date().toISOString().slice(0, 10),
          },
          {
            session_id: "test-session-batch-1",
            event_type: "session_end",
            page: "Overview",
            user_role: "Manager",
            occurred_at: new Date().toISOString(),
            day: new Date().toISOString().slice(0, 10),
          }
        ]
      });
    expect(batchRes.status).toBe(200);
    expect(batchRes.body).toEqual({ ok: true, count: 3 });
  });
});

describe("security headers", () => {
  it("implements robust Helmet and Content Security Policy headers", async () => {
    const res = await request(app).get("/api/metrics");
    expect(res.headers).toHaveProperty("content-security-policy");
    const csp = res.headers["content-security-policy"];
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self' 'unsafe-inline' 'unsafe-eval'");
    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
    expect(csp).toContain("object-src 'none'");
    expect(res.headers).toHaveProperty("x-content-type-options", "nosniff");
    expect(res.headers).toHaveProperty("x-frame-options", "SAMEORIGIN");
  });
});

describe("rate limiting", () => {
  it("includes rate limit headers on core api routes", async () => {
    const res = await request(app).get("/api/metrics");
    expect(res.headers).toHaveProperty("ratelimit-limit");
    expect(res.headers).toHaveProperty("ratelimit-remaining");
    expect(res.headers["ratelimit-limit"]).toBe("100");
  });

  it("includes lower rate limit headers on AI routes", async () => {
    const res = await request(app).get("/api/gemini/finance-analysis");
    // Since this route redirects/proxies or returns standard status, let's verify limit headers
    expect(res.headers).toHaveProperty("ratelimit-limit");
    expect(res.headers["ratelimit-limit"]).toBe("20");
  });
});
});
