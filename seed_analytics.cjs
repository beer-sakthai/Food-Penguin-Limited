// Saksee · 2026-07-24
// Seed analytics_sessions + analytics_events with realistic 30-day data.
// Idempotent: clears prior seed before populating.

const Database = require("better-sqlite3");
const path = require("path");

const DB_PATH = path.join(process.cwd(), "food-penguin.db");
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS analytics_sessions (
    session_id TEXT PRIMARY KEY,
    user_role TEXT NOT NULL,
    branch TEXT,
    first_seen_at TEXT NOT NULL,
    last_seen_at TEXT NOT NULL,
    event_count INTEGER NOT NULL DEFAULT 0,
    pageview_count INTEGER NOT NULL DEFAULT 0,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1
  );
  CREATE TABLE IF NOT EXISTS analytics_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    category TEXT,
    label TEXT,
    value REAL,
    props TEXT,
    page TEXT NOT NULL,
    user_role TEXT NOT NULL,
    branch TEXT,
    occurred_at TEXT NOT NULL,
    day TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_events_day ON analytics_events(day);
  CREATE INDEX IF NOT EXISTS idx_events_type ON analytics_events(event_type);
  CREATE INDEX IF NOT EXISTS idx_events_label ON analytics_events(label);
  CREATE INDEX IF NOT EXISTS idx_events_session ON analytics_events(session_id);
  CREATE INDEX IF NOT EXISTS idx_events_page ON analytics_events(page);
`);

db.exec("DELETE FROM analytics_events; DELETE FROM analytics_sessions;");

const ROLES = ["Admin", "Manager", "Staff"];
const BRANCHES = [
  "Marks & Spencer - Cork City",
  "Tesco - Cork City",
  "Tesco - Mahon Point",
];
const TABS_WEIGHTED = {
  Overview: 1.0, Production: 0.85, Sell: 0.7, Waste: 0.65, Hours: 0.55,
  Target: 0.5, Realtime: 0.45, Reports: 0.4, Planning: 0.35, Energy: 0.3,
  Advisor: 0.25, Finance: 0.2, Suppliers: 0.18, Allocation: 0.15, Studio: 0.12, Analytics: 0.1,
};
const ACTIONS = [
  { type: "click", label: "Save Order", category: "Button" },
  { type: "click", label: "Open Order", category: "Button" },
  { type: "click", label: "Print Label", category: "Button" },
  { type: "form_submit", label: "Add Waste", category: "Form" },
  { type: "form_submit", label: "Log Hours", category: "Form" },
  { type: "form_submit", label: "Update Target", category: "Form" },
  { type: "action", label: "Run Strategic Advisor", category: "AI" },
  { type: "action", label: "Generate Marketing Image", category: "AI" },
  { type: "action", label: "Suggest Restock", category: "AI" },
  { type: "action", label: "Capacity Quickfix", category: "AI" },
  { type: "action", label: "Shift Summary", category: "AI" },
  { type: "click", label: "Refresh", category: "Button" },
  { type: "click", label: "Export CSV", category: "Button" },
  { type: "click", label: "Generate PDF", category: "Button" },
  { type: "click", label: "Toggle Theme", category: "UI" },
];
const ERRORS = [
  { label: "Gemini 429 rate limit" },
  { label: "Failed to fetch /api/metrics" },
  { label: "Vite HMR reconnect" },
  { label: "Image generation timeout" },
];

function pickWeighted(items) {
  const total = Object.values(items).reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (const [k, v] of Object.entries(items)) { r -= v; if (r <= 0) return k; }
  return Object.keys(items)[0];
}
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function isoFor(d) { return d.toISOString().replace(/\.\d+Z$/, "Z"); }
function dayFor(d) { return d.toISOString().slice(0, 10); }

const insertSession = db.prepare(`
  INSERT INTO analytics_sessions (session_id, user_role, branch, first_seen_at, last_seen_at, event_count, pageview_count, duration_seconds, is_active)
  VALUES (?, ?, ?, ?, ?, 0, 0, ?, ?)
`);
const insertEvent = db.prepare(`
  INSERT INTO analytics_events (session_id, event_type, category, label, value, props, page, user_role, branch, occurred_at, day)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const now = new Date("2026-07-24T22:00:00Z");
const DAY = 24 * 3600 * 1000;
const sessionsPerDay = 14;
let sessionCounter = 1;
let totalEvents = 0;

for (let dOffset = 30; dOffset >= 0; dOffset--) {
  const dayStart = new Date(now.getTime() - dOffset * DAY);
  const isWeekend = [0, 6].includes(dayStart.getUTCDay());

  for (let s = 0; s < sessionsPerDay; s++) {
    const role = isWeekend && Math.random() < 0.3 ? "Admin" : pick(ROLES);
    const branch = pick(BRANCHES);
    const startHour = 8 + Math.floor(Math.random() * 12);
    const startMin = Math.floor(Math.random() * 60);
    const first = new Date(dayStart);
    first.setUTCHours(startHour, startMin, 0, 0);

    const sessionId = "S-" + String(sessionCounter++).padStart(5, "0");
    const sessionLenSec = 180 + Math.floor(Math.random() * 1500);
    const last = new Date(first.getTime() + sessionLenSec * 1000);
    const isActive = dOffset === 0 && s === sessionsPerDay - 1 ? 1 : 0;

    const pageviews = 3 + Math.floor(Math.random() * 12);
    const actions = Math.floor(pageviews * (0.3 + Math.random() * 0.5));

    let eventCount = 0;
    let pvCount = 0;
    let curPage = "Overview";

    insertSession.run(sessionId, role, branch, isoFor(first), isoFor(last), sessionLenSec, isActive);

    insertEvent.run(sessionId, "session_start", "lifecycle", "session_start", null, null, "Overview", role, branch, isoFor(first), dayFor(first));
    eventCount++;
    insertEvent.run(sessionId, "pageview", "Page", "Overview", null, null, "Overview", role, branch, isoFor(first), dayFor(first));
    eventCount++;
    pvCount++;

    for (let p = 0; p < pageviews - 1; p++) {
      const newPage = pickWeighted(TABS_WEIGHTED);
      const tOffset = (sessionLenSec * 1000 * (p + 1)) / pageviews;
      const at = new Date(first.getTime() + tOffset);
      if (at > last) break;
      insertEvent.run(sessionId, "tab_switch", "Tab", newPage, null, null, newPage, role, branch, isoFor(at), dayFor(at));
      eventCount++;
      insertEvent.run(sessionId, "pageview", "Page", newPage, null, null, newPage, role, branch, isoFor(at), dayFor(at));
      eventCount++;
      pvCount++;
      curPage = newPage;
    }

    for (let a = 0; a < actions; a++) {
      const act = pick(ACTIONS);
      const at = new Date(first.getTime() + Math.random() * sessionLenSec * 1000);
      if (at > last) break;
      insertEvent.run(sessionId, act.type, act.category, act.label, null, null, curPage, role, branch, isoFor(at), dayFor(at));
      eventCount++;
    }

    if (Math.random() < 0.03) {
      const err = pick(ERRORS);
      const at = new Date(first.getTime() + Math.random() * sessionLenSec * 1000);
      if (at < last) {
        insertEvent.run(sessionId, "error", "Error", err.label, null, null, curPage, role, branch, isoFor(at), dayFor(at));
        eventCount++;
      }
    }

    insertEvent.run(sessionId, "session_end", "lifecycle", "session_end", null, null, curPage, role, branch, isoFor(last), dayFor(last));
    eventCount++;

    db.prepare("UPDATE analytics_sessions SET event_count = ?, pageview_count = ? WHERE session_id = ?")
      .run(eventCount, pvCount, sessionId);
    totalEvents += eventCount;
  }
}

console.log("Seeded 30 days of analytics data");
console.log("  sessions: " + (sessionCounter - 1));
console.log("  events:   " + totalEvents);
const counts = db.prepare("SELECT event_type, COUNT(*) AS c FROM analytics_events GROUP BY event_type ORDER BY c DESC").all();
console.log("  by type:");
for (const r of counts) console.log("    " + r.event_type.padEnd(15) + r.c);
db.close();
