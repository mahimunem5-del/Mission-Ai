const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
const idx = content.indexOf('id="ideogram-delete-confirm-modal"');
console.log(content.slice(idx + 1000, idx + 2000));
