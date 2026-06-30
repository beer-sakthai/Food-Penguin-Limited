const fs = require('fs');
const path = require('path');

const tabsDir = 'src/components';
const files = fs.readdirSync(tabsDir).filter(f => f.endsWith('Tab.tsx'));

files.forEach(file => {
    const fullPath = path.join(tabsDir, file);
    let content = fs.readFileSync(fullPath, 'utf8');
    let changed = false;

    // 1. Add motion import if missing
    if (!content.includes(`import { motion } from 'motion/react';`)) {
        content = content.replace(/import React(.*?)\n/, "import React$1\nimport { motion } from 'motion/react';\n");
        changed = true;
    }

    // 2. Wrap main container in motion.div
    const exportMatch = content.match(/export default function \w+\(.*?\)\s*\{\s*([\s\S]*?)return\s*\(\s*<div([^>]*?)>/);
    if (exportMatch && !exportMatch[0].includes('<motion.div')) {
        const replacement = exportMatch[0].replace(/<div([^>]*?)>$/, `<motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}$1>`);
        content = content.replace(exportMatch[0], replacement);
        
        const lastDivIndex = content.lastIndexOf('</div>');
        if (lastDivIndex !== -1) {
            content = content.substring(0, lastDivIndex) + '</motion.div>' + content.substring(lastDivIndex + 6);
        }
        changed = true;
    }

    // 3. Upgrade cards to glassmorphism / gradient
    const oldContent = content;
    // We must be careful not to break existing classes by replacing too broadly, but Tailwind classes are usually space-separated.
    // Replacing solid zinc-800 with gradients
    content = content.replace(/bg-zinc-800(?![\/\-])/g, 'bg-gradient-to-br from-zinc-800 to-zinc-900/90 backdrop-blur-md border-white/10 shadow-xl');
    content = content.replace(/bg-zinc-900(?![\/\-])/g, 'bg-gradient-to-br from-zinc-900 to-zinc-950 backdrop-blur-xl border-white/5 shadow-2xl');
    
    // Specifically target the generic white background for Light mode
    content = content.replace(/bg-white(?![\/\-])/g, 'bg-white/95 backdrop-blur-md shadow-lg');
    
    if (content !== oldContent) changed = true;

    if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated UI in', file);
    }
});

// App.tsx
const appPath = 'src/App.tsx';
let appContent = fs.readFileSync(appPath, 'utf8');
let appChanged = false;

const oldApp = appContent;
appContent = appContent.replace(/bg-zinc-950(?![\/\-])/g, 'bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950');
appContent = appContent.replace(/bg-zinc-900 border-zinc-800/g, 'bg-zinc-900/80 backdrop-blur-2xl border-zinc-700/50 shadow-2xl');

if (appContent !== oldApp) {
    fs.writeFileSync(appPath, appContent, 'utf8');
    console.log('Updated UI in App.tsx');
}
