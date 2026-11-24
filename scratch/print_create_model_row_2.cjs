const fs = require('fs');
const s = fs.readFileSync('scratch/new_mobile_workspace_snippet.html', 'utf8');

const pos = s.indexOf('function createModelRowElement');
console.log(s.substring(pos + 800, pos + 1800));
