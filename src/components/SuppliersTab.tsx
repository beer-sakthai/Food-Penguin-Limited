// Saksee · 2026-07-24 · supplier directory
import React from "react";
import { Package, Mail, Phone, ShoppingBag } from "lucide-react";

export default function SuppliersTab({ theme }: { theme: string }) {
  const suppliers = [
    { name: "Tazaki", category: "Seafood", contact: "orders@tazaki.ie", phone: "+353 21 480 0000", orders: 28 },
    { name: "Sysco", category: "Produce", contact: "cork@sysco.ie", phone: "+353 21 480 0001", orders: 35 },
    { name: "Bulza", category: "Grains", contact: "sales@bulza.ie", phone: "+353 21 480 0002", orders: 22 },
    { name: "Sticker", category: "Packaging", contact: "info@sticker.ie", phone: "+353 21 480 0003", orders: 18 },
    { name: "Others", category: "Mixed", contact: "—", phone: "—", orders: 12 },
  ];

  const totalOrders = suppliers.reduce((a, s) => a + s.orders, 0);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center">
          <Package className="w-5 h-5 text-[var(--accent)]" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-[var(--text)]">Suppliers</h1>
          <p className="text-xs text-[var(--muted)]">{suppliers.length} suppliers · {totalOrders} total orders</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Seafood", value: suppliers.find(s => s.category === "Seafood")?.orders || 0, sub: "orders", icon: ShoppingBag },
          { label: "Produce", value: suppliers.find(s => s.category === "Produce")?.orders || 0, sub: "orders", icon: ShoppingBag },
          { label: "Grains", value: suppliers.find(s => s.category === "Grains")?.orders || 0, sub: "orders", icon: ShoppingBag },
          { label: "Packaging", value: suppliers.find(s => s.category === "Packaging")?.orders || 0, sub: "orders", icon: ShoppingBag },
        ].map((k, i) => (
          <div key={i} className="card card-hover">
            <div className="flex items-center justify-between">
              <span className="metric-label">{k.label}</span>
              <k.icon className="w-4 h-4 text-[var(--subtle)]" />
            </div>
            <div className="mt-2 metric-value">{k.value}</div>
            <div className="text-xs text-[var(--muted)]">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="card overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Supplier</th>
              <th>Category</th>
              <th>Contact</th>
              <th>Phone</th>
              <th className="text-right">Orders</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s) => (
              <tr key={s.name}>
                <td className="font-medium">{s.name}</td>
                <td>{s.category}</td>
                <td>{s.contact === "—" ? s.contact : <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {s.contact}</span>}</td>
                <td>{s.phone === "—" ? s.phone : <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {s.phone}</span>}</td>
                <td className="text-right">{s.orders}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
