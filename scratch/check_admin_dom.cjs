const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

const idx = content.indexOf('id="mestrio-admin-studio-root"');
console.log(content.slice(idx - 100, idx + 500));
