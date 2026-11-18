const fs = require('fs');
const dump = fs.readFileSync('scratch/controls_dump.txt', 'utf8');

const s = dump.indexOf('<div id="ideogram-generate-controls"');
const e = dump.indexOf('<div id="ideogram-vector-illustration-controls"');
console.log(dump.substring(s, e));
