const fs = require('fs');

const path = 'src/components/WasteTab.tsx';
const content = fs.readFileSync(path, 'utf8');

// I will extract from line 1 up to line 403, and then attach line 582 to the end.
const lines = content.split('\n');

const newLines = [...lines.slice(0, 403), ...lines.slice(581)];
fs.writeFileSync(path, newLines.join('\n'), 'utf8');

console.log('Done!');
