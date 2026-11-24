const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

function printRange(startPattern, length) {
  const idx = content.indexOf(startPattern);
  if (idx !== -1) {
    console.log(`=== ${startPattern} ===`);
    console.log(content.slice(idx, idx + length));
  }
}

printRange('function renderMobileResultFeed()', 1200);
printRange('function handleMobileMultiDelete()', 800);
