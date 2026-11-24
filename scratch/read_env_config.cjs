const fs = require('fs');
console.log('--- server/src/config/env.js ---');
console.log(fs.readFileSync('server/src/config/env.js', 'utf8'));
