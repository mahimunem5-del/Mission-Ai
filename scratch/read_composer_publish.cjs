const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');

function printRange(start, end, label) {
    console.log(`\n=== ${label} (lines ${start}-${end}) ===`);
    console.log(lines.slice(start - 1, end).map((l, i) => `${start + i}: ${l}`).join('\n'));
}

printRange(39350, 39530, 'Admin Composer Publish & Submit');
