const fs = require('fs');
const path = require('path');

const tabsDir = 'src/components';
const files = fs.readdirSync(tabsDir).filter(f => f.endsWith('Tab.tsx'));

files.forEach(file => {
    const fullPath = path.join(tabsDir, file);
    let content = fs.readFileSync(fullPath, 'utf8');
    let changed = false;

    if (!content.includes(`import { motion } from 'motion/react';`) && !content.includes(`import { motion } from "motion/react";`)) {
        // Prepend it right before the first import or at the very top
        content = "import { motion } from 'motion/react';\n" + content;
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Fixed imports in', file);
    }
});
