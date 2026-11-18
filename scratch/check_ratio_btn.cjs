const fs = require('fs');
const dump = fs.readFileSync('scratch/controls_dump.txt', 'utf8');

const s = dump.indexOf('id="studio-ratio-btn"');
console.log(dump.substring(s - 100, s + 1000));
