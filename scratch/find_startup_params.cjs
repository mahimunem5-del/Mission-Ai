const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

console.log('startupSearchParams occurrences:', html.split('startupSearchParams').length - 1);
