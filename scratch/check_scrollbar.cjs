const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

console.log('has no-scrollbar:', html.includes('no-scrollbar'));
