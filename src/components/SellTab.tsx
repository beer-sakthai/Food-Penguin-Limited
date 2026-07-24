// Saksee · 2026-07-24 · feat/new-design-system
import React, { useState } from "react";
import { Coins, Search, ShoppingCart, Minus, Plus, ArrowRight } from "lucide-react";

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

export default function SellTab({ selectedBranch }: { selectedBranch: string; theme: string }) {
  const isMS = selectedBranch.startsWith("Marks");
  const products = isMS ? MS_PRODUCTS : TESCO_PRODUCTS;
  const [cart, setCart] = useState<Record<string, number>>({});
  const [filter, setFilter] = useState("");
  const filtered = products.filter(p => !filter || p.name.toLowerCase().includes(filter.toLowerCase()) || p.category.toLowerCase().includes(filter.toLowerCase()));
  const add = (b: string) => setCart(c => ({ ...c, [b]: (c[b] || 0) + 1 }));
  const sub = (b: string) => setCart(c => ({ ...c, [b]: Math.max(0, (c[b] || 0) - 1) }));
  const total = Object.entries(cart).reduce((sum, [b, q]) => { const p = products.find(x => x.barcode === b); return sum + (p ? p.price * (Number(q) || 0) : 0); }, 0);
  const items = Object.values(cart).reduce((a, b) => Number(a) + Number(b), 0);

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center">
            <Coins className="w-5 h-5 text-[var(--accent)]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[var(--text)]">Sales</h1>
            <p className="text-xs text-[var(--muted)]">{selectedBranch}</p>
          </div>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="text"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Filter products…"
            className="input pl-9 w-64"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {filtered.map(p => {
          const qty = cart[p.barcode] || 0;
          return (
            <div key={p.barcode} className="card card-hover">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">{p.category}</div>
              <div className="text-sm font-medium text-[var(--text)] mt-1.5 leading-snug">{p.name}</div>
              <div className="metric-value text-[var(--accent)] mt-3">€{p.price.toFixed(2)}</div>
              <div className="flex items-center gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => sub(p.barcode)}
                  disabled={qty === 0}
                  className="btn btn-ghost w-8 h-8 p-0 justify-center disabled:opacity-30"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="flex-1 text-center font-mono text-sm text-[var(--text)]">{qty}</span>
                <button
                  type="button"
                  onClick={() => add(p.barcode)}
                  className="btn btn-ghost w-8 h-8 p-0 justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-5 h-5 text-[var(--accent)]" />
            <div>
              <div className="metric-value">€{total.toFixed(2)}</div>
              <div className="metric-label">{items} items in cart</div>
            </div>
          </div>
          <button
            type="button"
            disabled={items === 0}
            onClick={() => setCart({})}
            className="btn btn-primary disabled:opacity-30"
          >
            Save order <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
