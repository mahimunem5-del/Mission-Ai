const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('index.html', 'utf8');

// Find all script tags (excluding external src scripts)
const scriptRegex = /<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let count = 0;
let errors = 0;

while ((match = scriptRegex.exec(html)) !== null) {
    count++;
    const code = match[1];
    try {
        new vm.Script(code);
        console.log(`Script block #${count}: syntax OK (${code.length} bytes)`);
    } catch (err) {
        errors++;
        console.error(`Script block #${count} SYNTAX ERROR:`, err.message);
        // Find line number in script
        console.error(err.stack);
    }
}

console.log(`\nTotal script blocks: ${count}, Errors: ${errors}`);
