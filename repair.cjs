const fs = require('fs');
let c = fs.readFileSync('src/components/OverviewTab.tsx', 'utf8');

const prefixIdx = c.indexOf('{/* Interactive Production & Revenue Chart */}');
const suffixIdx = c.lastIndexOf('{/* Comparison Dashboard Grid */}');

const prefix = c.substring(0, prefixIdx);
const suffix = c.substring(suffixIdx);

const reconstructedMainCharts = `
{/* Interactive Production & Revenue Chart */}
        <div className={\`lg:col-span-2 rounded-3xl p-6 transition-all duration-300 \${isLight ? 'bg-amber-50/50 border border-amber-200' : 'bg-3d-gold-dark metallic-base drop-shadow-xl'}\`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className={\`text-lg font-sans font-bold \${isLight ? 'text-zinc-900' : 'text-3d-gold drop-shadow-md'}\`}>Performance Index</h3>
                <span className={\`text-[10px] border font-mono px-2 py-0.5 rounded font-semibold uppercase tracking-wider \${
                  isLight 
                    ? 'bg-emerald-50 text-emerald-750 text-emerald-700 border-emerald-250 border-emerald-200' 
                    : 'bg-emerald-950/40 text-emerald-400 border-emerald-900/40'
                }\`}>
                  {chartView === 'weekly' ? 'Week Overview' : 'Today Overview'}
                </span>
              </div>
              <p className="subtitle text-xs text-zinc-500 uppercase font-semibold">
                {chartView === 'weekly' ? '7-Day operational flow analysis' : 'Correlated hourly view of cumulative metrics'}
              </p>
            </div>
            <div className="flex items-center gap-2">
               <button
                  type="button"
                  onClick={() => setChartView('hourly')}
                  className={\`px-3 py-1.5 text-[10px] uppercase tracking-wider rounded-lg font-mono font-bold transition-all \${
                    chartView === 'hourly'
                      ? 'bg-amber-500 text-zinc-950 shadow-md'
                      : isLight ? 'text-zinc-500 hover:text-amber-700 hover:bg-white' : 'text-zinc-400 hover:bg-zinc-800'
                  }\`}
                >
                  Hourly
                </button>
                <button
                  type="button"
                  onClick={() => setChartView('weekly')}
                  className={\`px-3 py-1.5 text-[10px] uppercase tracking-wider rounded-lg font-mono font-bold transition-all \${
                    chartView === 'weekly'
                      ? 'bg-amber-500 text-zinc-950 shadow-md'
                      : isLight ? 'text-zinc-500 hover:text-amber-700 hover:bg-white' : 'text-zinc-400 hover:bg-zinc-800'
                  }\`}
                >
                  Weekly
                </button>
            </div>
          </div>
          <div className="h-72 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartView === 'weekly' ? weeklyData : hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isLight ? '#e4e4e7' : '#27272a'} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: isLight ? '#71717a' : '#a1a1aa', fontSize: 11 }} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: isLight ? '#71717a' : '#a1a1aa', fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: isLight ? '#71717a' : '#a1a1aa', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: isLight ? '#fff' : '#18181b', borderRadius: '12px', border: \`1px solid \${isLight ? '#e4e4e7' : '#27272a'}\` }} />
                <Line yAxisId="left" type="monotone" dataKey="Sales" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
                <Area yAxisId="left" type="monotone" dataKey="Sales" stroke="none" fill="url(#colorSales)" />
                <Line yAxisId="right" type="monotone" dataKey="Production" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
                <Area yAxisId="right" type="monotone" dataKey="Production" stroke="none" fill="url(#colorProd)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Branch Compare Config Header */}
        <div className={\`lg:col-span-1 rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 \${isLight ? 'bg-white border border-zinc-200' : 'bg-zinc-950 border border-zinc-900 shadow-xl shadow-amber-500/5'}\`}>
          <div>
            <h3 className={\`text-lg font-sans font-bold flex items-center gap-2 \${isLight ? 'text-zinc-900' : 'text-white'}\`}>
              <Layers className="w-5 h-5 text-amber-500" />
              Branch Compare
            </h3>
            <p className="text-xs text-zinc-500 mt-2">Measure relative performance between individual stores and benchmarks.</p>
            
            <div className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-zinc-500 mb-1.5 block">Branch A</label>
                <select
                  value={compareBranchA}
                  onChange={(e) => {
                    setCompareBranchA(e.target.value);
                    setCompareMode('twoBranches');
                  }}
                  className={\`w-full px-3 py-2.5 rounded-xl border text-sm transition-all outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 \${
                    isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-white'
                  }\`}
                >
                  <option value="m_s_cork">M&S Cork</option>
                  <option value="tesco_cork">Tesco Cork</option>
                  <option value="tesco_mahon">Tesco Mahon</option>
                </select>
              </div>
              <div className="flex justify-center">
                <span className="text-zinc-400 font-mono text-xs font-bold bg-zinc-100 dark:bg-zinc-900 px-3 py-1 rounded-full">VS</span>
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-zinc-500 mb-1.5 block">Branch B</label>
                <select
                  value={compareBranchB}
                  onChange={(e) => {
                    setCompareBranchB(e.target.value);
                    setCompareMode('twoBranches');
                  }}
                  className={\`w-full px-3 py-2.5 rounded-xl border text-sm transition-all outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 \${
                    isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-white'
                  }\`}
                >
                  <option value="m_s_cork">M&S Cork</option>
                  <option value="tesco_cork">Tesco Cork</option>
                  <option value="tesco_mahon">Tesco Mahon</option>
                </select>
              </div>
            </div>
          </div>
          <button
            onClick={() => setCompareMode(compareMode === 'all' ? 'twoBranches' : 'all')}
            className={\`w-full mt-6 px-4 py-3 rounded-xl border font-bold text-sm transition-all \${
              compareMode === 'all'
                ? 'bg-amber-500 text-zinc-950 border-amber-600'
                : isLight ? 'bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200' : 'bg-zinc-900 bg-opacity-60 border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white'
            }\`}
          >
            {compareMode === 'all' ? 'Viewing All Active Branches' : 'View All Global Branches'}
          </button>
        </div>
      </div>
      
      <div className="mt-10">
      `;

fs.writeFileSync('src/components/OverviewTab.tsx', prefix + reconstructedMainCharts + suffix);
