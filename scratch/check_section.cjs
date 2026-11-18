const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
const idx = content.indexOf('id="design-templates-section"');
console.log(content.slice(idx, idx + 600));
