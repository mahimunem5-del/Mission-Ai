const fs = require('fs');
const vm = require('vm');
const html = fs.readFileSync('index.html', 'utf8');

const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let count = 0;
while ((match = scriptRegex.exec(html)) !== null) {
  count++;
  const code = match[1];
  const startIdx = match.index;
  const lineNum = html.substring(0, startIdx).split('\n').length;
  try {
    new vm.Script(code);
  } catch (err) {
    console.error(`Script ${count} starting at line ${lineNum}: ${err.message}`);
    // Print first few lines of error or where error occurs
    console.error(err.stack);
  }
}
