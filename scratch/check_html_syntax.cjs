const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

// Extract all <script> blocks that don't have src or non-js type
const regex = /<script(?![^>]*\bsrc\b)(?![^>]*\btype=["'](?!text\/javascript|application\/javascript)[^"']*["'])[^>]*>([\s\S]*?)<\/script>/gi;

let match;
let count = 0;
let errors = 0;

while ((match = regex.exec(html)) !== null) {
  count++;
  const code = match[1];
  try {
    new Function(code);
  } catch (err) {
    errors++;
    console.error(`Script block #${count} syntax error:`, err.message);
  }
}

console.log(`Checked ${count} script blocks. Syntax errors found: ${errors}`);
if (errors > 0) process.exit(1);
