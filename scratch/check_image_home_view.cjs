const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const start = html.indexOf('id="image-home-view"');
console.log('image-home-view snippet:');
console.log(html.substring(start, start + 800));
