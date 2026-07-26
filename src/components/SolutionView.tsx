import React, { useMemo } from "react";
import { AlertTriangle, TrendingUp, CheckCircle2, ArrowRight, BarChart3 } from "lucide-react";
import type { DailyOperationalLog, SalesOrder } from "../types";
import { COGS_TARGET_PCT, WASTE_TARGET_PCT } from "../business";

interface SolutionViewProps {
  metrics: {
    salesToday: number;
    cogsToday: number;
    wasteCost: number;
    productionItems: number;
    productionTarget: number;
  };
  weeklyLogs: DailyOperationalLog[];
  orders: SalesOrder[];
  selectedBranch: string;
  onNavigateTab: (tab: string) => void;
}

export default function SolutionView({
  metrics,
  weeklyLogs,
  orders,
  selectedBranch,
  onNavigateTab,
}: SolutionViewProps) {
  type ActionCard = {
    severity: "critical" | "warn" | "ok";
    metric: string;
    value: string;
    target: string;
    message: string;
    action: string;
    tab: string;
  };

  const actions = useMemo(() => {
    const netSales = metrics.salesToday;
    const cogsPct = netSales > 0 ? (metrics.cogsToday / netSales) * 100 : 0;
    const wastePct = metrics.cogsToday > 0 ? (metrics.wasteCost / metrics.cogsToday) * 100 : 0;
    const prodProgress = metrics.productionTarget ? (metrics.productionItems / metrics.productionTarget) * 100 : 0;

    const fixNow: ActionCard[] = [];
    const watch: ActionCard[] = [];
    const maintain: ActionCard[] = [];

    if (cogsPct > COGS_TARGET_PCT + 2) {
      fixNow.push({
        severity: "critical",
        metric: "COGS",
        value: `${cogsPct.toFixed(1)}%`,
        target: `${COGS_TARGET_PCT}%`,
        message: `Over target by ${(cogsPct - COGS_TARGET_PCT).toFixed(1)}%`,
        action: "Review cost breakdown and supplier usage",
        tab: "P&L",
      });
    }

    if (wastePct > WASTE_TARGET_PCT + 2) {
      fixNow.push({
        severity: "critical",
        metric: "Waste",
        value: `${wastePct.toFixed(1)}%`,
        target: `${WASTE_TARGET_PCT}%`,
        message: `Over target by ${(wastePct - WASTE_TARGET_PCT).toFixed(1)}%`,
        action: "Log waste details and investigate root cause",
        tab: "Waste",
      });
    }

    if (prodProgress < 80) {
      watch.push({
        severity: "warn",
        metric: "Production",
        value: `${prodProgress.toFixed(0)}%`,
        target: "100%",
        message: `${(100 - prodProgress).toFixed(0)}% behind schedule`,
        action: "Accelerate production or adjust target",
        tab: "Targets & Production",
      });
    }

    if (cogsPct > COGS_TARGET_PCT) {
      watch.push({
        severity: "warn",
        metric: "COGS",
        value: `${cogsPct.toFixed(1)}%`,
        target: `${COGS_TARGET_PCT}%`,
        message: `Slightly elevated at ${(cogsPct - COGS_TARGET_PCT).toFixed(1)}% over`,
        action: "Monitor trends through end of day",
        tab: "P&L",
      });
    }

    if (fixNow.length === 0 && watch.length === 0) {
      maintain.push({
        severity: "ok",
        metric: "All metrics",
        value: "On track",
        target: "Target met",
        message: "All KPIs within healthy ranges",
        action: "Continue current operations",
        tab: "Overview",
      });
    }

    return { fixNow, watch, maintain };
  }, [metrics]);

  const actionsData = [
    ...actions.fixNow.map((a) => ({ ...a, priority: "fix" as const })),
    ...actions.watch.map((a) => ({ ...a, priority: "watch" as const })),
    ...actions.maintain.map((a) => ({ ...a, priority: "maintain" as const })),
  ];

  return (
    <div className="page-shell space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-soft)] flex items-center justify-center shadow-lg">
            <BarChart3 className="w-5 h-5 text-[var(--text)]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[var(--text)]">What should I do today?</h1>
            <p className="text-xs text-[var(--muted)]">{selectedBranch} · Executive summary · {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="hero-strip rounded-3xl border border-[var(--elevated)] bg-gradient-to-r from-[var(--panel)] via-[var(--panel)] to-[var(--elevated)] p-6 md:p-8">
        <div className="flex items-center gap-4 mb-4">
          {actions.fixNow.length > 0 && <div className="flex items-center gap-2 text-[var(--bad)]"><AlertTriangle className="w-5 h-5" /> <span className="font-semibold">{actions.fixNow.length} urgent</span></div>}
          {actions.watch.length > 0 && <div className="flex items-center gap-2 text-[var(--warn)]"><TrendingUp className="w-5 h-5" /> <span className="font-semibold">{actions.watch.length} monitoring</span></div>}
          {actions.maintain.length > 0 && <div className="flex items-center gap-2 text-[var(--ok)]"><CheckCircle2 className="w-5 h-5" /> <span className="font-semibold">On track</span></div>}
        </div>
        <p className="text-sm text-[var(--muted)]">
          {actions.fixNow.length > 0
            ? `Address ${actions.fixNow.length} critical issue${actions.fixNow.length > 1 ? "s" : ""} to optimize today's performance.`
            : actions.watch.length > 0
              ? `Monitor ${actions.watch.length} metric${actions.watch.length > 1 ? "s" : ""} as they approach targets.`
              : "All metrics are healthy. Continue monitoring."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {actions.fixNow.length > 0 && (
          <div className="action-section">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-[var(--bad)]" />
              <h2 className="section-title">Fix Now</h2>
            </div>
            <div className="space-y-3">
              {actions.fixNow.map((a, i) => (
                <div key={i} className="card border-l-4 border-l-[var(--bad)] bg-gradient-to-r from-[var(--bad)]/5 to-transparent">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-[var(--text)]">{a.metric}</span>
                        <span className="text-sm font-mono text-[var(--bad)]">{a.value}</span>
                      </div>
                      <p className="text-xs text-[var(--muted)] mb-2">{a.message}</p>
                      <p className="text-xs text-[var(--text)]">{a.action}</p>
                    </div>
                    <button
                      onClick={() => onNavigateTab(a.tab)}
                      className="shrink-0 btn btn-primary text-xs whitespace-nowrap"
                    >
                      Go to {a.tab} <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {actions.watch.length > 0 && (
          <div className="action-section">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-[var(--warn)]" />
              <h2 className="section-title">Watch</h2>
            </div>
            <div className="space-y-3">
              {actions.watch.map((a, i) => (
                <div key={i} className="card border-l-4 border-l-[var(--warn)] bg-gradient-to-r from-[var(--warn)]/5 to-transparent">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-[var(--text)]">{a.metric}</span>
                        <span className="text-sm font-mono text-[var(--warn)]">{a.value}</span>
                      </div>
                      <p className="text-xs text-[var(--muted)] mb-2">{a.message}</p>
                      <p className="text-xs text-[var(--text)]">{a.action}</p>
                    </div>
                    <button
                      onClick={() => onNavigateTab(a.tab)}
                      className="shrink-0 btn btn-primary text-xs whitespace-nowrap"
                    >
                      View <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {actions.maintain.length > 0 && (
          <div className="action-section">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-[var(--ok)]" />
              <h2 className="section-title">Maintain</h2>
            </div>
            <div className="space-y-3">
              {actions.maintain.map((a, i) => (
                <div key={i} className="card border-l-4 border-l-[var(--ok)] bg-gradient-to-r from-[var(--ok)]/5 to-transparent">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-[var(--text)]">{a.metric}</span>
                        <span className="text-sm font-mono text-[var(--ok)]">{a.value}</span>
                      </div>
                      <p className="text-xs text-[var(--muted)] mb-2">{a.message}</p>
                      <p className="text-xs text-[var(--text)]">{a.action}</p>
                    </div>
                    <button
                      onClick={() => onNavigateTab("Overview")}
                      className="shrink-0 btn btn-ghost text-xs"
                    >
                      View all <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
