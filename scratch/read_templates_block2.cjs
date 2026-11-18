const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
const lines = content.split('\n');
console.log('Lines from 21855 to 21915:');
console.log(lines.slice(21855, 21915).join('\n'));
