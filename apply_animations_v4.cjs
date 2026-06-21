const fs = require('fs');
const path = require('path');

function addHoverToListsAndRows(content) {
  let newContent = content;

  // Find basically anything with onClick OR cursor-pointer without active:scale
  newContent = newContent.replace(/<(div|li|tr|button)([^>]*)className=(['"])(.*?)\3/g, (match, tag, before, quote, classNames) => {
    let classes = classNames;
    
    // Only if it has cursor-pointer or is a button OR if before contains onClick
    let hasInteractivity = classes.includes('cursor-pointer') || tag === 'button' || before.includes('onClick');
    
    if (hasInteractivity) {
      if (!classes.includes('active:scale')) {
        classes += ' active:scale-[0.98]';
      }
      if (!classes.includes('hover:-translate-y') && !classes.includes('hover:translate-y')) {
        classes += ' hover:-translate-y-0.5 hover:shadow-md transition-all duration-200';
      }
    }
    
    classes = classes.replace(/\s+/g, ' ').trim();
    return `<${tag}${before}className=${quote}${classes}${quote}`;
  });

  return newContent;
}

const files = fs.readdirSync('src/components').filter(f => f.endsWith('.tsx')).map(f => path.join('src/components', f));
files.push('src/App.tsx');

let changed = 0;
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const newContent = addHoverToListsAndRows(content);
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    changed++;
    console.log(`Updated ${file}`);
  }
}
console.log(`Changed ${changed} files`);
