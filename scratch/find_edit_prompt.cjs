const fs = require('fs');
const dump = fs.readFileSync('scratch/controls_dump.txt', 'utf8');

const idx = dump.indexOf('studio-precise-edit-input');
console.log(dump.substring(Math.max(0, idx - 500), Math.min(dump.length, idx + 500)));
