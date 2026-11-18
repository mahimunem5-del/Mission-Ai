const fs = require('fs');
const dump = fs.readFileSync('scratch/controls_dump.txt', 'utf8');

const s = dump.indexOf('id="studio-generate-btn"');
console.log(dump.substring(s - 500, s + 600));
