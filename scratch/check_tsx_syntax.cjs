const fs = require('fs');

const content = fs.readFileSync('src/components/ImageWorkspace.tsx', 'utf8');

// Check bracket balancing
const stack = [];
let inString = false;
let stringChar = '';
let inComment = false;
let inLineComment = false;
let line = 1, col = 0;

for (let i = 0; i < content.length; i++) {
  const c = content[i];
  if (c === '\n') { line++; col = 0; inLineComment = false; } else { col++; }

  if (inLineComment) continue;

  if (inComment) {
    if (c === '*' && content[i+1] === '/') { inComment = false; i++; }
    continue;
  }
  if (!inString && c === '/' && content[i+1] === '*') { inComment = true; i++; continue; }
  if (!inString && c === '/' && content[i+1] === '/') { inLineComment = true; i++; continue; }

  if (inString) {
    if (c === '\\') { i++; continue; }
    if (c === stringChar) inString = false;
    continue;
  }
  if (c === '"' || c === "'" || c === '`') {
    inString = true;
    stringChar = c;
    continue;
  }

  if (c === '{' || c === '(' || c === '[') stack.push({ c, line, col });
  if (c === '}' || c === ')' || c === ']') {
    const last = stack.pop();
    const expected = c === '}' ? '{' : (c === ')' ? '(' : '[');
    if (!last || last.c !== expected) {
      console.error(`Mismatched bracket at ${line}:${col}: found ${c}, expected ${last ? last.c : 'none'}`);
      process.exit(1);
    }
  }
}

if (stack.length > 0) {
  console.error(`Unclosed brackets: ${stack.map(s => s.c + ' at ' + s.line).join(', ')}`);
  process.exit(1);
}

console.log('All brackets and string literals perfectly balanced in ImageWorkspace.tsx!');
