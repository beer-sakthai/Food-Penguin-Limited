import React from 'react';
import { BranchId, BranchData } from '../types';
import { BRANCHES } from '../data';
import { BarChart4, TrendingUp, AlertCircle, PieChart, Info } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';

interface KPITabProps {
  branchesData: Record<BranchId, BranchData>;
}

export default function KPITab({ branchesData }: KPITabProps) {
  // Aggregate data for comparison
  const comparisonData = BRANCHES.map(branch => {
    const data = branchesData[branch.id as BranchId];
    return {
      name: branch.name,
      Sales: data.metrics.salesToday,
      Waste: data.metrics.wasteCost,
      Production: data.metrics.productionItems,
      Hours: data.metrics.hoursScheduled
    };
  });

  const COLORS = ['#f97316', '#10b981', '#f43f5e'];

  const wasteDistributionData = BRANCHES.map(branch => ({
    name: branch.name,
    value: branchesData[branch.id as BranchId].metrics.wasteCost
  }));

  const totalEnterpriseSales = comparisonData.reduce((acc, curr) => acc + curr.Sales, 0);

  return (
    <div className="h-full space-y-6 overflow-y-auto scrollbar-hide pb-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-500 border border-indigo-100 dark:border-indigo-800/50">
          <BarChart4 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Business Intelligence KPI</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Enterprise-level comparative analytics across all locations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Branch vs Branch Sales */}
        <div className="bg-white dark:bg-black border border-slate-200 dark:border-amber-500/30 rounded-3xl p-6 shadow-sm flex flex-col h-96 relative overflow-hidden ring-1 ring-inset ring-white/5">
          <div className="absolute right-0 top-0 w-48 h-48 bg-amber-500/5 rounded-full filter blur-3xl pointer-events-none" />
          <div className="flex items-center justify-between pb-4 relative z-10">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Revenue Comparison
                <Info className="w-4 h-4 text-slate-400 cursor-pointer" />
              </h3>
              <p className="text-xs text-slate-500 dark:text-amber-500/70">Total Sales Today by Location</p>
            </div>
            <div className="text-right p-2 border border-slate-100 dark:border-amber-500/20 rounded-xl bg-slate-50 dark:bg-amber-950/20 backdrop-blur-sm">
              <span className="block text-[10px] font-mono uppercase text-slate-400 dark:text-amber-500/80">Total Enterprise</span>
              <span className="text-lg font-black text-emerald-500 dark:text-amber-400 drop-shadow-sm">€{totalEnterpriseSales.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }} 
                />
                <Bar dataKey="Sales" radius={[6, 6, 0, 0]} maxBarSize={60}>
                  {comparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Waste vs Sales Efficiency */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col h-96">
          <div className="flex items-center justify-between pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Operational Efficiency
                <AlertCircle className="w-4 h-4 text-orange-400 cursor-pointer" />
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Production vs. Waste Correlation</p>
            </div>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }} 
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Line yAxisId="left" type="monotone" dataKey="Production" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line yAxisId="right" type="monotone" dataKey="Waste" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Waste Distribution */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col h-80">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Enterprise Waste Distribution
                <PieChart className="w-4 h-4 text-rose-400" />
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Cost allocation across branches</p>
            </div>
          </div>
          <div className="flex-1 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={wasteDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {wasteDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `€${value.toFixed(2)}`}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }} 
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Labor Hours Matrix */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col h-80">
          <div className="flex items-center justify-between pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Labor Utilization Matrix
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Scheduled Hours vs Sales Output</p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto pr-2">
            <div className="space-y-4">
              {comparisonData.map((branch, index) => {
                const efficiency = (branch.Sales / branch.Hours).toFixed(2);
                return (
                  <div key={branch.name} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="font-bold text-slate-700 dark:text-slate-200 text-sm truncate">{branch.name}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="block text-sm font-black text-slate-900 dark:text-white truncate">€{efficiency} / hr</span>
                      <span className="text-[10px] text-slate-400 font-mono uppercase truncate">Revenue per Hour</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
