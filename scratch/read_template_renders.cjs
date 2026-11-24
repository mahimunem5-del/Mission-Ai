const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');

function printRange(start, end, label) {
    console.log(`\n=== ${label} (lines ${start}-${end}) ===`);
    console.log(lines.slice(start - 1, end).map((l, i) => `${start + i}: ${l}`).join('\n'));
}

printRange(21480, 21515, 'renderMobileImageHomeTemplates');
printRange(24200, 24240, 'renderImageHomeTemplates');
