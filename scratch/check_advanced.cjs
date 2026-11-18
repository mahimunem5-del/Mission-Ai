const fs = require('fs');
const dump = fs.readFileSync('scratch/controls_dump.txt', 'utf8');

const s = dump.indexOf('id="ideogram-advanced-toggle-btn"');
console.log(dump.substring(s - 100, s + 600));
