const fs = require('fs');
const dump = fs.readFileSync('scratch/controls_dump.txt', 'utf8');

const s = dump.indexOf('=================== GENERATE CONTROLS ===================');
const e = dump.indexOf('=================== PRECISE EDIT CONTROLS ===================');
const gen = dump.substring(s, e);
console.log('gen slice length:', gen.length);
const lines = gen.split('\n');
console.log('lines count:', lines.length);
console.log(lines.slice(0, 30).join('\n'));
