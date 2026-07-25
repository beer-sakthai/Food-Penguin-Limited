import React from "react";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  key?: React.Key;
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone?: "accent" | "ok" | "bad" | "warn";
  onClick?: () => void;
}

const toneClasses = {
  accent: "text-[var(--accent)] bg-[var(--accent-soft)] ring-1 ring-[var(--accent)]/20",
  ok: "text-[var(--ok)] bg-emerald-500/10 ring-1 ring-emerald-500/20",
  bad: "text-[var(--bad)] bg-rose-500/10 ring-1 ring-rose-500/20",
  warn: "text-[var(--warn)] bg-amber-500/10 ring-1 ring-amber-500/20",
};

export function KpiCard({ label, value, detail, icon: Icon, tone = "accent", onClick }: KpiCardProps) {
  const content = <>
    <div className="flex items-center justify-between">
      <span className="metric-label">{label}</span>
      <span className={`w-8 h-8 rounded-xl ${toneClasses[tone]} flex items-center justify-center shrink-0`}>
        <Icon className="w-4 h-4" />
      </span>
    </div>
    <div className="mt-4 metric-value">{value}</div>
    <div className="mt-2 text-[11px] text-[var(--muted)] leading-snug">{detail}</div>
  </>;

  const classes = "card card-hover text-left w-full h-full flex flex-col";
  return onClick ? <button type="button" onClick={onClick} className={classes}>{content}</button> : <div className={classes}>{content}</div>;
}
