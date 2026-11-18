const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

const idx = content.indexOf('function checkAdminStudioRoute()');
console.log(content.slice(idx - 100, idx + 1200));
