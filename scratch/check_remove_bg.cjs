const fs = require('fs');
const dump = fs.readFileSync('scratch/controls_dump.txt', 'utf8');

const s = dump.indexOf('<div id="ideogram-remove-bg-controls"');
const e = dump.indexOf('<div id="ideogram-upscale-controls"');
console.log(dump.substring(s, e));
