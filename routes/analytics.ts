import express from "express";
import {
  upsertAnalyticsSession, recordAnalyticsEvent, endAnalyticsSession,
  getAnalyticsSummary, getAnalyticsTimeseries, getTopLabels, getTopActions,
  getTopErrors, getTopPages, getTopBranches, getRoleBreakdown, getFunnel,
  getRecentEvents, getAnalyticsSeeded, applyAnalyticsEventsBatch,
} from "../db";

export const analyticsRouter = express.Router();

function parseDays(queryVal: any, defaultDays = 30, maxDays = 365) {
  const val = Number(queryVal);
  if (isNaN(val) || val <= 0) return defaultDays;
  return Math.min(val, maxDays);
}

function parseLimit(queryVal: any, defaultLimit = 10, maxLimit = 100) {
  const val = Number(queryVal);
  if (isNaN(val) || val <= 0) return defaultLimit;
  return Math.min(val, maxLimit);
}

const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1] || req.query.token;
  const expectedToken = process.env.ANALYTICS_API_KEY || "fp-analytics-secret-key";
  if (token === expectedToken) {
    return next();
  }
  return res.status(401).json({ error: "Unauthorized" });
};

analyticsRouter.use(requireAuth);

export function applyAnalyticsEvent(body: any) {
  if (body.event_type === "session_start") {
    upsertAnalyticsSession({
      session_id: body.session_id,
      user_role: body.user_role || "unknown",
      branch: body.branch,
      first_seen_at: body.occurred_at,
      last_seen_at: body.occurred_at,
      is_active: 1,
    });
  } else if (body.event_type === "session_end") {
    endAnalyticsSession(body.session_id, body.occurred_at);
  } else {
    recordAnalyticsEvent({
      session_id: body.session_id,
      event_type: body.event_type,
      category: body.category,
      label: body.label,
      value: body.value,
      props: body.props,
      page: body.page,
      user_role: body.user_role || "unknown",
      branch: body.branch,
      occurred_at: body.occurred_at,
      day: body.day,
    });
  }
}

// Track a single event (session_start, pageview, tab_switch, click, form_submit, action, error)
analyticsRouter.post("/track", (req, res) => {
  try {
    const body = req.body || {};
    if (!body.session_id || !body.event_type || !body.page) {
      return res.status(400).json({ error: "session_id, event_type, page are required" });
    }
    applyAnalyticsEvent(body);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Batch endpoint — send multiple events in one call (reduces chatter)
analyticsRouter.post("/track-batch", (req, res) => {
  try {
    const events: any[] = Array.isArray(req.body?.events) ? req.body.events : [];
    let count = 0;
    for (const ev of events) {
      if (!ev || !ev.session_id || !ev.event_type || !ev.page) continue;
      applyAnalyticsEvent(ev);
      count++;
    }
    res.json({ ok: true, count });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

analyticsRouter.get("/summary", (req, res) => {
  try {
    const days = parseDays(req.query.days, 30);
    res.json(getAnalyticsSummary(days));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

analyticsRouter.get("/timeseries", (req, res) => {
  try {
    const days = parseDays(req.query.days, 30);
    res.json(getAnalyticsTimeseries(days));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

analyticsRouter.get("/top-labels", (req, res) => {
  try {
    const days = parseDays(req.query.days, 30);
    const event_type = (req.query.event_type as string) || "tab_switch";
    const limit = parseLimit(req.query.limit, 10);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
    res.json(getTopLabels(days, event_type, limit));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

analyticsRouter.get("/top-actions", (req, res) => {
  try {
    const days = parseDays(req.query.days, 30);
    const limit = parseLimit(req.query.limit, 10);
    const days = Number(req.query.days) || 30;
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
    res.json(getTopActions(days, limit));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

analyticsRouter.get("/top-errors", (req, res) => {
  try {
    const days = parseDays(req.query.days, 30);
    const limit = parseLimit(req.query.limit, 10);
    const days = Number(req.query.days) || 30;
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
    res.json(getTopErrors(days, limit));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

analyticsRouter.get("/top-pages", (req, res) => {
  try {
    const days = parseDays(req.query.days, 30);
    const limit = parseLimit(req.query.limit, 10);
    const days = Number(req.query.days) || 30;
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
    res.json(getTopPages(days, limit));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

analyticsRouter.get("/top-branches", (req, res) => {
  try {
    const days = parseDays(req.query.days, 30);
    const limit = parseLimit(req.query.limit, 10);
    const days = Number(req.query.days) || 30;
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
    res.json(getTopBranches(days, limit));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

analyticsRouter.get("/roles", (req, res) => {
  try {
    const days = parseDays(req.query.days, 30);
    res.json(getRoleBreakdown(days));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

analyticsRouter.get("/funnel", (req, res) => {
  try {
    const days = parseDays(req.query.days, 30);
    const stepsParam = (req.query.steps as string) || "Overview,Production,Waste,Sell,Reports";
    const steps = stepsParam.split(",").map(s => s.trim()).filter(Boolean);
    res.json(getFunnel(steps, days));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

analyticsRouter.get("/recent", (req, res) => {
  try {
    const limit = parseLimit(req.query.limit, 50);
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
    res.json(getRecentEvents(limit));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

analyticsRouter.get("/status", (_req, res) => {
  try {
    res.json({ seeded: getAnalyticsSeeded() });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});
