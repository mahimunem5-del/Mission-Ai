const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

const idx = content.indexOf('interactive && interactive.id !== \'sidebar-toggle-btn\'');
console.log(content.slice(idx - 200, idx + 400));
