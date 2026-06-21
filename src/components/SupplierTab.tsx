import { supplierCatalog } from '../lib/supplierCatalog';

interface SupplierTabProps {
  theme: 'dark' | 'light';
}

export default function SupplierTab({ theme }: SupplierTabProps) {
  const isLight = theme === 'light';

  return (
    <section className="space-y-6">
      <div className={`rounded-3xl border p-6 transition-colors ${isLight ? 'bg-white border-zinc-200' : 'bg-zinc-950 border-zinc-900'}`}>
        <p className={`text-[10px] font-mono uppercase tracking-widest font-bold ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>COGS Supplier Master List</p>
        <h2 className={`mt-2 text-xl font-black ${isLight ? 'text-zinc-900' : 'text-3d-gold drop-shadow-md'}`}>Supplier Catalog</h2>
        <p className="mt-1 text-xs text-zinc-500">Centralized COG supplier and item mapping for purchasing and planning.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {supplierCatalog.map((supplier) => (
          <article
            key={supplier.name}
            className={`rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] ${
              isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-850'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className={`text-sm font-bold ${isLight ? 'text-zinc-900' : 'text-zinc-200'}`}>{supplier.name}</h3>
              <span className={`text-[10px] font-mono px-2 py-1 rounded-full border ${isLight ? 'border-zinc-300 text-zinc-600' : 'border-zinc-700 text-zinc-400'}`}>
                {supplier.items.length} items
              </span>
            </div>
            <ul className={`space-y-1.5 text-xs ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
              {supplier.items.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-orange-500 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
