const fs = require('fs');
const s = fs.readFileSync('scratch/new_mobile_workspace_snippet.html', 'utf8');

const pos = s.indexOf('function createModelRowElement');
console.log(s.substring(pos + 1600, pos + 2200));
