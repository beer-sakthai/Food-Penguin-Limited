// Saksee · 2026-07-24 · real Tesco + Bento (M&S) product catalog
import React, { useState } from "react";
import { Search, ShoppingCart, Package, QrCode, Check, X } from "lucide-react";
import { TESCO_PRODUCTS, MS_PRODUCTS } from "../business";
import type { SalesOrder } from "../types";

export { TESCO_PRODUCTS, MS_PRODUCTS };

interface SellTabProps {
  orders: SalesOrder[];
  onAddOrder: (order: Omit<SalesOrder, "id" | "timestamp" | "status">) => void;
  selectedBranch: string;
}

export default function SellTab({ orders, onAddOrder, selectedBranch }: SellTabProps) {
  const [search, setSearch] = useState("");
  const [addedBarcodes, setAddedBarcodes] = useState<Record<string, boolean>>({});
  const isTesco = selectedBranch.includes("Tesco");
  const products = isTesco ? TESCO_PRODUCTS : MS_PRODUCTS;
  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search));

  const handleAddProduct = (p: typeof products[0]) => {
    onAddOrder({
      item: p.name,
      category: "Sushi",
      quantity: 1,
      amount: p.price,
      barcode: p.barcode,
      branch: selectedBranch,
      date: new Date().toISOString().slice(0, 10),
    });

    setAddedBarcodes((prev) => ({ ...prev, [p.barcode]: true }));
    setTimeout(() => {
      setAddedBarcodes((prev) => {
        const next = { ...prev };
        delete next[p.barcode];
        return next;
      });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center">
          <ShoppingCart className="w-5 h-5 text-[var(--accent)]" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-[var(--text)]">Sell</h1>
          <p className="text-xs text-[var(--muted)]">{products.length} products · {selectedBranch}</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search product or barcode..."
          className="input w-full pl-10 pr-10"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--muted)] hover:text-[var(--text)] transition-colors rounded-md focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((p) => {
          const isAdded = Boolean(addedBarcodes[p.barcode]);
          return (
            <div key={p.barcode} className="card card-hover flex items-center justify-between">
              <div className="min-w-0">
                <div className="font-medium text-sm text-[var(--text)] truncate">{p.name}</div>
                <div className="flex items-center gap-2 text-xs text-[var(--muted)] mt-1">
                  <QrCode className="w-3 h-3" /> {p.barcode}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-[var(--accent)]">€{p.price.toFixed(2)}</div>
                <button
                  type="button"
                  onClick={() => handleAddProduct(p)}
                  aria-label={isAdded ? `Added ${p.name}` : `Add ${p.name} to order`}
                  className={`btn btn-sm mt-1 inline-flex items-center justify-center gap-1 transition-all ${
                    isAdded
                      ? "bg-[var(--ok-soft)] text-[var(--ok)] border border-[var(--ok-ring)]"
                      : ""
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Added
                    </>
                  ) : (
                    "Add"
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center text-[var(--muted)] text-sm py-12">No products match “{search}”</div>
      )}

      <div className="card">
        <h2 className="section-title mb-3 flex items-center gap-2">
          <Package className="w-4 h-4" /> Recent orders ({orders.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Item</th>
                <th>Qty</th>
                <th>Amount</th>
                <th>Branch</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 10).map((o) => (
                <tr key={o.id}>
                  <td>{o.timestamp}</td>
                  <td>{o.item}</td>
                  <td>{o.quantity}</td>
                  <td>€{o.amount.toFixed(2)}</td>
                  <td>{o.branch}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
