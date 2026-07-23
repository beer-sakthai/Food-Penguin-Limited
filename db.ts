import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "food-penguin.db");

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initSchema();
    seedIfEmpty();
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
  `);
}

function seedIfEmpty() {
  const count = db.prepare("SELECT COUNT(*) as c FROM metrics").get() as { c: number };
  if (count.c > 0) return;

  const insert = db.prepare(`
    INSERT OR REPLACE INTO metrics (id, sales_today, sales_growth, production_items, production_target, waste_cost, waste_reduction, hours_scheduled, overtime_hours, ai_health_score)
    VALUES (1, 14820, 12.4, 11240, 11500, 412.50, 18.2, 124, 0, 94)
  `);
  insert.run();

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
  for (const o of orders) insertOrder.run(...o);

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
  for (const t of targets) insertTarget.run(...t);

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
  for (const r of recipes) insertRecipe.run(...r);

  const insertTask = db.prepare(
    "INSERT OR REPLACE INTO production_tasks (id, item_name, assigned_to, status, quantity, priority, date) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );
  const tasks = [
    ["PT-301", "Tokyo Dragon Roll", "Chef Skipper", "Cooking", 2, "high", "2026-06-28"],
    ["PT-302", "Kyoto Salmon Sashimi Platter", "Chef Private", "Cooking", 1, "medium", "2026-06-27"],
    ["PT-303", "Spicy Bluefin Tuna Roll", "Kitchen Aide Rico", "In Queue", 1, "low", "2026-06-20"],
    ["PT-304", "California Roll Classic", "Chef Kowalski", "Prepared", 3, "high", "2026-06-19"],
  ];
  for (const t of tasks) insertTask.run(...t);

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
  for (const w of waste) insertWaste.run(...w);

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
  for (const h of hours) insertHours.run(...h);

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
  for (const i of inventory) insertInventory.run(...i);

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
  for (const l of logs) insertLog.run(...l);

  const insertAlert = db.prepare(
    "INSERT OR REPLACE INTO alerts (id, timestamp, date, sensor, value, status, message) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );
  const alerts = [
    ["A-01", "14:12:30", "2026-06-28", "Cold Room Freezy-01", "-19.4°C", "normal", "Temperature remains stable at threshold."],
    ["A-02", "14:08:15", "2026-06-28", "Sushi Rice Warm Unit A", "57.0°C", "normal", "Optimal preservation raw rice temperature verified."],
    ["A-03", "13:55:00", "2026-06-27", "Seafood Deep Freezer", "-12.1°C", "warning", "Slight thermal climb detected during door cycle."],
    ["A-04", "13:10:45", "2026-06-19", "Dishwasher Rinse Tank", "82.5°C", "normal", "Sanitation high-temp rinse verified."],
  ];
  for (const a of alerts) insertAlert.run(...a);
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

export function updateMetrics(data: Record<string, number>) {
  const fields = Object.keys(data).map(k => `${k} = ?`).join(", ");
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
