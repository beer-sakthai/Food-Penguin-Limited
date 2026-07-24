// Saksee · 2026-07-24 · feat/density-cut
import React, { useState } from "react";
import { BrainCircuit, Send, Loader2 } from "lucide-react";
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
      const r = await fetch("/api/gemini/strategic-advisor", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: input }) });
      const d = await r.json();
      setResp(d.text || d.response || JSON.stringify(d));
    } catch { setErr("Network error. Try again."); } finally { setLoading(false); }
  };
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-[var(--text)] flex items-center gap-2"><BrainCircuit className="w-5 h-5 text-[var(--accent)]" />Strategic Advisor</h1>
        <p className="text-xs font-mono text-[var(--muted)] mt-0.5">Ask a question about your operations</p>
      </div>
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 space-y-3">
        <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="e.g. How can I reduce waste on Fridays?" rows={3}
          className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)] resize-none" />
        <button type="button" onClick={ask} disabled={loading || !input.trim()}
          className="px-4 py-2 text-sm font-semibold rounded-md bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] disabled:opacity-50 flex items-center gap-2">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Thinking…</> : <><Send className="w-4 h-4" />Ask</>}
        </button>
      </div>
      {err && <div className="text-xs text-[var(--bad)] font-mono">{err}</div>}
      {resp && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-5">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)] mb-2">Response</div>
          <div className="text-sm text-[var(--text)] whitespace-pre-wrap leading-relaxed">{resp}</div>
        </div>
      )}
    </div>
  );
}
