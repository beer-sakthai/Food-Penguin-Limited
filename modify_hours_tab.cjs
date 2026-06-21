const fs = require('fs');

const path = 'src/components/HoursTab.tsx';
const content = fs.readFileSync(path, 'utf8');

const lines = content.split('\n');
// Line 52 is <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
// In 0-indexed, line 52 is index 52.
lines[52] = '    <div className="grid grid-cols-1 gap-6">';
lines[55] = '      <div className="space-y-6">';

const newLines = [...lines.slice(0, 147), ...lines.slice(198)];

fs.writeFileSync(path, newLines.join('\n'), 'utf8');

console.log('HoursTab done!');
