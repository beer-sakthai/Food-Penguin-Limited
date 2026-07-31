const fs = require('fs');

const path = 'src/components/PlanningTab.tsx';
const content = fs.readFileSync(path, 'utf8');

const lines = content.split('\n');
// Line 105 is index 105: <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
lines[105] = '    <div className="grid grid-cols-1 gap-6">';
lines[108] = '      <div className="space-y-6">';

// Right sidebar starts at line 213 (index 212)
const newLines = [...lines.slice(0, 212), ...lines.slice(278)];

fs.writeFileSync(path, newLines.join('\n'), 'utf8');

console.log('PlanningTab done!');
