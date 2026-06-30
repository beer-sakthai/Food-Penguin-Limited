const fs = require('fs');
const appFile = 'src/App.tsx';
let appContent = fs.readFileSync(appFile, 'utf8');

// 1. Inject isMaxCap
const target1 = `const isBottleneck = item.projected > bottleneckThreshold;`;
const replace1 = `const isBottleneck = item.projected > bottleneckThreshold;\n const isMaxCap = item.projected >= 100;`;
appContent = appContent.replace(target1, replace1);

// 2. Update Reorder.Item className
const target2 = `className={\`flex flex-col gap-1.5 pb-2 last:border-0 last:pb-0 transition-all duration-700 \${ isLight ? 'border-zinc-200' : 'border-b border-zinc-950/40' } \${ isBottleneck ? isLight ? 'bg-amber-50 border-2 border-amber-400 p-2.5 rounded-xl my-1 text-zinc-900 shadow-[0_0_12px_rgba(245,158,11,0.4)] animate-[pulse_2s_ease-in-out_infinite]' : 'bg-amber-900/10 border-2 border-amber-500/60 p-2.5 rounded-xl my-1 shadow-[0_0_15px_rgba(245,158,11,0.3)] text-zinc-300 animate-[pulse_2s_ease-in-out_infinite]' : 'px-1 pt-1' } \${ focusedDay === item.day ? 'ring-2 ring-yellow-500 border-yellow-500 rounded-xl p-2.5 shadow-[0_0_20px_rgba(234,179,8,0.75)] scale-[1.02] bg-yellow-500/5 dark:bg-yellow-500/10 z-10' : '' }\`}`;
const replace2 = `className={\`flex flex-col gap-1.5 pb-2 last:border-0 last:pb-0 transition-all duration-700 \${ isLight ? 'border-zinc-200' : 'border-b border-zinc-950/40' } \${ isMaxCap ? (isLight ? 'bg-red-50 border-2 border-red-500 p-2.5 rounded-xl my-1 text-zinc-900 shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-[pulse_1.5s_ease-in-out_infinite]' : 'bg-red-950/40 border-2 border-red-600 p-2.5 rounded-xl my-1 shadow-[0_0_25px_rgba(220,38,38,0.5)] text-red-100 animate-[pulse_1.5s_ease-in-out_infinite]') : isBottleneck ? (isLight ? 'bg-amber-50 border-2 border-amber-400 p-2.5 rounded-xl my-1 text-zinc-900 shadow-[0_0_12px_rgba(245,158,11,0.4)] animate-[pulse_2s_ease-in-out_infinite]' : 'bg-amber-900/10 border-2 border-amber-500/60 p-2.5 rounded-xl my-1 shadow-[0_0_15px_rgba(245,158,11,0.3)] text-zinc-300 animate-[pulse_2s_ease-in-out_infinite]') : 'px-1 pt-1' } \${ focusedDay === item.day ? 'ring-2 ring-yellow-500 border-yellow-500 rounded-xl p-2.5 shadow-[0_0_20px_rgba(234,179,8,0.75)] scale-[1.02] bg-yellow-500/5 dark:bg-yellow-500/10 z-10' : '' }\`}`;
appContent = appContent.replace(target2, replace2);

// 3. Replace the Hot badge
const target3 = `{isBottleneck && (
 <span className={\`text-[7.5px] font-mono leading-none py-0.5 px-1 rounded-sm font-bold uppercase tracking-wider animate-pulse inline-flex items-center gap-0.5 shadow-lg \${isLight ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20 shadow-amber-500/35' : 'bg-3d-copper-dark metallic-base drop-shadow-xl shadow-yellow-500/45'}\`}>
                        {isLight && <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />} Hot
                        </span>
  )}`;
const replace3 = `{isMaxCap ? (
 <span className={\`text-[7.5px] font-mono leading-none py-0.5 px-1 rounded-sm font-bold uppercase tracking-wider animate-pulse inline-flex items-center gap-0.5 shadow-lg \${isLight ? 'bg-red-500/10 text-red-600 border border-red-500/20 shadow-red-500/35' : 'bg-red-950 text-red-500 border border-red-500 shadow-red-500/45'}\`}>
                        {isLight && <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />} MAX CAP
                        </span>
  ) : isBottleneck ? (
 <span className={\`text-[7.5px] font-mono leading-none py-0.5 px-1 rounded-sm font-bold uppercase tracking-wider animate-pulse inline-flex items-center gap-0.5 shadow-lg \${isLight ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20 shadow-amber-500/35' : 'bg-3d-copper-dark metallic-base drop-shadow-xl shadow-yellow-500/45'}\`}>
                        {isLight && <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />} Hot
                        </span>
  ) : null}`;
appContent = appContent.replace(target3, replace3);

// 4. Update the slider background and accent
const target4_accent = `accentColor: '#eab308',`;
const target4_bg = `background: \`linear-gradient(to right, #eab308 0%, #eab308 \${((bottleneckThreshold - 50) / 50) * 100}%, \${isLight ? '#e4e4e7' : '#27272a'} \${((bottleneckThreshold - 50) / 50) * 100}%, \${isLight ? '#e4e4e7' : '#27272a'} 100%)\``;

const replace4_accent = `accentColor: bottleneckThreshold >= 95 ? '#ef4444' : bottleneckThreshold >= 80 ? '#f59e0b' : '#10b981',`;
const replace4_bg = `background: \`linear-gradient(to right, \${bottleneckThreshold >= 95 ? '#ef4444' : bottleneckThreshold >= 80 ? '#f59e0b' : '#10b981'} 0%, \${bottleneckThreshold >= 95 ? '#ef4444' : bottleneckThreshold >= 80 ? '#f59e0b' : '#10b981'} \${((bottleneckThreshold - 50) / 50) * 100}%, \${isLight ? '#e4e4e7' : '#27272a'} \${((bottleneckThreshold - 50) / 50) * 100}%, \${isLight ? '#e4e4e7' : '#27272a'} 100%)\``;

appContent = appContent.replace(target4_accent, replace4_accent);
appContent = appContent.replace(target4_bg, replace4_bg);

fs.writeFileSync(appFile, appContent, 'utf8');
console.log('App.tsx Max Cap logic updated successfully!');
