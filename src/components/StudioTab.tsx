// Saksee · 2026-07-24 · feat/new-design-system
import React, { useState } from "react";
import { Send, Loader2, Download, Image as ImageIcon } from "lucide-react";

interface Props { theme: "dark" | "light" }

const ASPECT = ["1:1", "2:3", "3:2", "9:16", "16:9"];
const MODELS = [
  { id: "gemini-3.1-flash-image-preview", label: "Fast" },
  { id: "gemini-3-pro-image-preview", label: "Pro" },
];
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
      const r = await fetch("/api/gemini/generate-marketing-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, aspectRatio: aspect, model })
      });
      const d = await r.json();
      if (d.imageUrl) setImg(d.imageUrl);
      else setErr(d.error || "Failed to generate image.");
    } catch { setErr("Network error."); } finally { setGen(false); }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center">
          <ImageIcon className="w-5 h-5 text-[var(--accent)]" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-[var(--text)]">Studio</h1>
          <p className="text-xs text-[var(--muted)]">Marketing image generator</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {PRESETS.map((p, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setPrompt(p.prompt)}
            className={`text-left p-3 rounded-xl border transition-colors ${
              prompt === p.prompt
                ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]"
            }`}
          >
            <div className="text-sm font-semibold text-[var(--text)]">{p.title}</div>
            <div className="text-[10px] text-[var(--muted)] mt-0.5">{p.desc}</div>
          </button>
        ))}
      </div>

      <div className="card space-y-4">
        <div>
          <label className="section-title mb-1.5 block">Prompt</label>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Describe your food advert in detail..."
            rows={3}
            className="input w-full resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="section-title mb-1.5 block">Aspect</label>
            <div className="flex flex-wrap gap-1.5">
              {ASPECT.map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setAspect(r)}
                  className={`px-3 py-1 text-xs font-mono rounded-md border transition-colors ${
                    aspect === r
                      ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--bg)]"
                      : "border-[var(--border)] bg-[var(--panel)] text-[var(--text)] hover:border-[var(--accent)]"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="section-title mb-1.5 block">Model</label>
            <div className="flex gap-1.5">
              {MODELS.map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setModel(m.id)}
                  className={`flex-1 px-3 py-1 text-xs font-mono rounded-md border transition-colors ${
                    model === m.id
                      ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--bg)]"
                      : "border-[var(--border)] bg-[var(--panel)] text-[var(--text)] hover:border-[var(--accent)]"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={generate}
          disabled={gen || !prompt.trim()}
          className="btn btn-primary w-full justify-center disabled:opacity-50"
        >
          {gen ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</> : <><Send className="w-4 h-4" /> Generate</>}
        </button>
        {err && <div className="text-xs text-[var(--bad)]">{err}</div>}
      </div>

      {img && (
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-title">Output</h2>
            <a
              href={img}
              download="marketing-asset.jpg"
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost text-[11px]"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </a>
          </div>
          <img src={img} alt="Generated" className="w-full h-auto rounded-lg" referrerPolicy="no-referrer" />
        </div>
      )}
    </div>
  );
}
