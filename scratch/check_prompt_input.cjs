const fs = require('fs');
const dump = fs.readFileSync('scratch/controls_dump.txt', 'utf8');

const s = dump.indexOf('id="studio-prompt-input"');
console.log(dump.substring(s - 100, s + 500));
