// Saksee · 2026-07-25 · Hugging Face SakThai model status card for FPL dashboard
import React, { useEffect, useState } from "react";
import { Cpu, ExternalLink, TrendingUp, AlertTriangle } from "lucide-react";

interface HfModel {
  id: string;
  downloads: number;
  likes?: number;
  tags?: string[];
}

const HF_AUTHOR = "Nanthasit";
const TOP_MODELS = [
  "Nanthasit/sakthai-context-1.5b-merged",
  "Nanthasit/sakthai-context-0.5b-merged",
  "Nanthasit/sakthai-context-7b-merged",
  "Nanthasit/sakthai-context-7b-128k",
];

function formatNumber(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}

export default function ModelPanel() {
  const [models, setModels] = useState<HfModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`https://huggingface.co/api/models?author=${HF_AUTHOR}&limit=100`)
      .then((r) => {
        if (!r.ok) throw new Error(`HF ${r.status}`);
        return r.json();
      })
      .then((data: HfModel[]) => {
        if (cancelled) return;
        const ordered = TOP_MODELS.map((id) => data.find((m) => m.id === id)).filter(Boolean) as HfModel[];
        const rest = data.filter((m) => !TOP_MODELS.includes(m.id));
        setModels([...ordered, ...rest]);
        setLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e.message);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const totalDownloads = models.reduce((a, m) => a + (m.downloads || 0), 0);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[var(--accent)]" />
          <h2 className="section-title">SakThai models · Hugging Face</h2>
        </div>
        <a
          href={`https://huggingface.co/${HF_AUTHOR}`}
          target="_blank"
          rel="noreferrer"
          className="btn btn-ghost text-[10px] py-1 px-2"
        >
          View all <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {loading && <div className="text-xs text-[var(--muted)]">Loading model stats…</div>}
      {error && (
        <div className="flex items-center gap-2 text-[var(--warn)] text-xs">
          <AlertTriangle className="w-4 h-4" /> HF fetch failed: {error}
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="card card-hover p-3 flex-1">
              <div className="flex items-center gap-2 text-[var(--muted)] text-[10px] uppercase tracking-wide">
                <TrendingUp className="w-3 h-3" /> total downloads
              </div>
              <div className="mt-1 text-xl font-semibold font-mono text-[var(--text)]">{formatNumber(totalDownloads)}</div>
            </div>
            <div className="card card-hover p-3 flex-1">
              <div className="text-[var(--muted)] text-[10px] uppercase tracking-wide">models tracked</div>
              <div className="mt-1 text-xl font-semibold font-mono text-[var(--text)]">{models.length}</div>
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border)] overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="text-left">Model</th>
                  <th className="text-right">Downloads</th>
                </tr>
              </thead>
              <tbody>
                {models.slice(0, 6).map((m) => (
                  <tr key={m.id}>
                    <td className="text-xs">
                      <a
                        href={`https://huggingface.co/${m.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-[var(--accent)]"
                      >
                        {m.id.replace(`${HF_AUTHOR}/`, "")}
                      </a>
                    </td>
                    <td className="text-right text-xs font-mono">{formatNumber(m.downloads || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
