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

    // Add button micro-animations
    // Find generic standard button hover styles
    c = c.replace(/className=\{\`([^`]*?)hover:([^`]*?)\`\}/g, (match, p1, p2) => {
        // Exclude rows (tr) or main containers if they are definitely not buttons, but the prompt says 
        // "Buttons, cards, and interactive rows include distinct micro-animations". So applying globally to hover: items is fine.
        if (!p1.includes('hover:-translate-y-0.5') && !p2.includes('hover:-translate-y-0.5')) {
           return `className={\`${p1} hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] hover:${p2}\`}`;
        }
        return match;
    });

    c = c.replace(/className="([^"]*?)hover:([^"]*?)"/g, (match, p1, p2) => {
        if (!p1.includes('hover:-translate-y-0.5') && !p2.includes('hover:-translate-y-0.5')) {
           return `className="${p1} hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] hover:${p2}"`;
        }
        return match;
    });

    fs.writeFileSync(file, c);
  }
});
