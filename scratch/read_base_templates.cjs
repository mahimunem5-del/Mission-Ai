const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
const lines = content.split('\n');
console.log('Lines from 20930 to 20970:');
console.log(lines.slice(20930, 20970).join('\n'));
