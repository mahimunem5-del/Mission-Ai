const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

const idx = content.indexOf('function initDesignTemplatesSection()');
console.log(content.slice(idx + 3500, idx + 4300));
