// Saksee · 2026-07-24 · finance: day + week + month view, driven by weeklyLogs
import React from "react";
import { DollarSign, TrendingUp, Wallet, Percent, PieChart, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, ReferenceLine } from "recharts";
import {
  COGS_TARGET_PCT,
  COMMISSION_TARGET_PCT,
  NET_SALES_FACTOR,
  cogsTargetFromSales,
} from "../business";
import { DailyOperationalLog } from "../types";

const MONTH_LABEL = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const sumCogs = (c: DailyOperationalLog["cogs"]) =>
  c.tazaki + c.sysco + c.bulza + c.sticker + c.others;

const deriveRow = (gross: number, cogs: number) => {
  const net = Math.round(gross * NET_SALES_FACTOR);
  const commission = Math.round(gross * (COMMISSION_TARGET_PCT / 100));
  const cogsRounded = Math.round(cogs);
  return { gross, net, commission, cogs: cogsRounded, margin: net - cogsRounded };
};

export default function FinanceTab({
  theme,
  weeklyLogs = [],
}: {
  theme: string;
  weeklyLogs?: DailyOperationalLog[];
}) {
  // Weekly: last 7 log entries. Fall back to a zeroed 7-day frame if empty.
  const lastSeven = weeklyLogs.slice(-7);
  const weekly = (lastSeven.length
    ? lastSeven
    : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => ({
        day: d,
        sales: 0,
        cogs: { tazaki: 0, sysco: 0, bulza: 0, sticker: 0, others: 0 },
      }))
  ).map((log: any) => ({
    d: log.day,
    ...deriveRow(log.sales || 0, sumCogs(log.cogs) || cogsTargetFromSales(log.sales || 0)),
  }));

  // Monthly: group logs by YYYY-MM. Render whatever range we have (up to 6 latest).
  const monthlyMap = new Map<string, { gross: number; cogs: number }>();
  for (const log of weeklyLogs) {
    if (!log.date) continue;
    const key = log.date.slice(0, 7); // YYYY-MM
    const bucket = monthlyMap.get(key) || { gross: 0, cogs: 0 };
    bucket.gross += log.sales || 0;
    bucket.cogs += sumCogs(log.cogs);
    monthlyMap.set(key, bucket);
  }
  const monthly = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([key, agg]) => ({
      m: MONTH_LABEL[Number(key.slice(5, 7)) - 1] || key,
      ...deriveRow(agg.gross, agg.cogs),
    }));

  const today = weekly[weekly.length - 1];
  const weekGross = weekly.reduce((a, m) => a + m.gross, 0);
  const weekNet = weekly.reduce((a, m) => a + m.net, 0);
  const weekCommission = weekly.reduce((a, m) => a + m.commission, 0);
  const weekCogs = weekly.reduce((a, m) => a + m.cogs, 0);
  const weekMargin = weekly.reduce((a, m) => a + m.margin, 0);

  const totalGross = monthly.reduce((a, m) => a + m.gross, 0);
  const totalNet = monthly.reduce((a, m) => a + m.net, 0);
  const totalCommission = monthly.reduce((a, m) => a + m.commission, 0);
  const totalCogs = monthly.reduce((a, m) => a + m.cogs, 0);
  const totalMargin = monthly.reduce((a, m) => a + m.margin, 0);

  const weekCogsPct = weekNet ? (weekCogs / weekNet) * 100 : 0;
  const weekMarginPct = weekNet ? (weekMargin / weekNet) * 100 : 0;

  const monthCogsPct = totalNet ? (totalCogs / totalNet) * 100 : 0;
  const monthMarginPct = totalNet ? (totalMargin / totalNet) * 100 : 0;

  const maxWeekGross = Math.max(...weekly.map((w) => w.gross));

  const COLORS = ["var(--accent)", "var(--warn)", "var(--ok)", "var(--bad)", "var(--muted)", "var(--violet)"];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center">
          <DollarSign className="w-5 h-5 text-[var(--accent)]" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-[var(--text)]">Finance</h1>
          <p className="text-xs text-[var(--muted)]">Today €{today.gross.toLocaleString()} · week €{weekGross.toLocaleString()} · 6 months €{totalGross.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Today gross", value: `€${today.gross.toLocaleString()}`, sub: "max this week €" + maxWeekGross.toLocaleString(), icon: TrendingUp },
          { label: "Week gross", value: `€${weekGross.toLocaleString()}`, sub: `€${Math.round(weekGross / 7).toLocaleString()} per day`, icon: Calendar },
          { label: "Week commission", value: `€${weekCommission.toLocaleString()}`, sub: `${COMMISSION_TARGET_PCT}%`, icon: Percent },
          { label: "Week net", value: `€${weekNet.toLocaleString()}`, sub: "after commission", icon: Wallet },
          { label: "Week COGS", value: `€${weekCogs.toLocaleString()}`, sub: `${weekCogsPct.toFixed(1)}% of net · target ${COGS_TARGET_PCT}%`, icon: PieChart },
          { label: "Week margin", value: `€${weekMargin.toLocaleString()}`, sub: `${weekMarginPct.toFixed(1)}% of net`, icon: DollarSign },
          { label: "6-month gross", value: `€${totalGross.toLocaleString()}`, sub: "YTD", icon: TrendingUp },
          { label: "6-month margin", value: `€${totalMargin.toLocaleString()}`, sub: `${monthMarginPct.toFixed(1)}% of net`, icon: Percent },
        ].map((k, i) => (
          <div key={i} className="card card-hover">
            <div className="flex items-center gap-2">
              <k.icon className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span className="metric-label">{k.label}</span>
            </div>
            <div className="mt-2 metric-value">{k.value}</div>
            <div className="mt-1 text-[11px] text-[var(--muted)]">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <h2 className="section-title mb-4 flex items-center gap-2">
            <Wallet className="w-4 h-4" /> This week · revenue flow
          </h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekly} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="d" tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} formatter={(v: any) => `€${Number(v).toLocaleString()}`} />
                <Bar dataKey="commission" name="Commission" stackId="a" fill="var(--warn)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="net" name="Net" stackId="a" fill="var(--ok)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="cogs" name="COGS" stackId="b" fill="var(--accent)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2 className="section-title mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> 6-month margin vs COGS target
          </h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="m" tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} formatter={(v: any) => `€${Number(v).toLocaleString()}`} />
                <ReferenceLine y={0} stroke="var(--border)" />
                <Bar dataKey="margin" name="Margin" radius={[6, 6, 0, 0]}>
                  {monthly.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
