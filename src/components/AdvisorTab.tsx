// Saksee · 2026-07-24 · operational Q&A panel
import React, { useState } from "react";
import { MessageSquare, Send, Loader2 } from "lucide-react";

export default function AdvisorTab() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const ask = async () => {
    if (!input.trim()) return;
    setLoading(true); setErr(null); setResp(null);
    try {
      const r = await fetch("/api/gemini/strategic-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input })
      });
      if (!r.ok) throw new Error(`Server returned ${r.status}`);
      const d = await r.json();
      setResp(d.text || d.response || JSON.stringify(d));
    } catch { setErr("Unable to reach the advisor. Check your connection and try again."); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-[var(--accent)]" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-[var(--text)]">Operational Advisor</h1>
          <p className="text-xs text-[var(--muted)]">Ask a question about daily operations</p>
        </div>
      </div>

      <div className="card">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Example: How did waste compare to target this week?"
          rows={3}
          className="input w-full mb-3"
        />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={ask}
            disabled={loading || !input.trim()}
            className="btn btn-primary"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin mr-1 inline" />}
            <Send className="w-4 h-4 inline mr-1" />
            Ask
          </button>
        </div>
      </div>

      {err && <div className="card border border-red-400/30 text-red-300 text-sm">{err}</div>}

      {resp && <div className="card text-sm text-[var(--text)] leading-relaxed">{resp}</div>}
    </div>
  );
}
