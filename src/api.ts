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

export async function fetchMetrics() {
  const r = await fetch(`${BASE}/api/metrics`);
  if (!r.ok) throw new Error(`metrics: ${r.status}`);
  const data = await r.json();
  return mapRow(data);
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

export async function fetchOrders(branch?: string) {
  const url = branch ? `${BASE}/api/orders?branch=${encodeURIComponent(branch)}` : `${BASE}/api/orders`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`orders: ${r.status}`);
  const rows = await r.json();
  return rows.map(mapRow);
}

export async function fetchTargets() {
  const r = await fetch(`${BASE}/api/targets`);
  if (!r.ok) throw new Error(`targets: ${r.status}`);
  const rows = await r.json();
  return rows.map(mapRow);
}

export async function fetchRecipes() {
  const r = await fetch(`${BASE}/api/recipes`);
  if (!r.ok) throw new Error(`recipes: ${r.status}`);
  const rows = await r.json();
  return rows.map((row: any) => Object.assign(mapRow(row), {
    ingredients: (row.ingredients || "").split("|"),
    allergens: (row.allergens || "").split("|"),
  }));
}

export async function fetchTasks() {
  const r = await fetch(`${BASE}/api/tasks`);
  if (!r.ok) throw new Error(`tasks: ${r.status}`);
  const rows = await r.json();
  return rows.map(mapRow);
}

export async function fetchWaste() {
  const r = await fetch(`${BASE}/api/waste`);
  if (!r.ok) throw new Error(`waste: ${r.status}`);
  const rows = await r.json();
  return rows.map(mapRow);
}

export async function fetchHours() {
  const r = await fetch(`${BASE}/api/hours`);
  if (!r.ok) throw new Error(`hours: ${r.status}`);
  const rows = await r.json();
  return rows.map(mapRow);
}

export async function fetchInventory() {
  const r = await fetch(`${BASE}/api/inventory`);
  if (!r.ok) throw new Error(`inventory: ${r.status}`);
  const rows = await r.json();
  return rows.map(mapRow);
}

export async function fetchLogs(week: string) {
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
  }));
}

export async function fetchAlerts() {
  const r = await fetch(`${BASE}/api/alerts`);
  if (!r.ok) throw new Error(`alerts: ${r.status}`);
  const rows = await r.json();
  return rows.map(mapRow);
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
  const r = await fetch(`${BASE}/api/analytics/top-labels?days=${days}&event_type=tab_switch&limit=10`);
  if (!r.ok) throw new Error(`analytics top tabs: ${r.status}`);
  return r.json();
}
export async function fetchTopActions(days = 30) {
  const r = await fetch(`${BASE}/api/analytics/top-actions?days=${days}&limit=8`);
  if (!r.ok) throw new Error(`analytics top actions: ${r.status}`);
  return r.json();
}
export async function fetchTopErrors(days = 30) {
  const r = await fetch(`${BASE}/api/analytics/top-errors?days=${days}`);
  if (!r.ok) throw new Error(`analytics top errors: ${r.status}`);
  return r.json();
}
export async function fetchTopBranches(days = 30) {
  const r = await fetch(`${BASE}/api/analytics/top-branches?days=${days}`);
  if (!r.ok) throw new Error(`analytics top branches: ${r.status}`);
  return r.json();
}
export async function fetchRoleBreakdown(days = 30) {
  const r = await fetch(`${BASE}/api/analytics/roles?days=${days}`);
  if (!r.ok) throw new Error(`analytics roles: ${r.status}`);
  return r.json();
}
export async function fetchFunnel(days = 30, steps = "Overview,Production,Sell,Waste,Hours,Reports") {
  const r = await fetch(`${BASE}/api/analytics/funnel?days=${days}&steps=${encodeURIComponent(steps)}`);
  if (!r.ok) throw new Error(`analytics funnel: ${r.status}`);
  return r.json();
}
export async function fetchRecentEvents(limit = 15) {
  const r = await fetch(`${BASE}/api/analytics/recent?limit=${limit}`);
  if (!r.ok) throw new Error(`analytics recent: ${r.status}`);
  return r.json();
}
