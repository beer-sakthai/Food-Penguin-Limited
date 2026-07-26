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
  ok: "text-[var(--ok)] bg-[var(--ok-soft)] ring-1 ring-[var(--ok-ring)]",
  bad: "text-[var(--bad)] bg-[var(--bad-soft)] ring-1 ring-[var(--bad-ring)]",
  warn: "text-[var(--warn)] bg-[var(--warn-soft)] ring-1 ring-[var(--warn-ring)]",
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
