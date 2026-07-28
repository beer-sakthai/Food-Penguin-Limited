const fs = require('fs');

const filesToUpdate = [
  'src/components/OverviewTab.tsx',
  'src/components/TargetTab.tsx',
  'src/components/StudioTab.tsx',
  'src/components/PlanningTab.tsx',
  'src/components/ProductionTab.tsx',
  'src/components/HoursTab.tsx',
  'src/components/WasteTab.tsx',
  'src/App.tsx'
];

filesToUpdate.forEach(file => {
  if (fs.existsSync(file)) {
    let c = fs.readFileSync(file, 'utf8');

    c = c.replace(/focus:border-amber-500/g, 'focus:border-yellow-500 hover:-translate-y-0.5 active:scale-[0.98]');
    c = c.replace(/focus:border-emerald-500/g, 'focus:border-yellow-500 hover:-translate-y-0.5 active:scale-[0.98]');
    c = c.replace(/focus:ring-emerald-500\/20/g, 'focus:ring-yellow-500/20');
    c = c.replace(/focus:ring-amber-500\/20/g, 'focus:ring-yellow-500/20');
    
    // Replace standard outline-none focus styles where possible
    c = c.replace(/focus:outline-none focus:ring-2 focus:ring-zinc-800 focus:border-transparent/g, 
        'focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:shadow-[0_0_10px_rgba(234,179,8,0.2)] transition-all');
        
    c = c.replace(/focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:border-transparent/g, 
        'focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:shadow-[0_0_10px_rgba(234,179,8,0.2)] transition-all');
        
    c = c.replace(/focus:ring-2 focus:ring-emerald-500\/50/g, 
        'focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 focus:shadow-[0_0_10px_rgba(234,179,8,0.2)] transition-all');

    c = c.replace(/focus:ring-2 focus:ring-amber-500\/50/g, 
        'focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 focus:shadow-[0_0_10px_rgba(234,179,8,0.2)] transition-all');

    const focusGlow = ' focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:shadow-[0_0_10px_rgba(234,179,8,0.2)] transition-all hover:-translate-y-0.5 active:scale-[0.98]';

    fs.writeFileSync(file, c);
  }
});
