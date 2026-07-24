// Saksee · 2026-07-24 · finance: day + week + month view
import React from "react";
import { DollarSign, TrendingUp, Wallet, Percent, PieChart, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, ReferenceLine } from "recharts";
import {
  COGS_TARGET_PCT,
  COMMISSION_TARGET_PCT,
  NET_SALES_FACTOR,
  cogsTargetFromSales,
} from "../business";

export default function FinanceTab({ theme }: { theme: string }) {
  // Last 7 days (today + 6 prior)
  const weekly = [
    { d: "Mon", gross: 6400 },
    { d: "Tue", gross: 6900 },
    { d: "Wed", gross: 6600 },
    { d: "Thu", gross: 7500 },
    { d: "Fri", gross: 7800 },
    { d: "Sat", gross: 8100 },
    { d: "Sun", gross: 7500 },
  ].map((m) => ({
    ...m,
    net: Math.round(m.gross * NET_SALES_FACTOR),
    commission: Math.round(m.gross * (COMMISSION_TARGET_PCT / 100)),
    cogs: Math.round(cogsTargetFromSales(m.gross)),
    margin: Math.round(m.gross * NET_SALES_FACTOR - cogsTargetFromSales(m.gross)),
  }));

  // Last 6 months
  const monthly = [
    { m: "Jan", gross: 205000 },
    { m: "Feb", gross: 212000 },
    { m: "Mar", gross: 220000 },
    { m: "Apr", gross: 215000 },
    { m: "May", gross: 228000 },
    { m: "Jun", gross: 235000 },
  ].map((m) => ({
    ...m,
    net: Math.round(m.gross * NET_SALES_FACTOR),
    commission: Math.round(m.gross * (COMMISSION_TARGET_PCT / 100)),
    cogs: Math.round(cogsTargetFromSales(m.gross)),
    margin: Math.round(m.gross * NET_SALES_FACTOR - cogsTargetFromSales(m.gross)),
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

  const COLORS = ["var(--accent)", "var(--warn)", "var(--ok)", "var(--bad)", "var(--muted)", "#6366f1"];

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
