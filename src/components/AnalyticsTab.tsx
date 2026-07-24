// Saksee · 2026-07-24 · commissioned by Beer
// Analytics dashboard for Food Penguin Limited.
// Self-hosted analytics — zero cost, full ownership, all data in SQLite.

import React, { useEffect, useState, useMemo } from "react";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis,
  Tooltip, CartesianGrid, ResponsiveContainer, Legend,
} from "recharts";
import {
  Activity, Users, Clock, BarChart3, AlertTriangle, MapPin,
  ArrowUpRight, TrendingUp, RefreshCw, Layers,
} from "lucide-react";

const api = (path: string) => fetch(path).then((r) => {
  if (!r.ok) throw new Error(`${path}: ${r.status}`);
  return r.json();
});

const WINDOWS = [
  { label: "7d",  days: 7 },
  { label: "30d", days: 30 },
];

const FUNNEL_DEFAULT = "Overview,Production,Sell,Waste,Hours,Reports";

function KpiCard({
  label, value, sub, icon, accent = "var(--accent)",
}: {
  label: string; value: React.ReactNode; sub?: React.ReactNode; icon: React.ReactNode; accent?: string;
}) {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-[var(--muted)] uppercase tracking-wide">{label}</span>
        <span className="w-7 h-7 rounded-md flex items-center justify-center" style={{ color: accent, background: "var(--panel)" }}>{icon}</span>
      </div>
      <div className="text-2xl font-bold text-[var(--text)] leading-tight">{value}</div>
      {sub && <div className="text-[11px] text-[var(--muted)] font-mono">{sub}</div>}
    </div>
  );
}

function BarRow({
  rows, valueKey = "hits", labelKey = "label", formatValue, max = 10,
}: {
  rows: any[]; valueKey?: string; labelKey?: string; formatValue?: (n: number) => string; max?: number;
}) {
  if (!rows || rows.length === 0) {
    return <div className="text-xs text-[var(--muted)] font-mono py-6 text-center">no data</div>;
  }
  const top = rows.slice(0, max);
  const peak = Math.max(...top.map((r) => Number(r[valueKey]) || 0), 1);
  return (
    <div className="space-y-2">
      {top.map((r, i) => {
        const v = Number(r[valueKey]) || 0;
        const pct = (v / peak) * 100;
        return (
          <div key={i} className="grid grid-cols-[140px_1fr_auto] items-center gap-3 text-xs">
            <div className="text-[var(--text)] font-medium truncate" title={r[labelKey]}>{r[labelKey]}</div>
            <div className="h-2 bg-[var(--panel)] rounded overflow-hidden">
              <div className="h-full bg-[var(--accent)] rounded transition-all" style={{ width: `${pct}%` }} />
            </div>
            <div className="font-mono text-[var(--muted)] tabular-nums">
              {formatValue ? formatValue(v) : v.toLocaleString()}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AnalyticsTab({ theme }: { theme: "light" | "dark" | "metallic" }) {
  const [window, setWindow] = useState(30);
  const [summary, setSummary] = useState<any>(null);
  const [series, setSeries] = useState<any[]>([]);
  const [topTabs, setTopTabs] = useState<any[]>([]);
  const [topActions, setTopActions] = useState<any[]>([]);
  const [topErrors, setTopErrors] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [funnel, setFunnel] = useState<any[]>([]);
  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const d = window;
      const [s, t, tabs, actions, errs, br, rl, fn, rc] = await Promise.all([
        api(`/api/analytics/summary?days=${d}`),
        api(`/api/analytics/timeseries?days=${d}`),
        api(`/api/analytics/top-labels?days=${d}&event_type=tab_switch&limit=10`),
        api(`/api/analytics/top-actions?days=${d}&limit=8`),
        api(`/api/analytics/top-errors?days=${d}`),
        api(`/api/analytics/top-branches?days=${d}`),
        api(`/api/analytics/roles?days=${d}`),
        api(`/api/analytics/funnel?days=${d}&steps=${FUNNEL_DEFAULT}`),
        api(`/api/analytics/recent?limit=15`),
      ]);
      setSummary(s);
      setSeries(t);
      setTopTabs(tabs);
      setTopActions(actions);
      setTopErrors(errs);
      setBranches(br);
      setRoles(rl);
      setFunnel(fn);
      setRecent(rc);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [window]);

  // For a tighter chart, fill any missing days with zeros
  const seriesComplete = useMemo(() => {
    if (!series || series.length === 0) return [];
    const out: any[] = [];
    const first = new Date(series[0].day);
    const last = new Date(series[series.length - 1].day);
    for (let d = new Date(first); d <= last; d.setUTCDate(d.getUTCDate() + 1)) {
      const key = d.toISOString().slice(0, 10);
      const row = series.find((r) => r.day === key);
      out.push({
        day: key.slice(5), // MM-DD
        events: row?.events || 0,
        pageviews: row?.pageviews || 0,
        sessions: row?.sessions || 0,
      });
    }
    return out;
  }, [series]);

  const totalEvents = series.reduce((a, r) => a + (r.events || 0), 0);
  const totalSessions = series.reduce((a, r) => a + (r.sessions || 0), 0);
  const totalErrors = topErrors.reduce((a, r) => a + (r.hits || 0), 0);
  const peakDay = seriesComplete.reduce(
    (m, r) => (r.events > (m?.events || 0) ? r : m),
    { day: "-", events: 0, sessions: 0 },
  );

  // Insights — surfaced from the data so Beer can see "what the analytics are telling us"
  const insights = useMemo(() => {
    if (!summary || series.length === 0) return [];
    const out: string[] = [];
    if (summary.avg_duration_seconds && summary.avg_duration_seconds < 600) {
      out.push(`Sessions are short (avg ${Math.round(summary.avg_duration_seconds / 60)}m). Manager adoption may be low — consider a daily standup tour.`);
    }
    const topTab = topTabs[0];
    if (topTab && summary.sessions) {
      const reach = Math.round((topTab.unique_sessions / summary.sessions) * 100);
      out.push(`"${topTab.label}" reaches ${reach}% of sessions — it's the de-facto landing tab.`);
    }
    if (funnel.length >= 2) {
      const f0 = funnel[0];
      const fN = funnel[funnel.length - 1];
      if (f0.users && fN.users) {
        const endReach = Math.round((fN.users / f0.users) * 100);
        out.push(`End-to-end funnel: ${f0.users} → ${fN.users} (${endReach}% reach from Overview to ${fN.step}).`);
      }
    }
    if (totalErrors > 0) {
      out.push(`${totalErrors} error events in ${window}d. Top culprit: "${topErrors[0]?.label}".`);
    }
    const ad = adminShare(summary.sessions, roles);
    if (ad.share) {
      out.push(`Admins generate ${ad.share}% of session events — the heaviest users.`);
    }
    return out;
  }, [summary, topTabs, funnel, topErrors, roles, totalErrors, window]);

  return (
    <div className="flex-1 overflow-auto bg-[var(--bg)]">
      <div className="px-6 py-5 max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-[var(--text)] flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[var(--accent)]" />
              Analytics
            </h1>
            <p className="text-xs text-[var(--muted)] font-mono mt-0.5">
              self-hosted · {summary?.events?.toLocaleString() || 0} events · {summary?.sessions || 0} sessions · {window}d window
            </p>
          </div>
          <div className="flex items-center gap-2">
            {WINDOWS.map((w) => (
              <button
                key={w.days}
                type="button"
                onClick={() => setWindow(w.days)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                  window === w.days
                    ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                    : "bg-[var(--surface)] text-[var(--muted)] border-[var(--border)] hover:text-[var(--text)]"
                }`}
              >
                {w.label}
              </button>
            ))}
            <button
              type="button"
              onClick={load}
              className="px-3 py-1.5 text-xs font-medium rounded-md border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)] flex items-center gap-1.5"
              title="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 rounded-lg p-3 text-sm">
            {error}
          </div>
        )}

        {/* KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard
            label="Sessions"
            value={(summary?.sessions || 0).toLocaleString()}
            sub={`${summary?.active_users || 0} unique users`}
            icon={<Users className="w-4 h-4" />}
          />
          <KpiCard
            label="Pageviews"
            value={(summary?.pageviews || 0).toLocaleString()}
            sub={`avg ${summary?.avg_pageviews_per_session || 0}/session`}
            icon={<Activity className="w-4 h-4" />}
          />
          <KpiCard
            label="Avg duration"
            value={
              summary?.avg_duration_seconds
                ? `${Math.round(summary.avg_duration_seconds / 60)}m ${Math.round(summary.avg_duration_seconds % 60)}s`
                : "—"
            }
            sub={`avg ${summary?.avg_events_per_session || 0} events/session`}
            icon={<Clock className="w-4 h-4" />}
          />
          <KpiCard
            label="Errors"
            value={totalErrors.toLocaleString()}
            sub={totalErrors === 0 ? "clean window" : "across session"}
            icon={<AlertTriangle className="w-4 h-4" />}
            accent={totalErrors === 0 ? "var(--accent)" : "#e11d48"}
          />
        </div>

        {/* Time-series */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[var(--text)] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[var(--accent)]" />
              Daily activity
            </h2>
            <div className="text-[11px] text-[var(--muted)] font-mono">
              peak: {peakDay.day} · {peakDay.events} events
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={seriesComplete} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                <defs>
                  <linearGradient id="evGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "var(--muted)" }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10, fill: "var(--muted)" }} />
                <Tooltip
                  contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12 }}
                  labelStyle={{ color: "var(--text)" }}
                />
                <Area type="monotone" dataKey="events" name="Events" stroke="var(--accent)" fill="url(#evGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="pageviews" name="Pageviews" stroke="#0d9488" fill="transparent" strokeWidth={1.5} strokeDasharray="4 3" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3-col grid: top tabs / actions / errors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
            <h3 className="text-xs font-semibold text-[var(--text)] uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[var(--accent)]" />
              Top tabs
            </h3>
            <BarRow rows={topTabs} valueKey="hits" labelKey="label" />
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
            <h3 className="text-xs font-semibold text-[var(--text)] uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <ArrowUpRight className="w-3.5 h-3.5 text-[var(--accent)]" />
              Top actions
            </h3>
            <BarRow rows={topActions} valueKey="hits" labelKey="label" max={8} />
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
            <h3 className="text-xs font-semibold text-[var(--text)] uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              Errors
            </h3>
            {totalErrors === 0 ? (
              <div className="text-xs text-[var(--muted)] font-mono py-6 text-center">no errors 🎉</div>
            ) : (
              <BarRow rows={topErrors} valueKey="hits" labelKey="label" max={6} />
            )}
          </div>
        </div>

        {/* 2-col: branches + roles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
            <h3 className="text-xs font-semibold text-[var(--text)] uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[var(--accent)]" />
              By branch
            </h3>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={branches} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="branch" tick={{ fontSize: 10, fill: "var(--muted)" }} interval={0} angle={-12} textAnchor="end" height={48} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--muted)" }} />
                  <Tooltip
                    contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12 }}
                  />
                  <Bar dataKey="sessions" name="Sessions" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
            <h3 className="text-xs font-semibold text-[var(--text)] uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[var(--accent)]" />
              By role
            </h3>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roles} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="user_role" tick={{ fontSize: 10, fill: "var(--muted)" }} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--muted)" }} />
                  <Tooltip
                    contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12 }}
                  />
                  <Bar dataKey="events" name="Events" fill="#0d9488" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="sessions" name="Sessions" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Funnel + recent events */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
            <h3 className="text-xs font-semibold text-[var(--text)] uppercase tracking-wide mb-3">
              Tab funnel — pageview reach
            </h3>
            <div className="space-y-2">
              {funnel.map((step, i) => {
                const pct = step.users && funnel[0].users ? (step.users / funnel[0].users) * 100 : 0;
                return (
                  <div key={step.step} className="grid grid-cols-[110px_1fr_auto] items-center gap-3 text-xs">
                    <div className="text-[var(--text)] font-medium">{step.step}</div>
                    <div className="h-3 bg-[var(--panel)] rounded overflow-hidden relative">
                      <div
                        className="h-full bg-[var(--accent)] rounded transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="font-mono text-[var(--muted)] tabular-nums whitespace-nowrap">
                      {step.users}
                      {i > 0 && step.conversion_pct !== null && (
                        <span className={`ml-1 ${step.conversion_pct < 50 ? "text-rose-500" : "text-[var(--muted)]"}`}>
                          ({step.conversion_pct}%)
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
            <h3 className="text-xs font-semibold text-[var(--text)] uppercase tracking-wide mb-3">
              Recent events (live)
            </h3>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {recent.length === 0 ? (
                <div className="text-xs text-[var(--muted)] font-mono py-6 text-center">no events yet</div>
              ) : recent.map((e: any) => (
                <div key={e.id} className="grid grid-cols-[60px_70px_1fr_80px] items-center gap-2 text-[11px] font-mono py-1 border-b border-[var(--border)] last:border-0">
                  <span className="text-[var(--muted)]">{e.occurred_at?.slice(11, 19) || ""}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold text-center ${
                    e.event_type === "error" ? "bg-rose-500/15 text-rose-700 dark:text-rose-300" :
                    e.event_type === "pageview" || e.event_type === "tab_switch" ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" :
                    e.event_type === "session_start" || e.event_type === "session_end" ? "bg-slate-500/15 text-[var(--muted)]" :
                    "bg-[var(--accent)]/15 text-[var(--accent)]"
                  }`}>
                    {e.event_type.slice(0, 6)}
                  </span>
                  <span className="text-[var(--text)] truncate" title={e.label || e.event_type}>
                    {e.label || e.event_type} <span className="text-[var(--muted)]">· {e.page}</span>
                  </span>
                  <span className="text-[var(--muted)] truncate text-right" title={e.user_role + (e.branch ? " · " + e.branch : "")}>
                    {e.user_role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Insights panel — the "study them" part */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
          <h3 className="text-xs font-semibold text-[var(--text)] uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-[var(--accent)]" />
            What the data is telling us
          </h3>
          {insights.length === 0 ? (
            <div className="text-xs text-[var(--muted)] font-mono">insights will appear once data is loaded</div>
          ) : (
            <ul className="space-y-2 text-sm text-[var(--text)]">
              {insights.map((i, idx) => (
                <li key={idx} className="flex gap-2">
                  <span className="text-[var(--accent)] font-mono">→</span>
                  <span>{i}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function adminShare(totalSessions: number, roles: any[]) {
  if (!roles || !totalSessions) return { share: 0 };
  const admin = roles.find((r) => r.user_role === "Admin");
  if (!admin) return { share: 0 };
  const share = Math.round((admin.sessions / totalSessions) * 100);
  return { share };
}
