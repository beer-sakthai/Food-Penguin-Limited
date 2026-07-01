const fs = require('fs');
const path = require('path');

const dbPath = 'C:\\Users\\beern\\.gemini\\antigravity\\conversations\\d64650b8-abbc-436b-9d18-85f17c2c0c22.db';
try {
  const data = fs.readFileSync(dbPath);
  console.log('Database size:', data.length);
  
  // Let's search for keywords
  const keywords = ['call_mcp_tool', 'get_screen', 'StitchMCP'];
  for (const kw of keywords) {
    let pos = 0;
    console.log(`Searching for keyword: ${kw}`);
    while ((pos = data.indexOf(kw, pos)) !== -1) {
      console.log(`Found "${kw}" at position ${pos}`);
      const start = Math.max(0, pos - 100);
      const end = Math.min(data.length, pos + 200);
      const slice = data.slice(start, end);
      // print clean text
      let text = '';
      for (let i = 0; i < slice.length; i++) {
        const char = slice[i];
        if (char >= 32 && char <= 126) {
          text += String.fromCharCode(char);
        } else {
          text += '.';
        }
      }
      console.log('Context:', text);
      pos += kw.length;
    }
  }
} catch (e) {
  console.error('Error:', e);
}
