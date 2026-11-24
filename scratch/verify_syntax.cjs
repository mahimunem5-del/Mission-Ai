const fs = require('fs');
const vm = require('vm');

const content = fs.readFileSync('index.html', 'utf8');

// Find all script blocks (without src)
const scriptRegex = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let count = 0;
let errors = 0;

while ((match = scriptRegex.exec(content)) !== null) {
    count++;
    const code = match[1];
    try {
        new vm.Script(code);
    } catch (e) {
        errors++;
        console.error(`Syntax error in script block #${count}:`, e.message);
        // show snippet
        const lines = code.split('\n');
        console.error('Line excerpt:');
        console.error(lines.slice(Math.max(0, (e.lineNumber || 1) - 5), (e.lineNumber || 1) + 5).join('\n'));
    }
}

console.log(`Parsed ${count} inline script blocks. Total errors: ${errors}`);
if (errors > 0) process.exit(1);
