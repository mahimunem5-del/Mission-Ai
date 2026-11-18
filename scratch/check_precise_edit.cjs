const fs = require('fs');
const dump = fs.readFileSync('scratch/controls_dump.txt', 'utf8');

const s = dump.indexOf('<div id="ideogram-precise-edit-controls"');
const e = dump.indexOf('<div id="ideogram-remove-bg-controls"');
console.log(dump.substring(s, e));
