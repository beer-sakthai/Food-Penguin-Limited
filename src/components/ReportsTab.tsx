// Saksee · 2026-07-24 · feat/density-cut
// Reports tab — basic, sample, professional. 1 chart, top KPIs, 1 list, 1 export.
// Detail data preserved, chrome cut 70%.

import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { FileSpreadsheet, Download } from "lucide-react";
import { jsPDF } from "jspdf";

type Order = { id: string; date: string; item: string; amount: number; branch: string };
type Target = { name: string; currentValue: number; targetValue: number; unit: string };
type Waste = { date: string; cost: number; reason: string };
type Alert = { status: string; message: string };

const BRANCH_COLORS = ["var(--accent)", "var(--accent-hover)", "var(--warn)", "var(--ok)", "var(--accent)", "#6366f1"];

export default function ReportsTab(props: {
  orders: Order[]; targets: Target[]; tasks: any[]; wasteRecords: Waste[];
  hoursData: any[]; inventory: any[]; weeklyLogs: any[]; alerts: Alert[]; theme: string;
}) {
  const { orders, targets, wasteRecords, alerts, weeklyLogs, theme } = props;
  const isDark = theme === "dark";

  // Aggregations — keep all detail data
  const revenueByBranch = useMemo(() => {
    const m = new Map<string, number>();
    orders.forEach(o => m.set(o.branch, (m.get(o.branch) || 0) + (o.amount || 0)));
    return Array.from(m, ([branch, total]) => ({ branch: branch.split(" - ")[0], total: Math.round(total) }));
  }, [orders]);

  const totalRevenue = revenueByBranch.reduce((a, r) => a + r.total, 0);
  const totalWaste = wasteRecords.reduce((a, w) => a + (w.cost || 0), 0);
  const onTrack = targets.filter(t => t.currentValue >= t.targetValue * 0.85).length;
  const openAlerts = alerts.filter(a => a.status !== "normal").length;

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Food Penguin — Operations Report", 14, 18);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toISOString().slice(0, 16).replace("T", " ")}`, 14, 26);
    doc.text(`Total revenue (period): €${totalRevenue.toLocaleString()}`, 14, 34);
    doc.text(`Total waste cost: €${totalWaste.toFixed(2)}`, 14, 40);
    doc.text(`Targets on track: ${onTrack} / ${targets.length}`, 14, 46);
    doc.text(`Open alerts: ${openAlerts}`, 14, 52);
    let y = 62;
    revenueByBranch.forEach((b, i) => {
      doc.text(`${i + 1}. ${b.branch}: €${b.total.toLocaleString()}`, 14, y);
      y += 6;
    });
    doc.save(`fpl-report-${Date.now()}.pdf`);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--text)]">Reports</h1>
          <p className="text-xs font-mono text-[var(--muted)] mt-0.5">
            {orders.length} orders · {wasteRecords.length} waste records · {targets.length} targets
          </p>
        </div>
        <button
          type="button"
          onClick={exportPDF}
          className="px-3 py-1.5 text-xs font-medium rounded-md border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--accent)] flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          Export PDF
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Revenue", value: `€${totalRevenue.toLocaleString()}`, sub: `${orders.length} orders` },
          { label: "Waste cost", value: `€${totalWaste.toFixed(0)}`, sub: `${wasteRecords.length} records` },
          { label: "On track", value: `${onTrack} / ${targets.length}`, sub: "≥85% target" },
          { label: "Open alerts", value: openAlerts, sub: openAlerts ? "needs review" : "all clear" },
        ].map((k, i) => (
          <div key={i} className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
            <div className="text-[10px] font-mono uppercase tracking-wide text-[var(--muted)]">{k.label}</div>
            <div className="text-2xl font-bold text-[var(--text)] mt-1">{k.value}</div>
            <div className="text-[10px] font-mono text-[var(--muted)] mt-0.5">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Revenue by branch — keep chart */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-5">
        <h2 className="text-sm font-semibold text-[var(--text)] mb-3">Revenue by branch</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueByBranch} margin={{ top: 4, right: 8, bottom: 0, left: -8 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="branch" tick={{ fontSize: 11, fill: "var(--muted)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} />
              <Tooltip
                contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12 }}
                formatter={(v: any) => `€${Number(v).toLocaleString()}`}
              />
              <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                {revenueByBranch.map((_, i) => <Cell key={i} fill={BRANCH_COLORS[i % BRANCH_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly logs table — full data, flat style */}
      {weeklyLogs && weeklyLogs.length > 0 && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg overflow-hidden">
          <div className="px-5 py-3 border-b border-[var(--border)] flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-[var(--accent)]" />
            <h2 className="text-sm font-semibold text-[var(--text)]">Weekly operational log</h2>
            <span className="text-[10px] font-mono text-[var(--muted)] ml-auto">{weeklyLogs.length} days</span>
          </div>
          <table className="w-full text-xs">
            <thead className="bg-[var(--panel)] text-[var(--muted)]">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Day</th>
                <th className="text-left px-4 py-2 font-medium">Date</th>
                <th className="text-right px-4 py-2 font-medium">Sales</th>
                <th className="text-right px-4 py-2 font-medium">Waste</th>
                <th className="text-right px-4 py-2 font-medium">Hours</th>
                <th className="text-right px-4 py-2 font-medium">Made / Target</th>
                <th className="text-left px-4 py-2 font-medium">Supplier</th>
              </tr>
            </thead>
            <tbody>
              {weeklyLogs.map((l: any, i: number) => (
                <tr key={i} className="border-t border-[var(--border)] hover:bg-[var(--panel)]">
                  <td className="px-4 py-2 font-mono">{l.day}</td>
                  <td className="px-4 py-2 font-mono text-[var(--muted)]">{l.date}</td>
                  <td className="px-4 py-2 text-right font-mono">€{Number(l.sales).toLocaleString()}</td>
                  <td className="px-4 py-2 text-right font-mono">€{Number(l.waste).toFixed(0)}</td>
                  <td className="px-4 py-2 text-right font-mono">{l.hours}</td>
                  <td className="px-4 py-2 text-right font-mono">
                    {l.production_made?.toLocaleString() || 0} / {l.production_target?.toLocaleString() || 0}
                  </td>
                  <td className="px-4 py-2 text-[var(--muted)]">{l.supplier_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
