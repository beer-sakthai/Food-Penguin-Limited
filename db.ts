import Database from "better-sqlite3";
import path from "path";

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), "food-penguin.db");

let db: Database.Database;
const stmtCache = new Map<string, Database.Statement>();

export function getPreparedStatement(sql: string): Database.Statement {
  let stmt = stmtCache.get(sql);
  if (!stmt) {
    stmt = getDb().prepare(sql);
    stmtCache.set(sql, stmt);
  }
  return stmt;
}

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initSchema();
    seedIfEmpty();
    stmtCache.clear();
  }
  return db;
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS metrics (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      sales_today REAL NOT NULL DEFAULT 0,
      sales_growth REAL NOT NULL DEFAULT 0,
      production_items INTEGER NOT NULL DEFAULT 0,
      production_target INTEGER NOT NULL DEFAULT 0,
      waste_cost REAL NOT NULL DEFAULT 0,
      waste_reduction REAL NOT NULL DEFAULT 0,
      hours_scheduled REAL NOT NULL DEFAULT 0,
      overtime_hours REAL NOT NULL DEFAULT 0,
      ai_health_score INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      date TEXT,
      item TEXT NOT NULL,
      category TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      amount REAL NOT NULL,
      barcode TEXT,
      status TEXT NOT NULL DEFAULT 'Completed',
      branch TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS targets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      metric TEXT NOT NULL,
      target_value REAL NOT NULL,
      current_value REAL NOT NULL,
      unit TEXT NOT NULL,
      category TEXT NOT NULL,
      deadline TEXT NOT NULL,
      date TEXT
    );

    CREATE TABLE IF NOT EXISTS recipes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      prep_time INTEGER NOT NULL,
      ingredients TEXT NOT NULL,
      allergens TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS production_tasks (
      id TEXT PRIMARY KEY,
      item_name TEXT NOT NULL,
      assigned_to TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'In Queue',
      quantity INTEGER NOT NULL,
      priority TEXT NOT NULL DEFAULT 'medium',
      date TEXT
    );

    CREATE TABLE IF NOT EXISTS waste_records (
      id TEXT PRIMARY KEY,
      item TEXT NOT NULL,
      category TEXT NOT NULL,
      weight REAL NOT NULL,
      cost REAL NOT NULL,
      reason TEXT NOT NULL,
      date TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS employee_hours (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Clocked Out',
      scheduled_hours REAL NOT NULL,
      actual_hours REAL NOT NULL,
      shift_start TEXT NOT NULL,
      shift_end TEXT NOT NULL,
      date TEXT
    );

    CREATE TABLE IF NOT EXISTS inventory (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      stock_level REAL NOT NULL,
      current_qty REAL NOT NULL,
      unit TEXT NOT NULL,
      reorder_level REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'Healthy'
    );

    CREATE TABLE IF NOT EXISTS daily_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      day TEXT NOT NULL,
      date TEXT NOT NULL,
      sales REAL NOT NULL,
      waste REAL NOT NULL,
      hours REAL NOT NULL,
      production_target INTEGER NOT NULL,
      production_made INTEGER NOT NULL,
      supplier_name TEXT NOT NULL,
      cogs_tazaki REAL NOT NULL DEFAULT 0,
      cogs_sysco REAL NOT NULL DEFAULT 0,
      cogs_bulza REAL NOT NULL DEFAULT 0,
      cogs_sticker REAL NOT NULL DEFAULT 0,
      cogs_others REAL NOT NULL DEFAULT 0,
      week_range TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      date TEXT,
      sensor TEXT NOT NULL,
      value TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'normal',
      message TEXT NOT NULL
    );

    -- ==========================================
    -- Product Analytics layer (self-hosted, no-cost)
    -- ==========================================
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
    CREATE INDEX IF NOT EXISTS idx_sessions_last_seen ON analytics_sessions(last_seen_at);

    CREATE TABLE IF NOT EXISTS analytics_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      event_type TEXT NOT NULL,           -- pageview | tab_switch | click | form_submit | action | error
      category TEXT,                       -- e.g. "Tab", "Button", "Form", "Api"
      label TEXT,                          -- e.g. "Production", "Save Order"
      value REAL,                          -- optional numeric value
      props TEXT,                          -- JSON string of extra props
      page TEXT NOT NULL,                  -- logical page/route
      user_role TEXT NOT NULL,
      branch TEXT,
      occurred_at TEXT NOT NULL,
      day TEXT NOT NULL                     -- YYYY-MM-DD for fast daily aggregation
    );
    CREATE INDEX IF NOT EXISTS idx_events_day ON analytics_events(day);
    CREATE INDEX IF NOT EXISTS idx_events_type ON analytics_events(event_type);
    CREATE INDEX IF NOT EXISTS idx_events_label ON analytics_events(label);
    CREATE INDEX IF NOT EXISTS idx_events_session ON analytics_events(session_id);
    CREATE INDEX IF NOT EXISTS idx_events_page ON analytics_events(page);
  `);
}

function seedIfEmpty() {
  const count = db.prepare("SELECT COUNT(*) as c FROM metrics").get() as { c: number };
  if (count.c > 0) return;

  const insert = db.prepare(`
    INSERT OR REPLACE INTO metrics (id, sales_today, sales_growth, production_items, production_target, waste_cost, waste_reduction, hours_scheduled, overtime_hours, ai_health_score)
    VALUES (1, 14820, 12.4, 11240, 11500, 412.50, 18.2, 124, 0, 94)
  `);

  const insertOrder = db.prepare(
    "INSERT OR REPLACE INTO orders (id, timestamp, date, item, category, quantity, amount, barcode, status, branch) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  );
  const orders = [
    ["FP-1084", "14:10", "2026-06-28", "Luxury Salmon & Caviar Platter", "Sashimi & Platters", 2, 69.00, "5391548895018", "Completed", "Marks & Spencer - Cork City"],
    ["FP-1083", "13:58", "2026-06-28", "Gastropub Spicy Truffle Roll", "Specialty Rolls", 1, 19.95, "5391548895025", "Completed", "Marks & Spencer - Cork City"],
    ["FP-1081", "13:45", "2026-06-26", "Handcrafted Premium Dragon Roll", "Sushi Rolls", 3, 52.50, "5391548895049", "Completed", "Marks & Spencer - Cork City"],
    ["FP-1079", "13:12", "2026-06-19", "Luxury Salmon & Caviar Platter", "Sashimi & Platters", 1, 34.50, "5391548895018", "Completed", "Marks & Spencer - Cork City"],
    ["FP-2081", "13:51", "2026-06-19", "salmon sashimi", "Sashimi Selections", 1, 7.75, "5391548890068", "Completed", "Tesco - Cork City"],
    ["FP-2080", "13:30", "2026-06-18", "spicy veggie roll", "Sushi Rolls", 2, 11.00, "5391548890266", "Completed", "Tesco - Cork City"],
    ["FP-2078", "12:45", "2026-06-25", "veggie tofu yakisoba noodles", "Noodles & Sides", 2, 15.90, "5391548890679", "Completed", "Tesco - Cork City"],
    ["FP-3081", "13:55", "2026-06-20", "spicy veggie roll", "Sushi Rolls", 1, 5.50, "5391548890266", "Completed", "Tesco - Mahon Point"],
    ["FP-3080", "13:20", "2026-06-15", "TokYO! party platter", "Party Platters", 1, 16.75, "5391548890549", "Completed", "Tesco - Mahon Point"],
    ["FP-3078", "12:30", "2026-06-28", "veggie tofu yakisoba noodles", "Noodles & Sides", 3, 23.85, "5391548890679", "Completed", "Tesco - Mahon Point"],
  ];

  const insertTarget = db.prepare(
    "INSERT OR REPLACE INTO targets (id, name, metric, target_value, current_value, unit, category, deadline, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
  );
  const targets = [
    ["T-1", "Sushi Revenue Target", "Total Sales (€)", 15000, 14820, "€", "Sell", "Today, 22:00", "2026-06-28"],
    ["T-2", "Sushi Rolls Made", "Items Rolled", 11500, 11240, "units", "Production", "Today, 21:05", "2026-06-28"],
    ["T-3", "Daily Waste Minimizer", "Food Waste Cost", 500, 412.50, "€", "Waste", "Today, 22:00", "2026-06-28"],
    ["T-4", "Hourly Roster Precision", "Overtime Margin", 2, 0, "hrs", "Hours", "End of Shift", "2026-06-28"],
    ["T-5", "Weekly Organic Reach", "Social Promos Run", 10, 8, "times", "Sell", "Sunday, 18:00", "2026-06-21"],
  ];

  const insertRecipe = db.prepare(
    "INSERT OR REPLACE INTO recipes (id, name, category, status, prep_time, ingredients, allergens) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );
  const recipes = [
    ["R-1", "Tokyo Dragon Roll", "Sushi Rolls", "active", 8, "Eel Fish|Shrimp Tempura|Fresh Avocado|Cucumber strip|Sweet Eel Glaze|Nori Seaweed", "Fish|Gluten|Sulphites"],
    ["R-2", "Kyoto Salmon Sashimi Platter", "Sashimi & Platters", "active", 12, "Atlantic Salmon Fillet|White Daikon Radish ruff|Fresh Shiso leaves|Artisanal Wasabi paste|Soy Sauce", "Fish|Soya|Gluten"],
    ["R-3", "Spicy Bluefin Tuna Roll", "Sushi Rolls", "active", 4, "Spicy Minced Tuna|Crispy Cucumber|Kyoto Spicy Mayo|Toasted Sesame seeds|Sushi Grains", "Fish|Eggs|Sesame"],
    ["R-4", "California Roll Classic", "Sushi Rolls", "active", 15, "Snow Crab Stick|Avocado slice|Fresh Cucumber|Premium Sushi Rice|Nori Sheets", "Crustaceans|Gluten"],
    ["R-5", "Volcano Baked Scallop Roll", "Specialty Rolls", "active", 6, "Spicy Crab Mix|Chopped Sea Scallops|Creamy Spicy Mayo|Sweet Soy Reduction|Masago Fish Roe", "Molluscs|Eggs|Fish|Soya"],
  ];

  const insertTask = db.prepare(
    "INSERT OR REPLACE INTO production_tasks (id, item_name, assigned_to, status, quantity, priority, date) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );
  const tasks = [
    ["PT-301", "Tokyo Dragon Roll", "Chef Skipper", "Cooking", 2, "high", "2026-06-28"],
    ["PT-302", "Kyoto Salmon Sashimi Platter", "Chef Private", "Cooking", 1, "medium", "2026-06-27"],
    ["PT-303", "Spicy Bluefin Tuna Roll", "Kitchen Aide Rico", "In Queue", 1, "low", "2026-06-20"],
    ["PT-304", "California Roll Classic", "Chef Kowalski", "Prepared", 3, "high", "2026-06-19"],
  ];

  const insertWaste = db.prepare(
    "INSERT OR REPLACE INTO waste_records (id, item, category, weight, cost, reason, date) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );
  const waste = [
    ["W-901", "Spilled Sushi Rice Vinegar", "Condiments", 4.5, 35.00, "Spill/Accident", "2026-06-19"],
    ["W-902", "Overproduced California Rolls", "Sushi Rolls", 12.0, 48.00, "Overproduced", "2026-06-19"],
    ["W-903", "Expired Tuna Loin Trimmings", "Seafood", 3.2, 74.50, "Expired", "2026-06-19"],
    ["W-904", "Damaged Nori Seaweed Sheets", "Wrapping", 6.0, 24.00, "Quality Issue", "2026-06-19"],
    ["W-905", "Soggy Cucumber Strips", "Produce", 5.0, 15.00, "Expired", "2026-06-18"],
  ];

  const insertHours = db.prepare(
    "INSERT OR REPLACE INTO employee_hours (id, name, role, status, scheduled_hours, actual_hours, shift_start, shift_end, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
  );
  const hours = [
    ["E-01", "Chef Skipper (Lead)", "Head Sushi Chef", "Clocked In", 40, 36.5, "08:00", "17:00", "2026-06-28"],
    ["E-02", "Chef Kowalski", "Sushi Master / Kitchen Analyst", "Clocked In", 40, 35.0, "09:00", "18:00", "2026-06-28"],
    ["E-03", "Chef Private", "Sushi Roll Prep", "Clocked In", 35, 31.0, "10:00", "18:00", "2026-06-27"],
    ["E-04", "Kitchen Aide Rico", "Prep & Rice Cooker", "Clocked In", 30, 28.5, "11:00", "19:00", "2026-06-20"],
    ["E-05", "Alice Smith", "Sushi Counter Manager", "Clocked Out", 32, 32.0, "08:00", "16:00", "2026-06-19"],
    ["E-06", "Bob Johnson", "Cold Logistics Lead", "Clocked Out", 30, 24.0, "12:00", "20:00", "2026-06-18"],
  ];

  const insertInventory = db.prepare(
    "INSERT OR REPLACE INTO inventory (id, name, category, stock_level, current_qty, unit, reorder_level, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  );
  const inventory = [
    ["I-101", "Bluefin Tuna Loin", "Seafood", 35, 70, "kg", 100, "Low"],
    ["I-102", "Atlantic Sushi Salmon", "Seafood", 80, 120, "kg", 80, "Healthy"],
    ["I-103", "Premium Sushi Rice", "Grains", 55, 180, "kg", 250, "Low"],
    ["I-104", "Nori Seaweed Sheets", "Dry Goods", 65, 1300, "units", 1000, "Healthy"],
    ["I-105", "Fresh Avocados", "Produce", 45, 90, "units", 120, "Low"],
    ["I-106", "Sushi Seasoning Vinegar", "Condiments", 95, 475, "L", 150, "Healthy"],
  ];

  const insertLog = db.prepare(
    "INSERT OR REPLACE INTO daily_logs (day, date, sales, waste, hours, production_target, production_made, supplier_name, cogs_tazaki, cogs_sysco, cogs_bulza, cogs_sticker, cogs_others, week_range) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  );
  const logs = [
    ["Mon", "2026-06-15", 10450, 520, 110, 11500, 9800, "Tazaki", 3500, 1200, 600, 120, 200, "2026-06-15 to 2026-06-21"],
    ["Tue", "2026-06-16", 11200, 480, 115, 11500, 10200, "Sysco", 3600, 1100, 550, 100, 250, "2026-06-15 to 2026-06-21"],
    ["Wed", "2026-06-17", 10800, 460, 118, 11500, 10100, "Bulza", 3450, 1300, 620, 150, 180, "2026-06-15 to 2026-06-21"],
    ["Thu", "2026-06-18", 12500, 410, 120, 11500, 11100, "Sticker", 4100, 1250, 700, 180, 210, "2026-06-15 to 2026-06-21"],
    ["Fri", "2026-06-19", 13800, 390, 122, 11500, 11300, "Others", 4500, 1150, 750, 200, 330, "2026-06-15 to 2026-06-21"],
    ["Sat", "2026-06-20", 14200, 405, 125, 11500, 11400, "Tazaki", 4700, 1100, 800, 220, 350, "2026-06-15 to 2026-06-21"],
    ["Sun", "2026-06-21", 14820, 412.50, 124, 11500, 11240, "Others", 4890, 1100, 820, 240, 380, "2026-06-15 to 2026-06-21"],
    ["Mon", "2026-06-22", 11000, 500, 108, 11500, 9900, "Tazaki", 3600, 1150, 580, 110, 190, "2026-06-22 to 2026-06-28"],
    ["Tue", "2026-06-23", 11500, 470, 114, 11500, 10400, "Sysco", 3700, 1200, 530, 110, 240, "2026-06-22 to 2026-06-28"],
    ["Wed", "2026-06-24", 11200, 450, 116, 11500, 10300, "Bulza", 3500, 1250, 610, 140, 200, "2026-06-22 to 2026-06-28"],
    ["Thu", "2026-06-25", 12100, 430, 118, 11500, 10900, "Sticker", 4000, 1200, 680, 170, 220, "2026-06-22 to 2026-06-28"],
    ["Fri", "2026-06-26", 14000, 380, 120, 11500, 11500, "Others", 4600, 1100, 720, 190, 310, "2026-06-22 to 2026-06-28"],
    ["Sat", "2026-06-27", 14500, 395, 122, 11500, 11600, "Tazaki", 4800, 1150, 780, 210, 340, "2026-06-22 to 2026-06-28"],
    ["Sun", "2026-06-28", 15200, 400, 126, 11500, 11800, "Others", 5000, 1050, 800, 230, 360, "2026-06-22 to 2026-06-28"],
    ["Mon", "2026-06-08", 9800, 550, 112, 11000, 9400, "Tazaki", 3300, 1250, 620, 130, 210, "2026-06-08 to 2026-06-14"],
    ["Tue", "2026-06-09", 10500, 510, 116, 11000, 9800, "Sysco", 3500, 1200, 600, 140, 230, "2026-06-08 to 2026-06-14"],
    ["Wed", "2026-06-10", 10200, 480, 114, 11000, 9600, "Bulza", 3400, 1300, 580, 130, 200, "2026-06-08 to 2026-06-14"],
    ["Thu", "2026-06-11", 11800, 440, 118, 11000, 10500, "Sticker", 3900, 1200, 650, 160, 220, "2026-06-08 to 2026-06-14"],
    ["Fri", "2026-06-12", 13200, 410, 120, 11000, 10800, "Others", 4400, 1100, 720, 180, 300, "2026-06-08 to 2026-06-14"],
    ["Sat", "2026-06-13", 13800, 420, 122, 11000, 11000, "Tazaki", 4600, 1050, 750, 200, 320, "2026-06-08 to 2026-06-14"],
    ["Sun", "2026-06-14", 14200, 430, 124, 11000, 11200, "Others", 4700, 1000, 780, 210, 340, "2026-06-08 to 2026-06-14"],
  ];

  const insertAlert = db.prepare(
    "INSERT OR REPLACE INTO alerts (id, timestamp, date, sensor, value, status, message) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );
  const alerts = [
    ["A-01", "14:12:30", "2026-06-28", "Cold Room Freezy-01", "-19.4°C", "normal", "Temperature remains stable at threshold."],
    ["A-02", "14:08:15", "2026-06-28", "Sushi Rice Warm Unit A", "57.0°C", "normal", "Optimal preservation raw rice temperature verified."],
    ["A-03", "13:55:00", "2026-06-27", "Seafood Deep Freezer", "-12.1°C", "warning", "Slight thermal climb detected during door cycle."],
    ["A-04", "13:10:45", "2026-06-19", "Dishwasher Rinse Tank", "82.5°C", "normal", "Sanitation high-temp rinse verified."],
  ];

  // Wrap inside a single atomic transaction for a massive speedup
  const runSeeding = db.transaction(() => {
    insert.run();
    for (const o of orders) insertOrder.run(...o);
    for (const t of targets) insertTarget.run(...t);
    for (const r of recipes) insertRecipe.run(...r);
    for (const t of tasks) insertTask.run(...t);
    for (const w of waste) insertWaste.run(...w);
    for (const h of hours) insertHours.run(...h);
    for (const i of inventory) insertInventory.run(...i);
    for (const l of logs) insertLog.run(...l);
    for (const a of alerts) insertAlert.run(...a);
  });

  runSeeding();
}

// ---- Query helpers ----

export function getMetrics() {
  return getDb().prepare("SELECT * FROM metrics WHERE id = 1").get();
}

export function getOrders(branch?: string) {
  if (branch) return getDb().prepare("SELECT * FROM orders WHERE branch = ? ORDER BY timestamp DESC").all(branch);
  return getDb().prepare("SELECT * FROM orders ORDER BY timestamp DESC").all();
}

export function getTargets() {
  return getDb().prepare("SELECT * FROM targets").all();
}

export function getRecipes() {
  return getDb().prepare("SELECT * FROM recipes WHERE status = 'active'").all();
}

export function getProductionTasks() {
  return getDb().prepare("SELECT * FROM production_tasks ORDER BY date DESC").all();
}

export function getWasteRecords() {
  return getDb().prepare("SELECT * FROM waste_records ORDER BY date DESC").all();
}

export function getEmployeeHours() {
  return getDb().prepare("SELECT * FROM employee_hours ORDER BY date DESC").all();
}

export function getInventory() {
  return getDb().prepare("SELECT * FROM inventory").all();
}

export function getDailyLogs(weekRange: string) {
  return getDb().prepare("SELECT * FROM daily_logs WHERE week_range = ? ORDER BY date").all(weekRange);
}

export function getAlerts() {
  return getDb().prepare("SELECT * FROM alerts ORDER BY timestamp DESC").all();
}

const ALLOWED_METRIC_COLUMNS = new Set([
  "sales_today",
  "sales_growth",
  "production_items",
  "production_target",
  "waste_cost",
  "waste_reduction",
  "hours_scheduled",
  "overtime_hours",
  "ai_health_score"
]);

export function updateMetrics(data: Record<string, number>) {
  const keys = Object.keys(data);
  if (keys.length === 0) {
    throw new Error("No fields provided for update");
  }
  for (const key of keys) {
    if (!ALLOWED_METRIC_COLUMNS.has(key)) {
      throw new Error(`Invalid metric column: ${key}`);
    }
  }
  const fields = keys.map(k => `${k} = ?`).join(", ");
  const values = Object.values(data);
  return getDb().prepare(`UPDATE metrics SET ${fields}, updated_at = datetime('now') WHERE id = 1`).run(...values);
}

export function addOrder(order: Record<string, any>) {
  return getDb().prepare(
    "INSERT INTO orders (id, timestamp, date, item, category, quantity, amount, barcode, status, branch) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(order.id, order.timestamp, order.date, order.item, order.category, order.quantity, order.amount, order.barcode, order.status, order.branch);
}

export function addWasteRecord(record: Record<string, any>) {
  return getDb().prepare(
    "INSERT INTO waste_records (id, item, category, weight, cost, reason, date) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).run(record.id, record.item, record.category, record.weight, record.cost, record.reason, record.date);
}

export function addDailyLog(log: Record<string, any>) {
  return getDb().prepare(
    "INSERT OR REPLACE INTO daily_logs (day, date, sales, waste, hours, production_target, production_made, supplier_name, cogs_tazaki, cogs_sysco, cogs_bulza, cogs_sticker, cogs_others, week_range) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(log.day, log.date, log.sales, log.waste, log.hours, log.production_target, log.production_made, log.supplier_name, log.cogs_tazaki, log.cogs_sysco, log.cogs_bulza, log.cogs_sticker, log.cogs_others, log.week_range);
}

// ==========================================
// Analytics write/read helpers
// ==========================================

export type AnalyticsEventInput = {
  session_id: string;
  event_type: string;
  category?: string;
  label?: string;
  value?: number;
  props?: Record<string, any>;
  page: string;
  user_role: string;
  branch?: string;
  occurred_at: string; // ISO
  day: string;         // YYYY-MM-DD
};

export function upsertAnalyticsSession(s: {
  session_id: string;
  user_role: string;
  branch?: string;
  first_seen_at: string;
  last_seen_at: string;
  is_active: number;
}) {
  return getPreparedStatement(`
    INSERT INTO analytics_sessions (session_id, user_role, branch, first_seen_at, last_seen_at, is_active)
    VALUES (@session_id, @user_role, @branch, @first_seen_at, @last_seen_at, @is_active)
    ON CONFLICT(session_id) DO UPDATE SET
      last_seen_at = excluded.last_seen_at,
      is_active = excluded.is_active
  `).run({
    session_id: s.session_id,
    user_role: s.user_role,
    branch: s.branch ?? null,
    first_seen_at: s.first_seen_at,
    last_seen_at: s.last_seen_at,
    is_active: s.is_active,
  });
}

export function recordAnalyticsEventInternal(row: AnalyticsEventInput) {
  getPreparedStatement(`
    INSERT INTO analytics_events (session_id, event_type, category, label, value, props, page, user_role, branch, occurred_at, day)
    VALUES (@session_id, @event_type, @category, @label, @value, @props, @page, @user_role, @branch, @occurred_at, @day)
  `).run({
    session_id: row.session_id,
    event_type: row.event_type,
    category: row.category ?? null,
    label: row.label ?? null,
    value: row.value ?? null,
    props: row.props ? JSON.stringify(row.props) : null,
    page: row.page,
    user_role: row.user_role,
    branch: row.branch ?? null,
    occurred_at: row.occurred_at,
    day: row.day,
  });
  // Bump session counters
  const isPageview = row.event_type === "pageview" ? 1 : 0;
  getPreparedStatement(`
    UPDATE analytics_sessions
    SET event_count = event_count + 1,
        pageview_count = pageview_count + ?,
        last_seen_at = ?
    WHERE session_id = ?
  `).run(isPageview, row.occurred_at, row.session_id);
}

export function recordAnalyticsEvent(e: AnalyticsEventInput) {
  const tx = getDb().transaction((row: AnalyticsEventInput) => {
    recordAnalyticsEventInternal(row);
  });
  tx(e);
}

export function endAnalyticsSession(session_id: string, last_seen_at: string) {
  // Compute duration from first_seen_at
  const s = getPreparedStatement("SELECT first_seen_at FROM analytics_sessions WHERE session_id = ?").get(session_id) as { first_seen_at: string } | undefined;
  if (!s) return;
  const start = new Date(s.first_seen_at).getTime();
  const end = new Date(last_seen_at).getTime();
  const dur = Math.max(0, Math.round((end - start) / 1000));
  getPreparedStatement("UPDATE analytics_sessions SET is_active = 0, duration_seconds = ? WHERE session_id = ?").run(dur, session_id);
}

export function getAnalyticsSummary(days = 30) {
  const db = getDb();
  const since = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString().slice(0, 10);
  const totals = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM analytics_sessions WHERE substr(first_seen_at,1,10) >= ?) AS sessions,
      (SELECT COUNT(*) FROM analytics_events WHERE day >= ?) AS events,
      (SELECT COUNT(*) FROM analytics_events WHERE day >= ? AND event_type = 'pageview') AS pageviews,
      (SELECT COUNT(DISTINCT session_id) FROM analytics_events WHERE day >= ?) AS active_users
  `).get(since, since, since, since) as { sessions: number; events: number; pageviews: number; active_users: number };
  const avgSession = db.prepare(`
    SELECT
      ROUND(AVG(duration_seconds), 1) AS avg_duration_seconds,
      ROUND(AVG(event_count), 1) AS avg_events_per_session,
      ROUND(AVG(pageview_count), 1) AS avg_pageviews_per_session
    FROM analytics_sessions
    WHERE substr(first_seen_at,1,10) >= ? AND duration_seconds > 0
  `).get(since) as { avg_duration_seconds: number | null; avg_events_per_session: number | null; avg_pageviews_per_session: number | null };
  return { ...totals, ...avgSession, window_days: days };
}

export function getAnalyticsTimeseries(days = 30) {
  const since = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString().slice(0, 10);
  return getDb().prepare(`
    SELECT day,
      COUNT(*) AS events,
      SUM(CASE WHEN event_type='pageview' THEN 1 ELSE 0 END) AS pageviews,
      COUNT(DISTINCT session_id) AS sessions
    FROM analytics_events
    WHERE day >= ?
    GROUP BY day
    ORDER BY day
  `).all(since);
}

export function getTopLabels(days = 30, event_type = "tab_switch", limit = 10) {
  const since = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString().slice(0, 10);
  return getDb().prepare(`
    SELECT label, COUNT(*) AS hits, COUNT(DISTINCT session_id) AS unique_sessions
    FROM analytics_events
    WHERE day >= ? AND event_type = ? AND label IS NOT NULL
    GROUP BY label
    ORDER BY hits DESC
    LIMIT ?
  `).all(since, event_type, limit);
}

export function getTopActions(days = 30, limit = 10) {
  const since = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString().slice(0, 10);
  return getDb().prepare(`
    SELECT label, category, COUNT(*) AS hits, COUNT(DISTINCT session_id) AS unique_sessions
    FROM analytics_events
    WHERE day >= ? AND event_type IN ('click','form_submit','action') AND label IS NOT NULL
    GROUP BY label
    ORDER BY hits DESC
    LIMIT ?
  `).all(since, limit);
}

export function getTopErrors(days = 30, limit = 10) {
  const since = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString().slice(0, 10);
  return getDb().prepare(`
    SELECT label, COUNT(*) AS hits
    FROM analytics_events
    WHERE day >= ? AND event_type = 'error' AND label IS NOT NULL
    GROUP BY label
    ORDER BY hits DESC
    LIMIT ?
  `).all(since, limit);
}

export function getTopPages(days = 30, limit = 10) {
  const since = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString().slice(0, 10);
  return getDb().prepare(`
    SELECT page, COUNT(*) AS views, COUNT(DISTINCT session_id) AS unique_sessions
    FROM analytics_events
    WHERE day >= ? AND event_type = 'pageview' AND page IS NOT NULL
    GROUP BY page
    ORDER BY views DESC
    LIMIT ?
  `).all(since, limit);
}

export function getTopBranches(days = 30, limit = 10) {
  const since = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString().slice(0, 10);
  return getDb().prepare(`
    SELECT branch, COUNT(DISTINCT session_id) AS sessions, COUNT(*) AS events
    FROM analytics_events
    WHERE day >= ? AND branch IS NOT NULL
    GROUP BY branch
    ORDER BY sessions DESC
    LIMIT ?
  `).all(since, limit);
}

export function getRoleBreakdown(days = 30) {
  const since = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString().slice(0, 10);
  return getDb().prepare(`
    SELECT user_role, COUNT(DISTINCT session_id) AS sessions, COUNT(*) AS events
    FROM analytics_events
    WHERE day >= ?
    GROUP BY user_role
    ORDER BY sessions DESC
  `).all(since);
}

export function getFunnel(steps: string[], days = 30) {
  const since = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString().slice(0, 10);
  const out: Array<{ step: string; users: number; conversion_pct: number | null }> = [];
  let prev: number | null = null;
  for (const step of steps) {
    const row = getDb().prepare(`
      SELECT COUNT(DISTINCT session_id) AS users
      FROM analytics_events
      WHERE day >= ? AND event_type = 'pageview' AND page = ?
    `).get(since, step) as { users: number };
    const conv = prev === null || prev === 0 ? null : Math.round((row.users / prev) * 1000) / 10;
    out.push({ step, users: row.users, conversion_pct: conv });
    prev = row.users;
  }
  return out;
}

export function getRecentEvents(limit = 50) {
  return getDb().prepare(`
    SELECT id, session_id, event_type, category, label, value, page, user_role, branch, occurred_at
    FROM analytics_events
    ORDER BY id DESC
    LIMIT ?
  `).all(limit);
}

export function getAnalyticsSeeded(): boolean {
  const row = getDb().prepare("SELECT COUNT(*) AS c FROM analytics_events").get() as { c: number };
  return row.c > 0;
}

export function applyAnalyticsEventsBatch(events: any[]): number {
  const db = getDb();

  const runBatch = db.transaction((batchEvents: any[]) => {
    let count = 0;
    for (const body of batchEvents) {
      if (!body || !body.session_id || !body.event_type || !body.page) continue;

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
        recordAnalyticsEventInternal({
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
      count++;
    }
    return count;
  });

  return runBatch(events);
}
