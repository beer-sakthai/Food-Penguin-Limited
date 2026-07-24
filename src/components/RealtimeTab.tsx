// Saksee · 2026-07-24 · real-time monitoring alerts
import React from "react";
import { Activity } from "lucide-react";

export default function RealtimeTab({ theme }: { theme: string }) {
  const alerts = [
    { id: "A-01", time: "14:12:30", sensor: "Cold Room 01", value: "-19.4°C", status: "normal", msg: "Temperature within range" },
    { id: "A-02", time: "14:08:15", sensor: "Rice Warmer A", value: "57.0°C", status: "normal", msg: "Holding temperature stable" },
    { id: "A-03", time: "13:55:00", sensor: "Seafood Freezer", value: "-12.1°C", status: "warning", msg: "Thermal climb during door cycle" },
    { id: "A-04", time: "13:10:45", sensor: "Dishwasher Rinse", value: "82.5°C", status: "normal", msg: "Sanitation rinse verified" }
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center">
          <Activity className="w-5 h-5 text-[var(--accent)]" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-[var(--text)]">Real-time</h1>
          <p className="text-xs text-[var(--muted)]">{alerts.length} active sensor readings</p>
        </div>
      </div>

      <div className="grid gap-3">
        {alerts.map((a) => (
          <div key={a.id} className="card flex items-center justify-between">
            <div className="grid grid-cols-[80px_1fr_120px_100px] md:grid-cols-[100px_1fr_140px_120px] gap-4 items-center w-full">
              <div className="text-xs text-[var(--muted)]">{a.time}</div>
              <div>
                <div className="text-sm font-medium text-[var(--text)]">{a.sensor}</div>
                <div className="text-xs text-[var(--muted)]">{a.msg}</div>
              </div>
              <div className="text-sm text-[var(--text)]">{a.value}</div>
              <div className="text-right">
                <span className={`status-pill ${a.status === "normal" ? "status-ok" : "status-warn"}`}>
                  {a.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
