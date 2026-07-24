// Saksee · 2026-07-24 · feat/new-design-system
import React, { useState } from "react";
import { BrainCircuit, Send, Loader2, Sparkles } from "lucide-react";

interface Props { theme: "dark" | "light" }

export default function AdvisorTab({ theme }: Props) {
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
      const d = await r.json();
      setResp(d.text || d.response || JSON.stringify(d));
    } catch { setErr("Network error. Try again."); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center">
          <BrainCircuit className="w-5 h-5 text-[var(--accent)]" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-[var(--text)]">Strategic Advisor</h1>
          <p className="text-xs text-[var(--muted)]">Ask a question about your operations</p>
        </div>
      </div>

      <div className="card">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="e.g. How can I reduce waste on Fridays?"
          rows={3}
          className="input w-full resize-none"
        />
        <button
          type="button"
          onClick={ask}
          disabled={loading || !input.trim()}
          className="btn btn-primary mt-3 disabled:opacity-50"
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Thinking…</> : <><Send className="w-4 h-4" /> Ask</>}
        </button>
      </div>

      {err && <div className="card border-[var(--bad)] text-[var(--bad)] text-xs">{err}</div>}

      {resp && (
        <div className="card">
          <div className="section-title mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Response
          </div>
          <div className="text-sm text-[var(--text)] whitespace-pre-wrap leading-relaxed">{resp}</div>
        </div>
      )}
    </div>
  );
}
