const fs = require('fs');
console.log('--- server/package.json ---');
console.log(fs.readFileSync('server/package.json', 'utf8'));
