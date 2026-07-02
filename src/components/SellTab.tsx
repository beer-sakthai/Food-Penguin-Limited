import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { Barcode } from './Barcode.client'; // Assuming Barcode is moved to its own file
import { useProductData } from '../hooks/useProductData.ts'; // Custom hook for data logic

interface SellTabProps {
  selectedBranch: string;
  theme: string;
}

export default function SellTab({ selectedBranch, theme }: SellTabProps) {
  const isLight = theme === 'light';
  const {
    products,
    distribution,
    distributionPercentages
  } = useProductData(selectedBranch);

  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const currentProducts = products.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  return (
    <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-12 items-start pb-16 pt-8">
      {/* LEFT COLUMN: Data & Analysis */}
      <div className="space-y-16">
        {/* HEADER */}
        <div className="flex flex-col gap-2">
          <h1 className={`text-2xl font-black tracking-tight ${isLight ? 'text-zinc-900' : 'text-zinc-100'}`}>
            {selectedBranch}
          </h1>
          <p className={`text-base font-medium ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
            {products.length} unique products listed
          </p>
        </div>

        {/* SALES PERFORMANCE VISUALIZATION */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800/50 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-5 h-5 text-amber-500" />
                <h2 className={`text-lg font-bold tracking-wide uppercase ${isLight ? 'text-zinc-900' : 'text-zinc-300'}`}>Revenue Trajectory</h2>
              </div>
              <p className="text-sm text-zinc-500">Gourmet sushi sales performance over 6 months</p>
            </div>
            <div className="flex gap-6">
              <div className="text-right">
                <p className="text-xs font-mono uppercase tracking-wider text-zinc-500">Average</p>
                <p className={`text-3xl font-black ${isLight ? 'text-zinc-900' : 'text-zinc-100'}`}>€51.0K</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-mono uppercase tracking-wider text-zinc-500">Peak</p>
                <p className="text-3xl font-black text-amber-500">€62.0K <span className="text-sm text-zinc-500 font-medium">(Jun)</span></p>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { month: 'Jan', Sales: 42000 },
                { month: 'Feb', Sales: 48000 },
                { month: 'Mar', Sales: 51000 },
                { month: 'Apr', Sales: 49000 },
                { month: 'May', Sales: 55000 },
                { month: 'Jun', Sales: 62000 },
              ]} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="sellRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke={isLight ? '#e4e4e7' : '#27272a'} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: isLight ? '#71717a' : '#71717a', fontSize: 15 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: isLight ? '#71717a' : '#71717a', fontSize: 15 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: isLight ? '#fff' : '#18181b', borderRadius: '8px', border: `1px solid ${isLight ? '#e4e4e7' : '#27272a'}`, boxShadow: 'none' }}
                  formatter={(value: number) => [`€${value.toLocaleString()}`, 'Sales']}
                />
                <Area type="monotone" dataKey="Sales" stroke="#f59e0b" strokeWidth={2} fill="url(#sellRevenueGrad)" dot={{ r: 3, strokeWidth: 2, fill: '#18181b', stroke: '#f59e0b' }} activeDot={{ r: 5, fill: '#f59e0b' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ANALYTICS FOOTER */}
        <div className="space-y-8 pt-8 border-t border-zinc-200 dark:border-zinc-800/50">
          <h2 className={`text-lg font-bold tracking-wide uppercase ${isLight ? 'text-zinc-900' : 'text-zinc-300'}`}>Distribution Analysis</h2>
          <div className="grid grid-cols-3 gap-8">
            <div>
              <div className={`text-4xl font-black mb-1 ${isLight ? 'text-zinc-900' : 'text-zinc-100'}`}>{distributionPercentages.seafood}%</div>
              <p className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>Seafood</p>
            </div>
            <div>
              <div className={`text-4xl font-black mb-1 ${isLight ? 'text-zinc-900' : 'text-zinc-100'}`}>{distributionPercentages.chicken}%</div>
              <p className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>Chicken</p>
            </div>
            <div>
              <div className={`text-4xl font-black mb-1 ${isLight ? 'text-zinc-900' : 'text-zinc-100'}`}>{distributionPercentages.veggie}%</div>
              <p className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>Veg/Vegan</p>
            </div>
          </div>

          {/* HORIZONTAL BAR CHART */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-4">
              <div className={`w-24 text-sm font-bold uppercase tracking-wider ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>Seafood</div>
              <div className={`flex-1 h-2 rounded-full overflow-hidden ${isLight ? 'bg-zinc-200' : 'bg-zinc-800'}`}>
                <div style={{ width: `${distributionPercentages.seafood}%` }} className="h-full bg-zinc-400 dark:bg-zinc-500"></div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className={`w-24 text-sm font-bold uppercase tracking-wider ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>Chicken</div>
              <div className={`flex-1 h-2 rounded-full overflow-hidden ${isLight ? 'bg-zinc-200' : 'bg-zinc-800'}`}>
                <div style={{ width: `${distributionPercentages.chicken}%` }} className="h-full bg-amber-500"></div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className={`w-24 text-sm font-bold uppercase tracking-wider ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>Veg/Vegan</div>
              <div className={`flex-1 h-2 rounded-full overflow-hidden ${isLight ? 'bg-zinc-200' : 'bg-zinc-800'}`}>
                <div style={{ width: `${distributionPercentages.veggie}%` }} className="h-full bg-zinc-300 dark:bg-zinc-600"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Products List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800/50 mb-4">
          <h2 className={`text-lg font-bold tracking-wide uppercase ${isLight ? 'text-zinc-900' : 'text-zinc-300'}`}>Product Inventory</h2>
          <div className={`font-mono text-xs font-bold ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>
            PAGE {currentPage + 1} OF {totalPages}
          </div>
        </div>

        <div className="flex flex-col">
          {currentProducts.map((p, i) => (
            <div key={i} className={`py-4 border-b ${isLight ? 'border-zinc-100' : 'border-zinc-800/50'} flex items-center justify-between transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] group cursor-default`}>
              <div className="flex-1 pr-4">
                <h3 className={`text-base font-bold leading-tight transition-colors ${isLight ? 'text-zinc-800 group-hover:text-zinc-900' : 'text-zinc-300 group-hover:text-zinc-100'}`}>{p.name}</h3>
                <p className={`text-sm font-bold mt-1 ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>€{p.price.toFixed(2)}</p>
              </div>
              <div className="shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
                <Barcode value={p.barcode || '0000000000000'} isLight={isLight} />
              </div>
            </div>
          ))}
        </div>

        {/* PAGINATION CONTROLS */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-8">
            <button className={`btn-interactive flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition-all ${currentPage === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:-translate-y-0.5 active:scale-[0.98] hover:text-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 rounded-md p-1'}`} onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 0}>
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>

            <button className={`btn-interactive flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition-all ${currentPage === totalPages - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:-translate-y-0.5 active:scale-[0.98] hover:text-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 rounded-md p-1'}`} onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages - 1}>
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
