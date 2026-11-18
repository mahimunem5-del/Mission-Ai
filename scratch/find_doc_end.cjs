const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const start = 958486;
const ufeff = html.indexOf('\\ufeff', start);
console.log('ufeff at:', ufeff);
if (ufeff !== -1) {
    console.log(html.slice(ufeff - 300, ufeff + 200));
}
