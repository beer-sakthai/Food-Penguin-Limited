const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

c = c.replace(/<div className="max-h-56 overflow-y-auto pr-1 space-y-2\.5 custom-scrollbar">\s*\{sortedDailyCapacityBreakdown\.map\(\(item, index\) => \{/, 
`<div className="max-h-56 overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
            {(() => {
              const avgWeeklyProjected = Math.round(dailyCapacityBreakdown.reduce((sum, d) => sum + d.projected, 0) / (dailyCapacityBreakdown.length || 1));
              return sortedDailyCapacityBreakdown.map((item, index) => {`);

c = c.replace(/<span className={`font-bold text-\[10px\] \$\{isBottleneck \? 'text-amber-400 font-bold' : item\.projected >= item\.current \? 'text-orange-400' : 'text-orange-500\/80'\}`} title="Projected">\s*\{item\.projected\}%\s*<\/span>\s*<\/div>/,
`<span className={\`font-bold text-[10px] \${isBottleneck ? 'text-amber-400 font-bold' : item.projected >= item.current ? 'text-orange-400' : 'text-orange-500/80'}\`} title="Projected">
                            {item.projected}%
                          </span>
                          <span className="ml-0.5 text-[10px] font-bold" title={\`Trend relative to weekly average (\${avgWeeklyProjected}%)\`}>
                            {item.projected > avgWeeklyProjected ? (
                                <span className="text-rose-500" title="Trending Up (Above avg)">↑</span>
                            ) : item.projected < avgWeeklyProjected ? (
                                <span className="text-emerald-500" title="Trending Down (Below avg)">↓</span>
                            ) : (
                                <span className="text-zinc-500" title="At weekly average">-</span>
                            )}
                          </span>
                        </div>`);

c = c.replace(/<\/div>\s*<\/div>\s*\);\s*}\)}\s*<\/div>\s*<\/aside>/,
`</div>
                        </div>
                      );
                    });
            })()}
          </div>
        </aside>`);

fs.writeFileSync('src/App.tsx', c);
