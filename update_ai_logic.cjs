const fs = require('fs');

const file = 'server.ts';
let content = fs.readFileSync(file, 'utf8');

// 1. Enforce Model Compliance
// Replace legacy/pro model names with gemini-1.5-flash and imagen-3.0-generate-001
content = content.replace(/gemini-3\.1-pro-preview/g, 'gemini-1.5-flash');
content = content.replace(/gemini-3\.1-flash-image-preview/g, 'imagen-3.0-generate-001');

// 2. Dish Auditor: Add systemInstruction and temperature
// Find the generateContent call for analyze-dish-photo
const dishRegex = /(const response = await ai\.models\.generateContent\(\{\s*model: "gemini-1\.5-flash",\s*contents: \{ parts: \[imagePart, promptPart\] \})(\s*\}\);)/;
if (dishRegex.test(content)) {
    content = content.replace(dishRegex, `$1,\n        config: {\n          systemInstruction: "You are Jules, the rigorous AI Strategy Officer for 'Food Penguin Limited'. Perform highly precise culinary audits, extracting quality and waste metrics.",\n          temperature: 0.1\n        }$2`);
}

// 3. Restock Planner: Add responseMimeType, systemInstruction, and temperature
// Find the generateContent call for suggest-restock
const restockRegex = /(const response = await ai\.models\.generateContent\(\{\s*model: "gemini-1\.5-flash",\s*contents: prompt)(\s*\}\);)/;
if (restockRegex.test(content)) {
    content = content.replace(restockRegex, `$1,\n        config: {\n          responseMimeType: "application/json",\n          systemInstruction: "You are Jules, the AI Strategy Officer. Act as a replenishment supply chain AI. Output strictly structured JSON.",\n          temperature: 0.1\n        }$2`);
}

fs.writeFileSync(file, content, 'utf8');
console.log('AI logic updated successfully.');
