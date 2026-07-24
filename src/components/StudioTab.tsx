// Saksee · 2026-07-24 · feat/density-cut
import React, { useState } from "react";
import { Send, Loader2, Download, Image as ImageIcon } from "lucide-react";
interface Props { theme: "dark" | "light" }
const ASPECT = ["1:1", "2:3", "3:2", "9:16", "16:9"];
const MODELS = [{ id: "gemini-3.1-flash-image-preview", label: "Fast" }, { id: "gemini-3-pro-image-preview", label: "Pro" }];
const PRESETS = [
  { title: "Cod platter", desc: "Rustic, fresh dill, lemon.", prompt: "A sizzling-hot Alaskan Cod platter garnished with rosemary, dill, lemon slices, on rustic charcoal tableware, warm steam rising, food advertisement, sharp focus." },
  { title: "Burger", desc: "Melted cheddar, brioche.", prompt: "Premium gourmet Arctic beef burger with cheddar melting over the sides, crisp lettuce, sesame brioche bun, commercial studio lighting, product photograph." },
  { title: "Dessert", desc: "Chocolate lava, cocoa.", prompt: "Layered chocolate-lava pudding cup, liquid cocoa oozing, side-garnished with frosty wild berries, modern luxury restaurant advertisement, macro photo." },
];
export default function StudioTab({ theme }: Props) {
  const [prompt, setPrompt] = useState("");
  const [aspect, setAspect] = useState("1:1");
  const [model, setModel] = useState(MODELS[0].id);
  const [gen, setGen] = useState(false);
  const [img, setImg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const generate = async () => {
    if (!prompt.trim()) return;
    setGen(true); setImg(null); setErr(null);
    try {
      const r = await fetch("/api/gemini/generate-marketing-image", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt, aspectRatio: aspect, model }) });
      const d = await r.json();
      if (d.imageUrl) setImg(d.imageUrl);
      else setErr(d.error || "Failed to generate image.");
    } catch { setErr("Network error."); } finally { setGen(false); }
  };
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-[var(--text)] flex items-center gap-2"><ImageIcon className="w-5 h-5 text-[var(--accent)]" />Studio</h1>
        <p className="text-xs font-mono text-[var(--muted)] mt-0.5">Marketing image generator</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {PRESETS.map((p, i) => (
          <button key={i} type="button" onClick={() => setPrompt(p.prompt)}
            className={`text-left p-3 rounded-lg border ${prompt === p.prompt ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]"}`}>
            <div className="text-sm font-semibold text-[var(--text)]">{p.title}</div>
            <div className="text-[10px] text-[var(--muted)] font-mono mt-0.5">{p.desc}</div>
          </button>
        ))}
      </div>
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-5 space-y-4">
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--muted)] mb-1.5">Prompt</label>
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Describe your food advert in detail..." rows={3}
            className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)] resize-none" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--muted)] mb-1.5">Aspect</label>
            <div className="flex flex-wrap gap-1.5">{ASPECT.map(r => (
              <button key={r} type="button" onClick={() => setAspect(r)}
                className={`px-2.5 py-1 text-xs font-mono rounded border ${aspect === r ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-[var(--border)] bg-[var(--bg)] text-[var(--text)] hover:border-[var(--accent)]"}`}>{r}</button>
            ))}</div>
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--muted)] mb-1.5">Model</label>
            <div className="flex gap-1.5">{MODELS.map(m => (
              <button key={m.id} type="button" onClick={() => setModel(m.id)}
                className={`flex-1 px-2.5 py-1 text-xs font-mono rounded border ${model === m.id ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-[var(--border)] bg-[var(--bg)] text-[var(--text)] hover:border-[var(--accent)]"}`}>{m.label}</button>
            ))}</div>
          </div>
        </div>
        <button type="button" onClick={generate} disabled={gen || !prompt.trim()}
          className="w-full px-3 py-2.5 text-sm font-semibold rounded-md bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] disabled:opacity-50 flex items-center justify-center gap-2">
          {gen ? <><Loader2 className="w-4 h-4 animate-spin" />Generating…</> : <><Send className="w-4 h-4" />Generate</>}
        </button>
        {err && <div className="text-xs text-[var(--bad)] font-mono">{err}</div>}
      </div>
      {img && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg overflow-hidden">
          <div className="px-5 py-3 border-b border-[var(--border)] flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--text)]">Output</h2>
            <a href={img} download="marketing-asset.jpg" target="_blank" rel="noreferrer" className="text-xs font-mono text-[var(--accent)] hover:text-[var(--accent-hover)] flex items-center gap-1"><Download className="w-3.5 h-3.5" />Download</a>
          </div>
          <img src={img} alt="Generated" className="w-full h-auto" referrerPolicy="no-referrer" />
        </div>
      )}
    </div>
  );
}
