// Saksee · 2026-07-24 · feat/new-design-system
import React, { useEffect, useState, useMemo } from "react";
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { Activity, Users, Clock, BarChart3, AlertTriangle, MapPin, ArrowUpRight, TrendingUp, RefreshCw, Layers } from "lucide-react";

const api = (path: string) => fetch(path).then(r => { if (!r.ok) throw new Error(`${path}: ${r.status}`); return r.json(); });
const WINDOWS = [{ label: "7d", days: 7 }, { label: "30d", days: 30 }];

function KpiCard({ label, value, sub, icon }: { label: string; value: React.ReactNode; sub?: React.ReactNode; icon: React.ReactNode; }) {
  return (
    <div className="card card-hover">
      <div className="flex items-center justify-between">
        <span className="metric-label">{label}</span>
        <span className="w-7 h-7 rounded-md bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent)]">{icon}</span>
      </div>
      <div className="mt-2 metric-value">{value}</div>
      {sub && <div className="mt-1 text-[11px] text-[var(--muted)]">{sub}</div>}
    </div>
  );
}

function BarRow({ rows, valueKey = "hits", labelKey = "label", max = 8 }: { rows: any[]; valueKey?: string; labelKey?: string; max?: number; }) {
  if (!rows || rows.length === 0) return <div className="text-xs text-[var(--muted)] py-6 text-center">no data</div>;
  const top = rows.slice(0, max);
  const peak = Math.max(...top.map(r => Number(r[valueKey]) || 0), 1);
  return (
    <div className="space-y-2.5">
      {top.map((r, i) => {
        const v = Number(r[valueKey]) || 0;
        const pct = (v / peak) * 100;
        return (
          <div key={i} className="grid grid-cols-[140px_1fr_60px] items-center gap-3 text-xs">
            <div className="text-[var(--text)] font-medium truncate" title={r[labelKey]}>{r[labelKey]}</div>
            <div className="h-1.5 bg-[var(--panel)] rounded overflow-hidden">
              <div className="h-full bg-[var(--accent)] rounded" style={{ width: `${pct}%` }} />
            </div>
            <div className="font-mono text-[var(--muted)] tabular-nums text-right">{v.toLocaleString()}</div>
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
  const [funnel, setFunnel] = useState<any[]>([]);
  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const d = window;
      const [s, t, tabs, actions, errs, br, fn, rc] = await Promise.all([
        api(`/api/analytics/summary?days=${d}`),
        api(`/api/analytics/timeseries?days=${d}`),
        api(`/api/analytics/top-labels?days=${d}&event_type=tab_switch&limit=10`),
        api(`/api/analytics/top-actions?days=${d}&limit=8`),
        api(`/api/analytics/top-errors?days=${d}`),
        api(`/api/analytics/top-branches?days=${d}`),
        api(`/api/analytics/funnel?days=${d}&steps=Overview,Production,Sell,Waste,Hours,Reports`),
        api(`/api/analytics/recent?limit=8`),
      ]);
      setSummary(s); setSeries(t); setTopTabs(tabs); setTopActions(actions);
      setTopErrors(errs); setBranches(br); setFunnel(fn); setRecent(rc);
    } catch (e) { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [window]);

  const seriesComplete = useMemo(() => {
    if (!series || series.length === 0) return [];
    const out: any[] = [];
    const first = new Date(series[0].day);
    const last = new Date(series[series.length - 1].day);
    for (let d = new Date(first); d <= last; d.setUTCDate(d.getUTCDate() + 1)) {
      const key = d.toISOString().slice(0, 10);
      const row = series.find(r => r.day === key);
      out.push({ day: key.slice(5), events: row?.events || 0, pageviews: row?.pageviews || 0, sessions: row?.sessions || 0 });
    }
    return out;
  }, [series]);

  const peakDay = seriesComplete.reduce((m, r) => (r.events > (m?.events || 0) ? r : m), { day: "-", events: 0 });
  const totalErrors = topErrors.reduce((a, r) => a + (r.hits || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-[var(--accent)]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[var(--text)]">Analytics</h1>
            <p className="text-xs text-[var(--muted)]">{summary?.events?.toLocaleString() || 0} events · {summary?.sessions || 0} sessions · {window}d</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {WINDOWS.map(w => (
            <button
              key={w.days}
              type="button"
              onClick={() => setWindow(w.days)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors ${
                window === w.days
                  ? "bg-[var(--accent)] text-[var(--bg)] border-[var(--accent)]"
                  : "bg-[var(--surface)] text-[var(--muted)] border-[var(--border)] hover:text-[var(--text)] hover:bg-[var(--panel)]"
              }`}
            >
              {w.label}
            </button>
          ))}
          <button
            type="button"
            onClick={load}
            className="btn btn-ghost px-3 py-1.5"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Sessions" value={(summary?.sessions || 0).toLocaleString()} sub={`${summary?.active_users || 0} unique`} icon={<Users className="w-4 h-4" />} />
        <KpiCard label="Pageviews" value={(summary?.pageviews || 0).toLocaleString()} sub={`avg ${summary?.avg_pageviews_per_session || 0}/sess`} icon={<Activity className="w-4 h-4" />} />
        <KpiCard label="Avg duration" value={summary?.avg_duration_seconds ? `${Math.round(summary.avg_duration_seconds / 60)}m` : "—"} sub={`avg ${summary?.avg_events_per_session || 0} ev/sess`} icon={<Clock className="w-4 h-4" />} />
        <KpiCard label="Errors" value={totalErrors.toLocaleString()} sub={totalErrors === 0 ? "clean window" : "session"} icon={<AlertTriangle className="w-4 h-4" />} />
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Daily activity
          </h2>
          <div className="text-[11px] text-[var(--muted)] font-mono">peak: {peakDay.day} · {peakDay.events}</div>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={seriesComplete} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
              <defs>
                <linearGradient id="evGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="events" name="Events" stroke="var(--accent)" fill="url(#evGrad)" strokeWidth={2} activeDot={{ r: 4 }} />
              <Area type="monotone" dataKey="pageviews" name="Pageviews" stroke="var(--muted)" fill="transparent" strokeWidth={1.5} strokeDasharray="4 3" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <h3 className="section-title mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4" /> Top tabs
          </h3>
          <BarRow rows={topTabs} valueKey="hits" labelKey="label" />
        </div>
        <div className="card">
          <h3 className="section-title mb-4 flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4" /> Top actions
          </h3>
          <BarRow rows={topActions} valueKey="hits" labelKey="label" max={6} />
        </div>
        <div className="card">
          <h3 className="section-title mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[var(--warn)]" /> Errors
          </h3>
          {totalErrors === 0 ? <div className="text-xs text-[var(--muted)] py-6 text-center">no errors</div> : <BarRow rows={topErrors} valueKey="hits" labelKey="label" max={5} />}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="section-title mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4" /> By branch
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branches} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="branch" tick={{ fontSize: 10, fill: "var(--muted)" }} interval={0} angle={-12} textAnchor="end" height={48} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="sessions" name="Sessions" fill="var(--accent)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <h3 className="section-title mb-4">Tab funnel</h3>
          <div className="space-y-3">
            {funnel.map((step, i) => {
              const pct = step.users && funnel[0].users ? (step.users / funnel[0].users) * 100 : 0;
              return (
                <div key={step.step} className="grid grid-cols-[110px_1fr_70px] items-center gap-3 text-xs">
                  <div className="text-[var(--text)] font-medium">{step.step}</div>
                  <div className="h-2 bg-[var(--panel)] rounded overflow-hidden">
                    <div className="h-full bg-[var(--accent)] rounded" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="font-mono text-[var(--muted)] tabular-nums text-right">{step.users}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="section-title mb-4">Recent events</h3>
        <div className="space-y-1 max-h-56 overflow-y-auto">
          {recent.length === 0 ? <div className="text-xs text-[var(--muted)] py-6 text-center">no events yet</div> : recent.map((e: any) => (
            <div key={e.id} className="grid grid-cols-[60px_70px_1fr_80px] items-center gap-2 text-[11px] py-1.5 border-b border-[var(--border)] last:border-0">
              <span className="text-[var(--muted)] font-mono">{e.occurred_at?.slice(11, 19) || ""}</span>
              <span className={`pill ${e.event_type === "error" ? "bad" : e.event_type === "pageview" || e.event_type === "tab_switch" ? "ok" : ""}`}>
                {e.event_type.slice(0, 6)}
              </span>
              <span className="text-[var(--text)] truncate">
                {e.label || e.event_type} <span className="text-[var(--muted)]">· {e.page}</span>
              </span>
              <span className="text-[var(--muted)] text-right">{e.user_role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
