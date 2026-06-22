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

    // add specific glow effect
    c = c.replace(/focus:ring-yellow-500 focus:border-yellow-500/g, 'focus:ring-yellow-500 focus:border-yellow-500 focus:shadow-[0_0_10px_rgba(234,179,8,0.2)] transition-all');
    
    // replace focus:ring-emerald-500 or amber-500
    c = c.replace(/focus:ring-emerald-500/g, 'focus:ring-yellow-500 focus:border-yellow-500 focus:shadow-[0_0_10px_rgba(234,179,8,0.2)] transition-all');
    c = c.replace(/focus:ring-amber-500/g, 'focus:ring-yellow-500 focus:border-yellow-500 focus:shadow-[0_0_10px_rgba(234,179,8,0.2)] transition-all');
    c = c.replace(/focus:ring-yellow-500 focus:shadow-\[0_0_10px_rgba\(234,179,8,0\.2\)\] transition-all\/20/g, 'focus:ring-yellow-500/20');
    c = c.replace(/focus:border-yellow-500 focus:shadow-\[0_0_10px_rgba\(234,179,8,0\.2\)\] transition-all focus:shadow-\[0_0_10px_rgba\(234,179,8,0\.2\)\] transition-all/g, 'focus:border-yellow-500 focus:shadow-[0_0_10px_rgba(234,179,8,0.2)] transition-all');
    
    fs.writeFileSync(file, c);
  }
});
