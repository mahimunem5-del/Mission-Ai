const fs = require('fs');
const dump = fs.readFileSync('scratch/controls_dump.txt', 'utf8');

const s = dump.indexOf('=================== UPSCALE CONTROLS ===================');
console.log(dump.substring(s));
