const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

function printRange(startLine, count) {
  const lines = content.split('\n');
  console.log(`=== Lines ${startLine} to ${startLine + count} ===`);
  for (let i = startLine - 1; i < startLine + count && i < lines.length; i++) {
    console.log(`${i + 1}: ${lines[i]}`);
  }
}

printRange(27760, 40);
printRange(27885, 30);
