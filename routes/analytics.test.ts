// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";
import { analyticsRouter, applyAnalyticsEvent } from "./analytics";
import {
  upsertAnalyticsSession,
  recordAnalyticsEvent,
  endAnalyticsSession,
  getAnalyticsSummary,
  getAnalyticsTimeseries,
  getTopLabels,
  getTopActions,
  getTopErrors,
  getTopPages,
  getTopBranches,
  getRoleBreakdown,
  getFunnel,
  getRecentEvents,
  getAnalyticsSeeded,
} from "../db";

// Mock the db exports
vi.mock("../db", () => {
  return {
    upsertAnalyticsSession: vi.fn(),
    recordAnalyticsEvent: vi.fn(),
    endAnalyticsSession: vi.fn(),
    getAnalyticsSummary: vi.fn(),
    getAnalyticsTimeseries: vi.fn(),
    getTopLabels: vi.fn(),
    getTopActions: vi.fn(),
    getTopErrors: vi.fn(),
    getTopPages: vi.fn(),
    getTopBranches: vi.fn(),
    getRoleBreakdown: vi.fn(),
    getFunnel: vi.fn(),
    getRecentEvents: vi.fn(),
    getAnalyticsSeeded: vi.fn(),
  };
});

// Set up express app with the analytics router
const app = express();
app.use(express.json());
app.use("/api/analytics", analyticsRouter);

describe("analytics routes and helper unit tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("applyAnalyticsEvent unit tests", () => {
    it("handles 'session_start' events by calling upsertAnalyticsSession", () => {
      const body = {
        event_type: "session_start",
        session_id: "session-123",
        user_role: "Manager",
        branch: "Tesco - Cork City",
        occurred_at: "2026-01-01T12:00:00.000Z",
        page: "Overview",
      };

      applyAnalyticsEvent(body);

      expect(upsertAnalyticsSession).toHaveBeenCalledWith({
        session_id: "session-123",
        user_role: "Manager",
        branch: "Tesco - Cork City",
        first_seen_at: "2026-01-01T12:00:00.000Z",
        last_seen_at: "2026-01-01T12:00:00.000Z",
        is_active: 1,
      });
    });

    it("defaults user_role to 'unknown' in 'session_start' if not provided", () => {
      const body = {
        event_type: "session_start",
        session_id: "session-123",
        branch: "Tesco - Cork City",
        occurred_at: "2026-01-01T12:00:00.000Z",
        page: "Overview",
      };

      applyAnalyticsEvent(body);

      expect(upsertAnalyticsSession).toHaveBeenCalledWith({
        session_id: "session-123",
        user_role: "unknown",
        branch: "Tesco - Cork City",
        first_seen_at: "2026-01-01T12:00:00.000Z",
        last_seen_at: "2026-01-01T12:00:00.000Z",
        is_active: 1,
      });
    });

    it("handles 'session_end' events by calling endAnalyticsSession", () => {
      const body = {
        event_type: "session_end",
        session_id: "session-123",
        occurred_at: "2026-01-01T12:05:00.000Z",
        page: "Overview",
      };

      applyAnalyticsEvent(body);

      expect(endAnalyticsSession).toHaveBeenCalledWith("session-123", "2026-01-01T12:05:00.000Z");
    });

    it("handles other events by calling recordAnalyticsEvent", () => {
      const body = {
        event_type: "pageview",
        session_id: "session-123",
        user_role: "Admin",
        branch: "Tesco - Mahon Point",
        occurred_at: "2026-01-01T12:00:00.000Z",
        day: "2026-01-01",
        page: "Production",
        category: "Tab",
        label: "Production Details",
        value: 5,
        props: { tabName: "Kitchen Queue" },
      };

      applyAnalyticsEvent(body);

      expect(recordAnalyticsEvent).toHaveBeenCalledWith({
        session_id: "session-123",
        event_type: "pageview",
        category: "Tab",
        label: "Production Details",
        value: 5,
        props: { tabName: "Kitchen Queue" },
        page: "Production",
        user_role: "Admin",
        branch: "Tesco - Mahon Point",
        occurred_at: "2026-01-01T12:00:00.000Z",
        day: "2026-01-01",
      });
    });

    it("defaults user_role to 'unknown' in generic events if not provided", () => {
      const body = {
        event_type: "click",
        session_id: "session-123",
        branch: "Tesco - Mahon Point",
        occurred_at: "2026-01-01T12:00:00.000Z",
        day: "2026-01-01",
        page: "Production",
      };

      applyAnalyticsEvent(body);

      expect(recordAnalyticsEvent).toHaveBeenCalledWith({
        session_id: "session-123",
        event_type: "click",
        category: undefined,
        label: undefined,
        value: undefined,
        props: undefined,
        page: "Production",
        user_role: "unknown",
        branch: "Tesco - Mahon Point",
        occurred_at: "2026-01-01T12:00:00.000Z",
        day: "2026-01-01",
      });
    });
  });

  describe("POST /api/analytics/track", () => {
    it("returns 200 ok: true and calls applyAnalyticsEvent for a valid body", async () => {
      const body = {
        session_id: "session-123",
        event_type: "pageview",
        page: "Overview",
        user_role: "Manager",
        occurred_at: "2026-01-01T12:00:00.000Z",
      };

      const res = await request(app)
        .post("/api/analytics/track").set("Authorization", "Bearer fp-analytics-secret-key")
        .send(body);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ok: true });
      expect(recordAnalyticsEvent).toHaveBeenCalled();
    });

    it("returns 400 when session_id is missing", async () => {
      const body = {
        event_type: "pageview",
        page: "Overview",
      };

      const res = await request(app)
        .post("/api/analytics/track").set("Authorization", "Bearer fp-analytics-secret-key")
        .send(body);

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "session_id, event_type, page are required" });
    });

    it("returns 400 when event_type is missing", async () => {
      const body = {
        session_id: "session-123",
        page: "Overview",
      };

      const res = await request(app)
        .post("/api/analytics/track").set("Authorization", "Bearer fp-analytics-secret-key")
        .send(body);

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "session_id, event_type, page are required" });
    });

    it("returns 400 when page is missing", async () => {
      const body = {
        session_id: "session-123",
        event_type: "pageview",
      };

      const res = await request(app)
        .post("/api/analytics/track").set("Authorization", "Bearer fp-analytics-secret-key")
        .send(body);

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "session_id, event_type, page are required" });
    });

    it("returns 500 when an internal error occurs", async () => {
      vi.mocked(recordAnalyticsEvent).mockImplementationOnce(() => {
        throw new Error("DB Error");
      });

      const body = {
        session_id: "session-123",
        event_type: "pageview",
        page: "Overview",
      };

      const res = await request(app)
        .post("/api/analytics/track").set("Authorization", "Bearer fp-analytics-secret-key")
        .send(body);

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "DB Error" });
    });
  });

  describe("POST /api/analytics/track-batch", () => {
    it("processes valid events and returns total processed count", async () => {
      const body = {
        events: [
          { session_id: "session-1", event_type: "pageview", page: "Overview" },
          { session_id: "session-2", event_type: "click", page: "Production" },
          // Missing page: should be skipped
          { session_id: "session-3", event_type: "click" },
        ],
      };

      const res = await request(app)
        .post("/api/analytics/track-batch").set("Authorization", "Bearer fp-analytics-secret-key")
        .send(body);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ok: true, count: 2 });
      expect(recordAnalyticsEvent).toHaveBeenCalledTimes(2);
    });

    it("handles empty or missing events array gracefully", async () => {
      const res = await request(app)
        .post("/api/analytics/track-batch").set("Authorization", "Bearer fp-analytics-secret-key")
        .send({});

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ok: true, count: 0 });
    });

    it("returns 500 when batch processing throws an error", async () => {
      vi.mocked(recordAnalyticsEvent).mockImplementationOnce(() => {
        throw new Error("Batch Failed");
      });

      const body = {
        events: [
          { session_id: "session-1", event_type: "pageview", page: "Overview" },
        ],
      };

      const res = await request(app)
        .post("/api/analytics/track-batch").set("Authorization", "Bearer fp-analytics-secret-key")
        .send(body);

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Batch Failed" });
    });
  });

  describe("GET analytics read endpoints", () => {
    it("GET /summary", async () => {
      const mockSummary = { sessions: 10, events: 50 };
      vi.mocked(getAnalyticsSummary).mockReturnValue(mockSummary as any);

      const res = await request(app).get("/api/analytics/summary?days=14").set("Authorization", "Bearer fp-analytics-secret-key").set("Authorization", "Bearer fp-analytics-secret-key");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockSummary);
      expect(getAnalyticsSummary).toHaveBeenCalledWith(14);
    });

    it("GET /timeseries", async () => {
      const mockTimeseries = [{ day: "2026-01-01", events: 5 }];
      vi.mocked(getAnalyticsTimeseries).mockReturnValue(mockTimeseries as any);

      const res = await request(app).get("/api/analytics/timeseries?days=15").set("Authorization", "Bearer fp-analytics-secret-key").set("Authorization", "Bearer fp-analytics-secret-key");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockTimeseries);
      expect(getAnalyticsTimeseries).toHaveBeenCalledWith(15);
    });

    it("GET /top-labels", async () => {
      const mockLabels = [{ label: "tab-1", hits: 5 }];
      vi.mocked(getTopLabels).mockReturnValue(mockLabels as any);

      const res = await request(app).get("/api/analytics/top-labels?days=10&event_type=click&limit=5").set("Authorization", "Bearer fp-analytics-secret-key").set("Authorization", "Bearer fp-analytics-secret-key");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockLabels);
      expect(getTopLabels).toHaveBeenCalledWith(10, "click", 5);
    });

    it("GET /top-actions", async () => {
      const mockActions = [{ label: "act-1", hits: 12 }];
      vi.mocked(getTopActions).mockReturnValue(mockActions as any);

      const res = await request(app).get("/api/analytics/top-actions?days=12&limit=8").set("Authorization", "Bearer fp-analytics-secret-key").set("Authorization", "Bearer fp-analytics-secret-key");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockActions);
      expect(getTopActions).toHaveBeenCalledWith(12, 8);
    });

    it("GET /top-errors", async () => {
      const mockErrors = [{ label: "err-1", hits: 2 }];
      vi.mocked(getTopErrors).mockReturnValue(mockErrors as any);

      const res = await request(app).get("/api/analytics/top-errors?days=5&limit=3").set("Authorization", "Bearer fp-analytics-secret-key").set("Authorization", "Bearer fp-analytics-secret-key");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockErrors);
      expect(getTopErrors).toHaveBeenCalledWith(5, 3);
    });

    it("GET /top-pages", async () => {
      const mockPages = [{ page: "Overview", views: 20 }];
      vi.mocked(getTopPages).mockReturnValue(mockPages as any);

      const res = await request(app).get("/api/analytics/top-pages?days=6&limit=4").set("Authorization", "Bearer fp-analytics-secret-key").set("Authorization", "Bearer fp-analytics-secret-key");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockPages);
      expect(getTopPages).toHaveBeenCalledWith(6, 4);
    });

    it("GET /top-branches", async () => {
      const mockBranches = [{ branch: "Cork", sessions: 5 }];
      vi.mocked(getTopBranches).mockReturnValue(mockBranches as any);

      const res = await request(app).get("/api/analytics/top-branches?days=4&limit=2").set("Authorization", "Bearer fp-analytics-secret-key").set("Authorization", "Bearer fp-analytics-secret-key");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockBranches);
      expect(getTopBranches).toHaveBeenCalledWith(4, 2);
    });

    it("GET /roles", async () => {
      const mockRoles = [{ user_role: "Admin", sessions: 10 }];
      vi.mocked(getRoleBreakdown).mockReturnValue(mockRoles as any);

      const res = await request(app).get("/api/analytics/roles?days=9").set("Authorization", "Bearer fp-analytics-secret-key").set("Authorization", "Bearer fp-analytics-secret-key");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockRoles);
      expect(getRoleBreakdown).toHaveBeenCalledWith(9);
    });

    it("GET /funnel", async () => {
      const mockFunnel = [{ step: "Overview", users: 5 }];
      vi.mocked(getFunnel).mockReturnValue(mockFunnel as any);

      const res = await request(app).get("/api/analytics/funnel?days=8&steps=Overview,Production").set("Authorization", "Bearer fp-analytics-secret-key");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockFunnel);
      expect(getFunnel).toHaveBeenCalledWith(["Overview", "Production"], 8);
    });

    it("GET /recent", async () => {
      const mockRecent = [{ id: 1, event_type: "click" }];
      vi.mocked(getRecentEvents).mockReturnValue(mockRecent as any);

      const res = await request(app).get("/api/analytics/recent?limit=25").set("Authorization", "Bearer fp-analytics-secret-key").set("Authorization", "Bearer fp-analytics-secret-key");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockRecent);
      expect(getRecentEvents).toHaveBeenCalledWith(25);
    });

    it("GET /status", async () => {
      vi.mocked(getAnalyticsSeeded).mockReturnValue(true);

      const res = await request(app).get("/api/analytics/status").set("Authorization", "Bearer fp-analytics-secret-key").set("Authorization", "Bearer fp-analytics-secret-key");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ seeded: true });
      expect(getAnalyticsSeeded).toHaveBeenCalled();
    });
  });
});
