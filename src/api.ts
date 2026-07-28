import type { CoreMetrics, SalesOrder, CompanyTarget, Recipe, ProductionTask, WasteRecord, EmployeeHour, InventoryItem, RealtimeAlert, DailyOperationalLog } from "./types";

const BASE = "";

function snakeToCamel(s: string): string {
  return s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function mapRow(row: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(row)) {
    out[snakeToCamel(k)] = v;
  }
  return out;
}

// ==========================================
// Auth
// ==========================================
export interface AuthUser {
  username: string;
  role: "Admin" | "Manager" | "Staff" | "User";
}

export async function login(username: string, password: string): Promise<AuthUser> {
  const r = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data?.error || `login: ${r.status}`);
  return data as AuthUser;
}

export async function logout(): Promise<void> {
  await fetch(`${BASE}/api/auth/logout`, { method: "POST" });
}

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  const r = await fetch(`${BASE}/api/auth/me`);
  if (!r.ok) return null;
  return r.json();
}

export async function fetchMetrics(): Promise<CoreMetrics> {
  const r = await fetch(`${BASE}/api/metrics`);
  if (!r.ok) throw new Error(`metrics: ${r.status}`);
  const data = await r.json();
  return mapRow(data) as CoreMetrics;
}

export async function updateMetrics(data: Record<string, number>) {
  const r = await fetch(`${BASE}/api/metrics`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error(`metrics update: ${r.status}`);
  return r.json();
}

export async function fetchOrders(branch?: string): Promise<SalesOrder[]> {
  const url = branch ? `${BASE}/api/orders?branch=${encodeURIComponent(branch)}` : `${BASE}/api/orders`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`orders: ${r.status}`);
  const rows = await r.json();
  return rows.map(mapRow) as SalesOrder[];
}

export async function fetchTargets(): Promise<CompanyTarget[]> {
  const r = await fetch(`${BASE}/api/targets`);
  if (!r.ok) throw new Error(`targets: ${r.status}`);
  const rows = await r.json();
  return rows.map(mapRow) as CompanyTarget[];
}

export async function fetchRecipes(): Promise<Recipe[]> {
  const r = await fetch(`${BASE}/api/recipes`);
  if (!r.ok) throw new Error(`recipes: ${r.status}`);
  const rows = await r.json();
  return rows.map((row: any) => Object.assign(mapRow(row), {
    ingredients: (row.ingredients || "").split("|"),
    allergens: (row.allergens || "").split("|"),
  })) as Recipe[];
}

export async function fetchTasks(): Promise<ProductionTask[]> {
  const r = await fetch(`${BASE}/api/tasks`);
  if (!r.ok) throw new Error(`tasks: ${r.status}`);
  const rows = await r.json();
  return rows.map(mapRow) as ProductionTask[];
}

export async function fetchWaste(): Promise<WasteRecord[]> {
  const r = await fetch(`${BASE}/api/waste`);
  if (!r.ok) throw new Error(`waste: ${r.status}`);
  const rows = await r.json();
  return rows.map(mapRow) as WasteRecord[];
}

export async function fetchHours(): Promise<EmployeeHour[]> {
  const r = await fetch(`${BASE}/api/hours`);
  if (!r.ok) throw new Error(`hours: ${r.status}`);
  const rows = await r.json();
  return rows.map(mapRow) as EmployeeHour[];
}

export async function fetchInventory(): Promise<InventoryItem[]> {
  const r = await fetch(`${BASE}/api/inventory`);
  if (!r.ok) throw new Error(`inventory: ${r.status}`);
  const rows = await r.json();
  return rows.map(mapRow) as InventoryItem[];
}

export async function fetchLogs(week: string): Promise<DailyOperationalLog[]> {
  const r = await fetch(`${BASE}/api/logs?week=${encodeURIComponent(week)}`);
  if (!r.ok) throw new Error(`logs: ${r.status}`);
  const rows = await r.json();
  return rows.map((row: any) => Object.assign(mapRow(row), {
    cogs: {
      tazaki: row.cogs_tazaki,
      sysco: row.cogs_sysco,
      bulza: row.cogs_bulza,
      sticker: row.cogs_sticker,
      others: row.cogs_others,
    },
  })) as DailyOperationalLog[];
}

export async function fetchAlerts(): Promise<RealtimeAlert[]> {
  const r = await fetch(`${BASE}/api/alerts`);
  if (!r.ok) throw new Error(`alerts: ${r.status}`);
  const rows = await r.json();
  return rows.map(mapRow) as RealtimeAlert[];
}

// ==========================================
// Analytics API (self-hosted)
// ==========================================
export async function fetchAnalyticsSummary(days = 30) {
  const r = await fetch(`${BASE}/api/analytics/summary?days=${days}`);
  if (!r.ok) throw new Error(`analytics summary: ${r.status}`);
  return r.json();
}
export async function fetchAnalyticsTimeseries(days = 30) {
  const r = await fetch(`${BASE}/api/analytics/timeseries?days=${days}`);
  if (!r.ok) throw new Error(`analytics timeseries: ${r.status}`);
  return r.json();
}
export async function fetchTopTabs(days = 30) {
  const r = await fetch(`${BASE}/api/analytics/top-tabs?days=${days}`);
  if (!r.ok) throw new Error(`analytics top tabs: ${r.status}`);
  return r.json();
}
export async function fetchTopActions(days = 30) {
  const r = await fetch(`${BASE}/api/analytics/top-actions?days=${days}`);
  if (!r.ok) throw new Error(`analytics top actions: ${r.status}`);
  return r.json();
}
export async function trackEventBatch(events: any[]) {
  const r = await fetch(`${BASE}/api/analytics/track-batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ events }),
  });
  if (!r.ok) throw new Error(`analytics batch: ${r.status}`);
  return r.json();
}
