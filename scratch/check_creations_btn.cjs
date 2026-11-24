const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const idx = html.indexOf('mobile-image-creations-btn');
console.log(html.substring(idx - 50, idx + 600));
