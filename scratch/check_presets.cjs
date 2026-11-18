const fs = require('fs');
const dump = fs.readFileSync('scratch/controls_dump.txt', 'utf8');

const s = dump.indexOf('id="ideogram-style-tags"');
console.log(dump.substring(s, s + 1800));
