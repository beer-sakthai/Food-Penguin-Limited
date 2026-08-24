// Saksee · 2026-07-24
// Self-hosted analytics tracker for Food Penguin Limited.
// Batches events every ~2s and posts to /api/analytics/track-batch.

import { useEffect, useMemo, useRef } from "react";

const SESSION_KEY = "fpl_analytics_session_id";
const ROLE_KEY = "fpl_analytics_role";
const BRANCH_KEY = "fpl_analytics_branch";

function getOrCreateSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    const randomSuffix = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("").slice(0, 8);
    id = "s-" + Date.now().toString(36) + "-" + randomSuffix;
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function nowIso(): string {
  return new Date().toISOString();
}

function dayStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

type EventType =
  | "pageview"
  | "tab_switch"
  | "click"
  | "form_submit"
  | "action"
  | "error"
  | "session_start";

type AnalyticsEvent = {
  session_id: string;
  event_type: EventType;
  category?: string;
  label?: string;
  value?: number;
  props?: Record<string, any>;
  page: string;
  user_role: string;
  branch?: string;
  occurred_at: string;
  day: string;
};

export function useAnalytics(opts: {
  userRole: string;
  selectedBranch?: string;
  activeTab: string;
}) {
  const { userRole, selectedBranch, activeTab } = opts;
  const sessionId = useMemo(() => getOrCreateSessionId(), []);

  const queue = useRef<AnalyticsEvent[]>([]);
  const started = useRef(false);
  const previousTab = useRef<string>(activeTab);
  const sessionStartSent = useRef(false);

  // Persist role + branch for other hook callers
  useEffect(() => {
    try { localStorage.setItem(ROLE_KEY, userRole); } catch {}
  }, [userRole]);
  useEffect(() => {
    if (selectedBranch) { try { localStorage.setItem(BRANCH_KEY, selectedBranch); } catch {} }
  }, [selectedBranch]);

  // Lifecycle: session_start
  useEffect(() => {
    if (sessionStartSent.current) return;
    sessionStartSent.current = true;
    queue.current.push({
      session_id: sessionId,
      event_type: "session_start",
      page: "Overview",
      user_role: userRole,
      branch: selectedBranch,
      occurred_at: nowIso(),
      day: dayStamp(),
    });
    started.current = true;
    // Initial pageview (Overview)
    queue.current.push({
      session_id: sessionId,
      event_type: "pageview",
      category: "Page",
      label: "Overview",
      page: "Overview",
      user_role: userRole,
      branch: selectedBranch,
      occurred_at: nowIso(),
      day: dayStamp(),
    });
  }, [sessionId, userRole, selectedBranch]);

  // Tab changes → pageview + tab_switch events
  useEffect(() => {
    if (activeTab === previousTab.current) return;
    const prev = previousTab.current;
    previousTab.current = activeTab;
    const ts = nowIso();
    const d = dayStamp();
    if (prev) {
      queue.current.push({
        session_id: sessionId,
        event_type: "tab_switch",
        category: "Tab",
        label: activeTab,
        page: activeTab,
        user_role: userRole,
        branch: selectedBranch,
        occurred_at: ts,
        day: d,
        props: { from: prev },
      });
    }
    queue.current.push({
      session_id: sessionId,
      event_type: "pageview",
      category: "Page",
      label: activeTab,
      page: activeTab,
      user_role: userRole,
      branch: selectedBranch,
      occurred_at: ts,
      day: d,
    });
  }, [activeTab, userRole, selectedBranch, sessionId]);

  // Periodic flush every 2s + on unload
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    const flush = (sendSessionEnd = false) => {
      if (queue.current.length === 0 && !sendSessionEnd) return;
      const events = queue.current.slice();
      queue.current = [];
      const body: any = { events };
      if (sendSessionEnd) {
        events.push({
          session_id: sessionId,
          event_type: "session_end" as any,
          page: activeTab,
          user_role: userRole,
          branch: selectedBranch,
          occurred_at: nowIso(),
          day: dayStamp(),
        });
      }
      const blob = new Blob([JSON.stringify(body)], { type: "application/json" });
      try {
        const token = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_ANALYTICS_API_KEY
          ? import.meta.env.VITE_ANALYTICS_API_KEY
          : "fp-analytics-secret-key";

        if (navigator.sendBeacon) {
          navigator.sendBeacon(`/api/analytics/track-batch?token=${token}`, blob);
        } else {
          fetch("/api/analytics/track-batch", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(body),
            keepalive: true,
          }).catch(() => {});
        }
      } catch {
        // Re-queue on failure
        queue.current = events.concat(queue.current);
      }
    };
    timer = setInterval(() => flush(false), 2000);
    const onUnload = () => flush(true);
    window.addEventListener("beforeunload", onUnload);
    return () => {
      if (timer) clearInterval(timer);
      window.removeEventListener("beforeunload", onUnload);
      flush(false);
    };
  }, [sessionId, userRole, selectedBranch, activeTab]);

  // Public API: track a generic event from any component
  const track = (
    type: EventType,
    opts: { category?: string; label?: string; value?: number; props?: Record<string, any>; page?: string } = {},
  ) => {
    queue.current.push({
      session_id: sessionId,
      event_type: type,
      category: opts.category,
      label: opts.label,
      value: opts.value,
      props: opts.props,
      page: opts.page ?? activeTab,
      user_role: userRole,
      branch: selectedBranch,
      occurred_at: nowIso(),
      day: dayStamp(),
    });
  };

  return { sessionId, track };
}
