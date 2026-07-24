// Saksee · 2026-07-24 · feat/density-cut
import React from "react";
import { Activity } from "lucide-react";
export default function RealtimeTab({ theme }: { theme: string }) {
  const alerts = [
    { id: "A-01", time: "14:12:30", sensor: "Cold Room Freezy-01", value: "-19.4°C", status: "normal", msg: "Temperature stable" },
    { id: "A-02", time: "14:08:15", sensor: "Sushi Rice Warm Unit A", value: "57.0°C", status: "normal", msg: "Optimal preservation" },
    { id: "A-03", time: "13:55:00", sensor: "Seafood Deep Freezer", value: "-12.1°C", status: "warning", msg: "Slight thermal climb" },
    { id: "A-04", time: "13:10:45", sensor: "Dishwasher Rinse Tank", value: "82.5°C", status: "normal", msg: "Sanitation verified" },
  ];
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-bold text-[var(--text)] flex items-center gap-2"><Activity className="w-5 h-5 text-[var(--accent)]" />Real-time</h1>
        <p className="text-xs font-mono text-[var(--muted)] mt-0.5">{alerts.length} alerts</p>
      </div>
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-[var(--panel)] text-[var(--muted)]">
            <tr><th className="text-left px-4 py-2 font-medium">Time</th><th className="text-left px-4 py-2 font-medium">Sensor</th><th className="text-left px-4 py-2 font-medium">Value</th><th className="text-left px-4 py-2 font-medium">Status</th><th className="text-left px-4 py-2 font-medium">Message</th></tr>
          </thead>
          <tbody>{alerts.map(a => (
            <tr key={a.id} className="border-t border-[var(--border)] hover:bg-[var(--panel)]">
              <td className="px-4 py-2 font-mono text-[var(--muted)]">{a.time}</td>
              <td className="px-4 py-2 font-medium text-[var(--text)]">{a.sensor}</td>
              <td className="px-4 py-2 font-mono">{a.value}</td>
              <td className="px-4 py-2"><span className={`text-[10px] font-mono uppercase ${a.status === "warning" ? "text-[var(--warn)]" : "text-[var(--ok)]"}`}>{a.status}</span></td>
              <td className="px-4 py-2 text-[var(--muted)]">{a.msg}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
