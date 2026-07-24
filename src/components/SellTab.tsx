// Saksee · 2026-07-24 · feat/density-cut
import React, { useState } from "react";
import { Coins } from "lucide-react";
export const MS_PRODUCTS = [
  { barcode: "5391548895018", name: "Luxury Salmon & Caviar Platter", category: "Sashimi & Platters", price: 34.50 },
  { barcode: "5391548895025", name: "Gastropub Spicy Truffle Roll", category: "Specialty Rolls", price: 19.95 },
  { barcode: "5391548895049", name: "Handcrafted Premium Dragon Roll", category: "Sushi Rolls", price: 17.50 },
];
export const TESCO_PRODUCTS = [
  { barcode: "5391548890068", name: "Salmon Sashimi", category: "Sashimi Selections", price: 7.75 },
  { barcode: "5391548890266", name: "Spicy Veggie Roll", category: "Sushi Rolls", price: 5.50 },
  { barcode: "5391548890679", name: "Veggie Tofu Yakisoba Noodles", category: "Noodles & Sides", price: 7.95 },
  { barcode: "5391548890549", name: "TokYO! Party Platter", category: "Party Platters", price: 16.75 },
];
export default function SellTab({ selectedBranch, theme }: { selectedBranch: string; theme: string }) {
  const isMS = selectedBranch.startsWith("Marks");
  const products = isMS ? MS_PRODUCTS : TESCO_PRODUCTS;
  const [cart, setCart] = useState<Record<string, number>>({});
  const [filter, setFilter] = useState("");
  const filtered = products.filter(p => !filter || p.name.toLowerCase().includes(filter.toLowerCase()) || p.category.toLowerCase().includes(filter.toLowerCase()));
  const add = (b: string) => setCart(c => ({ ...c, [b]: (c[b] || 0) + 1 }));
  const sub = (b: string) => setCart(c => ({ ...c, [b]: Math.max(0, (c[b] || 0) - 1) }));
  const total = Object.entries(cart).reduce((sum, [b, q]) => { const p = products.find(x => x.barcode === b); return sum + (p ? p.price * q : 0); }, 0);
  const items = Object.values(cart).reduce((a, b) => a + b, 0);
  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-bold text-[var(--text)] flex items-center gap-2"><Coins className="w-5 h-5 text-[var(--accent)]" />Sales</h1>
          <p className="text-xs font-mono text-[var(--muted)] mt-0.5">{selectedBranch}</p>
        </div>
        <input type="text" value={filter} onChange={e => setFilter(e.target.value)} placeholder="Filter products…"
          className="px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:border-[var(--accent)] w-64" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {filtered.map(p => {
          const qty = cart[p.barcode] || 0;
          return (
            <div key={p.barcode} className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
              <div className="text-[10px] font-mono uppercase tracking-wide text-[var(--muted)]">{p.category}</div>
              <div className="text-sm font-semibold text-[var(--text)] mt-1 leading-tight">{p.name}</div>
              <div className="text-lg font-bold text-[var(--accent)] mt-2">€{p.price.toFixed(2)}</div>
              <div className="flex items-center gap-2 mt-3">
                <button type="button" onClick={() => sub(p.barcode)} disabled={qty === 0} className="w-7 h-7 rounded border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] hover:border-[var(--accent)] disabled:opacity-30">−</button>
                <span className="flex-1 text-center font-mono text-sm">{qty}</span>
                <button type="button" onClick={() => add(p.barcode)} className="w-7 h-7 rounded border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] hover:border-[var(--accent)]">+</button>
              </div>
            </div>
          );
        })}
      </div>
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wide text-[var(--muted)]">Cart</div>
            <div className="text-2xl font-bold text-[var(--text)] mt-1">€{total.toFixed(2)}</div>
            <div className="text-[10px] font-mono text-[var(--muted)] mt-0.5">{items} items</div>
          </div>
          <button type="button" disabled={items === 0} onClick={() => setCart({})}
            className="px-4 py-2 text-sm font-semibold rounded-md bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] disabled:opacity-30">Save order</button>
        </div>
      </div>
    </div>
  );
}
