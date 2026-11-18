const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
const idx = content.indexOf('id="creative-workflows-grid"');
console.log(content.slice(idx, idx + 800));
