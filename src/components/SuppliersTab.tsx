// Saksee · 2026-07-24 · feat/density-cut
import React from "react";
import { Package } from "lucide-react";
export default function SuppliersTab({ theme }: { theme: string }) {
  const suppliers = [
    { name: "Tazaki", category: "Seafood", contact: "[email protected]", phone: "+353 21 555 0100", orders: 28 },
    { name: "Sysco", category: "Produce", contact: "[email protected]", phone: "+353 21 555 0200", orders: 35 },
    { name: "Bulza", category: "Grains", contact: "[email protected]", phone: "+353 21 555 0300", orders: 22 },
    { name: "Sticker", category: "Packaging", contact: "[email protected]", phone: "+353 21 555 0400", orders: 18 },
    { name: "Others", category: "Mixed", contact: "—", phone: "—", orders: 12 },
  ];
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-bold text-[var(--text)] flex items-center gap-2"><Package className="w-5 h-5 text-[var(--accent)]" />Suppliers</h1>
        <p className="text-xs font-mono text-[var(--muted)] mt-0.5">{suppliers.length} suppliers</p>
      </div>
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-[var(--panel)] text-[var(--muted)]">
            <tr><th className="text-left px-4 py-2 font-medium">Name</th><th className="text-left px-4 py-2 font-medium">Category</th><th className="text-left px-4 py-2 font-medium">Email</th><th className="text-left px-4 py-2 font-medium">Phone</th><th className="text-right px-4 py-2 font-medium">Orders</th></tr>
          </thead>
          <tbody>{suppliers.map(s => (
            <tr key={s.name} className="border-t border-[var(--border)] hover:bg-[var(--panel)]">
              <td className="px-4 py-2 font-medium text-[var(--text)]">{s.name}</td>
              <td className="px-4 py-2 text-[var(--muted)]">{s.category}</td>
              <td className="px-4 py-2 font-mono text-[var(--muted)]">{s.contact}</td>
              <td className="px-4 py-2 font-mono text-[var(--muted)]">{s.phone}</td>
              <td className="px-4 py-2 text-right font-mono">{s.orders}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
