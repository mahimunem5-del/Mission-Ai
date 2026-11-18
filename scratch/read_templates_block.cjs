const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
const lines = content.split('\n');
console.log('Lines from 21610 to 21860:');
console.log(lines.slice(21610, 21860).join('\n'));
