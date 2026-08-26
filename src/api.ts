import type { CoreMetrics, SalesOrder, CompanyTarget, Recipe, ProductionTask, WasteRecord, EmployeeHour, InventoryItem, RealtimeAlert, DailyOperationalLog } from "./types";

const BASE = "";

function snakeToCamel(s: string): string {
  return s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

export function mapRow(row: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(row)) {
    out[snakeToCamel(k)] = v;
  }
  return out;
}

/**
 * Thrown when the API is not reachable — either it answered with an error
 * status, or something that is not JSON came back.
 *
 * The latter is the normal case on a static-only deployment (e.g. Vercel):
 * the Express backend is not running, so `/api/*` falls through to the SPA
 * rewrite and returns `index.html` with a 200. Callers treat this as "no
 * backend" and fall back to the bundled data set.
 */
export class ApiUnavailableError extends Error {
  constructor(label: string, detail: string) {
    super(`${label}: ${detail}`);
    this.name = "ApiUnavailableError";
  }
}

async function requestJson(url: string, label: string, init?: RequestInit): Promise<any> {
  let r: Response;

  // Inject Authorization for analytics routes
  const myInit = init || {};
  if (url.includes("/api/analytics")) {
    const token = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_ANALYTICS_API_KEY
      ? import.meta.env.VITE_ANALYTICS_API_KEY
      : "fp-analytics-secret-key";

    myInit.headers = {
      ...myInit.headers,
      "Authorization": `Bearer ${token}`
    };
  }

  try {
    r = await fetch(url, myInit);
  } catch (err) {
    throw new ApiUnavailableError(label, `network error (${err instanceof Error ? err.message : String(err)})`);
  }

  if (!r.ok) throw new ApiUnavailableError(label, String(r.status));

  // A static host answers /api/* with the SPA shell (HTML, status 200).
  // Detect that here so callers see "no API backend" rather than an opaque
  // "Unexpected token '<'" JSON parse error.
  const contentType = r.headers.get("content-type") || "";
  if (!contentType.includes("json")) {
    throw new ApiUnavailableError(label, `no API backend (expected JSON, got "${contentType || "unknown"}")`);
  }

  try {
    return await r.json();
  } catch (err) {
    throw new ApiUnavailableError(label, `malformed JSON (${err instanceof Error ? err.message : String(err)})`);
  }
}

function postJson(url: string, label: string, body: unknown, method: "POST" | "PUT" = "POST") {
  return requestJson(url, label, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function fetchMetrics(): Promise<CoreMetrics> {
  const data = await requestJson(`${BASE}/api/metrics`, "metrics");
  return mapRow(data) as CoreMetrics;
}

export async function updateMetrics(data: Record<string, number>) {
  return postJson(`${BASE}/api/metrics`, "metrics update", data, "PUT");
}

export async function fetchOrders(branch?: string): Promise<SalesOrder[]> {
  const url = branch ? `${BASE}/api/orders?branch=${encodeURIComponent(branch)}` : `${BASE}/api/orders`;
  const rows = await requestJson(url, "orders");
  return rows.map(mapRow) as SalesOrder[];
}

export async function fetchTargets(): Promise<CompanyTarget[]> {
  const rows = await requestJson(`${BASE}/api/targets`, "targets");
  return rows.map(mapRow) as CompanyTarget[];
}

export async function fetchRecipes(): Promise<Recipe[]> {
  const rows = await requestJson(`${BASE}/api/recipes`, "recipes");
  return rows.map((row: any) => Object.assign(mapRow(row), {
    ingredients: (row.ingredients || "").split("|"),
    allergens: (row.allergens || "").split("|"),
  })) as Recipe[];
}

export async function fetchTasks(): Promise<ProductionTask[]> {
  const rows = await requestJson(`${BASE}/api/tasks`, "tasks");
  return rows.map(mapRow) as ProductionTask[];
}

export async function fetchWaste(): Promise<WasteRecord[]> {
  const rows = await requestJson(`${BASE}/api/waste`, "waste");
  return rows.map(mapRow) as WasteRecord[];
}

export async function fetchHours(): Promise<EmployeeHour[]> {
  const rows = await requestJson(`${BASE}/api/hours`, "hours");
  return rows.map(mapRow) as EmployeeHour[];
}

export async function fetchInventory(): Promise<InventoryItem[]> {
  const rows = await requestJson(`${BASE}/api/inventory`, "inventory");
  return rows.map(mapRow) as InventoryItem[];
}

export async function fetchLogs(week: string): Promise<DailyOperationalLog[]> {
  const rows = await requestJson(`${BASE}/api/logs?week=${encodeURIComponent(week)}`, "logs");
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
  const rows = await requestJson(`${BASE}/api/alerts`, "alerts");
  return rows.map(mapRow) as RealtimeAlert[];
}

// ==========================================
// Analytics API (self-hosted)
// ==========================================
export async function fetchAnalyticsSummary(days = 30) {
  return requestJson(`${BASE}/api/analytics/summary?days=${days}`, "analytics summary");
}
export async function fetchAnalyticsTimeseries(days = 30) {
  return requestJson(`${BASE}/api/analytics/timeseries?days=${days}`, "analytics timeseries");
}
export async function fetchTopTabs(days = 30) {
  return requestJson(`${BASE}/api/analytics/top-tabs?days=${days}`, "analytics top tabs");
}
export async function fetchTopActions(days = 30) {
  return requestJson(`${BASE}/api/analytics/top-actions?days=${days}`, "analytics top actions");
}
export async function trackEventBatch(events: any[]) {
  return postJson(`${BASE}/api/analytics/track-batch`, "analytics batch", { events });
}
