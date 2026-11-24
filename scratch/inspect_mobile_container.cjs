const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const startMobile = html.indexOf('id="mobile-image-home-container"');
const endMobile = html.indexOf('id="mobile-image-composer-container"');
console.log('Mobile container length:', endMobile - startMobile);
console.log(html.substring(startMobile, startMobile + 3000));
