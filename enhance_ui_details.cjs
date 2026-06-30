const fs = require('fs');

const overviewFile = 'src/components/OverviewTab.tsx';
let overviewContent = fs.readFileSync(overviewFile, 'utf8');
let changed = false;

// 1. Inject SVG Gradients <defs> inside the Overview charts if they don't already exist for larger charts.
// We know sparklines already have gradients. We can add a vivid gradient to the Recharts Tooltip by replacing standard Tooltip
// We'll replace <Tooltip /> with <Tooltip contentStyle={{ backgroundColor: 'rgba(24, 24, 27, 0.9)', backdropFilter: 'blur(12px)', border: '1px solid rgba(234, 179, 8, 0.5)', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }} itemStyle={{ color: '#eab308', fontWeight: 'bold' }} />
overviewContent = overviewContent.replace(/<Tooltip \/>/g, `<Tooltip contentStyle={{ backgroundColor: 'rgba(24, 24, 27, 0.9)', backdropFilter: 'blur(12px)', border: '1px solid rgba(234, 179, 8, 0.5)', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }} itemStyle={{ color: '#eab308', fontWeight: 'bold' }} />`);

// 2. Add stagger list animation. We will just wrap the main motion.div children with a stagger prop if possible,
// or we will just use AnimatePresence where appropriate. Since it already has motion.div, we'll just add the custom tooltips for now as the main UI polish for Overview.
changed = true;

if (changed) {
    fs.writeFileSync(overviewFile, overviewContent, 'utf8');
    console.log('OverviewTab updated');
}

const appFile = 'src/App.tsx';
let appContent = fs.readFileSync(appFile, 'utf8');
let appChanged = false;

// 1. Extreme glassmorphism header
appContent = appContent.replace(/bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 border-zinc-900 text-white shadow-md/g, 'bg-zinc-950/70 backdrop-blur-3xl border-zinc-800/80 text-white shadow-2xl');

// 2. Sidebar active tab glowing indicator. We look for a typical active tab button class and inject a glowing border or bar.
// In many cases, active tabs have bg-zinc-800 or similar. We will just add a global CSS glow to active items.
// Let's rely on standard text replacements if we find the active tab logic.
appContent = appContent.replace(/bg-orange-500 text-white shadow-md/g, 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)] border border-orange-400');

appChanged = true;

if (appChanged) {
    fs.writeFileSync(appFile, appContent, 'utf8');
    console.log('App.tsx updated');
}
