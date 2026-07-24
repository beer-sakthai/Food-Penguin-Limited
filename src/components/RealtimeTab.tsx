// Saksee · 2026-07-24 · feat/new-design-system
import React from "react";
import { Activity, Radio } from "lucide-react";

export default function RealtimeTab({ theme }: { theme: string }) {
  const alerts = [
    { id: "A-01", time: "14:12:30", sensor: "Cold Room Freezy-01", value: "-19.4°C", status: "normal", msg: "Temperature stable" },
    { id: "A-02", time: "14:08:15", sensor: "Sushi Rice Warm Unit A", value: "57.0°C", status: "normal", msg: "Optimal preservation" },
    { id: "A-03", time: "13:55:00", sensor: "Seafood Deep Freezer", value: "-12.1°C", status: "warning", msg: "Slight thermal climb" },
    { id: "A-04", time: "13:10:45", sensor: "Dishwasher Rinse Tank", value: "82.5°C", status: "normal", msg: "Sanitation verified" },
  ];

  const normal = alerts.filter(a => a.status === "normal").length;
  const warnings = alerts.filter(a => a.status === "warning").length;

  const cards = [
    { label: "Normal", value: normal, sub: "sensors", tone: "up" },
    { label: "Warnings", value: warnings, sub: "need attention", tone: warnings > 0 ? "down" : "up" },
    { label: "Total", value: alerts.length, sub: "alerts" },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center">
          <Activity className="w-5 h-5 text-[var(--accent)]" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-[var(--text)]">Real-time</h1>
          <p className="text-xs text-[var(--muted)]">{alerts.length} alerts · {warnings} warning</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map((k, i) => (
          <div key={i} className="card card-hover">
            <span className="metric-label">{k.label}</span>
            <div className="mt-2 metric-value">{k.value}</div>
            <div className="mt-1 text-[11px] text-[var(--muted)]">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Sensor</th>
              <th>Value</th>
              <th>Status</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map(a => (
              <tr key={a.id}>
                <td className="font-mono text-[var(--muted)]">{a.time}</td>
                <td className="font-medium">{a.sensor}</td>
                <td className="font-mono">{a.value}</td>
                <td>
                  <span className={`pill ${a.status === "warning" ? "warn" : "ok"}`}>
                    {a.status}
                  </span>
                </td>
                <td className="text-[var(--muted)]">{a.msg}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
