const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('index.html', 'utf8');

const scriptRegex = /<script\b(?![^>]*\bsrc\b)[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let count = 0;
while ((match = scriptRegex.exec(html)) !== null) {
    count++;
    const scriptContent = match[1];
    const startIndex = match.index;
    const lineNumber = html.substring(0, startIndex).split('\n').length;
    console.log(`Checking script #${count} starting around line ${lineNumber}...`);
    try {
        new vm.Script(scriptContent, { filename: `inline-script-${count}.js`, lineOffset: lineNumber - 1 });
        console.log(`Script #${count} is VALID.`);
    } catch (err) {
        console.error(`SYNTAX ERROR in script #${count} (starts near line ${lineNumber}):`);
        console.error(err.message);
        console.error(err.stack);
    }
}
