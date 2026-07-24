// Saksee · 2026-07-24 · feat/new-design-system
import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { FileSpreadsheet, Download, FileText, BarChart3 } from "lucide-react";
import { jsPDF } from "jspdf";

type Order = { id: string; date: string; item: string; amount: number; branch: string };
type Target = { name: string; currentValue: number; targetValue: number; unit: string };
type Waste = { date: string; cost: number; reason: string };
type Alert = { status: string; message: string };

const BRANCH_COLORS = ["var(--accent)", "var(--accent-hover)", "var(--warn)", "var(--ok)", "var(--accent)", "#6366f1"];

export default function ReportsTab(props: {
  orders: Order[];
  targets: Target[];
  tasks: any[];
  wasteRecords: Waste[];
  hoursData: any[];
  inventory: any[];
  weeklyLogs: any[];
  alerts: Alert[];
  theme: string;
}) {
  const { orders, targets, wasteRecords, alerts, weeklyLogs } = props;

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

  const cards = [
    { label: "Revenue", value: `€${totalRevenue.toLocaleString()}`, sub: `${orders.length} orders` },
    { label: "Waste cost", value: `€${totalWaste.toFixed(0)}`, sub: `${wasteRecords.length} records` },
    { label: "On track", value: `${onTrack} / ${targets.length}`, sub: "≥85% target" },
    { label: "Open alerts", value: openAlerts, sub: openAlerts ? "needs review" : "all clear" },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center">
            <FileText className="w-5 h-5 text-[var(--accent)]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[var(--text)]">Reports</h1>
            <p className="text-xs text-[var(--muted)]">{orders.length} orders · {wasteRecords.length} waste records · {targets.length} targets</p>
          </div>
        </div>
        <button
          type="button"
          onClick={exportPDF}
          className="btn btn-ghost"
        >
          <Download className="w-4 h-4" /> Export PDF
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((k, i) => (
          <div key={i} className="card card-hover">
            <span className="metric-label">{k.label}</span>
            <div className="mt-2 metric-value">{k.value}</div>
            <div className="mt-1 text-[11px] text-[var(--muted)]">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="section-title mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" /> Revenue by branch
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueByBranch} margin={{ top: 4, right: 8, bottom: 0, left: -8 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="branch" tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                formatter={(v: any) => `€${Number(v).toLocaleString()}`}
              />
              <Bar dataKey="total" radius={[6, 6, 0, 0]} fontSize={12}>
                {revenueByBranch.map((_, i) => <Cell key={i} fill={BRANCH_COLORS[i % BRANCH_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {weeklyLogs && weeklyLogs.length > 0 && (
        <div className="card overflow-hidden">
          <div className="flex items-center gap-3 mb-4">
            <FileSpreadsheet className="w-4 h-4 text-[var(--accent)]" />
            <h2 className="section-title">Weekly operational log</h2>
            <span className="text-[11px] text-[var(--muted)] ml-auto">{weeklyLogs.length} days</span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Date</th>
                <th className="text-right">Sales</th>
                <th className="text-right">Waste</th>
                <th className="text-right">Hours</th>
                <th className="text-right">Made / Target</th>
                <th>Supplier</th>
              </tr>
            </thead>
            <tbody>
              {weeklyLogs.map((l: any, i: number) => (
                <tr key={i}>
                  <td className="font-mono">{l.day}</td>
                  <td className="font-mono text-[var(--muted)]">{l.date}</td>
                  <td className="text-right font-mono">€{Number(l.sales).toLocaleString()}</td>
                  <td className="text-right font-mono">€{Number(l.waste).toFixed(0)}</td>
                  <td className="text-right font-mono">{l.hours}</td>
                  <td className="text-right font-mono">
                    {l.production_made?.toLocaleString() || 0} / {l.production_target?.toLocaleString() || 0}
                  </td>
                  <td className="text-[var(--muted)]">{l.supplier_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
