const fs = require('fs');

const path = 'src/App.tsx';
const content = fs.readFileSync(path, 'utf8');

// Also add Store to imported icons
let newContent = content.replace(
  "Mail,\n  Clock\n} from 'lucide-react';",
  "Mail,\n  Clock,\n  Store\n} from 'lucide-react';"
);

const sidebarAddition = `
        {/* Global Branches Overview */}
        <div className={\`mx-4 mt-6 p-3 rounded-2xl border transition-colors \${isLight ? 'bg-zinc-50 border-zinc-200 shadow-sm' : 'bg-zinc-900 border-zinc-800 shadow'}\`}>
          <div className={\`flex items-center gap-2 mb-3 pb-2 border-b \${isLight ? 'border-zinc-200' : 'border-zinc-800/80'}\`}>
            <Store className={\`w-3.5 h-3.5 \${isLight ? 'text-zinc-500' : 'text-zinc-400'}\`} />
            <span className={\`text-[10px] font-mono tracking-wider uppercase font-bold \${isLight ? 'text-zinc-600' : 'text-zinc-400'}\`}>Global Branches</span>
          </div>
          <div className="space-y-1.5 font-sans">
            {([
              'Marks & Spencer - Cork City',
              'Tesco - Cork City',
              'Tesco - Mahon Point'
            ] as const).map(branch => {
              const shortName = branch.replace('Marks & Spencer', 'M&S').replace(' - Cork City', ' Cork').replace(' - Mahon Point', ' Mahon');
              const isSelected = selectedBranch === branch;
              return (
                <div 
                  key={branch} 
                  onClick={() => setSelectedBranch(branch)}
                  className={\`flex justify-between items-center text-[10px] p-2 rounded-lg border cursor-pointer transition-colors \${
                    isSelected 
                      ? isLight ? 'bg-orange-50 border-orange-200' : 'bg-orange-500/10 border-orange-500/30'
                      : isLight ? 'bg-white border-zinc-200 hover:bg-zinc-100' : 'bg-zinc-950/50 border-zinc-800/80 hover:bg-zinc-900'
                  }\`}
                >
                  <span className={\`truncate mr-2 \${
                    isSelected 
                      ? isLight ? 'text-orange-700 font-bold' : 'text-orange-400 font-bold' 
                      : isLight ? 'text-zinc-700 font-medium' : 'text-zinc-300 font-medium'
                  }\`}>
                    {shortName}
                  </span>
                  <span className="text-emerald-500 font-mono font-bold tracking-tight shrink-0 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Live
                  </span>
                </div>
              );
            })}
          </div>
        </div>
`;

newContent = newContent.replace(
  "        {/* Navigation Actions */}",
  sidebarAddition + "\n        {/* Navigation Actions */}"
);

fs.writeFileSync(path, newContent, 'utf8');

console.log('Sidebar overview added!');
