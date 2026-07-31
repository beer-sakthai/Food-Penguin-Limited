// Saksee · 2026-07-25 · CSV price/product importer for FPL branches
import React, { useState, useEffect } from "react";
import { Upload, FileSpreadsheet, Trash2, CheckCircle2, AlertTriangle, Store } from "lucide-react";
import { BRANCH_META, type BusinessLocation } from "../business";

export interface ImportedProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  barcode?: string;
  branch: BusinessLocation;
  source: string;
}

interface PriceImporterTabProps {
  onProductsImported?: (products: ImportedProduct[]) => void;
}

const STORAGE_KEY = "fpl-imported-products";

export function getImportedProducts(): ImportedProduct[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ImportedProduct[]) : [];
  } catch {
    return [];
  }
}

function saveImportedProducts(products: ImportedProduct[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch {}
}

function parseCsv(text: string, branch: BusinessLocation): ImportedProduct[] {
  const lines = text.replace(/\r\n/g, "\n").split("\n").filter(Boolean);
  if (lines.length === 0) return [];

  const header = lines[0].toLowerCase().split(",").map((h) => h.trim());
  const nameIdx = header.findIndex((h) => h.includes("name") || h.includes("product") || h.includes("item"));
  const priceIdx = header.findIndex((h) => h.includes("price") || h.includes("cost") || h.includes("value"));
  const catIdx = header.findIndex((h) => h.includes("category") || h.includes("type") || h.includes("range"));
  const barcodeIdx = header.findIndex((h) => h.includes("barcode") || h.includes("code") || h.includes("sku"));

  const rows: ImportedProduct[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    if (cols.length < Math.max(nameIdx + 1, priceIdx + 1, 2)) continue;
    const name = (cols[nameIdx >= 0 ? nameIdx : 0] || "").trim();
    const priceRaw = parseFloat((cols[priceIdx >= 0 ? priceIdx : 1] || "").replace(/[^0-9.]/g, ""));
    if (!name || Number.isNaN(priceRaw) || priceRaw <= 0) continue;
    rows.push({
      id: `${branch}-${i}`,
      name,
      price: priceRaw,
      category: catIdx >= 0 ? (cols[catIdx] || "").trim() : "General",
      barcode: barcodeIdx >= 0 ? (cols[barcodeIdx] || "").trim() : undefined,
      branch,
      source: `csv-import-${new Date().toISOString().slice(0, 10)}`,
    });
  }
  return rows;
}

export default function PriceImporterTab({ onProductsImported }: PriceImporterTabProps) {
  const [stored, setStored] = useState<ImportedProduct[]>([]);
  const [csvText, setCsvText] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<BusinessLocation>(BRANCH_META[0].name);
  const [message, setMessage] = useState<{ type: "ok" | "bad"; text: string } | null>(null);

  useEffect(() => {
    setStored(getImportedProducts());
  }, []);

  const handleImport = () => {
    const parsed = parseCsv(csvText, selectedBranch);
    if (parsed.length === 0) {
      setMessage({ type: "bad", text: "No valid rows found. Need at least name,price columns." });
      return;
    }
    const next = [...stored.filter((p) => p.branch !== selectedBranch), ...parsed];
    saveImportedProducts(next);
    setStored(next);
    setCsvText("");
    setMessage({ type: "ok", text: `${parsed.length} products imported for ${selectedBranch}.` });
    onProductsImported?.(parsed);
  };

  const clearAll = () => {
    if (confirm("Clear all imported products?")) {
      saveImportedProducts([]);
      setStored([]);
      setMessage({ type: "ok", text: "Cleared imported products." });
    }
  };

  const countByBranch = BRANCH_META.map((b) => ({
    branch: b.name,
    short: b.short,
    colour: b.colour,
    count: stored.filter((p) => p.branch === b.name).length,
  }));

  return (
    <div className="page-shell space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center shrink-0">
            <Upload className="w-5 h-5 text-[var(--accent)]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[var(--text)]">Price / product import</h1>
            <p className="text-xs text-[var(--muted)]">Paste CSV price lists per branch. Stored locally until real Drive sync is connected.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {countByBranch.map((b) => (
          <div key={b.branch} className="card flex items-center gap-3">
            <span className="w-3 h-3 rounded-full" style={{ background: b.colour, boxShadow: `0 0 8px ${b.colour}` }} />
            <div>
              <div className="text-xs text-[var(--muted)]">{b.short}</div>
              <div className="text-lg font-semibold font-mono">{b.count}</div>
              <div className="text-[10px] text-[var(--muted)]">imported products</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card space-y-4">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-[var(--accent)]" />
            <h2 className="section-title">Import CSV</h2>
          </div>

          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value as BusinessLocation)}
            className="select w-full"
          >
            {BRANCH_META.map((b) => (
              <option key={b.id} value={b.name}>
                {b.short} — {b.name}
              </option>
            ))}
          </select>

          <textarea
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder={`name,price,category,barcode\nSpicy salmon roll,7.25,Sushi,5391548890372\nChicken katsu curry,7.95,Hot,5391548890617`}
            rows={10}
            className="input w-full font-mono text-xs"
          />

          <div className="flex items-center gap-3">
            <button type="button" onClick={handleImport} className="btn btn-primary">
              Import {countByBranch.find((b) => b.branch === selectedBranch)?.short}
            </button>
            <button type="button" onClick={clearAll} className="btn btn-ghost text-[var(--bad)]">
              <Trash2 className="w-4 h-4" /> Clear all
            </button>
          </div>

          {message && (
            <div className={`rounded-lg p-3 text-xs flex items-center gap-2 ${message.type === "ok" ? "bg-[var(--accent-soft)] text-[var(--ok)]" : "bg-[var(--bad-soft)] text-[var(--bad)]"}`}>
              {message.type === "ok" ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              {message.text}
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Store className="w-4 h-4 text-[var(--accent)]" />
            <h2 className="section-title">Imported products</h2>
            <span className="text-[11px] text-[var(--muted)] ml-auto">{stored.length} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Branch</th>
                  <th>Product</th>
                  <th className="text-right">Price</th>
                  <th>Category</th>
                </tr>
              </thead>
              <tbody>
                {stored.slice(0, 50).map((p) => (
                  <tr key={p.id}>
                    <td className="text-[11px]">
                      {p.branch === "Tesco - Cork City" ? "Cork" : p.branch === "Tesco - Mahon Point" ? "Mahon" : "M&S"}
                    </td>
                    <td className="font-medium">{p.name}</td>
                    <td className="text-right font-mono">€{p.price.toFixed(2)}</td>
                    <td className="text-[11px] text-[var(--muted)]">{p.category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {stored.length > 50 && <div className="text-[11px] text-[var(--muted)] mt-2">...and {stored.length - 50} more</div>}
        </div>
      </div>
    </div>
  );
}
