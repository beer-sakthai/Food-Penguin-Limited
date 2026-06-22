const fs = require('fs');
let c = fs.readFileSync('server.ts', 'utf8');

c = c.replace(/if \(!ai\)/, "const ai = getAiClient();\n  if (!ai)");

fs.writeFileSync('server.ts', c);
